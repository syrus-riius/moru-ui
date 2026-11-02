import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { lstat, mkdir, readFile, readdir, realpath, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Real shadcn CLI integration test. Projects and command logs remain under .qa;
// no parent node_modules or Moru source files are copied into the consumers.
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const args = process.argv.slice(2)
const options = { version: 'v0.3.1', cliVersion: '4.23.0', baseUrl: '', single: false }
for (let index = 0; index < args.length; index += 1) {
  const argument = args[index]
  if (argument === '--single') options.single = true
  else if (['--base-url', '--registry-version', '--cli-version'].includes(argument)) {
    const value = args[++index]
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${argument}`)
    options[argument === '--base-url' ? 'baseUrl' : argument === '--registry-version' ? 'version' : 'cliVersion'] = value
  } else if (argument === '--help') {
    console.log('node scripts/test-registry-install.mjs [--base-url https://host/r/v0.3.1] [--registry-version v0.3.1] [--cli-version 4.23.0] [--single]')
    console.log('Without --base-url, serves public/r/<version> locally and rewrites only same-registry dependency URLs to that temporary server. A supplied URL is fetched unchanged.')
    process.exit(0)
  } else throw new Error(`Unknown argument: ${argument}`)
}
assert.match(options.version, /^v\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/)
assert.match(options.cliVersion, /^(?:latest|\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)$/)

const qa = path.join(root, '.qa/registry-smoke')
await mkdir(qa, { recursive: true })
assert.equal(await realpath(qa), qa, 'QA output may not have a symlink parent')
const runDirectory = path.join(qa, new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-') + `-${process.pid}`)
await mkdir(runDirectory)
const lock = JSON.parse(await readFile(path.join(root, 'package-lock.json'), 'utf8'))
const versionOf = (name) => {
  const version = lock.packages?.[`node_modules/${name}`]?.version
  assert.match(version ?? '', /^\d+\.\d+\.\d+/, `Missing locked version for ${name}`)
  return version
}
const metadata = await fetch(`https://registry.npmjs.org/shadcn/${options.cliVersion}`).then(async (response) => {
  assert.equal(response.ok, true, `Unable to read shadcn metadata: HTTP ${response.status}`)
  return response.json()
})
assert.equal(metadata.name, 'shadcn')
assert.equal(metadata.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, ''), 'https://github.com/shadcn-ui/ui', 'Unexpected shadcn npm repository')
const cliPackage = `shadcn@${metadata.version}`
const report = { registryVersion: options.version, cliPackage, directory: runDirectory, baseUrl: '', localDependencyUrlRewrite: !options.baseUrl, fixtures: [], requests: [] }
const registryPath = `/r/${options.version}`
let server
let baseUrl = options.baseUrl

async function jsonFrom(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) })
  assert.equal(response.ok, true, `HTTP ${response.status}: ${url}`)
  return response.json()
}

