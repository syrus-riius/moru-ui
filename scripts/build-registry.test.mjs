import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createHash } from 'node:crypto'
import { cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'
import {
  buildRegistry, generateRegistry, moduleSpecifiers, registryDefinitions,
  registryOrigin, registryRepository, registryScope, registryVersion,
  scopeRegistryCss, verifyRegistry,
} from './build-registry.mjs'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const temporary = []
let generated, github, http
const item = (name) => github.items.find((entry) => entry.name === name)
const content = (file) => generated.artifacts.get(`registry/moru/${file}`)
before(async () => {
  generated = await generateRegistry(root)
  github = JSON.parse(generated.artifacts.get('registry.json'))
  http = JSON.parse(generated.artifacts.get('public/r/registry.json'))
})
after(async () => { for (const directory of temporary) await rm(directory, { recursive: true, force: true }) })

async function fixture() {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'moru-registry-test-'))
  temporary.push(directory)
  for (const file of generated.sources) {
    await mkdir(path.dirname(path.join(directory, file.path)), { recursive: true })
    await cp(path.join(root, file.path), path.join(directory, file.path))
  }
  return directory
}

function installedFiles(name, catalog = github) {
  const files = new Set()
  const visited = new Set()
  function add(current) {
    if (visited.has(current)) return
    visited.add(current)
    const entry = catalog.items.find((value) => value.name === current)
    assert.ok(entry, `Missing registry item ${current}`)
    for (const file of entry.files) files.add(file.path)
    for (const dependency of entry.registryDependencies ?? []) add(dependency.split('/').at(-1).split('#')[0].replace('.json', ''))
  }
  add(name)
  return files
}

function hasKeyframeParent(rule) {
  for (let current = rule.parent; current; current = current.parent) if (current.type === 'atrule' && /keyframes$/.test(current.name)) return true
  return false
}

test('the public catalog contains only the reviewed MVP items', () => {
  assert.deepEqual(github.items.map((entry) => entry.name), registryDefinitions.map((entry) => entry.name))
  assert.equal(github.items.length, 81)
  assert.equal(item('core').type, 'registry:base')
  assert.equal(item('login').type, 'registry:block')
  assert.equal(item('otp').type, 'registry:block')
  assert.equal(item('search-filters').type, 'registry:block')
  assert.equal(item('settings').type, 'registry:block')
})

test('GitHub dependencies use full Moru addresses and explicit release pins', () => {
  for (const entry of github.items) for (const dependency of entry.registryDependencies ?? []) {
    assert.match(dependency, new RegExp(`^${registryRepository}/[a-z-]+#v${registryVersion.replaceAll('.', '\\.')}$$`))
    assert.ok(item(dependency.split('/').at(-1).split('#')[0]))
  }
  assert.deepEqual(item('button').registryDependencies, [`${registryRepository}/core#v${registryVersion}`])
})

test('HTTP payloads and catalog pin every Moru dependency to production version URLs', () => {
  for (const entry of http.items) {
    const payload = JSON.parse(generated.artifacts.get(`public/r/v${registryVersion}/${entry.name}.json`))
    assert.deepEqual(payload.registryDependencies, entry.registryDependencies)
    for (const dependency of entry.registryDependencies ?? []) {
      assert.ok(dependency.startsWith(`${registryOrigin}/r/v${registryVersion}/`))
      assert.ok(generated.artifacts.has(`public${new URL(dependency).pathname}`))
    }
    for (const file of payload.files) assert.equal(file.content, generated.artifacts.get(file.path))
  }
})

test('each generated file has one owner and a namespaced target', () => {
  const targets = new Set()
  for (const entry of github.items) for (const file of entry.files) {
    assert.match(file.target, /^@ui\/moru\//)
    assert.equal(targets.has(file.target), false, file.target)
    targets.add(file.target)
    assert.ok(generated.artifacts.has(file.path))
  }
  assert.ok(item('core').files.some((file) => file.target === '@ui/moru/provider.tsx'))
  assert.ok(item('login').files.some((file) => file.target === '@ui/moru/blocks/LoginBlock.tsx'))
})

test('every single-item installation contains its complete relative source and CSS import graph', () => {
  for (const entry of github.items) {
    const files = installedFiles(entry.name)
    for (const file of files) {
      if (!/\.(?:tsx?|css)$/.test(file)) continue
      const source = generated.artifacts.get(file)
      const imports = file.endsWith('.css') ? [...source.matchAll(/@import\s+['"]([^'"]+)['"]/g)].map((match) => match[1]) : moduleSpecifiers(source, file).map((specifier) => specifier.value)
      for (const specifier of imports.filter((value) => value.startsWith('.'))) {
        const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier))
        assert.ok(['', '.ts', '.tsx', '.css'].some((extension) => files.has(resolved + extension)), `${entry.name}: ${file} → ${specifier}`)
      }
    }
  }
})

