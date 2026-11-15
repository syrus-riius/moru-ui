import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from '@babel/parser'
import {
  generateRegistry,
  registryDefinitions,
  registryOrigin,
  registryRepository,
  registryVersion,
} from './build-registry.mjs'
import { itemGuidance } from './ai-docs-metadata.mjs'

const scriptPath = fileURLToPath(import.meta.url)
const defaultRoot = path.dirname(path.dirname(scriptPath))
const base = `/ai/v${registryVersion}`
const json = (value) => `${JSON.stringify(value, null, 2)}\n`
const code = (value, language = 'tsx') => `\n\`\`\`${language}\n${value.trim()}\n\`\`\`\n`
const withoutExtension = (value) => value.replace(/\.[cm]?[jt]sx?$/, '')
const sourceTarget = (item) =>
  item.name === 'core'
    ? 'registry/moru/provider.tsx'
    : item.type === 'registry:block'
      ? `registry/moru/blocks/${path.basename(item.entry)}`
      : `registry/moru/${path.basename(item.entry)}`

function identifiers(node, result = new Set()) {
  if (!node || typeof node !== 'object') return result
  if (node.type === 'Identifier') result.add(node.name)
  for (const [key, value] of Object.entries(node)) {
    if (
      ['loc', 'start', 'end', 'extra', 'comments', 'leadingComments', 'trailingComments'].includes(
        key,
      )
    )
      continue
    if (Array.isArray(value)) value.forEach((child) => identifiers(child, result))
    else if (value && typeof value === 'object') identifiers(value, result)
  }
  return result
}

