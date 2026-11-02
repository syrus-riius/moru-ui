import { useId, useState, type ReactNode } from 'react'
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, RefreshControl,
  ScrollView, StyleSheet, Switch, Text, TextInput, View,
  type PressableProps, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle,
} from 'react-native'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'
import { useMoruNativeTheme } from './theme'
import { resolveNativeControlBorder, type NativeSize } from './theme-values'
import { readableOn, steppedValue } from './mobile-utils'

export type AppScreenProps = {
  children: ReactNode
  scroll?: boolean
  footer?: ReactNode
  style?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
  refreshing?: boolean
  onRefresh?: () => void
  /** Exclude top/bottom when an enclosing native navigator already owns those insets. */
  edges?: Edge[]
  keyboardVerticalOffset?: number
}

export function AppScreen({ children, scroll = true, footer, style, contentContainerStyle, refreshing = false, onRefresh, edges = ['top', 'left', 'right', 'bottom'], keyboardVerticalOffset = 0 }: AppScreenProps) {
  const { colors, metrics } = useMoruNativeTheme()
  const contentStyle = [{ padding: metrics.cardPadding, gap: metrics.formGap }, contentContainerStyle]
  return <SafeAreaView edges={edges} style={[styles.screen, { backgroundColor: colors.background }, style]}>
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={keyboardVerticalOffset}>
      {scroll ? <ScrollView style={styles.screen} contentContainerStyle={[styles.scrollContent, ...contentStyle]} keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'} contentInsetAdjustmentBehavior="never"
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} /> : undefined}>
        {children}
      </ScrollView> : <View style={[styles.screen, ...contentStyle]}>{children}</View>}
      {footer ? <View style={{ backgroundColor: colors.background }}>{footer}</View> : null}
    </KeyboardAvoidingView>
  </SafeAreaView>
}

export type IconButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children: ReactNode
  accessibilityLabel: string
  style?: StyleProp<ViewStyle>
}

export function IconButton({ children, accessibilityLabel, disabled = false, style, ...props }: IconButtonProps) {
  const { colors, minTouchSize, radius, metrics } = useMoruNativeTheme()
  return <Pressable {...props} accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityState={{ ...props.accessibilityState, disabled }} disabled={disabled}
    style={({ pressed }) => [{ minWidth: Math.max(minTouchSize, metrics.controlHeight.md), minHeight: Math.max(minTouchSize, metrics.controlHeight.md), borderRadius: radius, backgroundColor: pressed ? colors.mutedSurface : 'transparent', opacity: disabled ? .45 : 1 }, styles.center, style]}>
    {children}
  </Pressable>
}

export type NativeButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: NativeSize
  loading?: boolean
  style?: StyleProp<ViewStyle>
}

export function NativeButton({ children, variant = 'primary', size = 'md', loading = false, disabled = false, accessibilityLabel, style, ...props }: NativeButtonProps) {
  const { colors, radius, minTouchSize, space, metrics, typography, borderWidth, componentSpacing } = useMoruNativeTheme()
  const inactive = disabled || loading
  const foreground = variant === 'primary' ? colors.primaryForeground : colors.text
  return <Pressable {...props} accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityState={{ ...props.accessibilityState, disabled: inactive, busy: loading }} disabled={inactive}
    style={({ pressed }) => [styles.button, {
      minHeight: Math.max(minTouchSize, metrics.controlHeight[size]), borderRadius: radius, paddingHorizontal: metrics.controlPaddingX[size], paddingVertical: space * 2, gap: metrics.controlGap, borderWidth,
      backgroundColor: variant === 'primary' ? colors.primary : variant === 'secondary' ? colors.mutedSurface : pressed ? colors.mutedSurface : 'transparent',
      borderColor: variant === 'secondary' ? colors.border : 'transparent', opacity: inactive ? .45 : pressed ? .76 : 1,
    }, componentSpacing.button, style]}>
    {loading ? <ActivityIndicator color={foreground} accessibilityElementsHidden importantForAccessibility="no" /> : null}
    {typeof children === 'string' || typeof children === 'number' ? <Text style={[styles.buttonText, typography.label, { color: foreground }]}>{children}</Text> : children}
  </Pressable>
}

