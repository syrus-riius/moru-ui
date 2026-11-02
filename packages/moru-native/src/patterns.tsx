import { useCallback, useEffect, useMemo, useRef, useState, type ComponentRef, type ReactNode } from 'react'
import {
  AccessibilityInfo, Animated, Image, Keyboard, KeyboardAvoidingView, Modal, PanResponder,
  Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, findNodeHandle, useWindowDimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Circle } from 'react-native-svg'
import { useMoruNativeTheme } from './theme'
import { calendarMonthCells, closestDetent, progressValues, readableOn, sheetDetentHeights } from './mobile-utils'

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    let mounted = true
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => { if (mounted) setReduced(value) })
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced)
    return () => { mounted = false; subscription.remove() }
  }, [])
  return reduced
}

export type BottomSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  /** Fractions of usable height, or px when larger than one. */
  detents?: readonly number[]
  /** Zero-based index after the detents have been sorted. */
  initialDetent?: number
  /** Disable when children contain their own FlatList or ScrollView. */
  scrollable?: boolean
}

/** Drag is confined to the handle, leaving form fields and vertical lists usable. */
export function BottomSheet({ open, onOpenChange, title, children, detents, initialDetent = 0, scrollable = true }: BottomSheetProps) {
  const { colors, radius, space, metrics, typography, borderWidth, componentSpacing } = useMoruNativeTheme()
  const insets = useSafeAreaInsets()
  const window = useWindowDimensions()
  const reducedMotion = useReducedMotion()
  const availableHeight = Math.max(80, window.height - insets.top - 12)
  const heights = sheetDetentHeights(detents, availableHeight)
  const heightKey = heights.join(',')
  const initialIndex = Math.max(0, Math.min(heights.length - 1, Math.trunc(initialDetent) || 0))
  const [presented, setPresented] = useState(open)
  const [detentIndex, setDetentIndex] = useState(initialIndex)
  const visibleDetentIndex = Math.max(0, Math.min(heights.length - 1, detentIndex))
  const height = useRef(new Animated.Value(0)).current
  const currentHeight = useRef(0)
  const dragStart = useRef(0)
  const selectedIndex = useRef(initialIndex)
  const openRef = useRef(open)
  const changeRef = useRef(onOpenChange)
  const titleRef = useRef<ComponentRef<typeof Text>>(null)
  openRef.current = open
  changeRef.current = onOpenChange

  useEffect(() => {
    const listener = height.addListener(({ value }) => { currentHeight.current = value })
    return () => { height.removeListener(listener); height.stopAnimation() }
  }, [height])

  const animateHeight = useCallback((target: number, complete?: () => void) => {
    height.stopAnimation()
    Animated.timing(height, { toValue: target, duration: reducedMotion ? 0 : 230, useNativeDriver: false }).start(({ finished }) => { if (finished) complete?.() })
  }, [height, reducedMotion])

  useEffect(() => {
    if (open) {
      const index = Math.min(selectedIndex.current, heights.length - 1)
      selectedIndex.current = index
      setDetentIndex(index)
      setPresented(true)
      animateHeight(heights[index])
    } else animateHeight(0, () => setPresented(false))
    // Detent geometry is represented by its values, so callers may use inline arrays.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, heightKey, animateHeight])

  function selectDetent(index: number) {
    const next = Math.max(0, Math.min(heights.length - 1, index))
    selectedIndex.current = next
    setDetentIndex(next)
    animateHeight(heights[next])
  }
  function close() { changeRef.current(false) }
  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 4,
    onPanResponderGrant: () => { height.stopAnimation(); dragStart.current = currentHeight.current },
    onPanResponderMove: (_, gesture) => {
      const next = Math.max(0, Math.min(heights[heights.length - 1], dragStart.current - gesture.dy))
      currentHeight.current = next
      height.setValue(next)
    },
    onPanResponderRelease: (_, gesture) => {
      if (currentHeight.current < heights[0] * .6 || gesture.vy > 1.3) { changeRef.current(false); return }
      let next = closestDetent(currentHeight.current, heights)
      if (gesture.vy < -.6) next = Math.min(heights.length - 1, next + 1)
      if (gesture.vy > .6) next = Math.max(0, next - 1)
      selectedIndex.current = next
      setDetentIndex(next)
      animateHeight(heights[next])
    },
    onPanResponderTerminate: () => animateHeight(heights[selectedIndex.current] ?? heights[0]),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [heightKey, height, animateHeight])

  const body = scrollable
    ? <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled contentContainerStyle={[styles.sheetBody, { padding: metrics.cardPadding, gap: metrics.formGap }, componentSpacing.sheet]}>{children}</ScrollView>
    : <View style={[styles.sheetBody, styles.fill, { padding: metrics.cardPadding, gap: metrics.formGap }, componentSpacing.sheet]}>{children}</View>

  return <Modal visible={presented} transparent animationType="none" statusBarTranslucent onRequestClose={close} onShow={() => {
    if (!openRef.current || Platform.OS === 'web') return
    const handle = findNodeHandle(titleRef.current)
    if (handle) AccessibilityInfo.setAccessibilityFocus(handle)
  }}>
    <KeyboardAvoidingView style={styles.sheetOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityRole="button" accessibilityLabel="시트 닫기" />
      <Animated.View accessibilityViewIsModal importantForAccessibility="yes" style={[styles.sheetPanel, { backgroundColor: colors.surface, height, borderTopLeftRadius: radius + 12, borderTopRightRadius: radius + 12, paddingBottom: Math.max(insets.bottom, space * 3) }]}>
        <View {...pan.panHandlers} accessible accessibilityRole="adjustable" accessibilityLabel="시트 높이" accessibilityHint="위아래로 밀어 높이를 바꾸거나 아래로 내려 닫으세요."
          accessibilityValue={{ min: 0, max: heights.length - 1, now: visibleDetentIndex, text: `${Math.round(heights[visibleDetentIndex] / availableHeight * 100)}퍼센트` }}
          accessibilityActions={[{ name: 'increment', label: '더 크게' }, { name: 'decrement', label: '더 작게' }, { name: 'escape', label: '닫기' }]}
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === 'increment') selectDetent(selectedIndex.current + 1)
            if (event.nativeEvent.actionName === 'decrement') selectDetent(selectedIndex.current - 1)
            if (event.nativeEvent.actionName === 'escape') close()
          }} style={styles.sheetHandleTarget}><View style={[styles.sheetHandle, { backgroundColor: colors.border }]} /></View>
        <View style={[styles.sheetHeader, { borderBottomColor: colors.border, borderBottomWidth: borderWidth, paddingLeft: metrics.cardPadding, paddingRight: space * 2, gap: metrics.controlGap }]}><Text ref={titleRef} accessibilityRole="header" style={[styles.sheetTitle, typography.heading, { color: colors.text }]}>{title}</Text><Pressable onPress={close} accessibilityLabel="닫기" accessibilityRole="button" style={styles.touch}><Text style={[styles.close, { color: colors.muted }]}>×</Text></Pressable></View>
        {body}
      </Animated.View>
    </KeyboardAvoidingView>
  </Modal>
}

