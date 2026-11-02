import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { spawnSync } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildRegistry, generateRegistry, registryVersion } from './build-registry.mjs'
import { buildProjectStarter, projectStarterPlan, subsetLockfile, verifyProjectStarter } from './build-project-starter.mjs'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const temporary = []
let base, registry
before(async () => {
  registry = await generateRegistry(root)
  base = await mkdtemp(path.join(os.tmpdir(), 'moru-project-starter-tests-'))
  temporary.push(base)
  for (const source of [...new Set([...registry.sources.map((entry) => entry.path), 'package-lock.json', 'scripts/build-project-starter.mjs'])]) {
    await mkdir(path.dirname(path.join(base, source)), { recursive: true })
    await cp(path.join(root, source), path.join(base, source))
  }
  await cp(path.join(root, 'templates/moru-project-starter'), path.join(base, 'templates/moru-project-starter'), { recursive: true })
  const app = path.join(base, 'src/components/project-template')
  await mkdir(app, { recursive: true })
  await writeFile(path.join(app, 'ProjectTasksApp.tsx'), `import { Check } from 'lucide-react'
import { MoruProvider } from '@/components/ui/moru/provider'
import { Button } from '@/components/ui/moru/button'
import { Dialog } from '@/components/ui/moru/dialog'
import { Textarea } from '@/components/ui/moru/textarea'
import { SearchFiltersBlock } from '@/components/ui/moru/blocks/SearchFiltersBlock'
import { SettingsBlock } from '@/components/ui/moru/blocks/SettingsBlock'
import '@/components/ui/moru/styles.css'
import './project-template.css'
import { name } from './project-model'
export function ProjectTasksApp() { return <MoruProvider><h1>{name}</h1><Button><Check />Add</Button><SearchFiltersBlock /><SettingsBlock /><Dialog title="New"><Textarea /></Dialog></MoruProvider> }
`)
  await writeFile(path.join(app, 'project-model.ts'), "export const name = 'Moru Project'\n")
  await writeFile(path.join(app, 'project-template.css'), '.moru-project-app { display: grid; gap: 24px; }\n')
  await writeFile(path.join(app, 'project-model.test.ts'), '// This test must not be downloaded\n')
  await writeFile(path.join(app, '.env'), 'PRIVATE_VALUE=not-for-the-zip\n')
  await buildRegistry(base)
})
after(async () => { for (const directory of temporary) await rm(directory, { recursive: true, force: true }) })
async function fixture() {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'moru-project-fixture-'))
  temporary.push(directory)
  await cp(base, directory, { recursive: true })
  return directory
}

test('the app starter contains only the registry items imported by the application', async () => {
  const plan = await projectStarterPlan(base)
  for (const item of ['core', 'search-filters', 'settings', 'select', 'switch', 'badge', 'dialog', 'textarea']) assert.ok(plan.registryItems.includes(item), item)
  for (const item of ['login', 'otp', 'password-input', 'input-otp']) assert.equal(plan.registryItems.includes(item), false, item)
  assert.ok(plan.entries.has('src/components/ui/moru/blocks/SearchFiltersBlock.tsx'))
  assert.ok(plan.entries.has('src/components/ui/moru/blocks/SettingsBlock.tsx'))
  assert.equal(plan.entries.has('src/components/ui/moru/blocks/LoginBlock.tsx'), false)
})