export type NavigationBarProps = {
  title: string
  subtitle?: string
  onBack?: () => void
  trailing?: ReactNode
  style?: StyleProp<ViewStyle>
}

export function NavigationBar({ title, subtitle, onBack, trailing, style }: NavigationBarProps) {
  const { colors, space, typography } = useMoruNativeTheme()
  return <View style={[styles.navigationBar, { gap: space * 2.5 }, style]}>
    {onBack ? <IconButton accessibilityLabel="이전 화면" onPress={onBack}><Text style={{ color: colors.text, fontSize: 32, lineHeight: 36 }}>‹</Text></IconButton> : null}
    <View style={styles.navigationCopy}><Text accessibilityRole="header" style={[styles.title, typography.heading, { color: colors.text }]}>{title}</Text>{subtitle ? <Text style={[styles.caption, typography.caption, { color: colors.muted }]}>{subtitle}</Text> : null}</View>
    {trailing ? <View style={styles.navigationTrailing}>{trailing}</View> : null}
  </View>
}

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string
  error?: string
  description?: string
  style?: StyleProp<ViewStyle>
  inputStyle?: StyleProp<TextStyle>
  size?: NativeSize
}

export function TextField({ label, error, description, style, inputStyle, editable = true, size = 'md', multiline, onFocus, onBlur, accessibilityHint, ...props }: TextFieldProps) {
  const { colors, radius, minTouchSize, space, metrics, typography, borderWidth, componentSpacing } = useMoruNativeTheme()
  const [focused, setFocused] = useState(false)
  const id = useId().replace(/:/g, '')
  return <View style={[styles.field, { gap: metrics.fieldGap }, componentSpacing.field, style]}>
    <Text nativeID={`${id}-label`} style={[styles.label, typography.label, { color: colors.text }]}>{label}</Text>
    <TextInput {...props} editable={editable} multiline={multiline} accessibilityLabel={props.accessibilityLabel ?? label} accessibilityLabelledBy={`${id}-label`} accessibilityHint={error ?? description ?? accessibilityHint} accessibilityState={{ ...props.accessibilityState, disabled: !editable }}
      placeholderTextColor={colors.muted} selectionColor={colors.accent}
      onFocus={(event) => { setFocused(true); onFocus?.(event) }} onBlur={(event) => { setFocused(false); onBlur?.(event) }}
      style={[styles.textInput, typography.body, {
        minHeight: Math.max(minTouchSize, metrics.controlHeight[size]), borderRadius: radius, paddingHorizontal: metrics.controlPaddingX[size], paddingVertical: space * 2, borderWidth: focused || error ? Math.max(1, borderWidth) : borderWidth, backgroundColor: borderWidth === 0 ? colors.mutedSurface : colors.surface,
        color: colors.text, borderColor: error ? colors.danger : focused ? colors.primary : resolveNativeControlBorder(colors),
        opacity: editable ? 1 : .5,
      }, multiline ? styles.multilineInput : undefined, componentSpacing[multiline ? 'textarea' : 'input'], inputStyle]} />
    {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.caption, typography.caption, { color: colors.danger }]}>{error}</Text> : description ? <Text style={[styles.caption, typography.caption, { color: colors.muted }]}>{description}</Text> : null}
  </View>
}

export type ListSectionProps = {
  title?: string
  children: ReactNode
  footer?: string | ReactNode
  style?: StyleProp<ViewStyle>
}

