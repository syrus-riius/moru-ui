/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  nativeComponentSources, nativeCrossPlatformComponents, nativeMobileComponents, nativeOSComponents,
  nativePlatformCapabilities,
} from './mobile-coverage'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const sourceText = (path: string) => readFileSync(`${root}${path}`, 'utf8')

describe('native component source coverage', () => {
  it('maps every native export exactly once to an existing component implementation', () => {
    expect(nativeCrossPlatformComponents).toHaveLength(28)
    expect(nativeOSComponents).toHaveLength(3)
    expect(nativeComponentSources).toHaveLength(31)
    expect(new Set(nativeComponentSources.map((entry) => entry.name)).size).toBe(31)
    expect(nativeComponentSources.map((entry) => entry.name).sort()).toEqual([...nativeMobileComponents].sort())
    for (const entry of nativeComponentSources) {
      expect(sourceText(entry.sourceFile)).toMatch(new RegExp(`export function ${entry.name}\\b`))
      expect(entry.examples.length).toBeGreaterThan(0)
      expect(entry.deviceVerification).toBe('pending')
    }
  })

  it('keeps reusable Expo Universal renderers separate from the date-picker browser adaptation', () => {
    expect(nativeComponentSources.find((entry) => entry.name === 'NativePicker')?.browserImplementation).toBe('shared')
    expect(nativeComponentSources.find((entry) => entry.name === 'NativeSlider')?.browserImplementation).toBe('shared')
    expect(nativeComponentSources.find((entry) => entry.name === 'NativeDatePicker')?.browserImplementation).toBe('adapted')
    for (const entry of nativeComponentSources) {
      expect(entry.entryPoint).toBe(nativeOSComponents.some((name) => name === entry.name) ? '@moru/native/expo' : '@moru/native')
    }
  })

  it('maps wallet, task and activity examples to components that the actual Expo home imports', () => {
    const home = sourceText('apps/moru-expo/src/components/NativeLabHome.tsx')
    for (const entry of nativeComponentSources.filter((item) => item.examples.some((example) => ['wallet', 'tasks', 'activity'].includes(example)))) {
      expect(home).toMatch(new RegExp(`\\b${entry.name}\\b`))
    }
  })
})

describe('mobile-specific capabilities', () => {
  it('separates implemented native patterns from unconnected device integrations', () => {
    expect(new Set(nativePlatformCapabilities.map((entry) => entry.id)).size).toBe(nativePlatformCapabilities.length)
    expect(nativePlatformCapabilities.some((entry) => entry.group === 'pattern')).toBe(true)
    expect(nativePlatformCapabilities.some((entry) => entry.group === 'system')).toBe(true)
    expect(nativePlatformCapabilities.some((entry) => entry.group === 'device')).toBe(true)
    for (const entry of nativePlatformCapabilities) {
      expect(entry.web && entry.ios && entry.android && entry.verificationNote).toBeTruthy()
      expect(entry.docs.length).toBeGreaterThan(0)
      for (const doc of entry.docs) {
        const url = new URL(doc.url)
        expect(url.protocol).toBe('https:')
        expect(['docs.expo.dev', 'reactnative.dev']).toContain(url.hostname)
      }
      for (const name of entry.componentNames) expect(nativeMobileComponents).toContain(name)
      if (entry.implementationStatus === 'implemented') {
        expect(entry.sourceFiles.length).toBeGreaterThan(0)
        for (const path of entry.sourceFiles) expect(sourceText(path).length).toBeGreaterThan(0)
      }
    }
  })

  it('does not label conditionally supported browser device APIs as mobile-only', () => {
    for (const id of ['photos-camera', 'document-picker', 'share-sheet', 'haptics']) {
      const entry = nativePlatformCapabilities.find((item) => item.id === id)!
      expect(entry.scope).not.toBe('native-only')
      expect(entry.implementationStatus).toBe('pending')
    }
    const biometrics = nativePlatformCapabilities.find((entry) => entry.id === 'biometrics')!
    expect(biometrics.scope).toBe('native-only')
    expect(biometrics.web).toContain('미지원')
  })
})
