import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const packageDir = path.join(root, 'packages/moru-react')
const packageJson = JSON.parse(readFileSync(path.join(packageDir, 'package.json'), 'utf8'))
const lab = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
// Outside the repository: missing dependencies must not resolve from the lab's node_modules.
const workspace = mkdtempSync(path.join(tmpdir(), 'moru-package-install-'))
const logFile = path.join(workspace, 'verification.log')
let log = ''

function run(command, args, cwd) {
  const label = `${command} ${args.join(' ')}`
  console.log(`Checking: ${label}`)
  try {
    const output = execFileSync(command, args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 20 * 1024 * 1024,
    })
    log += `\n$ ${label}\n${output}`
    writeFileSync(logFile, log)
    return output
  } catch (error) {
    log += `\n$ ${label}\n${error.stdout ?? ''}\n${error.stderr ?? ''}`
    writeFileSync(logFile, log)
    throw error
  }
}
function write(file, data) {
  const target = path.join(workspace, file)
  mkdirSync(path.dirname(target), { recursive: true })
  writeFileSync(target, typeof data === 'string' ? data : `${JSON.stringify(data, null, 2)}\n`)
}

try {
  const requestedTarball = process.argv[2]
  if (process.argv.length > 3)
    throw new Error('Usage: node scripts/test-package-install.mjs [tarball.tgz]')
  let tarball
  if (requestedTarball) {
    tarball = path.resolve(requestedTarball)
    assert.ok(existsSync(tarball), `Tarball not found: ${tarball}`)
  } else {
    run('npm', ['run', 'package:build'], root)
    const packed = JSON.parse(
      run('npm', ['pack', '--json', '--pack-destination', workspace], packageDir),
    )
    tarball = path.join(workspace, packed[0].filename)
  }

  const optional = Object.keys(packageJson.peerDependenciesMeta ?? {}).filter(
    (name) => packageJson.peerDependenciesMeta[name].optional,
  )
  write('package.json', {
    name: 'moru-package-consumer-check',
    private: true,
    type: 'module',
    dependencies: { react: lab.dependencies.react, 'react-dom': lab.dependencies['react-dom'] },
    devDependencies: Object.fromEntries(
      ['typescript', 'vite', '@types/react', '@types/react-dom', '@types/node'].map((name) => [
        name,
        lab.devDependencies[name],
      ]),
    ),
  })
  write('tsconfig.json', {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      jsx: 'react-jsx',
      strict: true,
      skipLibCheck: false,
      noUncheckedSideEffectImports: true,
      noEmit: true,
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
    },
    include: ['src'],
  })
  write(
    'index.html',
    '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Moru package check</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>',
  )
  write('src/main.tsx', readFileSync(path.join(root, 'scripts/fixtures/npm/core.tsx'), 'utf8'))
  run('npm', ['install', tarball, '--no-audit', '--no-fund'], workspace)

  const require = createRequire(path.join(workspace, 'package.json'))
  for (const name of optional) {
    assert.throws(
      () => require.resolve(name),
      { code: 'MODULE_NOT_FOUND' },
      `Core unexpectedly installed ${name}`,
    )
  }
  run(
    process.execPath,
    [path.join(workspace, 'node_modules/typescript/bin/tsc'), '--noEmit'],
    workspace,
  )
  run(process.execPath, [path.join(workspace, 'node_modules/vite/bin/vite.js'), 'build'], workspace)
  run(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "await import('moru-ui'); await import('moru-ui/blocks'); console.log('Node ESM entries resolve without browser globals')",
    ],
    workspace,
  )
  console.log('Core and blocks passed without optional dependencies.')

  write('src/main.tsx', readFileSync(path.join(root, 'scripts/fixtures/npm/optional.tsx'), 'utf8'))
  run(
    'npm',
    [
      'install',
      ...optional.map((name) => `${name}@${packageJson.peerDependencies[name]}`),
      '--no-audit',
      '--no-fund',
    ],
    workspace,
  )
  run(
    process.execPath,
    [path.join(workspace, 'node_modules/typescript/bin/tsc'), '--noEmit'],
    workspace,
  )
  run(process.execPath, [path.join(workspace, 'node_modules/vite/bin/vite.js'), 'build'], workspace)
  console.log(`All optional subpaths passed for ${packageJson.name}@${packageJson.version}.`)
  rmSync(workspace, { recursive: true, force: true })
} catch (error) {
  console.error(`Package verification failed. Consumer and log retained at ${workspace}`)
  throw error
}