export type SwipeAction = { label: string; onPress: () => void; destructive?: boolean }
export type SwipeableRowProps = { children: ReactNode; actions: readonly SwipeAction[]; disabled?: boolean; accessibilityLabel?: string }

/** Swiping reveals choices; only an explicit action press invokes a destructive callback. */
export function SwipeableRow({ children, actions, disabled = false, accessibilityLabel }: SwipeableRowProps) {
  const { colors, radius, typography } = useMoruNativeTheme()
  const reducedMotion = useReducedMotion()
  const [revealed, setRevealed] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const visibleActions = actions.length > 3 ? [...actions.slice(0, 2), { label: '더 보기', onPress: () => setMoreOpen(true) }] : actions
  const offset = useRef(new Animated.Value(0)).current
  const current = useRef(0)
  const start = useRef(0)
  const actionWidth = Math.min(240, visibleActions.length * 84)
  const canSwipe = !disabled && actions.length > 0
  useEffect(() => {
    const listener = offset.addListener(({ value }) => { current.current = value })
    return () => { offset.removeListener(listener); offset.stopAnimation() }
  }, [offset])
  const settle = useCallback((show: boolean) => {
    setRevealed(show)
    Animated.timing(offset, { toValue: show ? -actionWidth : 0, duration: reducedMotion ? 0 : 180, useNativeDriver: true }).start()
  }, [offset, actionWidth, reducedMotion])
  useEffect(() => { if (!canSwipe) settle(false) }, [canSwipe, settle])
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => canSwipe && Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.6,
    onPanResponderGrant: () => { offset.stopAnimation(); start.current = current.current },
    onPanResponderMove: (_, gesture) => {
      const next = Math.max(-actionWidth, Math.min(0, start.current + gesture.dx))
      current.current = next
      offset.setValue(next)
    },
    onPanResponderRelease: (_, gesture) => settle(gesture.vx < -.3 || (gesture.vx <= .3 && current.current < -actionWidth * .35)),
    onPanResponderTerminate: () => settle(revealed),
  }), [offset, canSwipe, actionWidth, settle, revealed])
  return <><View style={[styles.swipeRow, { borderRadius: radius, backgroundColor: colors.mutedSurface }]}>
    <View accessibilityElementsHidden={!revealed} importantForAccessibility={revealed ? 'yes' : 'no-hide-descendants'} pointerEvents={revealed ? 'auto' : 'none'} style={[styles.swipeActions, { width: actionWidth }]}>
      {visibleActions.map((action, index) => <Pressable key={`${action.label}-${index}`} accessibilityRole="button" accessibilityLabel={action.label} disabled={!revealed || disabled} onPress={() => { settle(false); action.onPress() }} style={({ pressed }) => [styles.swipeAction, { backgroundColor: action.destructive ? colors.danger : colors.primary, opacity: pressed ? .7 : 1 }]}><Text style={[styles.actionText, typography.label, { color: readableOn(action.destructive ? colors.danger : colors.primary, colors.primaryForeground) }]}>{action.label}</Text></Pressable>)}
    </View>
    <Animated.View {...pan.panHandlers} style={[styles.swipeForeground, { backgroundColor: colors.surface, transform: [{ translateX: offset }] }]}><View style={styles.fill}>{children}</View>{actions.length ? <Pressable accessibilityRole="button" disabled={disabled} accessibilityLabel={accessibilityLabel ? `${accessibilityLabel} 작업 ${revealed ? '닫기' : '보기'}` : `작업 ${revealed ? '닫기' : '보기'}`} accessibilityState={{ expanded: revealed, disabled }} onPress={() => settle(!revealed)} style={styles.touch}><Text style={[styles.ellipsis, { color: colors.muted }]}>···</Text></Pressable> : null}</Animated.View>
  </View><NativeActionSheet open={moreOpen && !disabled} onOpenChange={setMoreOpen} title={accessibilityLabel ? `${accessibilityLabel} 작업` : '작업 선택'} actions={actions} /></>
}

