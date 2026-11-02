import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { lstat, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'
import { moduleSpecifiers, registryVersion, verifyRegistry } from './build-registry.mjs'

const scriptPath = fileURLToPath(import.meta.url)
const defaultRoot = path.dirname(path.dirname(scriptPath))
const templateDirectory = 'templates/moru-project-starter'
const applicationDirectory = 'src/components/project-template'
const archiveName = 'moru-project-starter.zip'
const manifestName = 'moru-project-starter.manifest.json'
const recipe = 'scripts/build-project-starter.mjs'
const developmentPackages = ['@types/node', '@types/react', '@types/react-dom', '@vitejs/plugin-react', 'typescript', 'vite']
const excluded = (name) => name === 'node_modules' || name === 'dist' || name.startsWith('.env') || /\.(test|spec)\.[cm]?[jt]sx?$/.test(name) || name.endsWith('.map') || name.endsWith('.tsbuildinfo') || (name.startsWith('.') && name !== '.gitignore')
const hash = (value) => createHash('sha256').update(value).digest('hex')
const json = (value) => JSON.stringify(value, null, 2) + '\n'

async function assertRegularPath(root, relative, directory = false) {
  if (path.isAbsolute(relative) || relative.split('/').some((part) => part === '..' || !part)) throw new Error(`Unsafe project starter path: ${relative}`)
  let current = path.resolve(root)
  for (const part of relative.split('/')) {
    current = path.join(current, part)
    if ((await lstat(current)).isSymbolicLink()) throw new Error(`Project starter sources may not contain symlinks: ${relative}`)
  }
  const stat = await lstat(current)
  if (directory ? !stat.isDirectory() : !stat.isFile()) throw new Error(`Project starter source is not a regular ${directory ? 'directory' : 'file'}: ${relative}`)
}

async function filesWithin(root, directory) {
  await assertRegularPath(root, directory, true)
  const files = []
  for (const entry of (await readdir(path.join(root, directory), { withFileTypes: true })).sort((left, right) => left.name.localeCompare(right.name, 'en'))) {
    if (excluded(entry.name)) continue
    const source = path.posix.join(directory, entry.name)
    if (entry.isSymbolicLink()) throw new Error(`Project starter sources may not contain symlinks: ${source}`)
    if (entry.isDirectory()) files.push(...await filesWithin(root, source))
    else if (entry.isFile()) files.push(source)
    else throw new Error(`Project starter source is not a regular file: ${source}`)
  }
  return files
}

function imports(source, file) {
  if (file.endsWith('.css')) {
    const values = []
    postcss.parse(source).walkAtRules('import', (rule) => {
      const match = rule.params.match(/^['"]([^'"]+)['"]$/)
      if (!match) throw new Error(`Unsupported project starter CSS import: ${rule.params}`)
      values.push(match[1])
    })
    return values
  }
  if (/\.[cm]?[jt]sx?$/.test(file)) return moduleSpecifiers(source, file).map((entry) => entry.value)
  return []
}

function npmPackage(specifier) {
  return specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0]
}

