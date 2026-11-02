import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: { include: ['src/**/*.test.{ts,tsx}', 'packages/moru-native/src/**/*.test.ts'] },
})
