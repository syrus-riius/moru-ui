import { NativeTabs } from 'expo-router/native-tabs'
import { useMoruNativeTheme } from '@moru/native'
export default function SystemTabs() {
  const { colors } = useMoruNativeTheme()
  return <NativeTabs tintColor={colors.accent}>
    <NativeTabs.Trigger name="index"><NativeTabs.Trigger.Label>요약</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon sf="square.grid.2x2.fill" md="dashboard" /></NativeTabs.Trigger>
    <NativeTabs.Trigger name="history"><NativeTabs.Trigger.Label>기록</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon sf="clock.fill" md="history" /></NativeTabs.Trigger>
  </NativeTabs>
}
