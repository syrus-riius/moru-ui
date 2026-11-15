import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { parse } from '@babel/parser'
import postcss from 'postcss'
import { generateRegistry, moduleSpecifiers } from './build-registry.mjs'

const scriptPath = fileURLToPath(import.meta.url)
const defaultRoot = path.dirname(path.dirname(scriptPath))
const registryPrefix = 'registry/moru/'

// These components have optional peer dependencies and their own public entry points.
export const optionalComponentModules = ['chart', 'data-table', 'carousel', 'resizable']

const foundationCss = [
  '_styles/utilities.css',
  '_styles/components.css',
  'style-packs.css',
  'controls-shared.css',
  'advanced-controls-shared.css',
  'navigation-shared.css',
  'content-shared.css',
  'enhanced-input.css',
  'overlay-shared.css',
  'workflow-shared.css',
  'time-shared.css',
]

function parseSource(source, file) {
  return parse(source, {
    sourceType: 'module',
    plugins: ['typescript', ...(file.endsWith('.tsx') ? ['jsx'] : [])],
  })
}

function resolveModule(file, specifier, sources) {
  const target = path.posix.join(path.posix.dirname(file), specifier)
  const stem = target.replace(/\.js$/, '')
  const resolved = [
    target,
    `${stem}.ts`,
    `${stem}.tsx`,
    `${stem}/index.ts`,
    `${stem}/index.tsx`,
  ].find((candidate) => /\.tsx?$/.test(candidate) && sources.has(candidate))

  if (!resolved) throw new Error(`Missing package import: ${file} → ${specifier}`)

  let relative = path.posix.relative(path.posix.dirname(file), resolved).replace(/\.tsx?$/, '.js')
  if (!relative.startsWith('.')) relative = `./${relative}`
  return { resolved, relative }
}

/** Preserve directives and source text while making imports valid in an installed ESM package. */
export function rewritePackageSource(source, file, sources) {
  const edits = []
  const removedCss = new Set()

  for (const node of parseSource(source, file).program.body) {
    if (node.type !== 'ImportDeclaration' || !node.source.value.endsWith('.css')) continue
    if (node.specifiers.length) throw new Error(`CSS bindings are not supported: ${file}`)
    removedCss.add(node.source.start + 1)
    edits.push({ start: node.start, end: node.end, text: '' })
  }

  for (const specifier of moduleSpecifiers(source, file)) {
    if (specifier.value.endsWith('.css')) {
      if (!removedCss.has(specifier.start)) {
        throw new Error(`Only side-effect CSS imports are supported: ${file}`)
      }
      continue
    }
    if (!specifier.value.startsWith('.')) continue
    const { relative } = resolveModule(file, specifier.value, sources)
    edits.push({ ...specifier, text: relative })
  }

  let result = source
  for (const edit of edits.sort((left, right) => right.start - left.start)) {
    result = result.slice(0, edit.start) + edit.text + result.slice(edit.end)
  }
  return result
}

/** Reuse the reviewed UI barrel, without exposing the Lab's theme hook or optional peers. */
export function createPackageEntries(uiBarrel, sources) {
  const optionalFiles = new Set(optionalComponentModules.map((name) => `${name}.tsx`))
  const uiExports = []

  for (const node of parseSource(uiBarrel, 'index.ts').program.body) {
    if (!['ExportNamedDeclaration', 'ExportAllDeclaration'].includes(node.type) || !node.source) {
      throw new Error('The UI public entry must contain only module re-exports.')
    }
    const { resolved, relative } = resolveModule('index.ts', node.source.value, sources)
    if (optionalFiles.has(resolved)) continue
    uiExports.push(
      uiBarrel.slice(node.start, node.source.start) +
        JSON.stringify(relative) +
        uiBarrel.slice(node.source.end, node.end),
    )
  }

  return new Map([
    [
      'index.ts',
      [
        ...uiExports,
        "export * from './provider.js'",
        "export * from './_theme/tokens.js'",
        '',
      ].join('\n'),
    ],
    [
      'blocks.ts',
      [
        "export { LoginBlock } from './blocks/LoginBlock.js'",
        "export { SignupBlock } from './blocks/SignupBlock.js'",
        "export { OTPBlock } from './blocks/OTPBlock.js'",
        "export { SearchFiltersBlock } from './blocks/SearchFiltersBlock.js'",
        "export type { SearchFilterItem, SearchFiltersValue, SearchFiltersBlockProps } from './blocks/SearchFiltersBlock.js'",
        "export { SettingsBlock } from './blocks/SettingsBlock.js'",
        "export type { WorkspaceSettingsValue, SettingsBlockProps } from './blocks/SettingsBlock.js'",
        '',
      ].join('\n'),
    ],
    [
      'dashboard.ts',
      [
        "export { DashboardBlock } from './blocks/DashboardBlock.js'",
        "export type { DashboardBlockProps, DashboardProject } from './blocks/DashboardBlock.js'",
        '',
      ].join('\n'),
    ],
  ])
}

