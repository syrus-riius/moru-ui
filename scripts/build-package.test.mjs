import assert from 'node:assert/strict'
import { before, test } from 'node:test'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'
import {
  createPackageEntries,
  createPackageStyles,
  generatePackage,
  optionalComponentModules,
  rewritePackageSource,
} from './build-package.mjs'
import { generateRegistry, moduleSpecifiers } from './build-registry.mjs'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const read = (file) => readFileSync(path.join(root, file), 'utf8')
let generated, registrySources

before(async () => {
  const [npmPackage, registry] = await Promise.all([generatePackage(root), generateRegistry(root)])
  generated = npmPackage
  registrySources = new Map(
    [...registry.artifacts]
      .filter(([file]) => file.startsWith('registry/moru/'))
      .map(([file, content]) => [file.slice('registry/moru/'.length), content]),
  )
})

function sourceForImport(file, specifier) {
  const stem = path.posix.join(path.posix.dirname(file), specifier).replace(/\.js$/, '')
  const target = [`${stem}.ts`, `${stem}.tsx`].find((candidate) => generated.sources.has(candidate))
  assert.ok(target, `${file}: unresolved import ${specifier}`)
  return target
}

function externalDependencies(entry) {
  const visited = new Set()
  const external = new Set()
  function visit(file) {
    if (visited.has(file)) return
    visited.add(file)
    for (const { value } of moduleSpecifiers(generated.sources.get(file), file)) {
      if (value.startsWith('.')) visit(sourceForImport(file, value))
      else
        external.add(
          value.startsWith('@') ? value.split('/').slice(0, 2).join('/') : value.split('/')[0],
        )
    }
  }
  visit(entry)
  return external
}

function cssFixture() {
  return new Map(
    [...registrySources.keys()].filter((file) => file.endsWith('.css')).map((file) => [file, '']),
  )
}

test('ESM rewriting preserves directives, aliases and literal text while resolving every import form', () => {
  const source = `'use client'
import { useState } from 'react'
import './styles.css'
import type { Value } from './model'
export { Button as Action } from './button'
// import './button'
const note = "import './button'"
const load = () => import('./button')
export type Local = import('./model').Value
`
  const sources = new Map([
    ['model.ts', ''],
    ['button.tsx', ''],
  ])
  const result = rewritePackageSource(source, 'example.tsx', sources)
  assert.match(result, /^'use client'/)
  assert.match(result, /export \{ Button as Action \} from '\.\/button\.js'/)
  assert.match(result, /\/\/ import '\.\/button'/)
  assert.match(result, /const note = "import '\.\/button'"/)
  assert.deepEqual(
    moduleSpecifiers(result, 'example.tsx').map(({ value }) => value),
    ['react', './model.js', './button.js', './button.js', './model.js'],
  )
})

test('unsupported CSS bindings and unresolved imports fail before writing output', () => {
  assert.throws(
    () => rewritePackageSource("import './missing'", 'example.ts', new Map()),
    /Missing package import/,
  )
  assert.throws(
    () => rewritePackageSource("import styles from './styles.css'", 'example.ts', new Map()),
    /CSS bindings/,
  )
  assert.throws(
    () =>
      rewritePackageSource("const load = () => import('./styles.css')", 'example.ts', new Map()),
    /Only side-effect CSS imports/,
  )
})

test('the core entry follows the UI barrel, including aliases and types, without optional components', () => {
  const uiBarrel = read('src/components/ui/index.ts')
  const expected = moduleSpecifiers(uiBarrel, 'index.ts')
    .map(({ value }) => `${value}.js`)
    .filter((value) => !optionalComponentModules.some((name) => value === `./${name}.js`))
  const actual = moduleSpecifiers(generated.sources.get('index.ts'), 'index.ts').map(
    ({ value }) => value,
  )
  assert.deepEqual(actual, [...expected, './provider.js', './_theme/tokens.js'])
  assert.match(
    generated.sources.get('index.ts'),
    /Menu as DropdownMenu, type MenuProps as DropdownMenuProps/,
  )
  assert.match(generated.sources.get('index.ts'), /export type \{ CalendarDisplayOptions \}/)
  assert.doesNotMatch(generated.sources.get('index.ts'), /useTheme|_theme\/index/)
  assert.throws(
    () => createPackageEntries('export const privateValue = 1', new Map()),
    /only module re-exports/,
  )
})