export function ListSection({ title, children, footer, style }: ListSectionProps) {
  const { colors, radius, metrics, typography, borderWidth } = useMoruNativeTheme()
  return <View style={[styles.listSection, { gap: metrics.fieldGap }, style]}>
    {title ? <Text accessibilityRole="header" style={[styles.sectionTitle, typography.label, { color: colors.muted }]}>{title}</Text> : null}
    <View style={{ borderRadius: radius + 4, backgroundColor: colors.surface, borderColor: colors.border, borderWidth, overflow: 'hidden' }}>{children}</View>
    {typeof footer === 'string' ? <Text style={[styles.caption, styles.sectionFooter, typography.caption, { color: colors.muted }]}>{footer}</Text> : footer}
  </View>
}

export type ListRowProps = {
  title: string
  subtitle?: string
  leading?: ReactNode
  trailing?: ReactNode
  onPress?: () => void
  destructive?: boolean
  disabled?: boolean
  showSeparator?: boolean
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
}

export function ListRow({ title, subtitle, leading, trailing, onPress, destructive = false, disabled = false, showSeparator = true, style, accessibilityLabel }: ListRowProps) {
  const { colors, minTouchSize, space, metrics, typography, borderWidth, componentSpacing } = useMoruNativeTheme()
  const rowStyle: StyleProp<ViewStyle> = [styles.listRow, { minHeight: Math.max(metrics.controlHeight.lg + space * 4, minTouchSize), paddingHorizontal: metrics.cardPadding, paddingVertical: space * 3, gap: metrics.controlGap, borderBottomColor: colors.border, borderBottomWidth: showSeparator ? borderWidth : 0, opacity: disabled ? .45 : 1 }, componentSpacing.item, style]
  const content = <>
    {leading ? <View style={styles.listLeading} importantForAccessibility="no-hide-descendants">{leading}</View> : null}
    <View style={styles.rowCopy}><Text style={[styles.rowTitle, typography.body, { color: destructive ? colors.danger : colors.text }]}>{title}</Text>{subtitle ? <Text style={[styles.caption, typography.caption, { color: colors.muted }]}>{subtitle}</Text> : null}</View>
    {trailing !== undefined ? <View style={styles.listTrailing}>{typeof trailing === 'string' || typeof trailing === 'number' ? <Text style={[styles.rowTitle, typography.body, { color: colors.muted }]}>{trailing}</Text> : trailing}</View> : onPress ? <Text accessibilityElementsHidden importantForAccessibility="no" style={{ fontSize: 24, color: colors.muted }}>›</Text> : null}
  </>
  return onPress ? <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? [title, subtitle, typeof trailing === 'string' ? trailing : null].filter(Boolean).join(', ')} accessibilityState={{ disabled }} style={({ pressed }) => [rowStyle, { backgroundColor: pressed ? colors.mutedSurface : colors.surface }]}>{content}</Pressable> : <View style={rowStyle}>{content}</View>
}

export type SegmentedControlProps = {
  items: readonly { value: string; label: string }[]
  value: string
  onValueChange: (value: string) => void
  accessibilityLabel?: string
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

export function SegmentedControl({ items, value, onValueChange, accessibilityLabel = '보기 방식', disabled = false, style }: SegmentedControlProps) {
  const { colors, radius, minTouchSize, space, metrics, typography, componentSpacing } = useMoruNativeTheme()
  return <View accessibilityLabel={accessibilityLabel} style={[styles.segmentedControl, { backgroundColor: colors.mutedSurface, borderRadius: radius + 2, gap: space, padding: space }, componentSpacing['toggle-group'], style]}>
    {items.map((item) => {
      const selected = item.value === value
      return <Pressable key={item.value} disabled={disabled} onPress={() => onValueChange(item.value)} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{ selected, disabled }} style={({ pressed }) => [styles.segment, { minHeight: Math.max(minTouchSize, metrics.controlHeight.md), paddingHorizontal: metrics.controlPaddingX.sm, paddingVertical: space * 2, borderRadius: radius, backgroundColor: selected ? colors.surface : 'transparent', opacity: disabled ? .45 : pressed ? .6 : 1 }]}><Text style={[styles.segmentLabel, typography.label, { color: selected ? colors.text : colors.muted, fontWeight: selected ? '600' : '400' }]}>{item.label}</Text></Pressable>
    })}
  </View>
}

