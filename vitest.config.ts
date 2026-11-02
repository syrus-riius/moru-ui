import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: { alias: { '@/components/ui/moru': fileURLToPath(new URL('./registry/moru', import.meta.url)) } },
  test: { include: ['src/**/*.test.{ts,tsx}', 'packages/moru-native/src/**/*.test.ts'] },
})
