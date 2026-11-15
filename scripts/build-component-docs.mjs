import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from '@babel/parser'
import { format, resolveConfig } from 'prettier'
import { generateAiDocs } from './build-ai-docs.mjs'
import { generatePackage } from './build-package.mjs'
import { registryDefinitions, registryRepository, registryVersion } from './build-registry.mjs'
import { itemGuidance } from './ai-docs-metadata.mjs'
import { controlDocExamples } from './component-doc-examples-controls.mjs'
import { contentDocExamples } from './component-doc-examples-content.mjs'

const scriptPath = fileURLToPath(import.meta.url)
const defaultRoot = path.dirname(path.dirname(scriptPath))
const outputDirectory = 'public/docs/components'
const registryPrefix = '@/components/ui/moru/'
const syntax = (source) => parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] })
const unwrap = (node) =>
  ['TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression'].includes(node?.type)
    ? unwrap(node.expression)
    : node

/** Read only the catalog's declared arrays; never evaluate application source in the build. */
async function catalogComponents(root) {
  const modules = new Map()
  async function readArray(file, name) {
    if (!modules.has(file)) {
      const source = await readFile(path.join(root, file), 'utf8')
      const variables = new Map()
      const imports = new Map()
      for (const statement of syntax(source).program.body) {
        const declaration = statement.declaration ?? statement
        if (declaration.type === 'VariableDeclaration')
          for (const variable of declaration.declarations)
            if (variable.id.type === 'Identifier') variables.set(variable.id.name, variable.init)
        if (statement.type === 'ImportDeclaration')
          for (const specifier of statement.specifiers)
            if (specifier.type === 'ImportSpecifier')
              imports.set(specifier.local.name, {
                file: path.posix.normalize(
                  path.posix.join(path.posix.dirname(file), `${statement.source.value}.ts`),
                ),
                name: specifier.imported.name,
              })
      }
      modules.set(file, { variables, imports })
    }
    const { variables, imports } = modules.get(file)
    const imported = imports.get(name)
    if (imported) return readArray(imported.file, imported.name)
    const array = unwrap(variables.get(name))
    if (array?.type !== 'ArrayExpression') throw new Error(`Expected catalog array ${file}:${name}`)
    const rows = []
    for (const element of array.elements) {
      if (element?.type === 'SpreadElement' && element.argument.type === 'Identifier') {
        rows.push(...(await readArray(file, element.argument.name)))
        continue
      }
      if (element?.type !== 'ObjectExpression')
        throw new Error(`Unsupported catalog entry: ${file}`)
      const row = {}
      for (const property of element.properties)
        if (property.type === 'ObjectProperty' && property.value.type === 'StringLiteral')
          row[property.key.name ?? property.key.value] = property.value.value
      if (!row.id || !row.name || !row.subtitle)
        throw new Error(`Incomplete catalog entry: ${file}`)
      rows.push(row)
    }
    return rows
  }
  return readArray('src/components/catalog/component-catalog.ts', 'components')
}

/** Keep nested object types intact; table rows describe only a declaration's own properties. */
export function extractApi(document) {
  const section = document.split('## Source-derived API\n')[1]?.split('\n## Declared defaults')[0]
  if (!section) throw new Error('Missing source-derived API section')
  const api = [...section.matchAll(/```ts\n([\s\S]*?)\n```/g)].map((match) => match[1]).join('\n\n')
  const defaults = [...document.matchAll(/^- `([^`.]+)\.([^`]+)`: `([^\n]+)`$/gm)].map(
    ([, component, prop, value]) => ({ component, prop, value }),
  )
  const props = []
  function members(node, owner) {
    if (!node) return
    if (node.type === 'TSIntersectionType') {
      node.types.forEach((part) => members(part, owner))
      return
    }
    // Named union branches are listed separately in the source-derived declarations.
    if (!['TSInterfaceBody', 'TSTypeLiteral'].includes(node.type)) return
    for (const member of node.body ?? node.members) {
      if (member.type !== 'TSPropertySignature' || !member.typeAnnotation || member.computed)
        continue
      const name = member.key.name ?? member.key.value
      const annotation = member.typeAnnotation.typeAnnotation
      const description = (member.leadingComments ?? [])
        .map((comment) => comment.value.replace(/^\s*\* ?/gm, '').trim())
        .filter(Boolean)
        .join('\n')
      const defaultValue = defaults.find(
        (entry) => entry.component === owner.replace(/Props$/, '') && entry.prop === name,
      )?.value
      props.push({
        owner,
        name,
        type: api.slice(annotation.start, annotation.end),
        required: !member.optional,
        ...(description ? { description } : {}),
        ...(defaultValue !== undefined ? { defaultValue } : {}),
      })
    }
  }
  for (const statement of syntax(api).program.body) {
    const declaration = statement.declaration ?? statement
    if (declaration.type === 'TSInterfaceDeclaration')
      members(declaration.body, declaration.id.name)
    if (declaration.type === 'TSTypeAliasDeclaration')
      members(declaration.typeAnnotation, declaration.id.name)
  }
  return { api, props, defaults }
}

