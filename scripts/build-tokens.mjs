import { writeFile } from 'node:fs/promises'
import { createDarkTokens, cssForTokens, defaultTokens } from '../src/theme/tokens.ts'

const light = cssForTokens(defaultTokens, 'light').replace(':root[data-theme="light"]', ':root,\n:root[data-theme="light"]')
const dark = cssForTokens(createDarkTokens(defaultTokens), 'dark')
await writeFile(new URL('../src/theme/default.css', import.meta.url), `/* Generated from tokens.ts. Run npm run tokens:build after changing defaults. */\n${light}\n${dark}`)
console.log('Default light and dark token styles generated.')
