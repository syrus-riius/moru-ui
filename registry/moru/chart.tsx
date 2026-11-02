'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { createContext, useContext, useId, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import { Button } from './button'
import { cn } from './_lib/cn'
import './data-completion.css'
import './chart-variations.css'

export type ChartConfig = Record<string, { label: string; color: string }>
export type ChartType = 'bar' | 'line' | 'area' | 'donut'
export type ChartDatum = Record<string, string | number | null | undefined>
const ChartContext = createContext<ChartConfig>({})
export interface ChartContainerProps { config: ChartConfig; children: ReactElement; className?: string; style?: CSSProperties }
export function ChartContainer({ config, children, className, style }: ChartContainerProps) {
  const colors = Object.fromEntries(Object.entries(config).filter(([key]) => /^[a-zA-Z][\w-]*$/.test(key)).map(([key, value]) => [`--color-${key}`, value.color]))
  return <ChartContext value={config}><div className={cn('ui-chart-container', className)} style={{ ...colors, ...style }}><ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 240 }}>{children}</ResponsiveContainer></div></ChartContext>
}
export { Tooltip as ChartTooltip, Legend as ChartLegend }
interface TooltipEntry { dataKey?: string | number; name?: string | number; value?: string | number | ReadonlyArray<string | number>; color?: string }
export function ChartTooltipContent({ active, label, payload }: { active?: boolean; label?: ReactNode; payload?: ReadonlyArray<TooltipEntry> }) {
  const config = useContext(ChartContext)
  if (!active || !payload?.length) return null
  return <div className="ui-chart-tooltip">{label != null ? <strong>{label}</strong> : null}{payload.map((entry, index) => <p key={`${entry.dataKey}-${index}`}><i className="ui-chart-key" aria-hidden="true" style={{ background: entry.color }} /><span>{config[String(entry.dataKey)]?.label ?? entry.name}</span><strong>{Array.isArray(entry.value) ? entry.value.join('–') : entry.value}</strong></p>)}</div>
}
function DonutTooltipContent({ active, payload, seriesLabel }: { active?: boolean; payload?: ReadonlyArray<TooltipEntry>; seriesLabel: string }) {
  const entry = payload?.[0]
  if (!active || !entry) return null
  return <div className="ui-chart-tooltip"><strong>{entry.name}</strong><p><i className="ui-chart-key" aria-hidden="true" style={{ background: entry.color }} /><span>{seriesLabel}</span><strong>{entry.value}</strong></p></div>
}
export interface ChartProps {
  data: ChartDatum[]
  config: ChartConfig
  xKey: string
  title: string
  type?: ChartType
  disabled?: boolean
  className?: string
  description?: string
  chartHeight?: number
  showLegend?: boolean
  showDataTable?: boolean
  style?: CSSProperties
}
const sliceColors = ['var(--ui-accent)', 'var(--ui-primary)', 'var(--ui-muted)', 'var(--ui-border)']
const numberFormat = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 })

/** A donut uses one numeric series across categorical rows. Invalid magnitudes are omitted. */
export function getDonutSlices(data: ChartDatum[], xKey: string, valueKey: string) {
  return data.flatMap((row, index) => {
    const value = row[valueKey]
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return []
    return [{ name: String(row[xKey] ?? `항목 ${index + 1}`), value, color: typeof row.fill === 'string' && row.fill.trim() ? row.fill : sliceColors[index % sliceColors.length], index }]
  })
}

function tableValue(value: ChartDatum[string]) {
  return typeof value === 'number' && !Number.isFinite(value) || value == null ? '—' : value
}