/** Follow npm's installed package locations, preserving nested versions and optional platform packages. */
export function subsetLockfile(original, packageJson) {
  if (original.lockfileVersion !== 3 || !original.packages?.['']) throw new Error('Project starter expects npm lockfile v3.')
  const packages = {
    '': { name: packageJson.name, version: packageJson.version, license: packageJson.license, dependencies: packageJson.dependencies, devDependencies: packageJson.devDependencies, engines: packageJson.engines },
  }
  const seen = new Map()
  function resolve(from, name) {
    let current = from
    while (true) {
      const candidate = `${current ? `${current}/` : ''}node_modules/${name}`
      if (original.packages[candidate]) return candidate
      if (!current) return null
      const parent = current.lastIndexOf('/node_modules/')
      current = parent < 0 ? '' : current.slice(0, parent)
    }
  }
  function include(location, dev) {
    if (seen.has(location) && (seen.get(location) === false || dev)) return
    seen.set(location, dev)
    const entry = original.packages[location]
    if (entry.link) throw new Error(`Local linked packages may not enter the downloadable starter: ${location}`)
    packages[location] = { ...entry }
    if (dev) packages[location].dev = true
    else { delete packages[location].dev; delete packages[location].devOptional }
    const dependencies = { ...entry.peerDependencies, ...entry.optionalDependencies, ...entry.dependencies }
    for (const name of Object.keys(dependencies).sort()) {
      const target = resolve(location, name)
      const optional = Boolean(entry.optionalDependencies?.[name] || entry.peerDependenciesMeta?.[name]?.optional)
      if (!target) {
        if (optional) continue
        throw new Error(`Missing locked project starter dependency: ${location} → ${name}`)
      }
      include(target, dev)
    }
  }
  for (const [name, version] of Object.entries(packageJson.dependencies)) {
    const target = resolve('', name)
    if (!target || original.packages[target].version !== version) throw new Error(`Starter runtime does not match root lockfile: ${name}@${version}`)
    include(target, false)
  }
  for (const [name, version] of Object.entries(packageJson.devDependencies)) {
    const target = resolve('', name)
    if (!target || original.packages[target].version !== version) throw new Error(`Starter tooling does not match root lockfile: ${name}@${version}`)
    include(target, true)
  }
  return { name: packageJson.name, version: packageJson.version, lockfileVersion: 3, requires: true, packages: Object.fromEntries(Object.entries(packages).sort(([left], [right]) => left.localeCompare(right, 'en'))) }
}

function validateImports(entries) {
  for (const [file, source] of entries) for (const specifier of imports(source, file)) {
    if (!specifier.startsWith('.') && !specifier.startsWith('@/')) continue
    const candidate = specifier.startsWith('@/') ? `src/${specifier.slice(2)}` : path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier))
    if (!candidate.startsWith('src/') && file.startsWith('src/')) throw new Error(`Project starter import escapes src: ${file} → ${specifier}`)
    if (!['', '.ts', '.tsx', '.js', '.css', '/index.ts', '/index.tsx'].some((extension) => entries.has(candidate + extension))) throw new Error(`Unresolved project starter import: ${file} → ${specifier}`)
  }
}