if (!baseUrl) {
  const registryDirectory = path.join(root, 'public', 'r', options.version)
  assert.equal((await lstat(registryDirectory)).isDirectory(), true, 'Build the registry before running installation checks')
  server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? '/', 'http://localhost')
      const name = url.pathname.slice(registryPath.length + 1)
      if (!url.pathname.startsWith(`${registryPath}/`) || !/^[a-z0-9-]+\.json$/.test(name)) {
        response.writeHead(404).end(); return
      }
      const item = JSON.parse(await readFile(path.join(registryDirectory, name), 'utf8'))
      // Local pre-publication mode changes transport URLs only. The production
      // mode above uses the deployed payloads without rewriting any fields.
      if (Array.isArray(item.registryDependencies)) item.registryDependencies = item.registryDependencies.map((dependency) => {
        try {
          const url = new URL(dependency)
          return url.origin === 'https://moru-ui-lab.riius.chatgpt.site' && url.pathname.startsWith(`${registryPath}/`)
            ? `${new URL(baseUrl).origin}${url.pathname}${url.search}` : dependency
        } catch { return dependency }
      })
      report.requests.push(url.pathname)
      response.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(item))
    } catch (error) { response.writeHead(500).end(error.message) }
  })
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve) })
  baseUrl = `http://127.0.0.1:${server.address().port}${registryPath}`
} else {
  const url = new URL(baseUrl)
  assert.ok(['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && !url.search && !url.hash, 'Use a plain HTTP(S) registry base URL')
  if (url.pathname === '/') url.pathname = registryPath
  baseUrl = url.href.replace(/\/$/, '')
}
report.baseUrl = baseUrl

async function command(cwd, name, executable, arguments_, { answerNo = false } = {}) {
  console.log(`${path.basename(cwd)}: ${name}`)
  const logfile = path.join(cwd, `${name}.log`)
  const output = createWriteStream(logfile)
  output.write(`${executable} ${arguments_.join(' ')}\n`)
  let tail = ''
  const answeredPrompts = new Set()
  await new Promise((resolve, reject) => {
    const child = spawn(executable, arguments_, { cwd, env: { ...process.env, CI: '1', FORCE_COLOR: '0', NO_COLOR: '1', npm_config_audit: 'false', npm_config_fund: 'false', npm_config_logs_dir: path.join(cwd, '.npm-logs') }, stdio: ['pipe', 'pipe', 'pipe'] })
    child.stdin.on('error', () => {})
    const timeout = setTimeout(() => { child.kill('SIGTERM'); setTimeout(() => child.kill('SIGKILL'), 2_000).unref() }, 240_000)
    const capture = (chunk) => {
      output.write(chunk)
      const text = chunk.toString().replace(/\u001b\[[0-9;?]*[A-Za-z]/g, '')
      tail = (tail + text).slice(-6_000)
      const prompt = [...tail.matchAll(/(?:file|File)\s+([^\n]+?)\s+already exists[^\n]*overwrite[^\n]*\?/g)].at(-1)
      if (answerNo && prompt && !answeredPrompts.has(prompt[1])) {
        answeredPrompts.add(prompt[1]); child.stdin.write('n\n')
      }
      // prompts resumes stdin in a pipe as well as in a terminal. Close the
      // answer stream after the file-update summary so the completed CLI exits.
      if (answerNo && /(?:Created|Skipped) \d+ files/.test(text)) child.stdin.end()
    }
    child.stdout.on('data', capture); child.stderr.on('data', capture)
    child.once('error', (error) => { clearTimeout(timeout); output.end(); reject(error) })
    child.once('close', (code, signal) => {
      clearTimeout(timeout); output.end()
      code === 0 ? resolve() : reject(new Error(`${name} failed (${signal ?? code}). See ${logfile}\n${tail}`))
    })
  })
}

async function filesWithin(directory) {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name)
    if (entry.isDirectory()) result.push(...await filesWithin(filename))
    else if (entry.isFile()) result.push(filename)
  }
  return result
}

async function runFixture({ name, alias, ui }) {
  const directory = path.join(runDirectory, name)
  const uiDirectory = path.join(directory, ui)
  const aliasPath = `${alias}/${ui.slice(4)}`
  const importPath = (file) => `${aliasPath}/moru/${file}`
  await mkdir(uiDirectory, { recursive: true })
  const initialPackage = {
    name: `moru-registry-smoke-${name === 'standard' ? 'standard' : 'alternate'}`, version: '0.0.0', private: true, type: 'module',
    scripts: { build: 'tsc --noEmit && vite build', dev: 'vite --host 127.0.0.1' },
    dependencies: Object.fromEntries(['react', 'react-dom'].map((dependency) => [dependency, versionOf(dependency)])),
    devDependencies: Object.fromEntries(['@types/react', '@types/react-dom', '@types/node', '@vitejs/plugin-react', '@tailwindcss/vite', 'tailwindcss', 'typescript', 'vite'].map((dependency) => [dependency, versionOf(dependency)])),
  }
  const configuration = {
    '$schema': 'https://ui.shadcn.com/schema.json', style: 'new-york', rsc: false, tsx: true,
    tailwind: { config: '', css: 'src/styles.css', baseColor: 'neutral', cssVariables: true, prefix: '' },
    iconLibrary: 'lucide',
    aliases: { components: `${alias}/${ui.slice(4).split('/')[0]}`, ui: aliasPath, utils: `${alias}/lib/utils`, lib: `${alias}/lib`, hooks: `${alias}/hooks` },
  }
  const sentinel = '// Existing application button: registry installation must preserve this file.\nexport const existingApplicationButton = true\n'
  const existingButton = path.join(uiDirectory, 'button.tsx')
  const write = async (filename, content) => { await mkdir(path.dirname(path.join(directory, filename)), { recursive: true }); await writeFile(path.join(directory, filename), content) }
  await write('package.json', JSON.stringify(initialPackage, null, 2) + '\n')
  await write('components.json', JSON.stringify(configuration, null, 2) + '\n')
  await write('tsconfig.json', JSON.stringify({ compilerOptions: { target: 'ES2022', lib: ['ES2022', 'DOM', 'DOM.Iterable'], module: 'ESNext', moduleResolution: 'bundler', allowImportingTsExtensions: true, skipLibCheck: true, noEmit: true, jsx: 'react-jsx', strict: true, verbatimModuleSyntax: true, types: ['vite/client', 'node'], paths: { [`${alias}/*`]: ['./src/*'] } }, include: ['src', 'vite.config.ts'] }, null, 2) + '\n')
  await write('vite.config.ts', `import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\nimport tailwindcss from '@tailwindcss/vite'\nimport { fileURLToPath, URL } from 'node:url'\nexport default defineConfig({ plugins: [react(), tailwindcss()], resolve: { alias: { ${JSON.stringify(alias)}: fileURLToPath(new URL('./src', import.meta.url)) } } })\n`)
  await write('index.html', '<!doctype html><html lang="ko"><head><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Moru registry installation check</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n')
  await write('src/styles.css', '@import "tailwindcss";\n/* APPLICATION_STYLE_SENTINEL: preserve user global styles. */\nbody { margin: 0; font-family: Arial, sans-serif; }\n')
  await writeFile(existingButton, sentinel)
  await write('src/main.tsx', 'import { StrictMode } from "react"\nimport { createRoot } from "react-dom/client"\nimport App from "./App"\nimport "./styles.css"\ncreateRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>)\n')
  await write('src/App.tsx', 'export default function App() { return <main>Registry smoke project</main> }\n')
  await command(directory, '01-lockfile', 'npm', ['install', '--package-lock-only', '--ignore-scripts'])
  await command(directory, '02-clean-install', 'npm', ['ci'])
  const install = (step, items) => command(directory, step, 'npx', ['--yes', cliPackage, 'add', '--yes', ...items.map((item) => `${baseUrl}/${item}.json`)], { answerNo: true })
  await install('03-button', ['button'])
  assert.equal(await readFile(existingButton, 'utf8'), sentinel, 'The user button was overwritten')
  const forbidden = ['recharts', '@tanstack/react-table', 'embla-carousel-react', 'react-resizable-panels']
  const installedLock = JSON.parse(await readFile(path.join(directory, 'package-lock.json'), 'utf8'))
  const afterButton = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'))
  for (const dependency of forbidden) {
    assert.ok(!afterButton.dependencies?.[dependency] && !afterButton.devDependencies?.[dependency], `Button installed unrelated dependency: ${dependency}`)
    assert.ok(!installedLock.packages?.[`node_modules/${dependency}`], `Button installed unrelated transitive dependency: ${dependency}`)
  }
  const core = await jsonFrom(`${baseUrl}/core.json`)
  const resolveTarget = (target) => {
    assert.ok(target.startsWith('@ui/'), `Unexpected core install target: ${target}`)
    const result = path.resolve(uiDirectory, target.slice(4))
    assert.ok(result.startsWith(`${uiDirectory}${path.sep}`), 'Core target escaped the UI directory')
    return result
  }
  const corePaths = core.files.map((file) => resolveTarget(file.target))
  assert.equal(new Set(corePaths).size, corePaths.length, 'Core declares duplicate targets')
  for (const filename of corePaths) assert.ok((await lstat(filename)).isFile(), `Missing installed core file: ${filename}`)
  const customCore = path.join(uiDirectory, 'moru/_lib/cn.ts')
  const customCoreContent = (await readFile(customCore, 'utf8')) + '\n// MORU_USER_CORE_SENTINEL: preserve local changes on repeated installation.\n'
  await writeFile(customCore, customCoreContent)
  await install('04-login-otp', ['input', 'field', 'login', 'otp'])
  await install('05-repeat-button-core', ['button', 'core'])
  assert.equal(await readFile(existingButton, 'utf8'), sentinel, 'Repeated installation overwrote the user button')
  assert.equal(await readFile(customCore, 'utf8'), customCoreContent, 'Repeated installation overwrote a modified core helper')
  assert.ok((await readFile(path.join(directory, 'src/styles.css'), 'utf8')).includes('APPLICATION_STYLE_SENTINEL'), 'Application styles were replaced')
  for (const filename of corePaths) assert.ok((await lstat(filename)).isFile(), `Repeated installation lost core file: ${filename}`)
  const installedFiles = await filesWithin(path.join(directory, 'src'))
  assert.equal(installedFiles.filter((filename) => filename.endsWith(`${path.sep}_theme${path.sep}tokens.ts`)).length, 1, 'Core tokens were installed more than once')
  const consumerPackage = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'))
  for (const filename of installedFiles.filter((filename) => /\.[cm]?[jt]sx?$/.test(filename))) {
    const source = await readFile(filename, 'utf8')
    for (const match of source.matchAll(/(?:from\s*|import\s*)['"]([^.'"][^'"]*)['"]/g)) {
      if (match[1].startsWith(`${alias}/`)) continue
      const dependency = match[1].startsWith('@') ? match[1].split('/').slice(0, 2).join('/') : match[1].split('/')[0]
      assert.ok(consumerPackage.dependencies?.[dependency] || consumerPackage.devDependencies?.[dependency], `Undeclared dependency ${dependency} in ${filename}`)
      const localPackage = path.join(directory, 'node_modules', dependency)
      assert.ok((await realpath(localPackage)).startsWith(`${directory}${path.sep}node_modules${path.sep}`), `Dependency ${dependency} fell back to the parent project`)
    }
  }
  const app = `import { useState } from 'react'
import { Button } from '${importPath('button')}'
import { Input } from '${importPath('input')}'
import { Field } from '${importPath('field')}'
import { MoruProvider } from '${importPath('provider')}'
import { ThemeScope } from '${importPath('theme-scope')}'
import { createDarkTokens, defaultTokens } from '${importPath('_theme/tokens')}'
import { LoginBlock } from '${importPath('blocks/LoginBlock')}'
import { OTPBlock } from '${importPath('blocks/OTPBlock')}'
import '${importPath('styles.css')}'

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const [value, setValue] = useState('')
  const tokens = mode === 'dark' ? createDarkTokens(defaultTokens) : defaultTokens
  return <MoruProvider mode={mode} style={{ minHeight: '100vh', background: 'var(--ui-background)', color: 'var(--ui-text)', padding: 'clamp(16px, 4vw, 48px)' }}>
    <main style={{ maxWidth: 1080, margin: 'auto', display: 'grid', gap: 24 }}>
      <header><h1>Moru registry installation check</h1><p>Actual installed sources · light/dark · login/OTP local demos.</p></header>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><Button onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>Switch to {mode === 'light' ? 'dark' : 'light'}</Button><Button disabled>Disabled</Button><Button loading>Loading</Button></div>
      <ThemeScope tokens={tokens} mode={mode}><Field label="Installed Input" description="Standalone Field + Input composition"><Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Type here" /></Field><Field label="Error state" error="Example validation error"><Input aria-invalid defaultValue="Invalid example" /></Field></ThemeScope>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 24 }}><LoginBlock /><OTPBlock /></div>
    </main>
  </MoruProvider>
}
`
  await write('src/App.tsx', app)
  await command(directory, '06-reproducible-install', 'npm', ['ci'])
  await command(directory, '07-build', 'npm', ['run', 'build'])
  const fixtureReport = { name, directory, alias, ui, checks: { standaloneInstall: true, selectiveButtonDependencies: true, existingButtonPreserved: true, modifiedCorePreserved: true, coreTargetsUnique: true, applicationStylesPreserved: true, dependencyOriginsLocal: true, cleanInstall: true, typecheckAndViteBuild: true }, dependencies: consumerPackage.dependencies, installedSourceFiles: installedFiles.map((filename) => path.relative(directory, filename)).sort() }
  report.fixtures.push(fixtureReport)
  await writeFile(path.join(runDirectory, 'report.json'), JSON.stringify(report, null, 2) + '\n')
}

try {
  await runFixture({ name: 'standard', alias: '@', ui: 'src/components/ui' })
  if (!options.single) await runFixture({ name: '다른 별칭', alias: '~', ui: 'src/공유 UI/컨트롤' })
  report.success = true
  await writeFile(path.join(runDirectory, 'report.json'), JSON.stringify(report, null, 2) + '\n')
  await writeFile(path.join(qa, 'latest.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify({ registryInstall: 'passed', cliPackage, baseUrl, localDependencyUrlRewrite: report.localDependencyUrlRewrite, fixtures: report.fixtures.map(({ name, directory }) => ({ name, directory })), report: path.join(runDirectory, 'report.json') }))
} catch (error) {
  report.success = false; report.error = error.message
  await writeFile(path.join(runDirectory, 'report.json'), JSON.stringify(report, null, 2) + '\n')
  console.error(error.message); process.exitCode = 1
} finally {
  if (server) await new Promise((resolve) => server.close(resolve))
}