test('selecting Button does not install unrelated inputs, blocks, charts or font packages', () => {
  const buttonFiles = installedFiles('button')
  assert.equal(buttonFiles.has('registry/moru/input.tsx'), false)
  assert.equal(buttonFiles.has('registry/moru/blocks/LoginBlock.tsx'), false)
  assert.equal([...buttonFiles].some((file) => /chart|table|carousel|fonts|calendar/.test(file)), false)
  assert.deepEqual(item('button').dependencies, ['@base-ui/react@1.9.0'])
})

test('Login and OTP install their original Moru components and dedicated CSS', () => {
  const login = installedFiles('login')
  for (const file of ['button.tsx', 'input.tsx', 'field.tsx', 'card.tsx', 'checkbox.tsx', 'password-input.tsx', 'enhanced-inputs.css']) assert.ok(login.has(`registry/moru/${file}`), file)
  const otp = installedFiles('otp')
  for (const file of ['button.tsx', 'field.tsx', 'card.tsx', 'input-otp.tsx', 'input-otp-utils.ts', 'controls-completion.css']) assert.ok(otp.has(`registry/moru/${file}`), file)
  assert.match(content('blocks/LoginBlock.tsx'), /Connect your authentication request/)
  assert.match(content('blocks/OTPBlock.tsx'), /123456/)
  assert.match(item('login').docs, /local demonstrations/)
})

test('search and settings blocks install the Moru controls used by the application template', () => {
  for (const name of ['search-filters', 'settings']) {
    const files = installedFiles(name)
    assert.ok(files.has('registry/moru/select.tsx'))
    assert.ok(files.has('registry/moru/theme-scope.tsx'))
    assert.ok(files.has('registry/moru/overlay-portal.tsx'))
  }
  assert.ok(installedFiles('settings').has('registry/moru/switch.tsx'))
  assert.ok(installedFiles('search-filters').has('registry/moru/badge.tsx'))
  assert.ok(installedFiles('dialog').has('registry/moru/overlay-portal.tsx'))
  assert.ok(installedFiles('textarea').has('registry/moru/field-context.ts'))
})