export type DateStripProps = { dates: readonly { value: string; label: string; weekday?: string }[]; value: string; onValueChange: (value: string) => void }
export function DateStrip({ dates, value, onValueChange }: DateStripProps) {
  const { colors, radius, space, metrics, typography } = useMoruNativeTheme()
  return <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false} style={styles.horizontalScroller} contentContainerStyle={[styles.dateStrip, { padding: space / 2, gap: metrics.controlGap }]}>
    {dates.map((date) => <Pressable key={date.value} accessibilityRole="button" accessibilityLabel={`${date.value}${date.weekday ? ` ${date.weekday}` : ''}`} accessibilityState={{ selected: value === date.value }} onPress={() => onValueChange(date.value)} style={({ pressed }) => [styles.dateButton, { backgroundColor: value === date.value ? colors.primary : colors.mutedSurface, borderRadius: radius + 4, padding: space * 2, gap: space, minHeight: Math.max(72, metrics.controlHeight.lg + space * 4), opacity: pressed ? .65 : 1 }]}>{date.weekday ? <Text style={[styles.dateWeekday, typography.caption, { color: value === date.value ? colors.primaryForeground : colors.muted }]}>{date.weekday}</Text> : null}<Text style={[styles.dateLabel, typography.label, { color: value === date.value ? colors.primaryForeground : colors.text }]}>{date.label}</Text></Pressable>)}
  </ScrollView>
}

