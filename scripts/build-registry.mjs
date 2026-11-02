import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { lstat, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'
import { parse } from '@babel/parser'

const scriptPath = fileURLToPath(import.meta.url)
const defaultRoot = path.dirname(path.dirname(scriptPath))
export const registryVersion = '0.3.4'
export const registryOrigin = 'https://moru-ui-lab.riius.chatgpt.site'
export const registryRepository = 'syrus-riius/moru-ui'
export const registryScope = ':where([data-moru-registry])'
const recipePath = 'scripts/build-registry.mjs'
const itemSchema = 'https://ui.shadcn.com/schema/registry-item.json'
const catalogSchema = 'https://ui.shadcn.com/schema/registry.json'
const banner = '// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT\n'
const cssBanner = '/* Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT */\n'

export const registryDefinitions = [
  { name: 'core', type: 'registry:base', title: 'Moru Core', description: 'Scoped styles, tokens, MoruProvider, and shared helpers.' },
  { name: 'button', entry: 'src/components/ui/button.tsx', title: 'Button', description: 'Accessible button with variants, loading and disabled states.' },
  { name: 'input', entry: 'src/components/ui/input.tsx', title: 'Input', description: 'Accessible text input with Field integration.' },
  { name: 'field', entry: 'src/components/ui/field.tsx', title: 'Field', description: 'Connected labels, descriptions and validation messages.' },
  { name: 'card', entry: 'src/components/ui/card.tsx', title: 'Card', description: 'A quiet, token-based content surface.' },
  { name: 'checkbox', entry: 'src/components/ui/checkbox.tsx', title: 'Checkbox', description: 'Accessible checkbox with label, description and loading state.' },
  { name: 'password-input', entry: 'src/components/ui/password-input.tsx', title: 'Password Input', description: 'Password input with an accessible visibility toggle.' },
  { name: 'input-otp', entry: 'src/components/ui/input-otp.tsx', title: 'Input OTP', description: 'Single native input with visual slots and one-time-code autofill.' },
  { name: 'status-message', entry: 'src/components/ui/status-message.tsx', title: 'Status Message', description: 'Semantic status feedback using text and icons.' },
  { name: 'select', entry: 'src/components/ui/select.tsx', title: 'Select', description: 'Accessible select with keyboard navigation and scoped popup theming.' },
  { name: 'badge', entry: 'src/components/ui/badge.tsx', title: 'Badge', description: 'Compact status and category labels using semantic tokens.' },
  { name: 'switch', entry: 'src/components/ui/switch.tsx', title: 'Switch', description: 'Accessible labelled switch with form and Field integration.' },
  { name: 'dialog', entry: 'src/components/ui/dialog.tsx', title: 'Dialog', description: 'Modal dialog with managed focus and scoped portals.' },
  { name: 'textarea', entry: 'src/components/ui/textarea.tsx', title: 'Textarea', description: 'Multiline input with Field integration and loading state.' },
  { name: 'tabs', entry: 'src/components/ui/tabs.tsx', title: 'Tabs', description: 'Accessible horizontal or vertical tabs with controlled selection and keyboard navigation.' },
  { name: 'menu', entry: 'src/components/ui/menu.tsx', title: 'Menu', description: 'Dropdown actions with keyboard navigation, disabled items and scoped popup theming.' },
  { name: 'popover', entry: 'src/components/ui/popover.tsx', title: 'Popover', description: 'Anchored popup with managed focus, collision handling and scoped portal styling.' },
  { name: 'drawer', entry: 'src/components/ui/drawer.tsx', title: 'Drawer', description: 'Bottom modal drawer with managed focus and keyboard or pointer dismissal.' },
  { name: 'calendar', entry: 'src/components/ui/calendar.tsx', title: 'Calendar', description: 'Calendar with single-date or range selection, year/month navigation and display variants.' },
  { name: 'date-picker', entry: 'src/components/ui/date-picker.tsx', title: 'Date Picker', description: 'Single-date field with a calendar popup, date bounds and native form integration.' },
  { name: 'date-range-picker', entry: 'src/components/ui/date-range-picker.tsx', title: 'Date Range Picker', description: 'Start/end date field with range selection, calendar display options and native form integration.' },
  { name: 'time-picker', entry: 'src/components/ui/time-picker.tsx', title: 'Time Picker', description: 'Wall-clock time field with direct input, hour/minute selection and configurable time bounds or steps.' },
  { name: 'time-range-picker', entry: 'src/components/ui/time-range-picker.tsx', title: 'Time Range Picker', description: 'Paired start/end time fields with duration feedback and optional overnight ranges.' },
  { name: 'login', entry: 'src/components/blocks/LoginBlock.tsx', type: 'registry:block', title: 'Login Block', description: 'Local login form demo. Connect your own authentication service.' },
  { name: 'otp', entry: 'src/components/blocks/OTPBlock.tsx', type: 'registry:block', title: 'OTP Block', description: 'Local OTP verification demo. The sample code is 123456.' },
  { name: 'search-filters', entry: 'src/components/blocks/SearchFiltersBlock.tsx', type: 'registry:block', title: 'Search Filters Block', description: 'Composable query, status and assignee filters with local demo data and a controlled application API.' },
  { name: 'settings', entry: 'src/components/blocks/SettingsBlock.tsx', type: 'registry:block', title: 'Settings Block', description: 'Workspace settings form with local demo feedback and controlled application save handlers.' },
]

const coreEntries = [
  'src/components/ui/theme-scope.tsx', 'src/components/ui/overlay-portal.tsx',
  'src/components/ui/field-context.ts', 'src/components/ui/state.ts',
  'src/components/ui/styles.css', 'src/theme/readability.css',
  // Shared by Popover and the date/time fields. Components import it on demand.
  'src/components/ui/overlays.css',
]
// Calendar is the common foundation of both date fields. Keep their small shared
// helpers here so a range field does not need the unused single-date component,
// and unrelated core/Button installations do not include calendar JavaScript.
const itemSupportEntries = {
  calendar: [
    'src/components/ui/calendar-options.ts',
    'src/components/ui/date-picker-form-utils.ts',
    'src/components/ui/date-picker-form.css',
  ],
}
const specialTargets = {
  'src/components/ui/styles.css': '_styles/components.css',
  'src/components/ui/form-controls.css': '_styles/form-controls.css',
  'src/components/ui/feedback.css': '_styles/feedback.css',
  'src/theme/readability.css': '_styles/readability.css',
}
const sha = (value) => createHash('sha256').update(value).digest('hex')
const json = (value) => JSON.stringify(value, null, 2) + '\n'
const relativePath = (from, to) => {
  const result = path.posix.relative(path.posix.dirname(from), to)
  return result.startsWith('.') ? result : `./${result}`
}

/** Parse actual module specifiers instead of guessing from TSX strings or comments. */
export function moduleSpecifiers(source, file = 'component.tsx') {
  const parsed = parse(source, { sourceType: 'module', plugins: ['typescript', ...(file.endsWith('.tsx') ? ['jsx'] : [])] })
  const imports = []
  function visit(node) {
    if (!node || typeof node !== 'object') return
    let specifier
    if (['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration'].includes(node.type)) specifier = node.source
    else if (node.type === 'TSImportType') specifier = node.argument
    else if (node.type === 'ImportExpression') specifier = node.source
    else if (node.type === 'CallExpression' && node.callee?.type === 'Import') specifier = node.arguments[0]
    if (specifier?.type === 'StringLiteral') imports.push({ value: specifier.value, start: specifier.start + 1, end: specifier.end - 1 })
    for (const [key, value] of Object.entries(node)) {
      if (['loc', 'extra', 'comments', 'leadingComments', 'trailingComments', 'innerComments'].includes(key)) continue
      if (Array.isArray(value)) for (const child of value) visit(child)
      else if (value && typeof value === 'object') visit(value)
    }
  }
  visit(parsed)
  return imports.sort((left, right) => left.start - right.start)
}

function cssImports(source) {
  const imports = []
  postcss.parse(source).walkAtRules('import', (rule) => {
    const match = rule.params.match(/^['"]([^'"]+)['"]$/)
    if (!match) throw new Error(`Registry CSS only supports local quoted imports: ${rule.params}`)
    imports.push(match[1])
  })
  return imports
}

function sourceTarget(source) {
  if (specialTargets[source]) return specialTargets[source]
  if (source.startsWith('src/components/ui/')) return source.slice('src/components/ui/'.length)
  if (source.startsWith('src/components/blocks/')) return `blocks/${source.slice('src/components/blocks/'.length)}`
  if (source.startsWith('src/lib/')) return `_lib/${source.slice('src/lib/'.length)}`
  if (source.startsWith('src/theme/')) return `_theme/${source.slice('src/theme/'.length)}`
  throw new Error(`Source is outside the public registry allowlist: ${source}`)
}

async function resolveSource(root, importer, specifier) {
  if (!specifier.startsWith('.')) return null
  const candidate = path.posix.normalize(path.posix.join(path.posix.dirname(importer), specifier))
  if (!candidate.startsWith('src/') || /(?:^|\/)\./.test(candidate)) throw new Error(`Unsafe registry import: ${importer} → ${specifier}`)
  const resolved = ['', '.ts', '.tsx', '.css', '/index.ts', '/index.tsx'].map((suffix) => `${candidate}${suffix}`).find((file) => existsSync(path.join(root, file)))
  if (!resolved) throw new Error(`Unresolved source import: ${importer} → ${specifier}`)
  sourceTarget(resolved)
  if (/\.(test|spec)\./.test(resolved)) throw new Error(`Test code may not be installed: ${resolved}`)
  return resolved
}

function isKeyframeRule(rule) {
  for (let parent = rule.parent; parent; parent = parent.parent) {
    if (parent.type === 'atrule' && /keyframes$/i.test(parent.name)) return true
  }
  return false
}

/** Scope ordinary and media rules, while keeping keyframe selectors valid. */
export function scopeRegistryCss(source, keyframeNames = new Set()) {
  const stylesheet = postcss.parse(source)
  stylesheet.walkAtRules((rule) => {
    if (/keyframes$/i.test(rule.name)) {
      keyframeNames.add(rule.params)
      rule.params = `moru-registry-${rule.params}`
    }
  })
  stylesheet.walkRules((rule) => {
    if (isKeyframeRule(rule)) return
    rule.selectors = rule.selectors.flatMap((selector) => {
      if (/(^|[\s,>+~])(?::root|html|body)(?=$|[\s,>+~.:[#])/i.test(selector)) {
        throw new Error(`Global host selector may not enter the registry: ${selector}`)
      }
      const result = [`${registryScope} ${selector}`]
      // ThemeScope and its portal are themselves scope roots, not descendants.
      if (/^\.ui-theme-(?:scope|portal)\b/.test(selector)) result.unshift(`${registryScope}${selector}`)
      return result
    })
  })
  stylesheet.walkDecls((declaration) => {
    if (!/^(?:-webkit-)?animation(?:-name)?$/.test(declaration.prop)) return
    for (const name of keyframeNames) {
      declaration.value = declaration.value.replace(new RegExp(`(?<![\\w-])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`, 'g'), `moru-registry-${name}`)
    }
  })
  return stylesheet.toString()
}

const utilities = `/* Minimal layout utilities used by the selected original sources; no Tailwind reset. */
.inline-flex { display: inline-flex; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }
.gap-2 { gap: 0.5rem; }
.whitespace-nowrap { white-space: nowrap; }
.w-full { width: 100%; }
.min-w-0 { min-width: 0; }
.shrink-0 { flex-shrink: 0; }
.ui-theme-scope, *, *::before, *::after { box-sizing: border-box; }
button, input, textarea, select { font: inherit; }
` 

const providerSource = `'use client'
${banner}import { ThemeScope, type ThemeScopeProps } from './theme-scope'
import { createDarkTokens, defaultTokens, type ThemeMode, type ThemeTokens } from './_theme/tokens'

export interface MoruProviderProps extends Omit<ThemeScopeProps, 'mode' | 'tokens'> {
  mode?: ThemeMode
  tokens?: ThemeTokens
}

const darkTokens = createDarkTokens(defaultTokens)

/** Import ./styles.css once, then wrap Moru components. Host tokens are not modified. */
export function MoruProvider({ mode = 'light', tokens, children, ...props }: MoruProviderProps) {
  return <ThemeScope {...props} mode={mode} tokens={tokens ?? (mode === 'dark' ? darkTokens : defaultTokens)}>{children}</ThemeScope>
}
`

function packageName(specifier) {
  return specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0]
}

function fileType(file) {
  if (!/\.tsx?$/.test(file)) return 'registry:file'
  if (file.startsWith('_lib/') || file.startsWith('_theme/')) return 'registry:lib'
  return 'registry:ui'
}

function sourceRewrite(source, importer, imports, graph) {
  let result = source
  for (const specifier of [...imports].reverse()) {
    if (!specifier.value.startsWith('.')) continue
    const resolved = graph.get(importer).dependencies.get(specifier.value)
    if (!resolved) throw new Error(`Missing transformed registry import: ${importer} → ${specifier.value}`)
    let target = relativePath(sourceTarget(importer), sourceTarget(resolved))
    if (/\.tsx?$/.test(target)) target = target.replace(/\.tsx?$/, '')
    result = result.slice(0, specifier.start) + target + result.slice(specifier.end)
  }
  if (importer === 'src/components/ui/theme-scope.tsx') {
    const original = "const attributes = { 'data-mode': mode,"
    if (!result.includes(original)) throw new Error('ThemeScope source changed; review registry scope markers before regenerating.')
    result = result.replace(original, "const attributes = { 'data-moru-registry': '', 'data-mode': mode,")
  }
  const client = importer.endsWith('.tsx') || ['src/components/ui/field-context.ts', 'src/components/ui/time-field-context.ts'].includes(importer)
  return `${client ? "'use client'\n" : ''}${banner}${result}`
}

/** Return deterministic artifacts without writing, useful for CI and fixture tests. */
export async function generateRegistry(root = defaultRoot) {
  const graph = new Map()
  async function readSource(file) {
    if (graph.has(file)) return
    if ((await lstat(path.join(root, file))).isSymbolicLink()) throw new Error(`Registry source may not be a symlink: ${file}`)
    const source = await readFile(path.join(root, file), 'utf8')
    const specifiers = file.endsWith('.css') ? cssImports(source).map((value) => ({ value })) : moduleSpecifiers(source, file)
    const record = { source, specifiers, dependencies: new Map() }
    graph.set(file, record)
    for (const specifier of specifiers) {
      const resolved = await resolveSource(root, file, specifier.value)
      if (resolved) { record.dependencies.set(specifier.value, resolved); await readSource(resolved) }
    }
  }
  for (const entry of [...coreEntries, ...registryDefinitions.filter((item) => item.entry).map((item) => item.entry), ...Object.values(itemSupportEntries).flat()]) await readSource(entry)
  const rootPackage = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
  if (rootPackage.version !== registryVersion) throw new Error(`Registry recipe version ${registryVersion} differs from package version ${rootPackage.version}. Review release URLs before building.`)
  const sourceFiles = [...graph.keys(), 'LICENSE', 'NOTICE.md', 'package.json', recipePath].sort()
  const sourceHash = createHash('sha256')
  const sourceRecords = []
  for (const file of sourceFiles) {
    if ((await lstat(path.join(root, file))).isSymbolicLink()) throw new Error(`Registry source may not be a symlink: ${file}`)
    const content = await readFile(path.join(root, file))
    sourceHash.update(file); sourceHash.update('\0'); sourceHash.update(content); sourceHash.update('\0')
    sourceRecords.push({ path: file, sha256: sha(content) })
  }
  const hash = sourceHash.digest('hex')
  const coreSources = new Set()
  function collectCore(file) {
    if (coreSources.has(file)) return
    coreSources.add(file)
    for (const dependency of graph.get(file).dependencies.values()) collectCore(dependency)
  }
  for (const entry of coreEntries) collectCore(entry)
  const primaryOwners = new Map([
    ...registryDefinitions.filter((item) => item.entry).map((item) => [item.entry, item.name]),
    ...Object.entries(itemSupportEntries).flatMap(([owner, files]) => files.map((file) => [file, owner])),
  ])
  const ownership = new Map([...coreSources].map((file) => [file, 'core']))
  const itemSources = new Map([['core', coreSources]])
  const itemDependencies = new Map([['core', new Set()]])
  for (const item of registryDefinitions.filter((item) => item.entry)) {
    const files = new Set()
    const dependencies = new Set(['core'])
    function collect(file) {
      const owner = coreSources.has(file) ? 'core' : primaryOwners.get(file)
      if (owner && owner !== item.name) { dependencies.add(owner); return }
      if (files.has(file)) return
      const prior = ownership.get(file)
      // Direct helper/CSS imports can refer to a dependency item's owned files.
      // Reuse that item rather than writing the same target more than once.
      if (prior && prior !== item.name) { dependencies.add(prior); return }
      ownership.set(file, item.name)
      files.add(file)
      for (const dependency of graph.get(file).dependencies.values()) collect(dependency)
    }
    collect(item.entry)
    for (const support of itemSupportEntries[item.name] ?? []) collect(support)
    itemSources.set(item.name, files)
    itemDependencies.set(item.name, dependencies)
  }
  const keyframes = new Set()
  for (const [file, record] of graph) {
    if (file.endsWith('.css')) postcss.parse(record.source).walkAtRules((rule) => { if (/keyframes$/i.test(rule.name)) keyframes.add(rule.params) })
  }
  const generatedFiles = new Map()
  for (const [file, record] of graph) {
    const target = sourceTarget(file)
    let content
    if (file.endsWith('.css')) {
      const stylesheet = postcss.parse(record.source)
      stylesheet.walkAtRules('import', (rule) => {
        const specifier = rule.params.slice(1, -1)
        const resolved = record.dependencies.get(specifier)
        rule.params = `'${relativePath(target, sourceTarget(resolved))}'`
      })
      content = cssBanner + scopeRegistryCss(stylesheet.toString(), keyframes) + '\n'
    } else content = sourceRewrite(record.source, file, record.specifiers, graph)
    if (generatedFiles.has(target)) throw new Error(`Generated target collision: ${target}`)
    generatedFiles.set(target, content)
  }
  generatedFiles.set('provider.tsx', providerSource)
  generatedFiles.set('_styles/utilities.css', cssBanner + scopeRegistryCss(utilities, keyframes))
  generatedFiles.set('styles.css', `${cssBanner}@import './_styles/utilities.css';\n@import './_styles/components.css';\n@import './_styles/readability.css';\n`)
  generatedFiles.set('_licenses/Moru-LICENSE', await readFile(path.join(root, 'LICENSE'), 'utf8'))
  generatedFiles.set('_licenses/NOTICE.md', `# Moru UI registry notices\n\nOriginal Moru source is MIT licensed. Keep the full copyright and license in\n\`Moru-LICENSE\` when redistributing copies or substantial portions of this code.\nSPDX comments in source files do not replace that notice.\n\nDependencies retain their own terms. React, React DOM and Base UI use MIT;\nLucide icons use ISC. Read the installed npm packages' LICENSE files before\nredistributing or bundling those packages. Fonts are not installed by this registry.\n\nRepository notices: https://github.com/${registryRepository}/blob/main/NOTICE.md\nInstallation guide: https://github.com/${registryRepository}/blob/main/docs/registry.ko.md\n`)

  const itemFiles = new Map()
  for (const [item, sources] of itemSources) itemFiles.set(item, [...sources].map(sourceTarget))
  itemFiles.get('core').push('provider.tsx', '_styles/utilities.css', 'styles.css', '_licenses/Moru-LICENSE', '_licenses/NOTICE.md')
  const dependencyVersions = rootPackage.dependencies ?? {}
  function externalDependencies(sources) {
    const packages = new Set()
    for (const source of sources) for (const specifier of graph.get(source).specifiers) {
      if (specifier.value.startsWith('.')) continue
      const name = packageName(specifier.value)
      if (name === 'react' || name === 'react-dom') continue
      if (!dependencyVersions[name]) throw new Error(`Registry package lacks a tested version: ${name}`)
      if (!/^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(dependencyVersions[name])) throw new Error(`Registry package version must be exact: ${name}@${dependencyVersions[name]}`)
      packages.add(`${name}@${dependencyVersions[name]}`)
    }
    return [...packages].sort()
  }
  const docs = `Import the installed moru/styles.css once in your application entry. Wrap Moru components in MoruProvider from moru/provider. mode defaults to light; pass mode="dark" for dark defaults. This beta is tested with Vite + React; Next.js SSR and React Native are not verified. Shared core CSS is installed once; fonts are optional and are not downloaded by this registry. Keep moru/_licenses/Moru-LICENSE when redistributing source. Guide: https://github.com/${registryRepository}/blob/main/docs/registry.ko.md`
  function manifest(item, transport, includeContent = false) {
    const dependencies = [...itemDependencies.get(item.name)].sort().map((dependency) => transport === 'github'
      ? `${registryRepository}/${dependency}#v${registryVersion}`
      : `${registryOrigin}/r/v${registryVersion}/${dependency}.json`)
    return {
      $schema: itemSchema, name: item.name, type: item.type ?? 'registry:ui', title: item.title, description: item.description,
      ...(externalDependencies(itemSources.get(item.name)).length ? { dependencies: externalDependencies(itemSources.get(item.name)) } : {}),
      ...(dependencies.length ? { registryDependencies: dependencies } : {}),
      files: itemFiles.get(item.name).sort().map((file) => ({ path: `registry/moru/${file}`, type: fileType(file), target: `@ui/moru/${file}`, ...(includeContent ? { content: generatedFiles.get(file) } : {}) })),
      docs: item.type === 'registry:block' ? `${docs} Authentication, code verification, resend, and persistence are local demonstrations; connect your own services.` : docs,
      categories: [item.type === 'registry:block' ? 'blocks' : item.name === 'core' ? 'foundation' : 'components'],
      meta: { version: registryVersion, sourceHash: hash, license: 'MIT', testedWith: { react: dependencyVersions.react, reactDom: dependencyVersions['react-dom'] } },
    }
  }
  const artifacts = new Map()
  for (const [file, content] of generatedFiles) artifacts.set(`registry/moru/${file}`, content)
  const catalog = (transport) => ({ $schema: catalogSchema, name: 'moru-ui', homepage: registryOrigin, items: registryDefinitions.map((item) => manifest(item, transport)) })
  artifacts.set('registry.json', json(catalog('github')))
  artifacts.set('public/r/registry.json', json(catalog('http')))
  artifacts.set(`public/r/v${registryVersion}/registry.json`, json(catalog('http')))
  for (const item of registryDefinitions) artifacts.set(`public/r/v${registryVersion}/${item.name}.json`, json(manifest(item, 'http', true)))
  const generatedRecords = [...artifacts].sort(([left], [right]) => left.localeCompare(right, 'en')).map(([file, content]) => ({ path: file, sha256: sha(content) }))
  artifacts.set('registry/moru/manifest.json', json({ schemaVersion: 1, version: registryVersion, sourceHash: hash, sources: sourceRecords, files: generatedRecords }))
  validateArtifacts(artifacts)
  return { artifacts, sourceHash: hash, sources: sourceRecords, itemCount: registryDefinitions.length, generatedCount: artifacts.size }
}

function validateArtifacts(artifacts) {
  for (const [file, content] of artifacts) {
    if (!file.startsWith('registry/moru/') || !/\.(?:tsx?|css)$/.test(file)) continue
    const specifiers = file.endsWith('.css') ? cssImports(content) : moduleSpecifiers(content, file).map((specifier) => specifier.value)
    for (const specifier of specifiers.filter((specifier) => specifier.startsWith('.'))) {
      const candidate = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier))
      if (!['', '.ts', '.tsx', '.css', '/index.ts'].some((suffix) => artifacts.has(`${candidate}${suffix}`))) {
        throw new Error(`Unresolved generated import: ${file} → ${specifier}`)
      }
    }
  }
  const targets = new Set()
  const catalog = JSON.parse(artifacts.get('registry.json'))
  const itemMap = new Map(catalog.items.map((item) => [item.name, item]))
  function checkDependencies(name, parents = []) {
    if (parents.includes(name)) throw new Error(`Registry dependency cycle: ${[...parents, name].join(' → ')}`)
    const item = itemMap.get(name)
    if (!item) throw new Error(`Missing registry dependency item: ${name}`)
    for (const dependency of item.registryDependencies ?? []) checkDependencies(dependency.split('/').at(-1).split('#')[0], [...parents, name])
  }
  for (const item of catalog.items) checkDependencies(item.name)
  for (const item of catalog.items) for (const file of item.files) {
    if (!file.target.startsWith('@ui/moru/')) throw new Error(`Unsafe installation target: ${file.target}`)
    if (targets.has(file.target)) throw new Error(`Installation target belongs to multiple items: ${file.target}`)
    targets.add(file.target)
    if (!artifacts.has(file.path)) throw new Error(`Registry manifest refers to a missing file: ${file.path}`)
  }
}

async function ownedFiles(root, directory) {
  if (!existsSync(path.join(root, directory))) return []
  const result = []
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    const file = path.posix.join(directory, entry.name)
    if (entry.isSymbolicLink()) throw new Error(`Generated registry contains a symlink: ${file}`)
    if (entry.isDirectory()) result.push(...await ownedFiles(root, file))
    else result.push(file)
  }
  return result
}