// Read declarations instead of maintaining an independent (and eventually stale) API schema.
function inspectSource(source, filename) {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
    sourceFilename: filename,
  })
  const exports = new Set()
  const publicTypes = new Map()
  const localTypes = new Map()
  const signatures = []
  const bindings = []
  const exportedTypeNames = new Set()
  const propsNodes = []
  const defaults = []
  const imports = []
  const typeReexports = []
  const slice = (node) => source.slice(node.start, node.end)

  function inspectFunction(fn, name) {
    if (!fn || !/^[A-Z]/.test(name)) return
    const patterns = fn.params.map((param) =>
      param.type === 'AssignmentPattern' ? param.left : param,
    )
    for (const statement of fn.body?.body ?? []) {
      if (statement.type !== 'VariableDeclaration') continue
      for (const declaration of statement.declarations) {
        if (
          declaration.id.type === 'ObjectPattern' &&
          declaration.init?.type === 'Identifier' &&
          declaration.init.name === 'props'
        )
          patterns.push(declaration.id)
      }
    }
    for (const pattern of patterns) {
      if (pattern.type !== 'ObjectPattern') continue
      for (const property of pattern.properties) {
        if (property.type !== 'ObjectProperty' || property.value.type !== 'AssignmentPattern')
          continue
        defaults.push({
          component: name,
          prop: property.key.name ?? property.key.value,
          value: slice(property.value.right),
        })
      }
    }
  }

  for (const statement of ast.program.body) {
    if (statement.type === 'ImportDeclaration') imports.push(statement)
    const declaration =
      statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement
    if (
      declaration &&
      ['TSTypeAliasDeclaration', 'TSInterfaceDeclaration'].includes(declaration.type)
    ) {
      localTypes.set(declaration.id.name, declaration)
      if (statement.type === 'ExportNamedDeclaration') {
        publicTypes.set(declaration.id.name, declaration)
        exportedTypeNames.add(declaration.id.name)
      }
    }
    if (statement.type !== 'ExportNamedDeclaration') continue
    if (statement.exportKind === 'type' && statement.source) typeReexports.push(slice(statement))
    for (const specifier of statement.specifiers ?? []) {
      if (statement.exportKind === 'type' || specifier.exportKind === 'type') {
        exportedTypeNames.add(specifier.exported.name ?? specifier.exported.value)
        continue
      }
      if (specifier.exported) exports.add(specifier.exported.name ?? specifier.exported.value)
    }
    if (declaration?.type === 'FunctionDeclaration') {
      exports.add(declaration.id.name)
      signatures.push(`${source.slice(declaration.start, declaration.body.start).trim()};`)
      propsNodes.push(...declaration.params, declaration.returnType)
      inspectFunction(declaration, declaration.id.name)
    }
    if (declaration?.type === 'VariableDeclaration') {
      for (const variable of declaration.declarations) {
        if (variable.id.type !== 'Identifier') continue
        exports.add(variable.id.name)
        propsNodes.push(variable.id.typeAnnotation, variable.init?.typeParameters)
        if (variable.id.typeAnnotation)
          bindings.push(`${variable.id.name}${slice(variable.id.typeAnnotation)}`)
        if (['FunctionExpression', 'ArrowFunctionExpression'].includes(variable.init?.type))
          inspectFunction(variable.init, variable.id.name)
        if (variable.init?.type === 'CallExpression') {
          if (variable.init.typeParameters)
            bindings.push(
              `${variable.id.name}: ${source.slice(variable.init.start, variable.init.typeParameters.end)}`,
            )
          const fn = variable.init.arguments.find((arg) =>
            ['FunctionExpression', 'ArrowFunctionExpression'].includes(arg.type),
          )
          inspectFunction(fn, variable.id.name)
        }
      }
    }
    if (declaration?.type === 'ClassDeclaration' || declaration?.type === 'TSEnumDeclaration')
      exports.add(declaration.id.name)
  }

  // Include local supporting declarations referenced by exported props, e.g. CalendarCommonProps.
  const needed = new Map(publicTypes)
  let changed = true
  while (changed) {
    changed = false
    for (const node of [...needed.values()])
      for (const name of identifiers(node)) {
        if (!needed.has(name) && localTypes.has(name)) {
          needed.set(name, localTypes.get(name))
          changed = true
        }
      }
  }
  const typeNodes = [...needed.values()].sort((a, b) => a.start - b.start)
  const used = new Set([...typeNodes, ...propsNodes].flatMap((node) => [...identifiers(node)]))
  const inherited = imports
    .filter((node) => node.specifiers.some((specifier) => used.has(specifier.local.name)))
    .map((node) => ({
      from: node.source.value,
      names: node.specifiers
        .filter((specifier) => used.has(specifier.local.name))
        .map((specifier) => specifier.local.name),
    }))
  return {
    exports: [...exports].sort(),
    publicTypes: [...exportedTypeNames],
    declarations: typeNodes.map(slice),
    typeReexports,
    signatures,
    bindings,
    defaults,
    inherited,
  }
}