function resolveSource(sources, from, specifier) {
  const target = path.posix.join(path.posix.dirname(from), specifier).replace(/\.js$/, '')
  const file = [`${target}.ts`, `${target}.tsx`, `${target}/index.ts`].find((file) =>
    sources.has(file),
  )
  if (!file) throw new Error(`Missing package module: ${from} -> ${specifier}`)
  return file
}

function packagePublicModules(sources, manifest) {
  const cached = new Map()
  function inspect(file, visiting = new Set()) {
    if (cached.has(file)) return cached.get(file)
    if (visiting.has(file)) return { names: new Set(), peers: new Set() }
    const active = new Set([...visiting, file])
    const names = new Set()
    const peers = new Set()
    for (const statement of syntax(sources.get(file)).program.body) {
      if (statement.source?.value.startsWith('.')) {
        const referenced = inspect(resolveSource(sources, file, statement.source.value), active)
        for (const peer of referenced.peers) peers.add(peer)
        if (statement.type === 'ExportAllDeclaration')
          for (const name of referenced.names) names.add(name)
      } else if (statement.source) {
        const specifier = statement.source.value
        const dependency = specifier.startsWith('@')
          ? specifier.split('/').slice(0, 2).join('/')
          : specifier.split('/')[0]
        if (manifest.peerDependenciesMeta?.[dependency]?.optional) peers.add(dependency)
      }
      if (statement.type !== 'ExportNamedDeclaration') continue
      for (const specifier of statement.specifiers)
        names.add(specifier.exported.name ?? specifier.exported.value)
      const declaration = statement.declaration
      if (declaration?.id?.name) names.add(declaration.id.name)
      if (declaration?.type === 'VariableDeclaration')
        for (const variable of declaration.declarations)
          if (variable.id.type === 'Identifier') names.add(variable.id.name)
    }
    const result = { names, peers }
    cached.set(file, result)
    return result
  }
  const modules = new Map()
  for (const [entry, target] of Object.entries(manifest.exports)) {
    if (entry === './styles.css') continue
    const file = target.import.replace('./dist/', '').replace(/\.js$/, '.ts')
    const sourceFile = sources.has(file) ? file : file.replace(/\.ts$/, '.tsx')
    if (!sources.has(sourceFile)) throw new Error(`Missing public npm entry source: ${entry}`)
    modules.set(
      entry === '.' ? manifest.name : `${manifest.name}/${entry.slice(2)}`,
      inspect(sourceFile),
    )
  }
  return modules
}

/** Convert import strings only, preserving code and validating the actual public npm API. */
export function prepareNpmExample(example, modules, manifest) {
  const edits = []
  const peers = new Set()
  const ast = syntax(example)
  if (
    !ast.program.body.some(
      (statement) =>
        statement.type === 'ExportNamedDeclaration' ||
        statement.type === 'ExportDefaultDeclaration',
    )
  )
    throw new Error('Component examples must export a complete React example')
  for (const statement of ast.program.body) {
    if (statement.type !== 'ImportDeclaration') continue
    const original = statement.source.value
    let specifier = original
    if (original.startsWith(registryPrefix)) {
      const sourceModule = original.slice(registryPrefix.length)
      const subpath = `${manifest.name}/${sourceModule}`
      specifier = modules.has(subpath) ? subpath : manifest.name
      edits.push({
        start: statement.source.start + 1,
        end: statement.source.end - 1,
        value: specifier,
      })
    }
    if (manifest.peerDependenciesMeta?.[specifier]?.optional) peers.add(specifier)
    if (specifier !== manifest.name && !specifier.startsWith(`${manifest.name}/`)) continue
    const entry = modules.get(specifier)
    if (!entry) throw new Error(`Unsupported npm import: ${specifier}`)
    for (const binding of statement.specifiers) {
      if (binding.type !== 'ImportSpecifier') throw new Error(`Use named Moru imports: ${original}`)
      const name = binding.imported.name ?? binding.imported.value
      if (!entry.names.has(name)) throw new Error(`${name} is not exported by ${specifier}`)
    }
    for (const peer of entry.peers) peers.add(peer)
  }
  // Positions refer to the original source, so trim only after applying the edits.
  let source = example
  for (const edit of edits.sort((left, right) => right.start - left.start))
    source = source.slice(0, edit.start) + edit.value + source.slice(edit.end)
  const dependencies = [...peers]
    .sort()
    .map((peer) => `"${peer}@${manifest.peerDependencies[peer]}"`)
  return {
    example: source.trim(),
    installCommand: `npm install ${manifest.name}${dependencies.length ? ` ${dependencies.join(' ')}` : ''}`,
  }
}

