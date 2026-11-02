import { useState } from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import { Host, Picker, Slider } from '@expo/ui'
import DateTimePicker from '@expo/ui/community/datetime-picker'
import { NativeButton } from './core'
import { useMoruNativeTheme } from './theme'

export type NativePickerProps = {
  label: string
  items: { value: string; label: string }[]
  value: string
  onValueChange: (value: string) => void
  appearance?: 'menu' | 'wheel'
  disabled?: boolean
}
/** Uses SwiftUI on iOS and Jetpack Compose on Android through Expo UI's Host. */
export function NativePicker({ label, items, value, onValueChange, appearance = 'menu', disabled = false }: NativePickerProps) {
  const { colors, mode, metrics, typography } = useMoruNativeTheme()
  return <View style={{ gap: metrics.fieldGap }}><Text style={[typography.label, { color: colors.text }]}>{label}</Text>
    <Host colorScheme={mode} seedColor={colors.accent} style={{ height: appearance === 'wheel' ? 216 : Math.max(56, metrics.controlHeight.md), width: '100%' }} ignoreSafeArea="all" accessibilityLabel={label}>
      <Picker selectedValue={value} onValueChange={onValueChange} appearance={appearance} enabled={!disabled}>
        {items.map((item) => <Picker.Item key={item.value} label={item.label} value={item.value} />)}
      </Picker>
    </Host>
  </View>
}

export type NativeSliderProps = { label: string; value: number; onValueChange: (value: number) => void; min?: number; max?: number; step?: number; disabled?: boolean }
export function NativeSlider({ label, value, onValueChange, min = 0, max = 100, step = 1, disabled = false }: NativeSliderProps) {
  const { colors, mode, metrics, typography } = useMoruNativeTheme()
  const lower = Number.isFinite(min) ? min : 0
  const upper = Number.isFinite(max) && max > lower ? max : lower + 100
  const amount = Math.min(upper, Math.max(lower, Number.isFinite(value) ? value : lower))
  return <View style={{ gap: metrics.fieldGap }}><Text style={[typography.label, { color: colors.text }]}>{label} · {amount.toLocaleString('ko-KR', { maximumSignificantDigits: 15 })}</Text>
    <Host colorScheme={mode} seedColor={colors.accent} style={{ height: 52, width: '100%' }} ignoreSafeArea="all" accessibilityLabel={label}>
      <Slider value={amount} onValueChange={onValueChange} min={lower} max={upper} step={Number.isFinite(step) && step > 0 ? step : 1} disabled={disabled} />
    </Host>
  </View>
}

export type NativeDatePickerProps = { label: string; value: Date; onValueChange: (value: Date) => void; mode?: 'date' | 'time'; minimumDate?: Date; maximumDate?: Date }
export function NativeDatePicker({ label, value, onValueChange, mode = 'date', minimumDate, maximumDate }: NativeDatePickerProps) {
  const { colors, radius, mode: colorScheme, minTouchSize, metrics, typography, borderWidth, componentSpacing } = useMoruNativeTheme()
  const [open, setOpen] = useState(false)
  const valid = Number.isFinite(value.getTime())
  return <View style={{ gap: metrics.fieldGap }}><Text style={[typography.label, { color: colors.text }]}>{label}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${valid ? value.toLocaleString('ko-KR') : '날짜를 확인해 주세요'}`} disabled={!valid} onPress={() => setOpen(!open)} style={[{ minHeight: Math.max(minTouchSize, metrics.controlHeight.md), justifyContent: 'center', paddingHorizontal: metrics.controlPaddingX.md, borderWidth, borderColor: colors.border, borderRadius: radius, backgroundColor: colors.surface }, componentSpacing['date-picker']]}>
      <Text style={[typography.body, { color: colors.text }]}>{valid ? mode === 'time' ? value.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : value.toLocaleDateString('ko-KR') : '날짜를 확인해 주세요'}</Text>
    </Pressable>
    {open && valid ? <View><DateTimePicker value={value} mode={mode} minimumDate={minimumDate} maximumDate={maximumDate} themeVariant={colorScheme} accentColor={colors.accent} display={Platform.OS === 'ios' ? 'spinner' : 'default'} onDismiss={() => setOpen(false)} onValueChange={(_, date) => { onValueChange(date); if (Platform.OS === 'android') setOpen(false) }} />
      {Platform.OS === 'ios' ? <NativeButton variant="secondary" onPress={() => setOpen(false)}>날짜 선택 완료</NativeButton> : null}
    </View> : null}
  </View>
}
