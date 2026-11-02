import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { cp, lstat, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptPath = fileURLToPath(import.meta.url)
const defaultRoot = path.dirname(path.dirname(scriptPath))
const templateReadme = 'templates/moru-native-starter/README.md'
const artifactName = 'moru-native-starter.zip'
const manifestName = 'moru-native-starter.manifest.json'
const copiedDirectories = ['apps/moru-expo/src', 'apps/moru-expo/assets', 'packages/moru-native/src']
const copiedFiles = [
  'LICENSE', 'NOTICE.md', 'docs/mobile-audit.md',
  ...['.gitignore', '.npmrc', 'AGENTS.md', 'LICENSE', 'NOTICE.md', 'README.md', 'app.config.js', 'app.json', 'package.json', 'package-lock.json', 'tsconfig.json', 'eslint.config.js'].map((file) => `apps/moru-expo/${file}`),
  'packages/moru-native/package.json', 'packages/moru-native/README.md',
]
const excluded = (name) => name.startsWith('.') || ['node_modules', 'dist', 'ios', 'android'].includes(name) || /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(name) || name.endsWith('.tsbuildinfo') || name.endsWith('.map')

async function assertRegularPath(root, relative, directory = false) {
  if (path.isAbsolute(relative) || relative.split('/').some((part) => part === '..' || !part)) throw new Error(`Unsafe native starter source path: ${relative}`)
  let current = path.resolve(root)
  for (const part of relative.split('/')) {
    current = path.join(current, part)
    if ((await lstat(current)).isSymbolicLink()) throw new Error(`Native starter sources may not contain symlinks: ${relative}`)
  }
  const stat = await lstat(current)
  if (directory ? !stat.isDirectory() : !stat.isFile()) throw new Error(`Native starter source is not a regular ${directory ? 'directory' : 'file'}: ${relative}`)
}

async function filesWithin(root, directory) {
  await assertRegularPath(root, directory, true)
  const files = []
  for (const entry of (await readdir(path.join(root, directory), { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    if (excluded(entry.name)) continue
    const relative = path.posix.join(directory, entry.name)
    if (entry.isSymbolicLink()) throw new Error(`Native starter sources may not contain symlinks: ${relative}`)
    if (entry.isDirectory()) files.push(...await filesWithin(root, relative))
    else if (entry.isFile()) files.push(relative)
    else throw new Error(`Native starter source is not a regular file: ${relative}`)
  }
  return files
}

async function sourceEntries(root) {
  const entries = copiedFiles.map((file) => ({ source: file, target: file }))
  entries.push({ source: templateReadme, target: 'README.md' })
  const packageLicense = 'packages/moru-native/LICENSE'
  entries.push({ source: existsSync(path.join(root, packageLicense)) ? packageLicense : 'LICENSE', target: packageLicense })
  for (const directory of copiedDirectories) {
    for (const file of await filesWithin(root, directory)) entries.push({ source: file, target: file })
  }
  for (const { source } of entries) await assertRegularPath(root, source)
  await assertRegularPath(root, 'scripts/build-native-starter.mjs')
  return entries.sort((a, b) => a.target.localeCompare(b.target, 'en'))
}

export async function nativeStarterSourceHash(root = defaultRoot) {
  const hash = createHash('sha256')
  for (const { source, target } of await sourceEntries(root)) {
    hash.update(source); hash.update('\0'); hash.update(target); hash.update('\0'); hash.update(await readFile(path.join(root, source))); hash.update('\0')
  }
  hash.update('scripts/build-native-starter.mjs'); hash.update('\0'); hash.update(await readFile(path.join(root, 'scripts/build-native-starter.mjs'))); hash.update('\0')
  return hash.digest('hex')
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
  if any(part in ('node_modules','dist','.git','.openai','.expo','.claude') or part.startswith('.env') for part in relative.parts): raise RuntimeError('Unexpected generated or private file in source archive')
  info=zipfile.ZipInfo(relative.as_posix(),date_time=(1980,1,1,0,0,0))
  info.compress_type=zipfile.ZIP_DEFLATED
  info.create_system=3
  info.external_attr=(stat.S_IFREG | 0o644)<<16
  output.writestr(info,file.read_bytes())
`
  await new Promise((resolve, reject) => {
    const child = spawn('python3', ['-c', python, directory, archive], { stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', (code, signal) => code === 0 ? resolve() : reject(new Error(`Native starter archive failed (${signal ?? code}). Python 3 is required only to package this source ZIP.`)))
  })
}

export async function verifyNativeStarter(root = defaultRoot) {
  const destination = path.join(root, 'public/downloads')
  let manifest
  try { manifest = JSON.parse(await readFile(path.join(destination, manifestName), 'utf8')) } catch { throw new Error('Moru native starter is missing. Run node scripts/build-native-starter.mjs.') }
  const sourceHash = await nativeStarterSourceHash(root)
  if (manifest.schemaVersion !== 1 || manifest.archive !== `/downloads/${artifactName}` || manifest.entry !== 'apps/moru-expo/src/app/_layout.tsx' || manifest.sourceHash !== sourceHash) throw new Error('Moru native starter is stale or has an invalid manifest. Run node scripts/build-native-starter.mjs after editing native sources, licenses, documentation, or templates.')
  const archive = await readFile(path.join(destination, artifactName))
  if (manifest.bytes !== archive.length || manifest.archiveSha256 !== createHash('sha256').update(archive).digest('hex')) throw new Error('Moru native starter ZIP does not match its manifest. Rebuild it before publishing.')
  if (manifest.fileCount !== (await sourceEntries(root)).length + 1) throw new Error('Moru native starter file count does not match its sources. Rebuild it before publishing.')
  return manifest
}

export async function buildNativeStarter(root = defaultRoot) {
  const sourceHash = await nativeStarterSourceHash(root)
  const entries = await sourceEntries(root)
  const directory = path.join(root, '.qa/moru-native-starter')
  await rm(directory, { recursive: true, force: true })
  await mkdir(directory, { recursive: true })
  for (const { source, target } of entries) {
    await assertRegularPath(root, source)
    await mkdir(path.dirname(path.join(directory, target)), { recursive: true })
    await cp(path.join(root, source), path.join(directory, target), { dereference: false })
  }
  const files = [...entries.map(({ target }) => target), 'moru-source.json'].sort()
  await writeFile(path.join(directory, 'moru-source.json'), JSON.stringify({ schemaVersion: 1, sourceHash, source: 'Moru UI native component sources and Expo app', entry: 'apps/moru-expo/src/app/_layout.tsx', files }, null, 2) + '\n')
  if (sourceHash !== await nativeStarterSourceHash(root)) throw new Error('Moru native sources changed while preparing the starter. Rebuild when source edits finish.')
  const destination = path.join(root, 'public/downloads')
  await mkdir(destination, { recursive: true })
  const temporaryArchive = path.join(destination, `${artifactName}.tmp`)
  await createSourceZip(directory, temporaryArchive)
  const archive = await readFile(temporaryArchive)
  await rename(temporaryArchive, path.join(destination, artifactName))
  const manifest = { schemaVersion: 1, sourceHash, archive: `/downloads/${artifactName}`, archiveSha256: createHash('sha256').update(archive).digest('hex'), bytes: archive.length, fileCount: files.length, entry: 'apps/moru-expo/src/app/_layout.tsx' }
  const temporaryManifest = path.join(destination, `${manifestName}.tmp`)
  await writeFile(temporaryManifest, JSON.stringify(manifest, null, 2) + '\n')
  await rename(temporaryManifest, path.join(destination, manifestName))
  return manifest
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  try {
    const manifest = process.argv.includes('--check') ? await verifyNativeStarter() : await buildNativeStarter()
    console.log(JSON.stringify({ nativeStarter: process.argv.includes('--check') ? 'verified' : 'built', ...manifest }))
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
