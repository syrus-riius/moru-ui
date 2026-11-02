import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { promisify } from 'node:util'
import { buildNativeStarter, verifyNativeStarter } from './build-native-starter.mjs'

const exec = promisify(execFile)

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'moru-native-starter-'))
  const files = {
    LICENSE: 'Moru MIT notice',
    'NOTICE.md': 'Third-party notices',
    'docs/mobile-audit.md': 'Native coverage',
    'templates/moru-native-starter/README.md': 'Starter instructions',
    'scripts/build-native-starter.mjs': await readFile(new URL('./build-native-starter.mjs', import.meta.url), 'utf8'),
    'packages/moru-native/package.json': '{"private":true,"license":"MIT"}',
    'packages/moru-native/README.md': 'Native package',
    'packages/moru-native/src/index.ts': 'export const native = true',
    'apps/moru-expo/src/app/_layout.tsx': 'export default function Layout() { return null }',
    'apps/moru-expo/assets/icon.txt': 'Sample asset',
    'apps/moru-expo/src/.env.local': 'NEVER_ARCHIVE',
    'apps/moru-expo/src/.private/token.txt': 'NEVER_ARCHIVE',
    'apps/moru-expo/src/node_modules/private.txt': 'NEVER_ARCHIVE',
    'apps/moru-expo/.openai/hosting.json': 'NEVER_ARCHIVE',
    'apps/moru-expo/LICENSE': 'Expo original copyright',
  }
  for (const file of ['.gitignore', '.npmrc', 'AGENTS.md', 'NOTICE.md', 'README.md', 'app.config.js', 'app.json', 'package.json', 'package-lock.json', 'tsconfig.json', 'eslint.config.js']) files[`apps/moru-expo/${file}`] = '{}'
  for (const [file, contents] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, file)), { recursive: true })
    await writeFile(path.join(root, file), contents)
  }
  return root
}

test('native source export excludes private paths, preserves notices, and refuses source symlinks', async () => {
  const root = await fixture()
  try {
    const first = await buildNativeStarter(root)
    const second = await buildNativeStarter(root)
    assert.equal(first.archiveSha256, second.archiveSha256, 'identical sources create identical archives')
    const { stdout } = await exec('python3', ['-c', 'import json,sys,zipfile\nwith zipfile.ZipFile(sys.argv[1]) as z: print(json.dumps({"files":z.namelist(),"expo":z.read("apps/moru-expo/LICENSE").decode(),"moru":z.read("packages/moru-native/LICENSE").decode()}))', path.join(root, 'public/downloads/moru-native-starter.zip')])
    const archive = JSON.parse(stdout)
    assert.equal(archive.expo, 'Expo original copyright')
    assert.equal(archive.moru, 'Moru MIT notice')
    assert.ok(archive.files.includes('NOTICE.md'))
    assert.ok(archive.files.includes('apps/moru-expo/.npmrc'))
    assert.ok(archive.files.every((file) => !/\.env|\.openai|\.private|node_modules/.test(file)))
    await writeFile(path.join(root, 'outside.txt'), 'NEVER_ARCHIVE')
    await symlink(path.join(root, 'outside.txt'), path.join(root, 'apps/moru-expo/src/linked.ts'))
    await assert.rejects(buildNativeStarter(root), /may not contain symlinks/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('native starter verification rejects modified archives and misleading manifest paths', async () => {
  const root = await fixture()
  try {
    const original = await buildNativeStarter(root)
    await verifyNativeStarter(root)
    const archivePath = path.join(root, 'public/downloads/moru-native-starter.zip')
    const archive = await readFile(archivePath)
    await writeFile(archivePath, Buffer.concat([archive, Buffer.from('modified')]))
    await assert.rejects(verifyNativeStarter(root), /does not match its manifest/)
    await writeFile(archivePath, archive)
    await writeFile(path.join(root, 'public/downloads/moru-native-starter.manifest.json'), JSON.stringify({ ...original, archive: '/downloads/something-else.zip' }))
    await assert.rejects(verifyNativeStarter(root), /invalid manifest/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
