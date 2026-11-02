import { createHash } from 'node:crypto'
import { cp, lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const destination = path.resolve(process.argv[2] ?? path.join(root, '.qa/moru-public-repo'))
const allowed = [
  '.gitignore', '.github', 'LICENSE', 'NOTICE.md', 'README.md', 'CONTRIBUTING.md',
  'package.json', 'package-lock.json', 'index.html', 'vite.config.ts',
  'vitest.config.ts', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json',
  'src', 'scripts', 'docs', 'templates', 'packages/moru-native',
  'public', 'apps/moru-expo/src', 'apps/moru-expo/assets',
  ...['.gitignore', '.npmrc', 'AGENTS.md', 'LICENSE', 'NOTICE.md', 'README.md',
    'app.config.js', 'app.json', 'package.json', 'package-lock.json',
    'tsconfig.json', 'eslint.config.js'].map((name) => `apps/moru-expo/${name}`),
]
const excluded = new Set(['.git', '.openai', '.qa', '.expo', '.claude', '.codex', 'node_modules', 'dist', 'coverage', 'ios', 'android'])
const skip = (name) => excluded.has(name) || name === '.DS_Store' || name.startsWith('.env') || /\.(?:tsbuildinfo|log|pem|key|p12|mobileprovision|keystore|jks)$/.test(name)

async function refuseSymlinkSegments(absolute, allowMissing = false) {
  let current = path.parse(absolute).root
  for (const segment of absolute.slice(current.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, segment)
    try {
      if ((await lstat(current)).isSymbolicLink()) throw new Error('Source and destination paths must not contain symlink segments.')
    } catch (error) {
      if (allowMissing && error.code === 'ENOENT') return
      throw error
    }
  }
}
await refuseSymlinkSegments(root)
await refuseSymlinkSegments(destination, true)
if (destination === root || root.startsWith(`${destination}${path.sep}`) || (destination.startsWith(`${root}${path.sep}`) && !destination.startsWith(`${root}${path.sep}.qa${path.sep}`))) {
  throw new Error('Use an empty directory outside the source tree or inside its .qa directory.')
}
try {
  if ((await readdir(destination)).length) throw new Error('The destination must be empty; existing repositories are never overwritten.')
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

const files = []
async function collect(relative) {
  await refuseSymlinkSegments(path.join(root, relative))
  const parent = path.posix.dirname(relative)
  const name = path.posix.basename(relative)
  const entry = (await readdir(path.join(root, parent), { withFileTypes: true })).find((item) => item.name === name)
  if (!entry) throw new Error(`Missing public source: ${relative}`)
  if (skip(name)) return
  if (entry.isSymbolicLink()) throw new Error(`Public sources must not include symlinks: ${relative}`)
  if (entry.isDirectory()) {
    for (const child of (await readdir(path.join(root, relative))).sort()) await collect(path.posix.join(relative, child))
  } else if (entry.isFile()) files.push(relative)
}
for (const source of allowed) await collect(source)
await mkdir(destination, { recursive: true })
const hash = createHash('sha256')
for (const relative of [...new Set(files)].sort()) {
  const content = await readFile(path.join(root, relative))
  // Fail before publication if typical local paths, hosting IDs or private keys
  // accidentally enter text sources. This is a bounded check, not a secret audit.
  if (/\.(?:[cm]?[jt]sx?|json|md|css|html|ya?ml)$/.test(relative)) {
    const text = content.toString('utf8')
    if (/-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----|\bappg(?:prj|dep|ver)_[a-z0-9]+|\/Users\/[A-Za-z0-9._-]+\/|\b(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}/.test(text)) {
      throw new Error(`Review possible private data before exporting: ${relative}`)
    }
  }
  hash.update(relative); hash.update('\0'); hash.update(content); hash.update('\0')
  await mkdir(path.dirname(path.join(destination, relative)), { recursive: true })
  await cp(path.join(root, relative), path.join(destination, relative))
}
const manifest = { schemaVersion: 1, sourceHash: hash.digest('hex'), files: [...new Set(files)].sort() }
await writeFile(path.join(destination, 'moru-public-source.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log(JSON.stringify({ directory: destination, fileCount: manifest.files.length, sourceHash: manifest.sourceHash }))