async function listFiles(root, relative) {
  let entries
  try {
    entries = await readdir(path.join(root, relative), { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
  const result = []
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const file = `${relative}/${entry.name}`
    if (entry.isDirectory()) result.push(...(await listFiles(root, file)))
    else if (entry.isFile()) result.push(file)
    else throw new Error(`Unexpected non-file in generated documentation: ${file}`)
  }
  return result
}

function exampleImports(example) {
  if (!example) return []
  const ast = parse(example, { sourceType: 'module', plugins: ['typescript', 'jsx'] })
  return ast.program.body
    .filter((node) => node.type === 'ImportDeclaration')
    .map((node) => node.source.value)
}

function docForItem(item, entry, facts, sourceHash, allEntries) {
  const guidance = itemGuidance[item.name] ?? {}
  const registryUrl = `${registryOrigin}/r/v${registryVersion}/${item.name}.json`
  const extra = exampleImports(guidance.example)
    .map((specifier) => allEntries.find((candidate) => candidate.importPath === specifier)?.id)
    .filter((id) => id && id !== item.name && !entry.dependencies.includes(id))
  const sections = [
    `# ${item.title}\n\n${item.description}\n\nVersion: ${registryVersion}. Source hash: ${sourceHash}.\n\n`,
    `## Discovery\n\n- Registry ID: \`${item.name}\`\n- Import: \`${entry.importPath}\`\n- Runtime exports: ${facts.exports.map((value) => `\`${value}\``).join(', ') || 'none'}\n- Registry dependencies: ${entry.dependencies.map((id) => `[${id}](${allEntries.find((candidate) => candidate.id === id)?.docPath})`).join(', ') || 'none'}\n- Install source: [${item.name}.json](${registryUrl})\n- Setup and import-path differences: [start](${base}/start.md)\n`,
  ]
  if (item.entry)
    sections.push(
      `- Source: [${item.entry}](https://github.com/${registryRepository}/blob/main/${item.entry})\n`,
    )
  if (guidance.notes?.length)
    sections.push(
      `\n## Usage and interaction\n\n${guidance.notes.map((note) => `- ${note}`).join('\n')}\n`,
    )
  if (guidance.example)
    sections.push(
      `\n## Minimal example\n${extra.length ? `\nAlso install: ${[...new Set(extra)].map((id) => `\`${id}\``).join(', ')}.\n` : ''}${code(guidance.example)}${item.name === 'settings' ? '\nThe /api/workspace/settings endpoint is an application-owned integration point; Moru does not create it.\n' : ''}`,
    )
  sections.push(
    `\n## Source-derived API\n\nThese are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.\n`,
  )
  if (facts.inherited.length)
    sections.push(
      `\nReferenced imported types/values:\n\n${facts.inherited.map(({ from, names }) => `- \`${names.join(', ')}\` from \`${from}\``).join('\n')}\n`,
    )
  if (facts.declarations.length || facts.typeReexports.length)
    sections.push(code([...facts.declarations, ...facts.typeReexports].join('\n\n'), 'ts'))
  if (facts.bindings.length)
    sections.push(
      `\nExported value type annotations / generic factory calls from source:\n\n${facts.bindings.map((binding) => `- \`${binding}\``).join('\n')}\n`,
    )
  if (facts.signatures.length)
    sections.push(
      `\nExported function declaration excerpts (return types may be inferred in source):\n${code(facts.signatures.join('\n'), 'ts')}`,
    )
  if (!facts.declarations.length && !facts.signatures.length)
    sections.push(
      '\nNo standalone public props declaration is exported. Inspect the installed source for inferred types.\n',
    )
  if (facts.defaults.length)
    sections.push(
      `\n## Declared defaults\n\nExtracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.\n\n${facts.defaults.map(({ component, prop, value }) => `- \`${component}.${prop}\`: \`${value.replace(/\s+/g, ' ')}\``).join('\n')}\n`,
    )
  return sections.join('')
}

