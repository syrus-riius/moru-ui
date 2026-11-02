import { describe, expect, it } from 'vitest'
import { isNativePreviewSender, readNativePreviewMessage } from './native-preview-bridge'

describe('native preview transport', () => {
  it('accepts ready and complete supported configuration messages', () => {
    expect(readNativePreviewMessage({ type: 'moru-native:ready', version: 1 })).toEqual({ type: 'moru-native:ready', version: 1 })
    const message = { type: 'moru-native:state', version: 1, payload: { screen: 'tasks', tabStyle: 'pill', centerAction: false } }
    expect(readNativePreviewMessage(message)).toEqual(message)
    expect(readNativePreviewMessage({ type: 'moru-native:mode', version: 1, payload: { mode: 'dark' } })).toEqual({ type: 'moru-native:mode', version: 1, payload: { mode: 'dark' } })
    expect(readNativePreviewMessage({ type: 'moru-native:mode', version: 1, payload: { mode: 'invalid' } })).toBeNull()
  })
  it('retains bounded source information for the current native route', () => {
    const payload = { screen: 'wallet', tabStyle: 'floating', centerAction: true, route: '/controls', componentIds: ['NativePicker', 'BrowserDatePicker'] }
    expect(readNativePreviewMessage({ type: 'moru-native:state', version: 1, payload })).toEqual({ type: 'moru-native:state', version: 1, payload })
    expect(readNativePreviewMessage({ type: 'moru-native:state', version: 1, payload: { ...payload, componentIds: ['<invalid>'] } })).toEqual({ type: 'moru-native:state', version: 1, payload: { screen: 'wallet', tabStyle: 'floating', centerAction: true, route: '/controls' } })
  })
  it.each([null, {}, { type: 'moru-native:ready', version: 2 }, { type: 'moru-native:state', version: 1, payload: { screen: 'arbitrary', tabStyle: 'pill', centerAction: false } }, { type: 'moru-native:state', version: 1, payload: { screen: 'wallet', tabStyle: 'pill', centerAction: 'false' } }])('rejects malformed or unsupported messages', (value) => {
    expect(readNativePreviewMessage(value)).toBeNull()
  })
  it('requires both the expected child window and the exact current origin', () => {
    const frame = {} as Window
    expect(isNativePreviewSender({ origin: 'https://moru.test', source: frame }, 'https://moru.test', frame)).toBe(true)
    expect(isNativePreviewSender({ origin: 'https://other.test', source: frame }, 'https://moru.test', frame)).toBe(false)
    expect(isNativePreviewSender({ origin: 'https://moru.test', source: {} as Window }, 'https://moru.test', frame)).toBe(false)
    expect(isNativePreviewSender({ origin: 'https://moru.test', source: null }, 'https://moru.test', null)).toBe(false)
  })
})