export type ActivityCalendarProps = { year: number; month: number; activities: Readonly<Record<string, number>>; selectedDate?: string; onSelectDate?: (date: string) => void }
export function ActivityCalendar({ year, month, activities, selectedDate, onSelectDate }: ActivityCalendarProps) {
  const { colors, space, typography, componentSpacing } = useMoruNativeTheme()
  const [width, setWidth] = useState(336)
  const cells = calendarMonthCells(year, month)
  if (!cells.length) return <Text style={{ color: colors.muted }}>유효한 연도와 월을 선택해 주세요.</Text>
  return <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={[styles.calendar, { gap: space * 3 }, componentSpacing.calendar]}>
    <Text accessibilityRole="header" style={[styles.calendarTitle, typography.heading, { color: colors.text }]}>{year}년 {month}월 활동</Text>
    <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarScroll}>
      <View style={{ width: Math.max(336, width) }}><View style={styles.calendarGrid}>{['월', '화', '수', '목', '금', '토', '일'].map((weekday) => <View key={weekday} style={styles.calendarCell}><Text accessible={false} style={[styles.weekday, typography.caption, { color: colors.muted }]}>{weekday}</Text></View>)}</View>
        <View style={styles.calendarGrid}>{cells.map((day, index) => {
          if (!day) return <View key={`empty-${index}`} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.calendarCell} />
          const raw = Object.prototype.hasOwnProperty.call(activities, day.date) ? activities[day.date] : 0
          const count = Number.isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0
          const selected = selectedDate === day.date
          const background = count >= 3 ? colors.accent : colors.mutedSurface
          return <Pressable key={day.date} accessibilityRole="button" accessibilityLabel={`${day.date}, 활동 ${count}회`} accessibilityState={{ selected, disabled: !onSelectDate }} disabled={!onSelectDate} onPress={() => onSelectDate?.(day.date)} style={styles.calendarCell}><View style={[styles.activityDay, { backgroundColor: background, borderColor: selected ? colors.primary : 'transparent', borderWidth: selected ? 2 : 0 }]}>{count > 0 && count < 3 ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.accent, opacity: count >= 2 ? .3 : .12, borderRadius: 20 }]} /> : null}<Text style={[styles.activityDayLabel, typography.label, { color: count >= 3 ? readableOn(colors.accent, colors.text) : colors.text }]}>{day.day}</Text>{count > 0 ? <View style={[styles.activityDot, { backgroundColor: count >= 3 ? readableOn(colors.accent, colors.text) : colors.accent }]} /> : null}</View></Pressable>
        })}</View>
      </View>
    </ScrollView>
    <Text style={[styles.calendarLegend, typography.caption, { color: colors.muted }]}>활동 횟수가 많을수록 진하게 표시됩니다.{selectedDate ? ` 선택: ${selectedDate}` : ''}</Text>
  </View>
}

export type ProgressRingProps = { value: number; max?: number; label?: string; size?: number }
export function ProgressRing({ value, max = 100, label = '진행률', size = 112 }: ProgressRingProps) {
  const { colors, typography } = useMoruNativeTheme()
  const progress = progressValues(value, max)
  const diameter = Math.max(64, Math.min(320, Number.isFinite(size) ? size : 112))
  const stroke = Math.max(5, diameter * .065)
  const center = diameter / 2
  const radius = (diameter - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const percent = Math.round(progress.fraction * 100)
  return <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: progress.max, now: progress.value, text: `${percent}퍼센트` }} style={{ width: diameter, height: diameter }}>
    <Svg accessible={false} width={diameter} height={diameter} viewBox={`0 0 ${diameter} ${diameter}`}><Circle cx={center} cy={center} r={radius} fill="none" stroke={colors.mutedSurface} strokeWidth={stroke} /><Circle cx={center} cy={center} r={radius} fill="none" stroke={colors.accent} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={circumference * (1 - progress.fraction)} transform={`rotate(-90 ${center} ${center})`} /></Svg>
    <View pointerEvents="none" style={styles.ringCenter}><Text accessible={false} style={[styles.ringValue, { fontFamily: typography.display.fontFamily }, { color: colors.text, fontSize: diameter * .2 }]}>{percent}%</Text><Text accessible={false} style={[styles.ringLabel, typography.caption, { color: colors.muted }]}>{label}</Text></View>
  </View>
}