function startDoc(sourceHash) {
  return `# Build with Moru UI\n\nVersion ${registryVersion} · source ${sourceHash}\n\nRead this file once, then [catalog.json](${base}/catalog.json) and only the selected item docs. Moru is a source-owned design system: fundamentals → behavior → technology → visual refinement. Use the existing components and interaction behavior before adding bespoke UI.\n
## Choose the platform and installation mode\n
- **Web registry:** install individual source items into an existing React application. The catalog covers web items. Default import prefix is \`@/components/ui/moru/\`; honor the actual \`components.json\` UI alias.
- **Web starter:** \`templates/moru-web-starter\` contains copied source with \`./components/ui/\` imports and \`./theme/\` tokens. It does not contain the registry-generated MoruProvider. Keep the starter setup and source imports.
- **Expo / React Native:** read [expo.md](${base}/expo.md). Native source, APIs, provider and styles are separate. Do not import the web registry into a native screen.
- The registry currently targets Vite + React. Do not claim SSR/Next.js or native support for these web components without doing the necessary integration work. Neither \`moru-ui\` nor \`@moru/native\` should be assumed to exist as a published npm UI package.

## Web registry setup\n
Use the existing project’s React/TypeScript setup and configured shadcn CLI alias. Install the smallest useful set; dependencies are included automatically. Add other items by the same versioned URL.
${code(`npx shadcn@4.23.0 add ${registryOrigin}/r/v${registryVersion}/button.json ${registryOrigin}/r/v${registryVersion}/input.json ${registryOrigin}/r/v${registryVersion}/field.json`, 'sh')}
Import the core CSS once and wrap the components. MoruProvider supplies theme tokens and the popup portal scope.
${code(`import '@/components/ui/moru/styles.css'
import { MoruProvider } from '@/components/ui/moru/provider'
import { Button } from '@/components/ui/moru/button'

export default function App() {
  return <MoruProvider mode="light"><Button type="button">Continue</Button></MoruProvider>
}`)}
MoruProvider defaults to light and derives dark defaults when mode="dark". If passing custom \`tokens\`, pass a complete ThemeTokens object already appropriate for the selected mode; mode does not recolor custom tokens. Fonts are optional and not installed by the registry. Retain the installed MIT license notices.

## Style packs\n
Default, Glass and Neon are optional token-driven styles for the same components. Preserve component behavior and APIs. Import applyStylePack from \`@/components/ui/moru/_theme/style-packs\` (registry) or \`./theme/style-packs\` (starter), then pass \`applyStylePack(tokens, 'glass')\` to the existing provider. Use 'default' to remove the effects. Color, typography and density stay independent.

The optional \`tokens.appearance\` contains \`preset\`, \`surfaceOpacity\` (0.55–1), \`blur\` (0–24 px), \`glow\` (0–24 px), and \`highlight\` (0–1). Use the exported snapshot if supplied. ThemeScope carries the appearance variables into popup portals. Shared core styles include the recipes; do not duplicate controls as GlassButton or NeonInput. Glass applies to surfaces, Neon to important actions/selected states. Inputs retain readable solid backgrounds. Keep focus/error indicators, reduced-transparency/unsupported-browser fallbacks, and check contrast against the real backdrop.

## Web starter setup\n
Keep the starter’s existing \`main.tsx\` imports: \`styles.css\`, \`theme/fonts.css\`, \`theme/default.css\`, \`components/ui/styles.css\`, \`theme/readability.css\`. Reuse its ThemeScope and token generation:
${code(`import { ThemeScope } from './components/ui/theme-scope'
import { Button } from './components/ui/button'
import { createDarkTokens, defaultTokens } from './theme/tokens'

const darkTokens = createDarkTokens(defaultTokens)
export default function App() {
  return <ThemeScope mode="dark" tokens={darkTokens}><Button type="button">Continue</Button></ThemeScope>
}`)}
In per-item examples replace \`@/components/ui/moru/NAME\` with the starter’s actual \`./components/ui/NAME\` path; registry blocks \`moru/blocks/NAME\` correspond to starter \`./components/blocks/NAME\` only when that block has actually been copied. ThemeScope requires both mode and tokens; setting mode alone does not generate dark tokens.

## Design and human experience rules\n
- Choose semantic tokens for surfaces, text, accent and statuses. Reuse density, typography roles, control sizes, spacing and component spacing instead of scattering arbitrary pixel values.
- Keep labels visible. Preserve Field’s ID/description/error connections, focus-visible styling, keyboard navigation, focus return and popup behavior.
- Preserve OTP paste/autofill, loading locks, input values on errors and meaningful empty/success/error feedback. Do not replace robust controls with lookalikes.
- Compose screen blocks first: dashboard, login, signup or workspace settings. Signup includes email verification; Dashboard embeds project search and filters. OTP/search-filters remain supporting patterns. Authentication previews are local demos; server verification and persistence belong to the application.
- Prefer responsive flow/grid, min-width: 0 for shrinking content and deliberate overflow. Respect reduced motion and keep text readable in light/dark and at narrow widths.
- Keep imports, controlled callbacks and prop names from the selected item docs. Moru shares infrastructure with other libraries but does not share every public API. Never invent shadcn-style compound exports.
- Read the source when an inherited API or behavior is not documented. This compact catalog deliberately does not duplicate all React and Base UI declarations.

## Progressive discovery\n
1. Pick web-registry, web-starter or Expo before generating code.
2. Read [catalog.json](${base}/catalog.json) for IDs, exports, import paths and registry dependencies.
3. Fetch only each selected docPath and the relevant dependency docs; do not load every component by default.
4. Use the real minimal example and source-derived declarations. Preserve existing project structure and styling setup.

Source: [Moru repository](https://github.com/${registryRepository}) · [Registry guide](https://github.com/${registryRepository}/blob/main/docs/registry.ko.md)\n`
}

