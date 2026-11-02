import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { cp, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptPath = fileURLToPath(import.meta.url)
const defaultRoot = path.dirname(path.dirname(scriptPath))
const templateDirectory = 'templates/moru-web-starter'
const copiedDirectories = ['src/components/ui', 'src/theme', 'src/lib']
const copiedBlocks = ['LoginBlock', 'OTPBlock', 'SearchFiltersBlock', 'SettingsBlock'].map((name) => `src/components/blocks/${name}.tsx`)
const artifactName = 'moru-web-starter.zip'
const manifestName = 'moru-web-starter.manifest.json'
const excluded = (name) => /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(name) || name.endsWith('.tsbuildinfo') || name.endsWith('.map') || name === 'node_modules' || name === 'dist' || name.startsWith('.env')

async function filesWithin(root, directory) {
  const files = []
  for (const entry of (await readdir(path.join(root, directory), { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    if (excluded(entry.name) || (entry.name.startsWith('.') && entry.name !== '.gitignore')) continue
    const relative = path.posix.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await filesWithin(root, relative))
    else if (entry.isFile()) files.push(relative)
    // Symlinks are never copied into a downloadable source archive.
  }
  return files
}

async function sourceFiles(root) {
  const files = ['LICENSE', 'package.json', 'package-lock.json', 'scripts/build-web-starter.mjs', ...copiedBlocks]
  for (const directory of [templateDirectory, ...copiedDirectories]) files.push(...await filesWithin(root, directory))
  return [...new Set(files)].sort()
}

export async function webStarterSourceHash(root = defaultRoot) {
  const hash = createHash('sha256')
  for (const file of await sourceFiles(root)) {
    hash.update(file); hash.update('\0'); hash.update(await readFile(path.join(root, file))); hash.update('\0')
  }
  return hash.digest('hex')
}

async function verifyRelativeImports(directory, files) {
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.css', '/index.ts', '/index.tsx']
  for (const file of files.filter((entry) => /\.(?:[cm]?[jt]sx?|css)$/.test(entry))) {
    const text = await readFile(path.join(directory, file), 'utf8')
    for (const match of text.matchAll(/(?:from\s*|import\s*)['"](\.{1,2}\/[^'"]+)['"]/g)) {
      const relative = path.posix.normalize(path.posix.join(path.posix.dirname(file), match[1]))
      if (relative.startsWith('../') || !extensions.some((extension) => existsSync(path.join(directory, `${relative}${extension}`)))) {
        throw new Error(`Web starter has an unresolved relative import: ${file} → ${match[1]}`)
      }
    }
  }
}

async function createSourceZip(directory, archive) {
  const python = `import pathlib,stat,sys,zipfile
source=pathlib.Path(sys.argv[1])
target=pathlib.Path(sys.argv[2])
with zipfile.ZipFile(target,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as output:
 for file in sorted(source.rglob('*')):
  if file.is_symlink(): raise RuntimeError('A source archive may not include symlinks')
  if not file.is_file(): continue
  relative=file.relative_to(source)
  if any(part in ('node_modules','dist','.git') or part.startswith('.env') for part in relative.parts): raise RuntimeError('Unexpected generated or private file in source archive')
  info=zipfile.ZipInfo('moru-web-starter/'+relative.as_posix(),date_time=(1980,1,1,0,0,0))
  info.compress_type=zipfile.ZIP_DEFLATED
  info.create_system=3
  info.external_attr=(stat.S_IFREG | 0o644)<<16
  output.writestr(info,file.read_bytes())
`
  await new Promise((resolve, reject) => {
    const child = spawn('python3', ['-c', python, directory, archive], { stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', (code, signal) => code === 0 ? resolve() : reject(new Error(`Web starter archive failed (${signal ?? code}). Python 3 is required only to package this source ZIP.`)))
  })
}

export async function verifyWebStarter(root = defaultRoot) {
  const destination = path.join(root, 'public/downloads')
  let manifest
  try { manifest = JSON.parse(await readFile(path.join(destination, manifestName), 'utf8')) } catch { throw new Error('Moru web starter is missing. Run node scripts/build-web-starter.mjs.') }
  if (manifest.schemaVersion !== 1 || manifest.sourceHash !== await webStarterSourceHash(root)) throw new Error('Moru web starter is stale. Run node scripts/build-web-starter.mjs after editing UI, theme, dependencies, or templates.')
  const archive = await readFile(path.join(destination, artifactName))
  if (manifest.archiveSha256 !== createHash('sha256').update(archive).digest('hex')) throw new Error('Moru web starter ZIP does not match its manifest. Rebuild it before publishing.')
  return manifest
}

export async function buildWebStarter(root = defaultRoot) {
  const sourceHash = await webStarterSourceHash(root)
  const sources = await sourceFiles(root)
  const directory = path.join(root, '.qa/moru-web-starter')
  await rm(directory, { recursive: true, force: true })
  await mkdir(directory, { recursive: true })
  const copiedFiles = []
  for (const source of sources) {
    const target = source.startsWith(`${templateDirectory}/`) ? source.slice(templateDirectory.length + 1) : source.startsWith('src/') || source === 'LICENSE' ? source : undefined
    if (!target) continue
    await mkdir(path.dirname(path.join(directory, target)), { recursive: true })
    await cp(path.join(root, source), path.join(directory, target))
    copiedFiles.push(target)
  }
  const template = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'))
  const original = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
  const packageJson = { ...template, dependencies: original.dependencies, devDependencies: original.devDependencies, engines: original.engines ?? template.engines }
  const lock = JSON.parse(await readFile(path.join(root, 'package-lock.json'), 'utf8'))
  if (lock.lockfileVersion !== 3 || !lock.packages?.['']) throw new Error('The web starter expects the root npm lockfile v3.')
  lock.name = packageJson.name
  lock.version = packageJson.version
  lock.packages[''] = { ...lock.packages[''], name: packageJson.name, version: packageJson.version, license: packageJson.license, dependencies: packageJson.dependencies, devDependencies: packageJson.devDependencies, engines: packageJson.engines }
  await writeFile(path.join(directory, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n')
  await writeFile(path.join(directory, 'package-lock.json'), JSON.stringify(lock, null, 2) + '\n')
  copiedFiles.push('package-lock.json', 'moru-source.json')
  const files = [...new Set(copiedFiles)].sort()
  await writeFile(path.join(directory, 'moru-source.json'), JSON.stringify({ schemaVersion: 1, sourceHash, source: 'Moru UI web component sources', entry: 'src/App.tsx', files }, null, 2) + '\n')
  await verifyRelativeImports(directory, files)
  if (sourceHash !== await webStarterSourceHash(root)) throw new Error('Moru sources changed while preparing the starter. Rebuild when source edits finish.')
  const destination = path.join(root, 'public/downloads')
  await mkdir(destination, { recursive: true })
  const temporaryArchive = path.join(destination, `${artifactName}.tmp`)
  await createSourceZip(directory, temporaryArchive)
  const archive = await readFile(temporaryArchive)
  await rename(temporaryArchive, path.join(destination, artifactName))
  const manifest = { schemaVersion: 1, sourceHash, archive: `/downloads/${artifactName}`, archiveSha256: createHash('sha256').update(archive).digest('hex'), bytes: archive.length, fileCount: files.length, entry: 'src/App.tsx' }
  await writeFile(path.join(destination, manifestName), JSON.stringify(manifest, null, 2) + '\n')
  return manifest
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  try {
    const manifest = process.argv.includes('--check') ? await verifyWebStarter() : await buildWebStarter()
    console.log(JSON.stringify({ webStarter: process.argv.includes('--check') ? 'verified' : 'built', ...manifest }))
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