export type BottomTabItem = { value: string; label: string; icon: ReactNode; badge?: number }
export type BottomTabBarProps = {
  items: readonly BottomTabItem[]
  value: string
  onValueChange: (value: string) => void
  variant?: 'standard' | 'floating' | 'pill'
  onCreate?: () => void
  createAccessibilityLabel?: string
  style?: StyleProp<ViewStyle>
}

export function BottomTabBar({ items, value, onValueChange, variant = 'standard', onCreate, createAccessibilityLabel = '새로 만들기', style }: BottomTabBarProps) {
  const { colors, minTouchSize, space, metrics, typography, borderWidth, componentSpacing } = useMoruNativeTheme()
  const detached = variant !== 'standard'
  const createButton = onCreate ? <Pressable key="moru-create-action" onPress={onCreate} accessibilityRole="button" accessibilityLabel={createAccessibilityLabel} style={({ pressed }) => [styles.tabCreate, { minWidth: minTouchSize, minHeight: minTouchSize, backgroundColor: colors.primary, opacity: pressed ? .7 : 1 }]}><Text style={{ fontSize: 27, lineHeight: 32, color: colors.primaryForeground }}>+</Text></Pressable> : null
  const tabs: ReactNode[] = items.map((item) => {
    const selected = item.value === value
    const pill = variant === 'pill' && selected
    return <Pressable key={item.value} onPress={() => onValueChange(item.value)} accessibilityRole="tab" accessibilityLabel={`${item.label}${item.badge && item.badge > 0 ? `, 알림 ${Math.floor(item.badge)}개` : ''}`} accessibilityState={{ selected }} style={({ pressed }) => [styles.bottomTab, { minHeight: Math.max(minTouchSize, metrics.controlHeight.md), paddingHorizontal: space, paddingVertical: space * 2, gap: space, backgroundColor: pill ? colors.primary : 'transparent', opacity: pressed ? .6 : 1 }]}>
      <View importantForAccessibility="no-hide-descendants" style={[styles.tabIcon, { opacity: selected ? 1 : .55 }]}>{item.icon}{item.badge && item.badge > 0 ? <View style={[styles.tabBadge, { backgroundColor: colors.accent }]}><Text style={[styles.badgeText, { color: readableOn(colors.accent) }]}>{item.badge > 99 ? '99+' : Math.floor(item.badge)}</Text></View> : null}</View>
      <Text style={[styles.tabLabel, typography.caption, { color: pill ? colors.primaryForeground : selected ? colors.text : colors.muted, fontWeight: selected ? '600' : '400' }]}>{item.label}</Text>
      {variant === 'standard' && selected ? <View style={[styles.tabIndicator, { backgroundColor: colors.accent }]} /> : null}
    </Pressable>
  })
  if (createButton) tabs.splice(Math.ceil(tabs.length / 2), 0, createButton)
  return <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderColor: colors.border, borderTopWidth: detached ? 0 : borderWidth, paddingHorizontal: space * 2, paddingVertical: space * 1.5 }, detached ? styles.floatingBar : undefined, detached ? { borderWidth } : undefined, componentSpacing.tabs, style]}>{tabs}</View>
}

export type MetricCardProps = { label: string; value: string | number; caption?: string; trend?: string; onPress?: () => void; style?: StyleProp<ViewStyle> }