test('every public entry is compiled and every generated relative import is portable ESM', () => {
  const manifest = JSON.parse(read('packages/moru-react/package.json'))
  const config = JSON.parse(read('tsconfig.package.json'))
  for (const [entry, target] of Object.entries(manifest.exports)) {
    if (typeof target === 'string') continue
    if (entry === './styles.css') {
      assert.equal(target.types, './dist/styles.d.ts')
      assert.equal(target.default, './dist/styles.css')
      assert.match(read('packages/moru-react/css.d.ts'), /export\s*\{\s*\}/)
      continue
    }
    const source = sourceForImport('index.ts', target.import.replace('./dist/', './'))
    assert.ok(config.files.includes(`.qa/moru-package-src/${source}`), `Not compiled: ${entry}`)
    assert.equal(target.types, target.import.replace(/\.js$/, '.d.ts'))
  }
  for (const [file, content] of generated.sources) {
    for (const { value } of moduleSpecifiers(content, file)) {
      assert.ok(!value.endsWith('.css'), `${file}: CSS import was not extracted`)
      if (!value.startsWith('.')) continue
      assert.ok(value.endsWith('.js'), `${file}: extension missing from ${value}`)
      sourceForImport(file, value)
    }
  }
})

test('core and ordinary blocks do not load optional peers; each advanced entry declares its peers', () => {
  const manifest = JSON.parse(read('packages/moru-react/package.json'))
  const optionalPeers = new Set(
    Object.entries(manifest.peerDependenciesMeta)
      .filter(([, metadata]) => metadata.optional)
      .map(([name]) => name),
  )
  for (const entry of ['index.ts', 'blocks.ts']) {
    for (const dependency of externalDependencies(entry)) {
      assert.ok(!optionalPeers.has(dependency), `${entry} eagerly imports ${dependency}`)
      assert.ok(
        manifest.dependencies[dependency] || manifest.peerDependencies[dependency],
        `Undeclared: ${dependency}`,
      )
    }
  }
  const advanced = {
    'dashboard.ts': 'recharts',
    'chart.tsx': 'recharts',
    'data-table.tsx': '@tanstack/react-table',
    'carousel.tsx': 'embla-carousel-react',
    'resizable.tsx': 'react-resizable-panels',
  }
  for (const [entry, peer] of Object.entries(advanced)) {
    assert.ok(optionalPeers.has(peer), `${entry}: ${peer} must be optional`)
    assert.ok(externalDependencies(entry).has(peer), `${entry}: peer graph changed`)
  }
})

test('the complete CSS bundle includes each source once, resolves imports and keeps overrides last', () => {
  const expected = [...registrySources.keys()]
    .filter((file) => file.endsWith('.css') && file !== 'styles.css')
    .sort()
  assert.deepEqual([...generated.styles.files].sort(), expected)
  const imports = []
  postcss.parse(generated.styles.css).walkAtRules('import', (rule) => imports.push(rule.params))
  assert.deepEqual(imports, [])

  const sources = cssFixture()
  sources.set('_styles/components.css', '@import "../shared-test.css";')
  sources.set('shared-test.css', '.shared-test { color: green; }')
  sources.set('chart.css', '.order-test { padding: 8px; }')
  sources.set('chart-variations.css', '.order-test { padding: 16px; }')
  sources.set('z-last.css', '@import "./shared-test.css";')
  sources.set('_styles/readability.css', '.order-test { padding: 24px; }')
  sources.set('styles.css', '.aggregate-must-not-appear { color: red; }')
  const result = createPackageStyles(sources)
  const sheet = postcss.parse(result.css)
  const padding = []
  let sharedCount = 0
  sheet.walkRules((rule) => {
    if (rule.selector === '.shared-test') sharedCount++
    if (rule.selector === '.order-test')
      rule.walkDecls('padding', (declaration) => padding.push(declaration.value))
  })
  assert.equal(sharedCount, 1)
  assert.deepEqual(padding, ['8px', '16px', '24px'])
  assert.doesNotMatch(result.css, /aggregate-must-not-appear/)
})

test('CSS cycles, missing files and unsupported imports produce actionable errors', () => {
  const sources = cssFixture()
  sources.set('_styles/components.css', '@import "../cycle-a.css";')
  sources.set('cycle-a.css', '@import "./cycle-b.css";')
  sources.set('cycle-b.css', '@import "./cycle-a.css";')
  assert.throws(() => createPackageStyles(sources), /Circular package CSS import: cycle-a.css/)
  sources.set('_styles/components.css', '@import "../missing.css";')
  assert.throws(() => createPackageStyles(sources), /Missing package CSS: missing.css/)
  sources.set('_styles/components.css', '@import url("https://example.com/style.css");')
  assert.throws(() => createPackageStyles(sources), /Unsupported package CSS import/)
})