export function Chart({ data, config, xKey, title, type = 'bar', disabled = false, className, description, chartHeight = 240, showLegend = true, showDataTable = true, style }: ChartProps) {
  const id = useId()
  const [hidden, setHidden] = useState<string[]>([])
  const [donutSeries, setDonutSeries] = useState<string | null>(null)
  const keys = Object.keys(config)
  const requestedVisible = keys.filter((key) => !hidden.includes(key))
  const visible = requestedVisible.length ? requestedVisible : keys.slice(0, 1)
  const selectedSeries = donutSeries && keys.includes(donutSeries) ? donutSeries : keys[0]
  const donutSlices = type === 'donut' && selectedSeries ? getDonutSlices(data, xKey, selectedSeries) : []
  const donutTotal = donutSlices.reduce((sum, item) => sum + item.value, 0)
  const hasDonutData = donutTotal > 0 && Number.isFinite(donutTotal)
  const height = Number.isFinite(chartHeight) ? Math.max(80, Math.min(1200, chartHeight)) : 240
  const series = visible.map((key) => type === 'bar' ? <Bar key={key} dataKey={key} name={config[key].label} fill={config[key].color} radius={[4, 4, 0, 0]} isAnimationActive={false} /> : type === 'area' ? <Area key={key} dataKey={key} name={config[key].label} stroke={config[key].color} fill={config[key].color} fillOpacity={0.14} strokeWidth={2} isAnimationActive={false} /> : <Line key={key} dataKey={key} name={config[key].label} stroke={config[key].color} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />)
  const common = <><CartesianGrid vertical={false} /><XAxis dataKey={xKey} axisLine={false} tickLine={false} tickMargin={8} /><YAxis width={32} axisLine={false} tickLine={false} /><Tooltip content={<ChartTooltipContent />} />{series}</>
  return <figure className={cn('ui-chart', className)} data-chart-type={type} style={style} aria-labelledby={`${id}-title`} aria-describedby={description ? `${id}-description` : undefined}><figcaption id={`${id}-title`}>{title}</figcaption>
    {description ? <p className="ui-chart-description" id={`${id}-description`}>{description}</p> : null}
    {data.length && keys.length ? <>
      {type === 'donut' ? <>
        <div className="ui-chart-donut-plot" style={{ height }}>
          {hasDonutData ? <><ChartContainer config={config} style={{ height }}><PieChart accessibilityLayer aria-label={`${title} · ${config[selectedSeries].label} 비중`}>
            <Pie data={donutSlices} nameKey="name" dataKey="value" innerRadius="64%" outerRadius="88%" paddingAngle={donutSlices.filter((slice) => slice.value > 0).length > 1 ? 3 : 0} stroke="var(--ui-surface)" strokeWidth={2} isAnimationActive={false}>
              {donutSlices.map((slice) => <Cell key={slice.index} fill={slice.color} />)}
            </Pie>
            <Tooltip content={<DonutTooltipContent seriesLabel={config[selectedSeries].label} />} />
          </PieChart></ChartContainer><div className="ui-chart-donut-center" aria-label={`${config[selectedSeries].label} 합계 ${numberFormat.format(donutTotal)}`}><strong>{numberFormat.format(donutTotal)}</strong><span>{config[selectedSeries].label} 합계</span></div></> : <p className="ui-chart-empty" role="status">도넛에 표시할 수 있는 데이터가 없습니다.</p>}
        </div>
        {showLegend ? <>
          {keys.length > 1 ? <div className="ui-chart-legend" role="group" aria-label={`${title} 표시할 계열`}>{keys.map((key) => <Button key={key} type="button" variant="ghost" size="sm" aria-pressed={selectedSeries === key} disabled={disabled} onClick={() => setDonutSeries(key)}>{config[key].label}</Button>)}</div> : null}
          <dl className="ui-chart-donut-legend" aria-label={`${title} 범주별 값`}>{donutSlices.map((slice) => <div key={slice.index}><dt><i className="ui-chart-key" aria-hidden="true" style={{ background: slice.color }} />{slice.name}</dt><dd>{numberFormat.format(slice.value)}<span>{hasDonutData ? `${Math.round(slice.value / donutTotal * 100)}%` : '0%'}</span></dd></div>)}</dl>
        </> : null}
      </> : <><ChartContainer config={config} style={{ height }}>{type === 'bar' ? <BarChart accessibilityLayer data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>{common}</BarChart> : type === 'area' ? <AreaChart accessibilityLayer data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>{common}</AreaChart> : <LineChart accessibilityLayer data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>{common}</LineChart>}</ChartContainer>
        {showLegend ? <div className="ui-chart-legend" role="group" aria-label={`${title} 표시할 계열`}>{keys.map((key) => <Button key={key} type="button" variant="ghost" size="sm" aria-pressed={visible.includes(key)} disabled={disabled || (visible.includes(key) && visible.length === 1)} onClick={() => setHidden(visible.includes(key) ? keys.filter((item) => item !== key && !visible.includes(item)).concat(key) : keys.filter((item) => item !== key && !visible.includes(item)))}><i className="ui-chart-key" aria-hidden="true" style={{ background: config[key].color, opacity: visible.includes(key) ? 1 : .35 }} />{config[key].label}</Button>)}</div> : null}
      </>}
      {showDataTable ? <details className="ui-chart-data"><summary>데이터 표로 보기</summary><table><caption>{title}</caption><thead><tr><th scope="col">구분</th>{keys.map((key) => <th key={key} scope="col">{config[key].label}</th>)}</tr></thead><tbody>{data.map((row, index) => <tr key={index}><th scope="row">{tableValue(row[xKey])}</th>{keys.map((key) => <td key={key}>{tableValue(row[key])}</td>)}</tr>)}</tbody></table></details> : null}
    </> : <p className="ui-data-table-empty">표시할 데이터가 없습니다.</p>}
  </figure>
}