export function MetricCard({ label, value, caption, trend, onPress, style }: MetricCardProps) {
  const { colors, radius, metrics, typography, borderWidth, componentSpacing } = useMoruNativeTheme()
  const cardStyle: StyleProp<ViewStyle> = [styles.metricCard, { borderRadius: radius + 4, borderColor: colors.border, backgroundColor: colors.surface, padding: metrics.cardPadding, gap: metrics.fieldGap, borderWidth }, componentSpacing.card, style]
  const content = <><Text style={[styles.label, typography.label, { color: colors.muted }]}>{label}</Text><Text style={[styles.metricValue, typography.heading, { color: colors.text }]}>{value}</Text>{caption ? <Text style={[styles.caption, typography.caption, { color: colors.muted }]}>{caption}</Text> : null}{trend ? <Text style={[styles.caption, typography.caption, { color: colors.text }]}>{trend}</Text> : null}</>
  return onPress ? <Pressable accessibilityRole="button" accessibilityLabel={[label, value, caption, trend].filter(Boolean).join(', ')} onPress={onPress} style={({ pressed }) => [cardStyle, { opacity: pressed ? .7 : 1 }]}>{content}</Pressable> : <View style={cardStyle}>{content}</View>
}

export type AmountProps = { value: number; currency?: string; locale?: string; hidden?: boolean; onToggleVisibility?: () => void; style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle> }

export function Amount({ value, currency = 'USD', locale = 'ko-KR', hidden = false, onToggleVisibility, style, textStyle }: AmountProps) {
  const { colors, space, typography } = useMoruNativeTheme()
  let formatted: string
  try { formatted = new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: currency === 'KRW' ? 0 : 2 }).format(Number.isFinite(value) ? value : 0) }
  catch { formatted = `${currency} ${Number.isFinite(value) ? value.toLocaleString() : '0'}` }
  return <View style={[styles.amount, { gap: space * 2 }, style]}>
    <Text accessibilityLabel={hidden ? '잔액이 숨겨져 있습니다.' : formatted} style={[styles.amountText, typography.display, { color: colors.text }, textStyle]}>{hidden ? '••••••' : formatted}</Text>
    {onToggleVisibility ? <IconButton accessibilityLabel={hidden ? '잔액 표시' : '잔액 숨기기'} onPress={onToggleVisibility}><Text style={{ color: colors.muted, fontSize: 19 }} accessibilityElementsHidden>{hidden ? '○' : '◉'}</Text></IconButton> : null}
  </View>
}

export type NativeSwitchProps = { label: string; description?: string; value: boolean; onValueChange: (value: boolean) => void; disabled?: boolean; style?: StyleProp<ViewStyle> }

export function NativeSwitch({ label, description, value, onValueChange, disabled = false, style }: NativeSwitchProps) {
  const { colors, minTouchSize, space, metrics, typography, componentSpacing } = useMoruNativeTheme()
  return <View style={[styles.switchRow, { minHeight: Math.max(minTouchSize, metrics.controlHeight.md), paddingVertical: space, gap: metrics.controlGap, opacity: disabled ? .45 : 1 }, componentSpacing.switch, style]}>
    <View style={styles.rowCopy}><Text style={[styles.rowTitle, typography.body, { color: colors.text }]}>{label}</Text>{description ? <Text style={[styles.caption, typography.caption, { color: colors.muted }]}>{description}</Text> : null}</View>
    <View style={[styles.center, { minWidth: 56, minHeight: minTouchSize }]}><Switch value={value} onValueChange={onValueChange} disabled={disabled} accessibilityLabel={label} accessibilityHint={description} hitSlop={8} trackColor={{ false: resolveNativeControlBorder(colors), true: colors.primary }} thumbColor={Platform.OS === 'android' ? colors.surface : undefined} ios_backgroundColor={resolveNativeControlBorder(colors)} /></View>
  </View>
}

export type NativeCheckboxProps = { label: string; value: boolean; onValueChange: (value: boolean) => void; disabled?: boolean; style?: StyleProp<ViewStyle> }