/** Plan an independently runnable app, using only registry items actually imported by the source app. */
export async function projectStarterPlan(root = defaultRoot) {
  const registry = await verifyRegistry(root)
  const catalog = JSON.parse(await readFile(path.join(root, 'registry.json'), 'utf8'))
  const definitions = new Map(catalog.items.map((item) => [item.name, item]))
  const applicationFiles = await filesWithin(root, applicationDirectory)
  if (!applicationFiles.includes(`${applicationDirectory}/ProjectTasksApp.tsx`)) throw new Error('ProjectTasksApp.tsx must exist before packaging the project starter.')
  const templateFiles = await filesWithin(root, templateDirectory)
  const entries = new Map()
  const records = []
  async function add(source, target) {
    await assertRegularPath(root, source)
    if (entries.has(target)) throw new Error(`Project starter target collision: ${target}`)
    const value = await readFile(path.join(root, source), 'utf8')
    entries.set(target, value)
    records.push({ source, target, sha256: hash(value) })
  }
  for (const source of templateFiles) await add(source, source.slice(templateDirectory.length + 1))
  for (const source of applicationFiles) await add(source, source)
  for (const source of ['LICENSE', 'NOTICE.md']) await add(source, source)
  const itemByTarget = new Map()
  for (const item of catalog.items) for (const file of item.files) itemByTarget.set(file.target.replace(/^@ui\/moru\//, ''), item.name)
  const selected = new Set()
  function select(name) {
    if (selected.has(name)) return
    const item = definitions.get(name)
    if (!item) throw new Error(`Project starter requests an unknown registry item: ${name}`)
    selected.add(name)
    for (const dependency of item.registryDependencies ?? []) select(dependency.split('/').at(-1).split('#')[0])
  }
  for (const [file, source] of entries) for (const specifier of imports(source, file)) {
    if (!specifier.startsWith('@/components/ui/moru/')) continue
    const target = specifier.slice('@/components/ui/moru/'.length)
    const owner = ['', '.ts', '.tsx', '.css'].map((extension) => itemByTarget.get(target + extension)).find(Boolean)
    if (!owner) throw new Error(`App imports a file not owned by any registry item: ${specifier}`)
    select(owner)
  }
  if (!selected.size) throw new Error('Project starter must use the actual Moru registry components.')
  for (const name of [...selected].sort()) for (const file of definitions.get(name).files) {
    if (!file.target.startsWith('@ui/moru/')) throw new Error(`Unsafe project starter registry target: ${file.target}`)
    await add(file.path, `src/components/ui/moru/${file.target.slice('@ui/moru/'.length)}`)
  }
  const rootPackage = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
  const templatePackage = JSON.parse(entries.get('package.json'))
  if (templatePackage.version !== registryVersion) throw new Error(`Project starter version ${templatePackage.version} differs from registry ${registryVersion}.`)
  const runtimePackages = new Set(['react', 'react-dom'])
  for (const [file, source] of entries) {
    if (!file.startsWith('src/')) continue
    for (const specifier of imports(source, file)) {
      if (specifier.startsWith('.') || specifier.startsWith('@/')) continue
      const name = npmPackage(specifier)
      if (!rootPackage.dependencies?.[name]) throw new Error(`Starter imports an unapproved runtime package: ${specifier}`)
      runtimePackages.add(name)
    }
  }
  function pinned(names, available) {
    return Object.fromEntries([...names].sort().map((name) => {
      const version = available[name]
      if (!/^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(version ?? '')) throw new Error(`Project starter needs an exact tested package version: ${name}`)
      return [name, version]
    }))
  }
  const packageJson = { ...templatePackage, dependencies: pinned(runtimePackages, rootPackage.dependencies), devDependencies: pinned(developmentPackages, rootPackage.devDependencies) }
  const lockfile = subsetLockfile(JSON.parse(await readFile(path.join(root, 'package-lock.json'), 'utf8')), packageJson)
  entries.set('package.json', json(packageJson))
  entries.set('package-lock.json', json(lockfile))
  const hashInputs = [...records, ...['package.json', 'package-lock.json', 'registry/moru/manifest.json', recipe, 'scripts/build-registry.mjs'].map((source) => ({ source, target: '' }))]
  const digest = createHash('sha256')
  for (const { source, target } of hashInputs.sort((left, right) => `${left.source}\0${left.target}`.localeCompare(`${right.source}\0${right.target}`, 'en'))) {
    await assertRegularPath(root, source)
    digest.update(source); digest.update('\0'); digest.update(target); digest.update('\0'); digest.update(await readFile(path.join(root, source))); digest.update('\0')
  }
  const sourceHash = digest.digest('hex')
  const files = [...entries.keys(), 'moru-source.json'].sort()
  entries.set('moru-source.json', json({ schemaVersion: 1, version: registryVersion, sourceHash, registryVersion: registry.version, registrySourceHash: registry.sourceHash, registryItems: [...selected].sort(), source: 'Moru Project Starter application and selected registry sources', entry: 'src/main.tsx', files }))
  validateImports(entries)
  return { entries, records, sourceHash, packageJson, lockfile, registryItems: [...selected].sort(), registrySourceHash: registry.sourceHash }
}

export async function projectStarterSourceHash(root = defaultRoot) { return (await projectStarterPlan(root)).sourceHash }

async function createSourceZip(directory, archive) {
  const python = `import pathlib,stat,sys,zipfile
source=pathlib.Path(sys.argv[1])
target=pathlib.Path(sys.argv[2])
with zipfile.ZipFile(target,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as output:
 for file in sorted(source.rglob('*')):
  if file.is_symlink(): raise RuntimeError('A source archive may not contain symlinks')
  if not file.is_file(): continue
  relative=file.relative_to(source)
  if any(part in ('node_modules','dist','.git','.openai','.qa') or part.startswith('.env') for part in relative.parts): raise RuntimeError('Private or generated runtime data in project starter')
  info=zipfile.ZipInfo('moru-project-starter/'+relative.as_posix(),date_time=(1980,1,1,0,0,0))
  info.compress_type=zipfile.ZIP_DEFLATED
  info.create_system=3
  info.external_attr=(stat.S_IFREG | 0o644)<<16
  output.writestr(info,file.read_bytes())
`
  await new Promise((resolve, reject) => {
    const child = spawn('python3', ['-c', python, directory, archive], { stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', (code, signal) => code === 0 ? resolve() : reject(new Error(`Project starter archive failed (${signal ?? code}). Python 3 is required to create the ZIP.`)))
  })
}

export async function buildProjectStarter(root = defaultRoot) {
  const plan = await projectStarterPlan(root)
  const directory = path.join(root, '.qa/moru-project-starter')
  await rm(directory, { recursive: true, force: true })
  await mkdir(directory, { recursive: true })
  for (const [file, source] of plan.entries) {
    await mkdir(path.dirname(path.join(directory, file)), { recursive: true })
    await writeFile(path.join(directory, file), source)
  }
  if (plan.sourceHash !== await projectStarterSourceHash(root)) throw new Error('Moru sources changed while preparing the project starter. Rebuild after source edits finish.')
  const destination = path.join(root, 'public/downloads')
  await mkdir(destination, { recursive: true })
  const temporary = path.join(destination, `${archiveName}.tmp`)
  await createSourceZip(directory, temporary)
  const archive = await readFile(temporary)
  await rename(temporary, path.join(destination, archiveName))
  const manifest = { schemaVersion: 1, version: registryVersion, sourceHash: plan.sourceHash, registrySourceHash: plan.registrySourceHash, registryItems: plan.registryItems, archive: `/downloads/${archiveName}`, archiveSha256: hash(archive), bytes: archive.length, fileCount: plan.entries.size, entry: 'src/main.tsx' }
  const manifestTemporary = path.join(destination, `${manifestName}.tmp`)
  await writeFile(manifestTemporary, json(manifest))
  await rename(manifestTemporary, path.join(destination, manifestName))
  return manifest
}

export async function verifyProjectStarter(root = defaultRoot) {
  let manifest
  try { manifest = JSON.parse(await readFile(path.join(root, 'public/downloads', manifestName), 'utf8')) } catch { throw new Error('Moru project starter is missing. Run node scripts/build-project-starter.mjs.') }
  const plan = await projectStarterPlan(root)
  if (manifest.schemaVersion !== 1 || manifest.version !== registryVersion || manifest.sourceHash !== plan.sourceHash || manifest.registrySourceHash !== plan.registrySourceHash || manifest.archive !== `/downloads/${archiveName}` || manifest.entry !== 'src/main.tsx' || manifest.fileCount !== plan.entries.size || json(manifest.registryItems) !== json(plan.registryItems)) throw new Error('Moru project starter is stale or has an invalid manifest. Run node scripts/build-project-starter.mjs.')
  const archive = await readFile(path.join(root, 'public/downloads', archiveName))
  if (manifest.bytes !== archive.length || manifest.archiveSha256 !== hash(archive)) throw new Error('Moru project starter ZIP does not match its manifest. Rebuild it before publishing.')
  return manifest
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  try {
    const result = process.argv.includes('--check') ? await verifyProjectStarter() : await buildProjectStarter()
    console.log(JSON.stringify({ projectStarter: process.argv.includes('--check') ? 'verified' : 'built', ...result }))
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
