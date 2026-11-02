import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { MoruNativeProvider, useMoruNativeTheme } from '@moru/native'
import { LabStateProvider, useLabState } from '../state'
function Navigation() {
  const { colors, mode } = useMoruNativeTheme()
  return <ThemeProvider value={mode === 'dark' ? DarkTheme : DefaultTheme}><StatusBar style={mode === 'dark' ? 'light' : 'dark'} /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, gestureEnabled: true }} /></ThemeProvider>
}
function Theme() { const { mode } = useLabState(); return <MoruNativeProvider mode={mode}><Navigation /></MoruNativeProvider> }
export default function Layout() { return <SafeAreaProvider><LabStateProvider><Theme /></LabStateProvider></SafeAreaProvider> }