export function NativeCheckbox({ label, value, onValueChange, disabled = false, style }: NativeCheckboxProps) {
  const { colors, minTouchSize, space, metrics, typography, borderWidth, componentSpacing } = useMoruNativeTheme()
  return <Pressable onPress={() => onValueChange(!value)} disabled={disabled} accessibilityRole="checkbox" accessibilityLabel={label} accessibilityState={{ checked: value, disabled }}
    style={({ pressed }) => [styles.selectionRow, { minHeight: minTouchSize, paddingVertical: space * 2, gap: metrics.controlGap, opacity: disabled ? .45 : pressed ? .65 : 1 }, componentSpacing.checkbox, style]}>
    <View importantForAccessibility="no-hide-descendants" style={[styles.checkboxMark, { width: metrics.checkboxSize, height: metrics.checkboxSize, borderWidth, borderColor: value ? colors.primary : resolveNativeControlBorder(colors), backgroundColor: value ? colors.primary : resolveNativeControlBorder(colors) }]}>{value ? <Text style={{ color: colors.primaryForeground, fontSize: metrics.checkboxSize * .75, fontWeight: '700', lineHeight: metrics.checkboxSize }}>✓</Text> : null}</View>
    <Text style={[styles.rowTitle, typography.body, { color: colors.text, flex: 1 }]}>{label}</Text>
  </Pressable>
}