function expoDoc(sourceHash, nativeExports, expoExports, nativeFacts, expoFacts) {
  const keyNativeTypes = [
    'MoruNativeProviderProps',
    'AppScreenProps',
    'NativeButtonProps',
    'TextFieldProps',
    'NativeSwitchProps',
  ]
  const declarations = nativeFacts.flatMap((facts) =>
    facts.declarations.filter((declaration) =>
      keyNativeTypes.some((name) => new RegExp(`(?:type|interface) ${name}\\b`).test(declaration)),
    ),
  )
  return `# Moru for Expo / React Native\n\nVersion ${registryVersion} · source ${sourceHash}\n
The web catalog is not a native component catalog. Use \`apps/moru-expo\` with the local \`packages/moru-native\` package. Its dependency is \`file:../../packages/moru-native\`; preserve that monorepo relation or deliberately relocate both. This is not an npm publication claim.

## Native setup and minimal example\n
Retain the starter’s Expo dependencies and entry configuration. Wrap the application once in SafeAreaProvider and MoruNativeProvider. Native callbacks differ from the web controls.
${code(`import { useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AppScreen, MoruNativeProvider, NativeButton, TextField } from '@moru/native'

export default function App() {
  const [name, setName] = useState('')
  return <SafeAreaProvider><MoruNativeProvider mode="light">
    <AppScreen>
      <TextField label="Project name" value={name} onChangeText={setName} />
      <NativeButton onPress={() => setName('')} disabled={!name}>Clear name</NativeButton>
    </AppScreen>
  </MoruNativeProvider></SafeAreaProvider>
}`)}
- NativeButton uses onPress; TextField uses onChangeText. NativeSwitch uses value/onValueChange. Do not paste web onClick, Field/Input or CSS variable APIs into native screens.
- AppScreen owns safe area, keyboard avoidance, optional scrolling, pull-to-refresh and a fixed footer. Avoid double-counting navigator insets; use its edges prop. Use scroll={false} when supplying a virtualized list.
- MoruNativeProvider follows system appearance if mode is omitted. Exported native theme JSON can be applied as \`mode={exported.mode} tokens={exported.tokens}\`; web CSS token objects are not interchangeable.
- Native tokens contain numeric spacing/radius/metrics and color strings. \`webFontFamily\` only affects React Native Web; register a device font and use tokens.fontFamily, or keep the system font.
- Style-pack settings are preserved as \`designIntent.appearance\` in exports, with \`compatibility.stylePack: 'solid-fallback'\`. The current native provider renders solid surfaces and does not implement web blur/glow. Do not claim visual effect parity or pass web CSS into native components.
- Maintain the 48pt/dp minimum native touch target, accessibility labels/state and keyboard handling. Web previews cannot verify device gestures, screen-reader behavior or native rendering.
- NativePicker, NativeSlider and NativeDatePicker come from \`@moru/native/expo\` and use the starter’s \`@expo/ui\` dependency. They are not web registry exports. NativeDatePicker is a single-date/time picker; do not invent a native date-range or OTP component because one exists on the web.

## Actual runtime exports\n
Derived from the native entry modules in this repository; helpers are listed alongside components.

\`@moru/native\`: ${nativeExports.map((value) => `\`${value}\``).join(', ')}.

\`@moru/native/expo\`: ${expoExports.map((value) => `\`${value}\``).join(', ')}.

## Selected source-derived declarations\n
React Native inherited props remain inherited. These are excerpts, not replacement implementations.
${code(declarations.join('\n\n'), 'ts')}
${code(expoFacts.declarations.join('\n\n'), 'ts')}
Read [native README](https://github.com/${registryRepository}/blob/main/packages/moru-native/README.md) and [native source](https://github.com/${registryRepository}/tree/main/packages/moru-native/src) for the remaining component props. Use the source’s actual exports instead of assuming SwiftUI and web components have one-to-one wrappers.\n`
}

