import { useEffect } from 'react'
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { MoruNativeProvider, useMoruNativeTheme } from '@moru/native'
import { LabStateProvider, useLabState } from '../state'
import { useNativePreviewBridge } from '../web/useNativePreviewBridge'
function Navigation() {
  const { colors, mode } = useMoruNativeTheme()
  useEffect(() => {
    document.documentElement.style.colorScheme = mode
    document.documentElement.style.backgroundColor = colors.background
    document.body.style.backgroundColor = colors.background
  }, [mode, colors.background])
  return <ThemeProvider value={mode === 'dark' ? DarkTheme : DefaultTheme}><Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: colors.background } }} /></ThemeProvider>
}
function Theme() {
  const { mode } = useLabState()
  const tokens = useNativePreviewBridge()
  return <MoruNativeProvider mode={mode} tokens={tokens}><Navigation /></MoruNativeProvider>
}
export default function Layout() {
  const embedded = typeof window !== 'undefined' && window.parent !== window
  return <SafeAreaProvider><LabStateProvider embedded={embedded}><Theme /></LabStateProvider></SafeAreaProvider>
}
