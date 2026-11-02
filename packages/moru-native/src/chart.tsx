import { useId, useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Svg, { Circle, Defs, G, LinearGradient, Line, Path, Rect, Stop, Text as SvgText } from 'react-native-svg'
import { useMoruNativeTheme } from './theme'
import {
  chartAreaPath, chartCoordinates, chartLinePath, donutArcPath, donutSegments, formatChartValue,
  normalizeChartData, scaleChartValue, type NativeChartDatum,
} from './chart-utils'

export type NativeChartType = 'bar' | 'line' | 'area' | 'donut'
export type NativeChartProps = {
  type?: NativeChartType
  data: readonly NativeChartDatum[]
  title: string
  height?: number
  color?: string
  /** Initial visibility of the full, accessible values list. */
  showValues?: boolean
}
const typeLabels: Record<NativeChartType, string> = { bar: '막대', line: '선', area: '영역', donut: '도넛' }

function labelForAxis(label: string) { return label.length > 10 ? `${label.slice(0, 9)}…` : label }
function axisIndexes(count: number) {
  if (count <= 5) return Array.from({ length: count }, (_, index) => index)
  return [...new Set([0, .25, .5, .75, 1].map((ratio) => Math.round((count - 1) * ratio)))]
}

/** Native SVG rendering; all values remain available as expandable native text. */
export function NativeChart({ type = 'bar', data, title, height = 210, color, showValues = true }: NativeChartProps) {
  const { colors, radius, metrics, typography, borderWidth, componentSpacing } = useMoruNativeTheme()
  const [width, setWidth] = useState(320)
  const [valuesOpen, setValuesOpen] = useState(showValues)
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const chartType = Object.prototype.hasOwnProperty.call(typeLabels, type) ? type : 'bar'
  const normalized = useMemo(() => normalizeChartData(data), [data])
  const safeHeight = Math.max(120, Math.min(640, Number.isFinite(height) ? height : 210))
  const ink = color ?? colors.accent
  const layout = useMemo(() => chartCoordinates(normalized, width, safeHeight), [normalized, width, safeHeight])
  const segments = useMemo(() => donutSegments(normalized), [normalized])
  const excluded = chartType === 'donut' ? normalized.length - segments.length : 0
  const hasPlot = chartType === 'donut' ? segments.length > 0 : normalized.length > 0
  const barBand = (layout.plot.right - layout.plot.left) / Math.max(1, normalized.length)
  const barWidth = Math.min(36, barBand * .64)
  const centerX = width / 2
  const centerY = safeHeight / 2
  const donutRadius = Math.max(12, Math.min(width, safeHeight) / 2 - 20)
  const donutStroke = Math.max(12, Math.min(26, donutRadius * .3))
  const minimum = normalized.reduce((result, item) => Math.min(result, item.value), Infinity)
  const maximum = normalized.reduce((result, item) => Math.max(result, item.value), -Infinity)
  const summary = normalized.length
    ? `${title}. ${typeLabels[chartType]} 차트, ${chartType === 'donut' ? segments.length : normalized.length}개 항목. ${chartType === 'donut' ? '양수 값의 비중을 표시합니다.' : `최솟값 ${formatChartValue(minimum)}, 최댓값 ${formatChartValue(maximum)}.`} 아래 데이터 보기에서 각 값을 읽을 수 있습니다.`
    : `${title}. 표시할 유효한 데이터가 없습니다.`

  return <View style={[styles.chart, { borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius + 4, padding: metrics.cardPadding, gap: metrics.fieldGap, borderWidth }, componentSpacing.chart]}>
    <View style={styles.header}><Text accessibilityRole="header" style={[styles.title, typography.heading, { color: colors.text }]}>{title}</Text><Text style={[styles.type, typography.caption, { color: colors.muted }]}>{typeLabels[chartType]}</Text></View>
    <View accessible accessibilityRole="image" accessibilityLabel={summary} onLayout={(event) => {
      const next = event.nativeEvent.layout.width
      if (Number.isFinite(next) && next > 0) setWidth(next)
    }} style={[styles.plot, { minHeight: safeHeight }]}>
      {hasPlot ? <Svg accessible={false} width="100%" height={safeHeight} viewBox={`0 0 ${width} ${safeHeight}`}>
        <Defs><LinearGradient id={`moru-area-${id}`} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={ink} stopOpacity={.35} /><Stop offset="1" stopColor={ink} stopOpacity={.04} /></LinearGradient></Defs>
        {chartType === 'donut' ? <>
          <Circle cx={centerX} cy={centerY} r={donutRadius} fill="none" stroke={colors.mutedSurface} strokeWidth={donutStroke} />
          {segments.map((segment, index) => <Path key={segment.id} d={donutArcPath(centerX, centerY, donutRadius, segment.startAngle, segment.endAngle)} fill="none" stroke={ink} strokeWidth={donutStroke} strokeOpacity={Math.max(.24, 1 - index / Math.max(1, segments.length - 1) * .7)} />)}
          <SvgText x={centerX} y={centerY - 2} textAnchor="middle" fill={colors.text} fontSize={24} fontWeight="600">{segments.length}</SvgText>
          <SvgText x={centerX} y={centerY + 19} textAnchor="middle" fill={colors.muted} fontSize={10}>개 항목</SvgText>
        </> : <>
          {[0, .5, 1].map((ratio) => {
            const value = layout.domain.min * (1 - ratio) + layout.domain.max * ratio
            const y = scaleChartValue(value, layout.domain, layout.plot.bottom, layout.plot.top)
            return <G key={ratio}><Line x1={layout.plot.left} y1={y} x2={layout.plot.right} y2={y} stroke={colors.border} strokeWidth={.5} /><SvgText x={layout.plot.left - 6} y={y + 3} textAnchor="end" fill={colors.muted} fontSize={9}>{formatChartValue(value)}</SvgText></G>
          })}
          <Line x1={layout.plot.left} y1={layout.baseline} x2={layout.plot.right} y2={layout.baseline} stroke={colors.muted} strokeWidth={1} />
          {chartType === 'bar' ? normalized.map((item, index) => {
            const y = scaleChartValue(item.value, layout.domain, layout.plot.bottom, layout.plot.top)
            return <Rect key={item.id} x={layout.plot.left + barBand * index + (barBand - barWidth) / 2} y={Math.min(y, layout.baseline)} width={barWidth} height={Math.abs(y - layout.baseline)} rx={Math.min(4, barWidth / 3)} fill={ink} opacity={.78 + index / Math.max(1, normalized.length - 1) * .22} />
          }) : <>
            {chartType === 'area' ? <Path d={chartAreaPath(layout.points, layout.baseline)} fill={`url(#moru-area-${id})`} /> : null}
            <Path d={chartLinePath(layout.points)} fill="none" stroke={ink} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
            {layout.points.length <= 24 ? layout.points.map((point) => <Circle key={point.id} cx={point.x} cy={point.y} r={3} fill={ink} stroke={colors.surface} strokeWidth={1} />) : null}
          </>}
          {axisIndexes(normalized.length).map((index) => {
            const x = chartType === 'bar' ? layout.plot.left + barBand * (index + .5) : layout.points[index].x
            const anchor = chartType === 'bar' || normalized.length === 1 ? 'middle' : index === 0 ? 'start' : index === normalized.length - 1 ? 'end' : 'middle'
            return <SvgText key={normalized[index].id} x={x} y={safeHeight - 6} textAnchor={anchor} fill={colors.muted} fontSize={9}>{labelForAxis(normalized[index].label)}</SvgText>
          })}
        </>}
      </Svg> : <View style={styles.empty}><Text style={[styles.emptyTitle, typography.body, { color: colors.text }]}>{chartType === 'donut' && normalized.length ? '양수 데이터가 없습니다.' : '표시할 데이터가 없습니다.'}</Text><Text style={[styles.emptyCopy, typography.caption, { color: colors.muted }]}>{chartType === 'donut' ? '도넛에는 0보다 큰 값만 표시합니다.' : '유효한 숫자 값을 추가해 주세요.'}</Text></View>}
    </View>
    {excluded > 0 ? <Text style={[styles.note, typography.caption, { color: colors.muted }]}>0 이하의 {excluded}개 항목은 도넛에서 제외됩니다.</Text> : null}
    {normalized.length ? <>
      <Pressable accessibilityRole="button" accessibilityLabel={`${title} 데이터 ${valuesOpen ? '숨기기' : '보기'}`} accessibilityState={{ expanded: valuesOpen }} onPress={() => setValuesOpen((previous) => !previous)} style={({ pressed }) => [styles.valuesToggle, { borderTopColor: colors.border, borderTopWidth: borderWidth, opacity: pressed ? .6 : 1 }]}><Text style={[styles.toggleLabel, typography.label, { color: colors.text }]}>{valuesOpen ? '데이터 숨기기' : '데이터 보기'}</Text><Text style={[styles.toggleSymbol, { color: colors.muted }]}>{valuesOpen ? '−' : '+'}</Text></Pressable>
      {valuesOpen ? <View style={styles.valuesList}>{normalized.map((item) => {
        const segment = segments.find((entry) => entry.id === item.id)
        const omitted = chartType === 'donut' && item.value <= 0
        return <View key={item.id} accessible accessibilityLabel={`${item.label}, ${formatChartValue(item.value)}${chartType === 'donut' ? omitted ? ', 도넛 제외' : `, ${((segment?.ratio ?? 0) * 100).toFixed(1)}퍼센트` : ''}`} style={[styles.valueRow, { borderTopColor: colors.border, borderTopWidth: borderWidth }]}><Text style={[styles.valueLabel, typography.caption, { color: colors.muted }]}>{item.label}{omitted ? ' · 도넛 제외' : ''}</Text><Text style={[styles.valueNumber, typography.code, { color: colors.text }]}>{formatChartValue(item.value)}{chartType === 'donut' && !omitted ? ` · ${((segment?.ratio ?? 0) * 100).toFixed(1)}%` : ''}</Text></View>
      })}</View> : null}
    </> : null}
  </View>
}

export type NativeSparklineProps = { values: readonly number[]; height?: number; color?: string; label: string }
export function NativeSparkline({ values, height = 44, color, label }: NativeSparklineProps) {
  const { colors, typography } = useMoruNativeTheme()
  const [width, setWidth] = useState(160)
  const data = useMemo(() => normalizeChartData(values.map((value, index) => ({ id: String(index), label: String(index + 1), value }))), [values])
  const safeHeight = Math.max(24, Math.min(160, Number.isFinite(height) ? height : 44))
  const layout = useMemo(() => chartCoordinates(data, width, safeHeight, false, { left: 4, right: 4, top: 4, bottom: 4 }), [data, width, safeHeight])
  const ink = color ?? colors.accent
  return <View accessible accessibilityRole="image" accessibilityLabel={`${label}. ${data.length ? `${data.length}개 값, 시작 ${formatChartValue(data[0].value)}, 마지막 ${formatChartValue(data[data.length - 1].value)}.` : '표시할 유효한 데이터가 없습니다.'}`} onLayout={(event) => { if (event.nativeEvent.layout.width > 0) setWidth(event.nativeEvent.layout.width) }} style={{ minWidth: 48, width: '100%', height: safeHeight }}>
    {data.length ? <Svg accessible={false} width="100%" height={safeHeight} viewBox={`0 0 ${width} ${safeHeight}`}><Path d={chartLinePath(layout.points)} fill="none" stroke={ink} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />{data.length === 1 ? <Circle cx={layout.points[0].x} cy={layout.points[0].y} r={2.5} fill={ink} /> : null}</Svg> : <View style={styles.sparklineEmpty}><Text style={[styles.note, typography.caption, { color: colors.muted }]}>데이터 없음</Text></View>}
  </View>
}

const styles = StyleSheet.create({
  chart: { minWidth: 0, padding: 16, borderWidth: StyleSheet.hairlineWidth, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  title: { flex: 1, flexShrink: 1, fontSize: 16, fontWeight: '600' },
  type: { fontSize: 11 },
  plot: { width: '100%', minWidth: 0, justifyContent: 'center' },
  empty: { minHeight: 120, alignItems: 'center', justifyContent: 'center', padding: 16, gap: 6 },
  emptyTitle: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  emptyCopy: { fontSize: 12, lineHeight: 19, textAlign: 'center' },
  note: { fontSize: 11, lineHeight: 18 },
  valuesToggle: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 4 },
  toggleLabel: { fontSize: 12, fontWeight: '500' },
  toggleSymbol: { fontSize: 20 },
  valuesList: { minWidth: 0 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, minWidth: 0, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
  valueLabel: { flex: 1, minWidth: 72, flexShrink: 1, fontSize: 12, lineHeight: 19 },
  valueNumber: { flexShrink: 1, fontSize: 12, lineHeight: 19, fontWeight: '500', fontVariant: ['tabular-nums'] },
  sparklineEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})