export async function generateAiDocs(root = defaultRoot) {
  const registry = await generateRegistry(root)
  const nativeFiles = (await listFiles(root, 'packages/moru-native/src')).filter(
    (file) => /\.[jt]sx?$/.test(file) && !/\.test\./.test(file),
  )
  const ownedInputs = [
    'scripts/build-ai-docs.mjs',
    'scripts/ai-docs-metadata.mjs',
    ...nativeFiles,
    'packages/moru-native/README.md',
    'templates/moru-web-starter/src/main.tsx',
    'templates/moru-web-starter/src/App.tsx',
    'apps/moru-expo/package.json',
    'packages/moru-native/package.json',
    'templates/moru-native-starter/README.md',
  ]
  const inputs = await Promise.all(
    ownedInputs.map(async (file) => [file, await readFile(path.join(root, file), 'utf8')]),
  )
  const inputMap = new Map(inputs)
  const hash = createHash('sha256').update(registry.sourceHash)
  for (const [file, content] of inputs) hash.update(`\0${file}\0${content}`)
  const sourceHash = hash.digest('hex')
  const factsById = new Map()
  const entries = registryDefinitions.map((item) => {
    const manifest = JSON.parse(
      registry.artifacts.get(`public/r/v${registryVersion}/${item.name}.json`),
    )
    const source = registry.artifacts.get(sourceTarget(item))
    if (!source) throw new Error(`No generated source for ${item.name}`)
    const facts = inspectSource(source, sourceTarget(item))
    factsById.set(item.name, facts)
    return {
      id: item.name,
      title: item.title,
      description: item.description,
      kind:
        item.name === 'core'
          ? 'foundation'
          : item.type === 'registry:block'
            ? 'block'
            : 'component',
      exports: facts.exports,
      docPath: `${base}/${item.name === 'core' ? 'core' : `${item.type === 'registry:block' ? 'blocks' : 'components'}/${item.name}`}.md`,
      dependencies: (manifest.registryDependencies ?? []).map((url) =>
        path.basename(new URL(url).pathname, '.json'),
      ),
      importPath: `@/components/ui/moru/${withoutExtension(sourceTarget(item).replace('registry/moru/', ''))}`,
    }
  })
  const ids = new Set(entries.map((entry) => entry.id))
  for (const entry of entries)
    for (const dependency of entry.dependencies)
      if (!ids.has(dependency)) throw new Error(`Unknown dependency ${dependency}`)
  for (const [id, guidance] of Object.entries(itemGuidance)) {
    if (!ids.has(id)) throw new Error(`Guidance references an unknown registry item: ${id}`)
    if (!guidance.example) continue
    const ast = parse(guidance.example, { sourceType: 'module', plugins: ['typescript', 'jsx'] })
    for (const statement of ast.program.body) {
      if (
        statement.type !== 'ImportDeclaration' ||
        !statement.source.value.startsWith('@/components/ui/moru/')
      )
        continue
      const imported = entries.find((entry) => entry.importPath === statement.source.value)
      if (!imported)
        throw new Error(`${id} example imports an unknown Moru module: ${statement.source.value}`)
      const facts = factsById.get(imported.id)
      for (const specifier of statement.specifiers) {
        if (specifier.type !== 'ImportSpecifier')
          throw new Error(`${id} example must use named Moru imports`)
        const name = specifier.imported.name ?? specifier.imported.value
        if (![...facts.exports, ...facts.publicTypes].includes(name))
          throw new Error(`${id} example imports missing ${name} from ${imported.id}`)
      }
    }
  }
  const artifacts = new Map()
  artifacts.set(
    `public${base}/catalog.json`,
    json({ schemaVersion: 1, version: registryVersion, sourceHash, entries }),
  )
  artifacts.set(`public${base}/start.md`, startDoc(sourceHash))
  const nativeModulePaths = new Set()
  function visitNativeEntry(file) {
    if (nativeModulePaths.has(file)) return
    nativeModulePaths.add(file)
    const source = inputMap.get(file)
    if (!source) throw new Error(`Missing native export source: ${file}`)
    const ast = parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] })
    for (const statement of ast.program.body) {
      if (statement.type !== 'ExportAllDeclaration' || statement.exportKind === 'type') continue
      if (!statement.source.value.startsWith('.'))
        throw new Error(`Unexpected external native export: ${statement.source.value}`)
      const target = path.posix.join(path.posix.dirname(file), statement.source.value)
      const resolved = [target, `${target}.ts`, `${target}.tsx`, `${target}/index.ts`].find(
        (candidate) => inputMap.has(candidate),
      )
      if (!resolved) throw new Error(`Cannot resolve native export: ${target}`)
      visitNativeEntry(resolved)
    }
  }
  visitNativeEntry('packages/moru-native/src/index.ts')
  const nativeFacts = [...nativeModulePaths].map((file) => inspectSource(inputMap.get(file), file))
  const expoFacts = inspectSource(inputMap.get('packages/moru-native/src/expo.tsx'), 'expo.tsx')
  artifacts.set(
    `public${base}/expo.md`,
    expoDoc(
      sourceHash,
      [...new Set(nativeFacts.flatMap((facts) => facts.exports))].sort(),
      expoFacts.exports,
      nativeFacts,
      expoFacts,
    ),
  )
  for (const [index, item] of registryDefinitions.entries()) {
    const entry = entries[index]
    artifacts.set(
      `public${entry.docPath}`,
      docForItem(
        item,
        entry,
        inspectSource(registry.artifacts.get(sourceTarget(item)), sourceTarget(item)),
        sourceHash,
        entries,
      ),
    )
  }
  artifacts.set(
    'public/llms.txt',
    `# Moru UI\n\n> Source-owned React UI: fundamentals, behavior, technology and visual refinement. Read only the platform guide and components needed for your task.\n\n- [Start here](${registryOrigin}${base}/start.md): registry vs starter setup, design and interaction rules.\n- [Catalog](${registryOrigin}${base}/catalog.json): version ${registryVersion}, actual exports, dependencies and per-item doc paths.\n- [Expo / React Native](${registryOrigin}${base}/expo.md): separate native source and APIs.\n\nMoru APIs are not interchangeable with shadcn/ui. Preserve the existing project setup; consult source-derived props before generating code.\n`,
  )
  return { artifacts, sourceHash, itemCount: entries.length }
}