/** Inline each scoped stylesheet once, keeping shared defaults before component variations. */
export function createPackageStyles(sources) {
  const emitted = new Set()
  const active = new Set()

  function flatten(file) {
    if (active.has(file)) throw new Error(`Circular package CSS import: ${file}`)
    if (emitted.has(file)) return postcss.root()
    const source = sources.get(file)
    if (source === undefined) throw new Error(`Missing package CSS: ${file}`)

    active.add(file)
    const sheet = postcss.parse(source, { from: file })
    sheet.walkAtRules('import', (rule) => {
      const match = rule.params.match(/^['"]([^'"]+)['"]$/)
      if (!match || !match[1].startsWith('.')) {
        throw new Error(`Unsupported package CSS import: ${rule.params}`)
      }
      const imported = path.posix.join(path.posix.dirname(file), match[1])
      rule.replaceWith(...flatten(imported).nodes)
    })
    active.delete(file)
    emitted.add(file)
    return sheet
  }

  // styles.css is the registry's aggregate entry; including it would place readability too early.
  const cssFiles = [...sources.keys()]
    .filter((file) => file.endsWith('.css') && file !== 'styles.css')
    .sort()
  const finalCss = [
    ...cssFiles.filter((file) => file.endsWith('-variations.css')),
    '_styles/readability.css',
  ]
  const reserved = new Set([...foundationCss, ...finalCss])
  const order = [...foundationCss, ...cssFiles.filter((file) => !reserved.has(file)), ...finalCss]
  const css =
    order
      .map((file) => flatten(file).toString())
      .filter(Boolean)
      .join('\n\n') + '\n'
  return { css, files: [...emitted] }
}

/** Generate in memory: npm and registry distributions share one source transformation. */
export async function generatePackage(root = defaultRoot) {
  const { artifacts, sourceHash } = await generateRegistry(root)
  const sources = new Map(
    [...artifacts]
      .filter(([file]) => file.startsWith(registryPrefix))
      .map(([file, content]) => [file.slice(registryPrefix.length), content]),
  )
  const preparedSources = new Map(
    [...sources]
      .filter(([file]) => /\.tsx?$/.test(file))
      .sort(([left], [right]) => left.localeCompare(right, 'en'))
      .map(([file, content]) => [file, rewritePackageSource(content, file, sources)]),
  )
  const uiBarrel = readFileSync(path.join(root, 'src/components/ui/index.ts'), 'utf8')
  for (const [file, content] of createPackageEntries(uiBarrel, sources)) {
    preparedSources.set(file, content)
  }
  const styles = createPackageStyles(sources)
  return { sources: preparedSources, styles, sourceHash }
}

function write(file, content) {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, content)
}

export async function buildPackage(root = defaultRoot) {
  const generated = await generatePackage(root)
  const staging = path.join(root, '.qa/moru-package-src')
  const dist = path.join(root, 'packages/moru-react/dist')

  // Only this build's generated directories are replaced; tracked registry files are untouched.
  rmSync(staging, { recursive: true, force: true })
  rmSync(dist, { recursive: true, force: true })
  for (const [file, content] of generated.sources) write(path.join(staging, file), content)

  execFileSync(
    process.execPath,
    [
      path.join(root, 'node_modules/typescript/bin/tsc'),
      '-p',
      path.join(root, 'tsconfig.package.json'),
    ],
    { cwd: root, stdio: 'inherit' },
  )
  write(path.join(dist, 'styles.css'), generated.styles.css)
  write(
    path.join(dist, 'styles.d.ts'),
    readFileSync(path.join(root, 'packages/moru-react/css.d.ts'), 'utf8'),
  )

  return {
    sources: generated.sources.size,
    stylesheets: generated.styles.files.length,
    sourceHash: generated.sourceHash,
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  try {
    const result = await buildPackage()
    console.log(JSON.stringify({ package: 'built', ...result }))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