export type CardStackProps = { cards: readonly { id: string; title: string; subtitle?: string; value?: string; color?: string }[]; activeId: string; onSelect: (id: string) => void }
export function CardStack({ cards, activeId, onSelect }: CardStackProps) {
  const { colors, radius, metrics, typography, borderWidth, componentSpacing } = useMoruNativeTheme()
  const { fontScale } = useWindowDimensions()
  const active = cards.find((card) => card.id === activeId) ?? cards[0]
  if (!active) return null
  const ordered = [...cards.filter((card) => card.id !== active.id), active]
  return <View style={styles.cardStack}>{ordered.map((card, index) => {
    const selected = card.id === active.id
    const background = card.color ?? (selected ? colors.primary : colors.mutedSurface)
    const foreground = card.color ? readableOn(card.color, colors.text) : selected ? colors.primaryForeground : colors.text
    return <Pressable key={card.id} accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={`${card.title}${card.value ? `, ${card.value}` : ''}${selected ? ', 선택됨' : ', 선택하기'}`} onPress={() => onSelect(card.id)} style={({ pressed }) => [styles.stackedCard, { minHeight: 150 + Math.max(0, fontScale - 1) * 36, backgroundColor: background, borderRadius: radius + 12, padding: metrics.cardPadding, gap: metrics.controlGap, borderWidth, marginTop: index ? -94 : 0, borderColor: colors.border, opacity: pressed ? .82 : 1 }, componentSpacing.card]}><Text style={[styles.stackedCardTitle, typography.label, { color: foreground }]}>{card.title}</Text>{selected ? <View style={styles.stackedCardDetails}>{card.subtitle ? <Text style={[styles.stackedCardSubtitle, typography.caption, { color: foreground }]}>{card.subtitle}</Text> : null}{card.value ? <Text style={[styles.stackedCardValue, typography.display, { color: foreground }]}>{card.value}</Text> : null}</View> : null}</Pressable>
  })}</View>
}

export type AvatarGroupProps = { items: readonly { id: string; label: string; uri?: string }[]; max?: number }
export function AvatarGroup({ items, max = 4 }: AvatarGroupProps) {
  const { colors, typography } = useMoruNativeTheme()
  const visible = items.slice(0, Math.max(1, Math.min(8, Math.trunc(max) || 4)))
  const hidden = items.length - visible.length
  return <View accessible accessibilityLabel={items.map((item) => item.label).join(', ')} style={styles.avatarGroup}>{visible.map((item, index) => <View key={item.id} style={[styles.avatar, { marginLeft: index ? -12 : 0, backgroundColor: colors.mutedSurface, borderColor: colors.surface }]}>{item.uri ? <Image source={{ uri: item.uri }} accessible={false} style={styles.avatarImage} /> : <Text accessible={false} style={[styles.avatarLabel, typography.caption, { color: colors.text }]}>{item.label.slice(0, 2)}</Text>}</View>)}{hidden > 0 ? <View style={[styles.avatar, { marginLeft: -12, backgroundColor: colors.primary, borderColor: colors.surface }]}><Text accessible={false} style={[styles.avatarLabel, typography.caption, { color: colors.primaryForeground }]}>+{hidden}</Text></View> : null}</View>
}

export type ActionGridProps = { items: readonly { id: string; label: string; icon: ReactNode; onPress: () => void }[]; columns?: 2 | 3 | 4 }
export function ActionGrid({ items, columns = 3 }: ActionGridProps) {
  const { colors, radius, space, metrics, typography } = useMoruNativeTheme()
  const safeColumns = ([2, 3, 4] as const).some((value) => value === columns) ? columns : 3
  const rows = Array.from({ length: Math.ceil(items.length / safeColumns) }, (_, index) => items.slice(index * safeColumns, (index + 1) * safeColumns))
  return <View style={[styles.actionGrid, { gap: metrics.controlGap }]}>{rows.map((row, rowIndex) => <View key={rowIndex} style={[styles.actionGridRow, { gap: metrics.controlGap }]}>{Array.from({ length: safeColumns }, (_, column) => {
    const item = row[column]
    return item ? <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={item.label} onPress={item.onPress} style={({ pressed }) => [styles.gridAction, { backgroundColor: colors.mutedSurface, borderRadius: radius + 6, padding: space * 3, gap: metrics.controlGap, opacity: pressed ? .65 : 1 }]}><View accessible={false}>{item.icon}</View><Text style={[styles.gridActionLabel, typography.label, { color: colors.text }]}>{item.label}</Text></Pressable> : <View key={`blank-${column}`} style={styles.fill} />
  })}</View>)}</View>
}

