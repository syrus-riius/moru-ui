import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { cp, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptPath = fileURLToPath(import.meta.url)
const defaultRoot = path.dirname(path.dirname(scriptPath))
const sources = ['apps/moru-expo/src', 'apps/moru-expo/assets', 'packages/moru-native/src']
const sourceFiles = [
  'apps/moru-expo/app.json', 'apps/moru-expo/app.config.js', 'apps/moru-expo/package.json',
  'apps/moru-expo/package-lock.json', 'apps/moru-expo/tsconfig.json',
  'packages/moru-native/package.json', 'scripts/build-native-preview.mjs', 'scripts/native-preview-fonts.mjs',
]
async function filesWithin(root, directory) {
  const result = []
  for (const entry of (await readdir(path.join(root, directory), { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    if (entry.name.startsWith('.') || entry.name.endsWith('.tsbuildinfo')) continue
    const relative = path.posix.join(directory, entry.name)
    if (entry.isDirectory()) result.push(...await filesWithin(root, relative))
    else if (entry.isFile()) result.push(relative)
  }
  return result
}
export async function nativePreviewSourceHash(root = defaultRoot) {
  const files = [...sourceFiles]
  for (const directory of sources) files.push(...await filesWithin(root, directory))
  const hash = createHash('sha256')
  for (const file of [...new Set(files)].sort()) {
    hash.update(file); hash.update('\0'); hash.update(await readFile(path.join(root, file))); hash.update('\0')
  }
  return hash.digest('hex')
}
export async function verifyNativePreview(root = defaultRoot) {
  const manifestPath = path.join(root, 'public/native-preview/build-info.json')
  let manifest
  try { manifest = JSON.parse(await readFile(manifestPath, 'utf8')) } catch { throw new Error('Moru native preview is missing. Run npm run mobile:build after installing apps/moru-expo dependencies.') }
  if (manifest.schemaVersion !== 1 || manifest.sourceHash !== await nativePreviewSourceHash(root)) throw new Error('Moru native preview is stale. Run npm run mobile:build before publishing changed native sources.')
  const directory = path.join(root, 'public/native-preview')
  if (!existsSync(path.join(directory, 'index.html'))) throw new Error('Moru native preview index.html is missing.')
  if (existsSync(path.join(directory, 'assets/node_modules'))) throw new Error('Moru native preview contains a hosting-reserved asset path. Rebuild the preview.')
  for (const file of (await filesWithin(directory, '.')).filter((file) => /\.(js|css|html|json)$/.test(file))) {
    if ((await readFile(path.join(directory, file), 'utf8')).includes('assets/node_modules')) throw new Error('Moru native preview contains a stale asset reference. Rebuild the preview.')
  }
  return manifest
}
async function command(executable, args, options) {
  await new Promise((resolve, reject) => {
    const child = spawn(executable, args, { ...options, stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', (code, signal) => code === 0 ? resolve() : reject(new Error(`Native preview build failed (${signal ?? code}).`)))
  })
}
async function normalizePreviewAssets(directory, sourceHash) {
  const legacyAssets = path.join(directory, 'assets/node_modules')
  if (existsSync(legacyAssets)) await rename(legacyAssets, path.join(directory, 'assets/vendor'))
  const files = await filesWithin(directory, '.')
  const textFiles = files.filter((file) => /\.(js|css|html|json)$/.test(file))
  // Exported files have already received Metro names; post-processing needs a new cache key.
  const assetVersion = sourceHash.slice(0, 12)
  const renamed = files.filter((file) => file.startsWith('_expo/') && /\.(js|css)$/.test(file)).map((file) => {
    const extension = path.extname(file)
    const previousName = path.basename(file)
    const nextName = `${previousName.slice(0, -extension.length)}-${assetVersion}${extension}`
    return { file, previousName, nextName }
  })
  for (const file of textFiles) {
    const filename = path.join(directory, file)
    const original = await readFile(filename, 'utf8')
    let updated = original.replaceAll('assets/node_modules', 'assets/vendor')
    for (const item of renamed) updated = updated.replaceAll(item.previousName, item.nextName)
    if (updated !== original) await writeFile(filename, updated)
  }
  for (const item of renamed) await rename(path.join(directory, item.file), path.join(directory, path.dirname(item.file), item.nextName))
  return assetVersion
}
export async function buildNativePreview(root = defaultRoot) {
  const app = path.join(root, 'apps/moru-expo')
  const cli = path.join(app, 'node_modules/expo/bin/cli')
  if (!existsSync(cli)) throw new Error('Install the Expo app dependencies first: cd apps/moru-expo && npm ci')
  const sourceHash = await nativePreviewSourceHash(root)
  // The Expo app deliberately installs @moru/native as a copied local package.
  const installedPackage = path.join(app, 'node_modules/@moru/native')
  await mkdir(installedPackage, { recursive: true })
  await rm(path.join(installedPackage, 'src'), { recursive: true, force: true })
  await cp(path.join(root, 'packages/moru-native/src'), path.join(installedPackage, 'src'), { recursive: true })
  await cp(path.join(root, 'packages/moru-native/package.json'), path.join(installedPackage, 'package.json'))
  const temporary = path.join(root, '.qa/native-preview-export')
  await rm(temporary, { recursive: true, force: true })
  await command(process.execPath, [cli, 'export', '--platform', 'web', '--output-dir', temporary, '--max-workers', '4'], { cwd: app, env: { ...process.env, MORU_WEB_PREVIEW: '1', CI: '1' } })
  const { installPreviewFonts } = await import('./native-preview-fonts.mjs')
  await installPreviewFonts({ root, outputDirectory: temporary })
  const indexPath = path.join(temporary, 'index.html')
  let html = await readFile(indexPath, 'utf8')
  html = html.replace('<html lang="en">', '<html lang="ko">')
  await writeFile(indexPath, html)
  // Known demonstration links also remain valid when opened directly on static hosting.
  const aliases = ['controls', 'system-tabs', 'system-tabs/history', 'task/1', 'task/2', 'task/3', 'transaction/1', 'transaction/2', 'transaction/3']
  for (const route of aliases) {
    const directory = path.join(temporary, route)
    await mkdir(directory, { recursive: true })
    await writeFile(path.join(directory, 'index.html'), html)
  }
  const assetVersion = await normalizePreviewAssets(temporary, sourceHash)
  if (sourceHash !== await nativePreviewSourceHash(root)) throw new Error('Native sources changed during export. Rebuild after editing completes.')
  const manifest = {
    schemaVersion: 1, sourceHash, assetVersion, assetDirectory: 'assets/vendor', runtime: 'expo-react-native-web', baseUrl: '/native-preview',
    appEntry: 'apps/moru-expo/src/components/NativeLabHome.tsx', packageSource: 'packages/moru-native/src',
    sharedScreens: ['wallet', 'tasks', 'activity'],
    webImplementations: { NativePicker: 'Expo UI Universal web', NativeSlider: 'Expo UI Universal web', NativeDatePicker: 'BrowserDatePicker explicit browser alternative', NativeTabs: 'Expo Router NativeTabs web implementation' },
  }
  await writeFile(path.join(temporary, 'build-info.json'), JSON.stringify(manifest, null, 2) + '\n')
  const destination = path.join(root, 'public/native-preview')
  await rm(destination, { recursive: true, force: true })
  await cp(temporary, destination, { recursive: true })
  return manifest
}
if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  try {
    const manifest = process.argv.includes('--check') ? await verifyNativePreview() : await buildNativePreview()
    console.log(JSON.stringify({ nativePreview: process.argv.includes('--check') ? 'verified' : 'built', sourceHash: manifest.sourceHash, baseUrl: manifest.baseUrl }))
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