export async function verifyRegistry(root = defaultRoot) {
  const generated = await generateRegistry(root)
  const existing = ['registry.json', 'public/r/registry.json', ...await ownedFiles(root, 'registry/moru'), ...await ownedFiles(root, `public/r/v${registryVersion}`)]
  if (existing.length !== generated.artifacts.size || existing.some((file) => !generated.artifacts.has(file))) {
    throw new Error('Moru registry file list is stale. Run node scripts/build-registry.mjs.')
  }
  for (const [file, content] of generated.artifacts) {
    let current
    try { current = await readFile(path.join(root, file), 'utf8') } catch { throw new Error(`Moru registry is missing ${file}. Run node scripts/build-registry.mjs.`) }
    if (current !== content) throw new Error(`Moru registry is stale or modified: ${file}. Run node scripts/build-registry.mjs.`)
  }
  return { version: registryVersion, sourceHash: generated.sourceHash, itemCount: generated.itemCount, generatedCount: generated.generatedCount }
}

export async function buildRegistry(root = defaultRoot) {
  const generated = await generateRegistry(root)
  // Only these generated directories belong to this script; source is never edited.
  await rm(path.join(root, 'registry/moru'), { recursive: true, force: true })
  // Older immutable release URLs must remain available for pinned dependencies.
  await rm(path.join(root, `public/r/v${registryVersion}`), { recursive: true, force: true })
  for (const [file, content] of generated.artifacts) {
    await mkdir(path.dirname(path.join(root, file)), { recursive: true })
    await writeFile(path.join(root, file), content)
  }
  return { version: registryVersion, sourceHash: generated.sourceHash, itemCount: generated.itemCount, generatedCount: generated.generatedCount }
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  try {
    const result = process.argv.includes('--check') ? await verifyRegistry() : await buildRegistry()
    console.log(JSON.stringify({ registry: process.argv.includes('--check') ? 'verified' : 'built', ...result }))
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