export type NativeRadioGroupProps = {
  label: string
  items: readonly { value: string; label: string; disabled?: boolean }[]
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

export function NativeRadioGroup({ label, items, value, onValueChange, disabled = false, style }: NativeRadioGroupProps) {
  const { colors, minTouchSize, space, metrics, typography, borderWidth, componentSpacing } = useMoruNativeTheme()
  return <View style={[styles.field, { gap: metrics.fieldGap }, componentSpacing['radio-group'], style]} accessibilityRole="radiogroup" accessibilityLabel={label}>
    <Text style={[styles.label, typography.label, { color: colors.text }]}>{label}</Text>
    {items.map((item) => {
      const selected = value === item.value
      const inactive = disabled || item.disabled
      return <Pressable key={item.value} onPress={() => { if (!selected) onValueChange(item.value) }} disabled={inactive} accessibilityRole="radio" accessibilityLabel={item.label} accessibilityState={{ checked: selected, disabled: inactive }}
        style={({ pressed }) => [styles.selectionRow, { minHeight: minTouchSize, paddingVertical: space * 2, gap: metrics.controlGap, opacity: inactive ? .45 : pressed ? .65 : 1 }]}>
        <View importantForAccessibility="no-hide-descendants" style={[styles.radioMark, { width: metrics.checkboxSize, height: metrics.checkboxSize, borderRadius: metrics.checkboxSize / 2, borderWidth, borderColor: selected ? colors.primary : resolveNativeControlBorder(colors), backgroundColor: resolveNativeControlBorder(colors) }]}>{selected ? <View style={[styles.radioDot, { width: metrics.checkboxSize / 2, height: metrics.checkboxSize / 2, borderRadius: metrics.checkboxSize / 4, backgroundColor: colors.primary }]} /> : null}</View>
        <Text style={[styles.rowTitle, typography.body, { color: colors.text, flex: 1 }]}>{item.label}</Text>
      </Pressable>
    })}
  </View>
}

export type NativeStepperProps = { label: string; value: number; onValueChange: (value: number) => void; min?: number; max?: number; step?: number; disabled?: boolean; style?: StyleProp<ViewStyle> }

export function NativeStepper({ label, value, onValueChange, min = 0, max = 100, step = 1, disabled = false, style }: NativeStepperProps) {
  const { colors, radius, metrics, typography, borderWidth } = useMoruNativeTheme()
  const lower = Number.isFinite(min) ? min : 0
  const upper = Number.isFinite(max) ? Math.max(lower, max) : Math.max(lower, 100)
  const increment = Number.isFinite(step) && step > 0 ? step : 1
  const current = Math.min(upper, Math.max(lower, Number.isFinite(value) ? value : lower))
  function change(direction: number) { if (!disabled) onValueChange(steppedValue(current, increment, direction, lower, upper)) }
  return <View style={[styles.stepperRow, { gap: metrics.controlGap }, style]}>
    <Text style={[styles.rowTitle, typography.body, { color: colors.text, flex: 1 }]}>{label}</Text>
    <View style={[styles.stepperControls, { borderColor: colors.border, borderRadius: radius, borderWidth, backgroundColor: colors.surface }]}>
      <IconButton accessibilityLabel={`${label} 줄이기`} onPress={() => change(-1)} disabled={disabled || current <= lower}><Text style={{ fontSize: 23, color: colors.text }}>−</Text></IconButton>
      <Text accessibilityLiveRegion="polite" style={[styles.stepperValue, typography.code, { color: colors.text }]}>{current}</Text>
      <IconButton accessibilityLabel={`${label} 늘리기`} onPress={() => change(1)} disabled={disabled || current >= upper}><Text style={{ fontSize: 23, color: colors.text }}>+</Text></IconButton>
    </View>
  </View>
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  button: { borderWidth: 1, paddingHorizontal: 18, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonText: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  navigationBar: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56 },
  navigationCopy: { flex: 1, gap: 3 },
  navigationTrailing: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  title: { fontSize: 22, fontWeight: '600', lineHeight: 29, letterSpacing: -.5 },
  caption: { fontSize: 12, lineHeight: 18 },
  label: { fontSize: 13, lineHeight: 20, fontWeight: '500' },
  field: { gap: 7 },
  textInput: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, lineHeight: 22 },
  multilineInput: { minHeight: 112, textAlignVertical: 'top', paddingTop: 14 },
  listSection: { gap: 8 },
  sectionTitle: { marginHorizontal: 10, fontSize: 13, lineHeight: 19, fontWeight: '500' },
  sectionFooter: { marginHorizontal: 10 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  rowCopy: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  listLeading: { alignItems: 'center', justifyContent: 'center', minWidth: 30 },
  listTrailing: { alignItems: 'flex-end', flexShrink: 0, maxWidth: '45%' },
  segmentedControl: { flexDirection: 'row', gap: 3, padding: 3 },
  segment: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8 },
  segmentLabel: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', gap: 3, paddingHorizontal: 8, paddingTop: 7, paddingBottom: 7 },
  floatingBar: { marginHorizontal: 12, marginBottom: 8, borderRadius: 28, paddingHorizontal: 8, paddingVertical: 6 },
  bottomTab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingHorizontal: 5, paddingVertical: 8, borderRadius: 22 },
  tabIcon: { alignItems: 'center', justifyContent: 'center', minHeight: 24, minWidth: 26 },
  tabLabel: { fontSize: 10, lineHeight: 15, textAlign: 'center' },
  tabIndicator: { position: 'absolute', top: 0, height: 2, width: 18, borderRadius: 2 },
  tabBadge: { position: 'absolute', right: -10, top: -6, minWidth: 16, minHeight: 16, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  badgeText: { fontSize: 9, fontWeight: '600', lineHeight: 13 },
  tabCreate: { alignItems: 'center', justifyContent: 'center', borderRadius: 25, marginHorizontal: 4 },
  metricCard: { padding: 18, gap: 8, borderWidth: StyleSheet.hairlineWidth, minWidth: 0 },
  metricValue: { fontSize: 28, lineHeight: 35, fontWeight: '600', letterSpacing: -.6, fontVariant: ['tabular-nums'] },
  amount: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  amountText: { flexShrink: 1, fontSize: 34, lineHeight: 43, fontWeight: '600', letterSpacing: -.8, fontVariant: ['tabular-nums'] },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 5 },
  selectionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  checkboxMark: { width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  radioMark: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 12, height: 12, borderRadius: 6 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepperControls: { flexDirection: 'row', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth },
  stepperValue: { minWidth: 30, textAlign: 'center', fontSize: 15, lineHeight: 22, fontVariant: ['tabular-nums'] },
})
