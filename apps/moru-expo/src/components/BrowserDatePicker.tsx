import { useId } from 'react'
import { Text, View } from 'react-native'
import { useMoruNativeTheme } from '@moru/native'
import type { NativeDatePickerProps } from '@moru/native/expo'
function dateOnly(value: Date) { return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}` }
/** Explicit browser alternative: the Expo community DateTimePicker web module renders null. */
export function BrowserDatePicker({ label, value, onValueChange, mode = 'date', minimumDate, maximumDate }: NativeDatePickerProps) {
  const { colors, radius } = useMoruNativeTheme()
  const id = useId()
  return <View style={{ gap: 8 }}><Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>{label} · 브라우저 대체</Text>
    <input id={id} aria-label={`${label} 브라우저 날짜 선택`} type={mode === 'time' ? 'time' : 'date'}
      value={mode === 'time' ? `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}` : dateOnly(value)}
      min={minimumDate && mode === 'date' ? dateOnly(minimumDate) : undefined} max={maximumDate && mode === 'date' ? dateOnly(maximumDate) : undefined}
      onChange={(event) => {
        if (!event.target.value) return
        const next = new Date(value)
        const parts = event.target.value.split(mode === 'time' ? ':' : '-').map(Number)
        if (mode === 'time') next.setHours(parts[0], parts[1], 0, 0)
        else next.setFullYear(parts[0], parts[1] - 1, parts[2])
        if (Number.isFinite(next.getTime())) onValueChange(next)
      }} style={{ minHeight: 48, boxSizing: 'border-box', width: '100%', border: `1px solid ${colors.border}`, borderRadius: radius, padding: '10px 12px', backgroundColor: colors.surface, color: colors.text, fontSize: 16 }} />
    <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>앱의 iOS·Android 시스템 날짜 선택기는 기기에서 확인하세요.</Text>
  </View>
}