test('source import rewriting preserves the selected original code', async () => {
  const original = await readFile(path.join(root, 'src/components/ui/button.tsx'), 'utf8')
  const expected = original.replace("'../../lib/cn'", "'./_lib/cn'")
  assert.equal(content('button.tsx').split('\n').slice(2).join('\n'), expected)
  assert.match(content('blocks/LoginBlock.tsx'), /from '\.\.\/button'/)
  assert.doesNotMatch(content('blocks/LoginBlock.tsx'), /\.\.\/ui\//)
})

test('core installs scoped runtime tokens rather than default root CSS or the editor hook', () => {
  const files = item('core').files.map((file) => file.path)
  assert.ok(files.includes('registry/moru/_theme/tokens.ts'))
  assert.ok(files.includes('registry/moru/_theme/component-spacing.ts'))
  assert.equal(files.some((file) => /default\.css|useTheme|\/index\.ts|fonts\.css/.test(file)), false)
  assert.match(content('theme-scope.tsx'), /'data-moru-registry': ''/)
  assert.match(content('theme-scope.tsx'), /<div \{\.\.\.props\} \{\.\.\.attributes\}/)
  assert.match(content('theme-scope.tsx'), /<div \{\.\.\.attributes\} ref=\{portalContainer\}/)
})

test('every installation retains the full Moru MIT grant and repository notice reference', async () => {
  const license = await readFile(path.join(root, 'LICENSE'), 'utf8')
  assert.equal(content('_licenses/Moru-LICENSE'), license)
  assert.match(license, /Copyright \(c\) 2026 SYRUS RIIUS/)
  assert.match(license, /Permission is hereby granted/)
  assert.match(content('_licenses/NOTICE.md'), /https:\/\/github\.com\/syrus-riius\/moru-ui\/blob\/main\/NOTICE\.md/)
  for (const entry of github.items) assert.ok(installedFiles(entry.name).has('registry/moru/_licenses/Moru-LICENSE'))
  for (const file of item('core').files.filter((file) => file.path.includes('_licenses/'))) assert.equal(file.type, 'registry:file')
  assert.ok(generated.sources.some((file) => file.path === 'NOTICE.md'))
})

test('MoruProvider gives both modes scoped defaults while allowing explicit token overrides', () => {
  const provider = content('provider.tsx')
  assert.ok(provider.startsWith("'use client'"))
  assert.match(provider, /mode = 'light'/)
  assert.match(provider, /tokens \?\? \(mode === 'dark' \? darkTokens : defaultTokens\)/)
  assert.match(provider, /const darkTokens = createDarkTokens\(defaultTokens\)/)
  assert.match(provider, /<ThemeScope \{\.\.\.props\}/)
  assert.doesNotMatch(provider, /localStorage|document\.documentElement|document\.body\.style/)
})

test('entry styles import the shared layout, component and readability layers once', () => {
  const entry = content('styles.css')
  const imports = [...entry.matchAll(/@import ['"]([^'"]+)['"]/g)].map((match) => match[1])
  assert.deepEqual(imports, ['./_styles/utilities.css', './_styles/components.css', './_styles/readability.css'])
  assert.match(content('_styles/components.css'), /@import '\.\/form-controls\.css'/)
  assert.match(content('_styles/components.css'), /@import '\.\/feedback\.css'/)
})

test('all installed CSS selectors are confined to the Moru scope including media rules', () => {
  for (const [file, source] of generated.artifacts) {
    if (!file.startsWith('registry/moru/') || !file.endsWith('.css')) continue
    postcss.parse(source).walkRules((rule) => {
      if (hasKeyframeParent(rule)) return
      for (const selector of rule.selectors) assert.ok(selector.startsWith(registryScope), `${file}: ${selector}`)
    })
    assert.doesNotMatch(source, /(?:^|[\n{,])\s*(?::root|html|body)\s*[{,]/)
  }
  assert.match(content('_styles/components.css'), /:where\(\[data-moru-registry\]\)\.ui-theme-scope/)
  assert.match(content('_styles/components.css'), /:where\(\[data-moru-registry\]\)\.ui-theme-portal/)
})

test('keyframes and their animation references do not collide with host animation names', () => {
  const names = new Set()
  for (const [file, source] of generated.artifacts) if (file.startsWith('registry/moru/') && file.endsWith('.css')) {
    postcss.parse(source).walkAtRules((rule) => {
      if (/keyframes$/.test(rule.name)) {
        assert.ok(rule.params.startsWith('moru-registry-'))
        names.add(rule.params)
        assert.ok(rule.nodes.every((node) => node.type !== 'rule' || !node.selector.includes('data-moru-registry')))
      }
    })
    postcss.parse(source).walkDecls((declaration) => {
      if (/^animation/.test(declaration.prop)) assert.doesNotMatch(declaration.value, /(?<![\w-])ui-(?:spin|otp-blink|completion-spin|skeleton-pulse|progress-indeterminate)(?![\w-])/)
    })
  }
  assert.ok(names.has('moru-registry-ui-spin'))
  assert.ok(names.has('moru-registry-ui-otp-blink'))
})

test('minimal layout helpers work without importing a Tailwind reset or host CSS variables', () => {
  const utilities = content('_styles/utilities.css')
  for (const utility of ['inline-flex', 'flex-col', 'items-start', 'items-center', 'justify-center', 'w-full', 'min-w-0', 'shrink-0']) assert.ok(utilities.includes(`.${utility} `), utility)
  assert.doesNotMatch(utilities, /@import|:root|--color-|--spacing:/)
  assert.match(utilities, /:where\(\[data-moru-registry\]\) \*::before/)
})

test('generated modules need no allowImportingTsExtensions and carry client boundaries', () => {
  for (const [file, source] of generated.artifacts) if (file.startsWith('registry/moru/') && /\.tsx?$/.test(file)) {
    for (const specifier of moduleSpecifiers(source, file)) assert.doesNotMatch(specifier.value, /\.tsx?$/)
    if (file.endsWith('.tsx') || file.endsWith('/field-context.ts')) assert.ok(source.startsWith("'use client'"), file)
  }
})

test('manifest checksums cover every source and generated output', async () => {
  const manifest = JSON.parse(content('manifest.json'))
  assert.equal(manifest.sourceHash, generated.sourceHash)
  for (const file of manifest.files) assert.equal(file.sha256, createHash('sha256').update(generated.artifacts.get(file.path)).digest('hex'))
  for (const source of manifest.sources) assert.equal(source.sha256, createHash('sha256').update(await readFile(path.join(root, source.path))).digest('hex'))
  assert.equal(manifest.files.length + 1, generated.artifacts.size)
})

test('identical input produces byte-for-byte identical registry output', async () => {
  const again = await generateRegistry(root)
  assert.deepEqual([...again.artifacts], [...generated.artifacts])
})

test('module parsing ignores strings and comments while retaining type imports and exports', () => {
  const source = `// import './fake-a'\nconst s = "import './fake-b'"\nimport type { X } from './types'\nexport { y } from './helper'\ntype Z = import('./more-types').Z\nconst dynamic = import('./lazy')\nconst node = <div>{s}</div>`
  assert.deepEqual(moduleSpecifiers(source, 'example.tsx').map((entry) => entry.value), ['./types', './helper', './more-types', './lazy'])
})

test('CSS scoping retains nested conditions and refuses root-level token injection', () => {
  assert.throws(() => scopeRegistryCss(':root { --ui-text: red }'), /Global host selector/)
  assert.throws(() => scopeRegistryCss('body .ui-button { color:red }'), /Global host selector/)
  const css = scopeRegistryCss('@media (pointer: coarse) { .ui-button { min-height:44px } } @keyframes example { to { opacity: 1 } } .ui-button { animation:example 1s }')
  assert.match(css, /@media \(pointer: coarse\)/)
  assert.match(css, /animation:moru-registry-example 1s/)
  assert.match(css, /@keyframes moru-registry-example \{ to/)
})

test('check mode rejects modified output, stale sources and unexpected generated files', async () => {
  const directory = await fixture()
  await buildRegistry(directory)
  await verifyRegistry(directory)
  await writeFile(path.join(directory, 'registry/moru/button.tsx'), '// tampered')
  await assert.rejects(verifyRegistry(directory), /stale or modified/)
  await buildRegistry(directory)
  await writeFile(path.join(directory, 'registry/moru/extra.ts'), '// stale')
  await assert.rejects(verifyRegistry(directory), /file list is stale/)
  await buildRegistry(directory)
  const button = path.join(directory, 'src/components/ui/button.tsx')
  await writeFile(button, (await readFile(button, 'utf8')) + '\n// source changed\n')
  await assert.rejects(verifyRegistry(directory), /stale or modified/)
})

test('building a new current registry preserves old immutable HTTP release URLs', async () => {
  const directory = await fixture()
  await mkdir(path.join(directory, 'public/r/v0.1.0'), { recursive: true })
  await writeFile(path.join(directory, 'public/r/v0.1.0/button.json'), 'old release')
  await buildRegistry(directory)
  assert.equal(await readFile(path.join(directory, 'public/r/v0.1.0/button.json'), 'utf8'), 'old release')
  await verifyRegistry(directory)
})

test('the published v0.3.1 HTTP release remains byte-for-byte unchanged', async () => {
  const directory = path.join(root, 'public/r/v0.3.1')
  const files = (await readdir(directory)).filter((file) => file.endsWith('.json')).sort()
  assert.equal(files.length, 12)
  const digest = createHash('sha256')
  for (const file of files) { digest.update(file); digest.update('\0'); digest.update(await readFile(path.join(directory, file))); digest.update('\0') }
  assert.equal(digest.digest('hex'), '718ed9b99fabdc894b0243a7aae07d6d01203f3622e4912c5949d4a0037b350f')
})

test('unresolved imports and symlinked sources cannot enter a published payload', async () => {
  const directory = await fixture()
  const button = path.join(directory, 'src/components/ui/button.tsx')
  const original = await readFile(button, 'utf8')
  await writeFile(button, original + "\nimport './missing-file'\n")
  await assert.rejects(generateRegistry(directory), /Unresolved source import/)
  await rm(button)
  await writeFile(path.join(directory, 'source-link-target.tsx'), original)
  await symlink(path.join(directory, 'source-link-target.tsx'), button)
  await assert.rejects(generateRegistry(directory), /may not be a symlink/)
})

test('circular item dependencies fail before producing an installable registry', async () => {
  const directory = await fixture()
  for (const [file, other] of [['button', 'input'], ['input', 'button']]) {
    const source = path.join(directory, `src/components/ui/${file}.tsx`)
    await writeFile(source, (await readFile(source, 'utf8')) + `\nimport './${other}'\n`)
  }
  await assert.rejects(generateRegistry(directory), /Registry dependency cycle/)
})

test('npm package versions must be reproducibly pinned to the tested release', async () => {
  const directory = await fixture()
  const packagePath = path.join(directory, 'package.json')
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8'))
  packageJson.dependencies['@base-ui/react'] = '^1.9.0'
  await writeFile(packagePath, JSON.stringify(packageJson))
  await assert.rejects(generateRegistry(directory), /package version must be exact/)
})
