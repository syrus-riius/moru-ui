import { useEffect, useRef, useState } from 'react'
import { router, usePathname } from 'expo-router'
import type { MoruNativeProviderProps } from '@moru/native'
import { useLabState, type NativeLabScreen, type NativeLabTabStyle } from '../state'

type NativeTokens = MoruNativeProviderProps['tokens']
const shared = ['AppScreen', 'NavigationBar', 'IconButton', 'SegmentedControl', 'BottomTabBar', 'BottomSheet', 'NativeButton', 'TextField']
const byScreen: Record<NativeLabScreen, string[]> = {
  wallet: ['Amount', 'CardStack', 'PageControl', 'ActionGrid', 'MetricCard', 'NativeSparkline', 'MobileSearchField', 'SwipeableRow', 'ListRow'],
  tasks: ['DateStrip', 'AvatarGroup', 'NativeCheckbox', 'ListRow'],
  activity: ['ProgressRing', 'ActivityCalendar', 'MetricCard', 'NativeChart'],
}
function componentsFor(path: string, screen: NativeLabScreen) {
  if (path.startsWith('/controls')) return ['AppScreen', 'NavigationBar', 'NativeButton', 'NativePicker', 'NativeSlider', 'BrowserDatePicker', 'NativeSwitch', 'NativeCheckbox', 'NativeRadioGroup', 'NativeStepper', 'NativeActionSheet']
  if (path.startsWith('/system-tabs')) return ['NavigationBar', 'NativeButton', 'ListSection', 'ListRow', 'MetricCard', 'ExpoRouterNativeTabs']
  if (path.startsWith('/task/')) return ['AppScreen', 'NavigationBar', 'TextField', 'NativeCheckbox', 'NativeButton']
  if (path.startsWith('/transaction/')) return ['AppScreen', 'NavigationBar', 'Amount', 'ListSection', 'ListRow', 'NativeButton']
  return [...shared, ...byScreen[screen]]
}
function record(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value) }
function safeValue(value: unknown, depth = 0): boolean {
  if (depth > 5) return false
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value === 'string') return value.length <= 512
  if (typeof value === 'boolean') return true
  return record(value) && Object.keys(value).length <= 128 && Object.entries(value).every(([key, item]) => !['__proto__', 'prototype', 'constructor'].includes(key) && safeValue(item, depth + 1))
}
function tokensFrom(value: unknown): NativeTokens {
  if (!record(value) || !safeValue(value)) return undefined
  const allowed = ['space', 'radius', 'colors', 'borderWidth', 'density', 'metrics', 'typography', 'webFontFamily', 'fontFamily', 'componentSpacing']
  return Object.fromEntries(Object.entries(value).filter(([key]) => allowed.includes(key))) as NativeTokens
}

/** Preview messages stay inside the current same-origin parent/iframe pair. */
export function useNativePreviewBridge() {
  const { embedded, screen, setScreen, tabStyle, setTabStyle, centerAction, setCenterAction, setMode } = useLabState()
  const [tokens, setTokens] = useState<NativeTokens>()
  const pathname = usePathname()
  const pathRef = useRef(pathname)
  const screenRef = useRef(screen)
  useEffect(() => { pathRef.current = pathname; screenRef.current = screen }, [pathname, screen])
  useEffect(() => {
    if (!embedded) return
    const ready = () => window.parent.postMessage({ type: 'moru-native:ready', version: 1 }, window.location.origin)
    function receive(event: MessageEvent) {
      if (event.source !== window.parent || event.origin !== window.location.origin || !record(event.data) || event.data.version !== 1) return
      const { type, payload } = event.data
      if (type === 'moru-native:ping') { ready(); return }
      if (!record(payload)) return
      if (type === 'moru-native:theme' && (payload.mode === 'light' || payload.mode === 'dark')) {
        const next = tokensFrom(payload.tokens)
        if (!next) return
        setMode(payload.mode); setTokens(next)
      }
      if (type === 'moru-native:configure') {
        if (payload.resetRoute === true && pathRef.current !== '/') router.replace('/')
        if (['wallet', 'tasks', 'activity'].includes(String(payload.screen))) {
          const next = payload.screen as NativeLabScreen
          if (payload.resetRoute !== true && screenRef.current !== next && pathRef.current !== '/') router.replace('/')
          setScreen(next)
        }
        if (['standard', 'floating', 'pill'].includes(String(payload.tabStyle))) setTabStyle(payload.tabStyle as NativeLabTabStyle)
        if (typeof payload.centerAction === 'boolean') setCenterAction(payload.centerAction)
      }
    }
    window.addEventListener('message', receive)
    ready()
    return () => window.removeEventListener('message', receive)
  }, [embedded, setCenterAction, setMode, setScreen, setTabStyle])
  useEffect(() => {
    if (!embedded) return
    window.parent.postMessage({ type: 'moru-native:state', version: 1, payload: { screen, tabStyle, centerAction, componentIds: componentsFor(pathname, screen), route: pathname } }, window.location.origin)
  }, [embedded, screen, tabStyle, centerAction, pathname])
  return tokens
}