export type PageControlProps = { count: number; index: number; onIndexChange: (index: number) => void }
export function PageControl({ count, index, onIndexChange }: PageControlProps) {
  const { colors } = useMoruNativeTheme()
  const total = Math.max(0, Math.min(50, Number.isFinite(count) ? Math.trunc(count) : 0))
  const selected = Math.max(0, Math.min(total - 1, Math.trunc(index) || 0))
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pageControlViewport} contentContainerStyle={styles.pageControl}>{Array.from({ length: total }, (_, page) => <Pressable key={page} accessibilityRole="button" accessibilityLabel={`${total}페이지 중 ${page + 1}페이지`} accessibilityState={{ selected: page === selected }} onPress={() => onIndexChange(page)} style={styles.touch}><View style={[styles.pageDot, { backgroundColor: page === selected ? colors.primary : colors.border, width: page === selected ? 18 : 6 }]} /></Pressable>)}</ScrollView>
}

export type MobileSearchFieldProps = { value: string; onChangeText: (value: string) => void; placeholder?: string; onCancel?: () => void }
export function MobileSearchField({ value, onChangeText, placeholder = '검색', onCancel }: MobileSearchFieldProps) {
  const { colors, radius, metrics, typography, borderWidth, componentSpacing } = useMoruNativeTheme()
  return <View style={styles.searchRow}><View style={[styles.searchField, { backgroundColor: colors.mutedSurface, borderRadius: radius + 4, paddingHorizontal: metrics.controlPaddingX.md, borderWidth, borderColor: colors.border }]}><Text accessible={false} style={[styles.searchGlyph, { color: colors.muted }]}>⌕</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} accessibilityLabel={placeholder} returnKeyType="search" autoCorrect={false} clearButtonMode="never" style={[styles.searchInput, typography.body, { minHeight: Math.max(48, metrics.controlHeight.md), color: colors.text }, componentSpacing.input]} />{value ? <Pressable onPress={() => onChangeText('')} accessibilityRole="button" accessibilityLabel="검색어 지우기" style={styles.touch}><Text style={[styles.searchClear, { color: colors.muted }]}>×</Text></Pressable> : null}</View>{onCancel ? <Pressable onPress={() => { Keyboard.dismiss(); onCancel() }} accessibilityRole="button" accessibilityLabel="검색 취소" style={styles.touch}><Text style={{ color: colors.text }}>취소</Text></Pressable> : null}</View>
}

export type NativeActionSheetProps = { open: boolean; onOpenChange: (open: boolean) => void; title: string; actions: readonly SwipeAction[] }
export function NativeActionSheet({ open, onOpenChange, title, actions }: NativeActionSheetProps) {
  const { colors, radius, space, metrics, typography, borderWidth } = useMoruNativeTheme()
  const { height } = useWindowDimensions()
  const detent = Math.min(.85, Math.max(.3, (actions.length * 56 + 150) / height))
  return <BottomSheet open={open} onOpenChange={onOpenChange} title={title} detents={[detent]}>{actions.map((action, index) => <Pressable key={`${action.label}-${index}`} accessibilityRole="button" onPress={() => { onOpenChange(false); action.onPress() }} style={({ pressed }) => [styles.actionSheetItem, { borderBottomColor: colors.border, borderBottomWidth: borderWidth, paddingVertical: space * 3, minHeight: Math.max(48, metrics.controlHeight.md), opacity: pressed ? .6 : 1 }]}><Text style={[styles.actionSheetLabel, typography.body, { color: action.destructive ? colors.danger : colors.text }]}>{action.label}</Text></Pressable>)}<Pressable accessibilityRole="button" onPress={() => onOpenChange(false)} style={({ pressed }) => [styles.cancelAction, { backgroundColor: colors.mutedSurface, borderRadius: radius + 4, opacity: pressed ? .6 : 1 }]}><Text style={[styles.actionSheetLabel, typography.body, { color: colors.text }]}>취소</Text></Pressable></BottomSheet>
}