export async function verifyAiDocs(root = defaultRoot) {
  const generated = await generateAiDocs(root)
  const problems = []
  for (const [file, expected] of generated.artifacts) {
    try {
      if ((await readFile(path.join(root, file), 'utf8')) !== expected)
        problems.push(`Stale: ${file}`)
    } catch (error) {
      if (error.code === 'ENOENT') problems.push(`Missing: ${file}`)
      else throw error
    }
  }
  for (const file of await listFiles(root, `public${base}`))
    if (!generated.artifacts.has(file)) problems.push(`Unexpected: ${file}`)
  if (problems.length)
    throw new Error(
      `AI documentation is out of date. Run node scripts/build-ai-docs.mjs\n${problems.join('\n')}`,
    )
  return {
    itemCount: generated.itemCount,
    fileCount: generated.artifacts.size,
    sourceHash: generated.sourceHash,
  }
}

export async function buildAiDocs(root = defaultRoot) {
  const generated = await generateAiDocs(root)
  for (const file of await listFiles(root, `public${base}`))
    if (!generated.artifacts.has(file)) await rm(path.join(root, file))
  for (const [file, content] of generated.artifacts) {
    await mkdir(path.dirname(path.join(root, file)), { recursive: true })
    await writeFile(path.join(root, file), content)
  }
  return {
    itemCount: generated.itemCount,
    fileCount: generated.artifacts.size,
    sourceHash: generated.sourceHash,
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  const args = process.argv.slice(2)
  if (args.some((arg) => arg !== '--check'))
    throw new Error('Usage: node scripts/build-ai-docs.mjs [--check]')
  const result = args.includes('--check') ? await verifyAiDocs() : await buildAiDocs()
  console.log(
    `AI docs ${args.includes('--check') ? 'verified' : 'generated'}: ${result.itemCount} items, ${result.fileCount} files (${result.sourceHash.slice(0, 12)}).`,
  )
}