test('the app starter provides a complete standalone Vite and TypeScript bootstrap', async () => {
  const plan = await projectStarterPlan(base)
  for (const file of ['package.json', 'package-lock.json', 'vite.config.ts', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', 'index.html', 'src/App.tsx', 'src/main.tsx', 'src/app.css', 'src/vite-env.d.ts']) assert.ok(plan.entries.has(file), file)
  assert.match(plan.entries.get('src/App.tsx'), /ProjectTasksApp as default/)
  assert.match(plan.entries.get('vite.config.ts'), /alias: \{ '@':/)
  assert.deepEqual(JSON.parse(plan.entries.get('tsconfig.app.json')).compilerOptions.paths, { '@/*': ['./src/*'] })
  assert.match(plan.entries.get('src/components/project-template/ProjectTasksApp.tsx'), /@\/components\/ui\/moru\/blocks\/SearchFiltersBlock/)
  assert.match(plan.entries.get('src/components/ui/moru/theme-scope.tsx'), /data-moru-registry/)
})

test('runtime and tooling dependencies are selective, exact and lockfile-backed', async () => {
  const plan = await projectStarterPlan(base)
  assert.deepEqual(Object.keys(plan.packageJson.dependencies), ['@base-ui/react', 'lucide-react', 'react', 'react-dom'])
  assert.deepEqual(Object.keys(plan.packageJson.devDependencies), ['@types/node', '@types/react', '@types/react-dom', '@vitejs/plugin-react', 'typescript', 'vite'])
  for (const [name, version] of Object.entries({ ...plan.packageJson.dependencies, ...plan.packageJson.devDependencies })) assert.equal(plan.lockfile.packages[`node_modules/${name}`].version, version)
  for (const name of ['@tanstack/react-table', 'recharts', 'embla-carousel-react', 'react-resizable-panels', 'pretendard', 'tailwindcss', '@babel/parser']) assert.equal(Boolean(plan.lockfile.packages[`node_modules/${name}`]), false, name)
  assert.equal(plan.packageJson.private, true)
  assert.equal(plan.packageJson.license, 'MIT')
  assert.equal(plan.packageJson.version, registryVersion)
})

test('source notices are copied verbatim and local/runtime files are excluded', async () => {
  const plan = await projectStarterPlan(base)
  assert.equal(plan.entries.get('LICENSE'), await readFile(path.join(root, 'LICENSE'), 'utf8'))
  assert.equal(plan.entries.get('NOTICE.md'), await readFile(path.join(root, 'NOTICE.md'), 'utf8'))
  assert.equal(plan.entries.get('src/components/ui/moru/_licenses/Moru-LICENSE'), plan.entries.get('LICENSE'))
  for (const file of plan.entries.keys()) assert.doesNotMatch(file, /(?:^|\/)(?:\.env|\.openai|\.git\/|node_modules\/|dist\/)|\.test\.ts$/)
  const provenance = JSON.parse(plan.entries.get('moru-source.json'))
  assert.deepEqual(provenance.files, [...plan.entries.keys()].sort())
  assert.equal(provenance.registrySourceHash, registry.sourceHash)
  assert.equal(provenance.sourceHash, plan.sourceHash)
  assert.doesNotMatch(plan.entries.get('moru-source.json'), /\/Users\/|appgprj_|127\.0\.0\.1/)
})

test('identical sources produce deterministic package plans and archives', async () => {
  const directory = await fixture()
  const first = await projectStarterPlan(directory)
  const second = await projectStarterPlan(directory)
  assert.deepEqual([...first.entries], [...second.entries])
  const firstBuild = await buildProjectStarter(directory)
  const secondBuild = await buildProjectStarter(directory)
  assert.equal(firstBuild.archiveSha256, secondBuild.archiveSha256)
  await verifyProjectStarter(directory)
  const python = spawnSync('python3', ['-c', `import json,sys,zipfile
with zipfile.ZipFile(sys.argv[1]) as archive:
 names=archive.namelist()
 assert all(name.startswith('moru-project-starter/') for name in names)
 assert not any('.env' in name or '/node_modules/' in name or '.test.' in name for name in names)
 assert all(info.date_time==(1980,1,1,0,0,0) for info in archive.infolist())
 data=json.loads(archive.read('moru-project-starter/package.json'))
 assert len(data['dependencies'])==4
 print(len(names))
`, path.join(directory, 'public/downloads/moru-project-starter.zip')], { encoding: 'utf8' })
  assert.equal(python.status, 0, python.stderr)
  assert.equal(Number(python.stdout.trim()), first.entries.size)
})

test('check mode detects app edits, archive tampering and invalid metadata', async () => {
  const directory = await fixture()
  await buildProjectStarter(directory)
  const archive = path.join(directory, 'public/downloads/moru-project-starter.zip')
  await writeFile(archive, 'tampered')
  await assert.rejects(verifyProjectStarter(directory), /ZIP does not match/)
  await buildProjectStarter(directory)
  const model = path.join(directory, 'src/components/project-template/project-model.ts')
  await writeFile(model, "export const name = 'Edited'\n")
  await assert.rejects(verifyProjectStarter(directory), /stale or has an invalid manifest/)
  await buildProjectStarter(directory)
  const manifest = path.join(directory, 'public/downloads/moru-project-starter.manifest.json')
  const data = JSON.parse(await readFile(manifest, 'utf8'))
  data.entry = '../../private'
  await writeFile(manifest, JSON.stringify(data))
  await assert.rejects(verifyProjectStarter(directory), /invalid manifest/)
})

test('a stale registry must be regenerated before the application can be packaged', async () => {
  const directory = await fixture()
  await writeFile(path.join(directory, 'registry/moru/input.tsx'), '// out of date')
  await assert.rejects(projectStarterPlan(directory), /registry is stale or modified/)
})

test('unresolved app imports and unapproved packages stop packaging', async () => {
  const directory = await fixture()
  const app = path.join(directory, 'src/components/project-template/ProjectTasksApp.tsx')
  const original = await readFile(app, 'utf8')
  await writeFile(app, original + "\nimport './missing-file'\n")
  await assert.rejects(projectStarterPlan(directory), /Unresolved project starter import/)
  await writeFile(app, original + "\nimport 'unapproved-package'\n")
  await assert.rejects(projectStarterPlan(directory), /unapproved runtime package/)
  await writeFile(app, original + "\nimport '@/components/ui/moru/not-a-component'\n")
  await assert.rejects(projectStarterPlan(directory), /not owned by any registry item/)
})

test('linked source files cannot leak files from outside the source tree', async () => {
  const directory = await fixture()
  const model = path.join(directory, 'src/components/project-template/project-model.ts')
  await rm(model)
  await symlink(path.join(directory, 'LICENSE'), model)
  await assert.rejects(projectStarterPlan(directory), /may not contain symlinks/)
})

test('lockfile selection resolves nested dependencies and shared peer dependencies', () => {
  const packageJson = { name: 'test', version: '1.0.0', license: 'MIT', engines: { node: '>=24' }, dependencies: { app: '1.0.0' }, devDependencies: { tooling: '1.0.0' } }
  const lock = { lockfileVersion: 3, packages: {
    '': {},
    'node_modules/app': { version: '1.0.0', dependencies: { shared: '^1' }, optionalDependencies: { absent: '^1' } },
    'node_modules/app/node_modules/shared': { version: '1.1.0' },
    'node_modules/shared': { version: '2.0.0' },
    'node_modules/tooling': { version: '1.0.0', peerDependencies: { shared: '^2' } },
    'node_modules/unrelated': { version: '9.0.0' },
  } }
  const selected = subsetLockfile(lock, packageJson)
  assert.equal(selected.packages['node_modules/app/node_modules/shared'].version, '1.1.0')
  assert.equal(selected.packages['node_modules/shared'].version, '2.0.0')
  assert.equal(selected.packages['node_modules/tooling'].dev, true)
  assert.equal(selected.packages['node_modules/app'].dev, undefined)
  assert.equal(selected.packages['node_modules/unrelated'], undefined)
  assert.equal(lock.packages['node_modules/tooling'].dev, undefined)
})

test('lockfile selection rejects missing required or locally linked packages', () => {
  const packageJson = { name: 'test', version: '1.0.0', dependencies: { app: '1.0.0' }, devDependencies: {} }
  assert.throws(() => subsetLockfile({ lockfileVersion: 3, packages: { '': {}, 'node_modules/app': { version: '1.0.0', dependencies: { missing: '^1' } } } }, packageJson), /Missing locked/)
  assert.throws(() => subsetLockfile({ lockfileVersion: 3, packages: { '': {}, 'node_modules/app': { version: '1.0.0', link: true } } }, packageJson), /linked packages/)
  assert.throws(() => subsetLockfile({ lockfileVersion: 2, packages: {} }, packageJson), /lockfile v3/)
})