const styles = StyleSheet.create({
  fill: { flex: 1, minWidth: 0 },
  touch: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  sheetOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000066' },
  sheetPanel: { width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  sheetHandleTarget: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  sheetHandle: { width: 36, height: 4, borderRadius: 2 },
  sheetHeader: { minHeight: 56, paddingLeft: 20, paddingRight: 8, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  sheetTitle: { flex: 1, fontSize: 18, fontWeight: '600', flexShrink: 1 },
  close: { fontSize: 28, fontWeight: '300' },
  sheetBody: { padding: 20, gap: 16 },
  swipeRow: { overflow: 'hidden', minWidth: 0 },
  swipeActions: { position: 'absolute', top: 0, bottom: 0, right: 0, flexDirection: 'row' },
  swipeAction: { flex: 1, minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center', padding: 8 },
  actionText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  swipeForeground: { flexDirection: 'row', alignItems: 'center', minWidth: 0, minHeight: 56 },
  ellipsis: { fontSize: 23, lineHeight: 26, letterSpacing: 1 },
  dateStrip: { padding: 2, gap: 8 },
  horizontalScroller: { flexGrow: 0 },
  dateButton: { minWidth: 56, minHeight: 72, alignItems: 'center', justifyContent: 'center', padding: 8, gap: 5 },
  dateWeekday: { fontSize: 11 },
  dateLabel: { fontSize: 18, fontWeight: '600' },
  calendar: { minWidth: 0, gap: 12 },
  calendarTitle: { fontSize: 16, fontWeight: '600' },
  calendarScroll: { flexGrow: 1 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell: { width: '14.285714%', minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  weekday: { fontSize: 12 },
  activityDay: { width: 40, minHeight: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 2 },
  activityDayLabel: { fontSize: 13, fontWeight: '500' },
  activityDot: { width: 3, height: 3, borderRadius: 2 },
  calendarLegend: { fontSize: 11, lineHeight: 18 },
  ringCenter: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', padding: 8 },
  ringValue: { fontWeight: '600', fontVariant: ['tabular-nums'] },
  ringLabel: { fontSize: 10, marginTop: 4, textAlign: 'center' },
  cardStack: { paddingTop: 2, minWidth: 0 },
  stackedCard: { minHeight: 150, padding: 18, borderWidth: StyleSheet.hairlineWidth, justifyContent: 'space-between', gap: 16 },
  stackedCardTitle: { fontSize: 14, fontWeight: '600' },
  stackedCardDetails: { gap: 7 },
  stackedCardSubtitle: { fontSize: 12, opacity: .75 },
  stackedCardValue: { fontSize: 30, fontWeight: '600', fontVariant: ['tabular-nums'] },
  avatarGroup: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  avatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarLabel: { fontSize: 11, fontWeight: '600' },
  actionGrid: { gap: 8 },
  actionGridRow: { flexDirection: 'row', gap: 8 },
  gridAction: { flex: 1, minWidth: 48, minHeight: 84, alignItems: 'center', justifyContent: 'center', padding: 12, gap: 10 },
  gridActionLabel: { fontSize: 12, fontWeight: '500', textAlign: 'center' },
  pageControl: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  pageControlViewport: { height: 48, flexGrow: 0 },
  pageDot: { height: 6, borderRadius: 3 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 0 },
  searchField: { flex: 1, flexDirection: 'row', alignItems: 'center', minHeight: 48, minWidth: 0, paddingLeft: 12 },
  searchGlyph: { fontSize: 23, marginRight: 7 },
  searchInput: { flex: 1, minWidth: 0, minHeight: 48, paddingVertical: 10, fontSize: 15 },
  searchClear: { fontSize: 23, lineHeight: 28 },
  actionSheetItem: { minHeight: 56, justifyContent: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  actionSheetLabel: { fontSize: 16, fontWeight: '500', textAlign: 'center' },
  cancelAction: { minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 12, padding: 12 },
})