export async function generateComponentDocs(root = defaultRoot) {
  const [ai, npm, catalog, manifestSource, formatOptions] = await Promise.all([
    generateAiDocs(root),
    generatePackage(root),
    catalogComponents(root),
    readFile(path.join(root, 'packages/moru-react/package.json'), 'utf8'),
    resolveConfig(path.join(root, 'src/components/site/ComponentDocumentation.tsx')),
  ])
  const manifest = JSON.parse(manifestSource)
  const modules = packagePublicModules(npm.sources, manifest)
  const aiCatalog = JSON.parse(ai.artifacts.get(`public/ai/v${registryVersion}/catalog.json`))
  const artifacts = new Map()
  for (const component of catalog) {
    const id = component.id === 'dialog' ? 'modal' : component.id
    const entry = aiCatalog.entries.find((item) => item.id === id)
    const definition = registryDefinitions.find((item) => item.name === id)
    if (!entry || !definition?.entry)
      throw new Error(`Missing component documentation source: ${id}`)
    const example = controlDocExamples[id] ?? contentDocExamples[id] ?? itemGuidance[id]?.example
    if (!example) throw new Error(`Missing complete component example: ${id}`)
    const npmExample = prepareNpmExample(example, modules, manifest)
    const documentation = {
      schemaVersion: 1,
      id,
      title: component.name,
      description: component.subtitle,
      ...npmExample,
      example: (
        await format(npmExample.example, {
          ...formatOptions,
          parser: 'typescript',
          filepath: `${id}.tsx`,
        })
      ).trimEnd(),
      sourceUrl: `https://github.com/${registryRepository}/blob/main/${definition.entry}`,
      ...extractApi(ai.artifacts.get(`public${entry.docPath}`)),
      notes: itemGuidance[id]?.notes ?? [],
    }
    artifacts.set(`${outputDirectory}/${id}.json`, `${JSON.stringify(documentation, null, 2)}\n`)
  }
  return { artifacts, itemCount: artifacts.size }
}

async function existingFiles(root) {
  try {
    return (await readdir(path.join(root, outputDirectory))).map(
      (name) => `${outputDirectory}/${name}`,
    )
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

export async function verifyComponentDocs(root = defaultRoot) {
  const generated = await generateComponentDocs(root)
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
  for (const file of await existingFiles(root))
    if (!generated.artifacts.has(file)) problems.push(`Unexpected: ${file}`)
  if (problems.length)
    throw new Error(
      `Component documentation is out of date. Run node scripts/build-component-docs.mjs\n${problems.join('\n')}`,
    )
  return { itemCount: generated.itemCount, fileCount: generated.artifacts.size }
}

export async function buildComponentDocs(root = defaultRoot) {
  const generated = await generateComponentDocs(root)
  await mkdir(path.join(root, outputDirectory), { recursive: true })
  for (const file of await existingFiles(root))
    if (!generated.artifacts.has(file)) await rm(path.join(root, file))
  for (const [file, content] of generated.artifacts) await writeFile(path.join(root, file), content)
  return { itemCount: generated.itemCount, fileCount: generated.artifacts.size }
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  const args = process.argv.slice(2)
  if (args.some((arg) => arg !== '--check'))
    throw new Error('Usage: node scripts/build-component-docs.mjs [--check]')
  const result = args.includes('--check') ? await verifyComponentDocs() : await buildComponentDocs()
  console.log(
    `Component docs ${args.includes('--check') ? 'verified' : 'generated'}: ${result.itemCount} items.`,
  )
}
