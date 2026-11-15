# Chart

Recharts-based chart variations with Moru colors and supporting controls.

Version: 0.4.1. Source hash: baf065ccb1fccaa4eed187992c95b92d1b8fd9b7084c361d9faa54b0f7c55c24.

## Discovery

- Registry ID: `chart`
- Import: `@/components/ui/moru/chart`
- Runtime exports: `Chart`, `ChartContainer`, `ChartLegend`, `ChartTooltip`, `ChartTooltipContent`, `getDonutSlices`
- Registry dependencies: [button](/ai/v0.4.1/components/button.md), [core](/ai/v0.4.1/core.md)
- Install source: [chart.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/chart.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/chart.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/chart.tsx)

## Usage and interaction

- Keep full category names in data. xAxisTickFormatter abbreviates only visual tick labels; tooltips and the data table preserve the original values.
- xAxisInterval={0} retains every category tick. Use it with compact labels and enough plot width; the default collision-aware behavior is unchanged.

## Minimal example

```tsx
import { Chart } from '@/components/ui/moru/chart'
export function WeeklyActivity() {
  return <Chart title="Weekly activity" xKey="day"
    data={[{ day: "Monday", tasks: 24 }, { day: "Tuesday", tasks: 36 }, { day: "Wednesday", tasks: 28 }]}
    config={{ tasks: { label: "Completed tasks", color: "var(--ui-primary)" } }}
    xAxisInterval={0} xAxisTickFormatter={(value) => String(value).slice(0, 1)} />
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `CSSProperties, ReactElement, ReactNode` from `react`
- `XAxisProps` from `recharts`

```ts
type ChartConfig = Record<string, { label: string; color: string }>

type ChartType = 'bar' | 'line' | 'area' | 'donut'

type ChartDatum = Record<string, string | number | null | undefined>

interface ChartContainerProps {
  config: ChartConfig
  children: ReactElement
  className?: string
  style?: CSSProperties
}

interface ChartProps {
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
  /** Formats axis ticks only; tooltips and the data table retain the original category. */
  xAxisTickFormatter?: (value: string | number, index: number) => string
  /** Use 0 with compact tick labels to display every category in a small chart. */
  xAxisInterval?: XAxisProps['interval']
  style?: CSSProperties
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function ChartContainer({ config, children, className, style }: ChartContainerProps);
function ChartTooltipContent({
  active,
  label,
  payload,
}: {
  active?: boolean
  label?: ReactNode
  payload?: ReadonlyArray<TooltipEntry>
});
function getDonutSlices(data: ChartDatum[], xKey: string, valueKey: string);
function Chart({
  data,
  config,
  xKey,
  title,
  type = 'bar',
  disabled = false,
  className,
  description,
  chartHeight = 240,
  showLegend = true,
  showDataTable = true,
  xAxisTickFormatter,
  xAxisInterval,
  style,
}: ChartProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Chart.type`: `'bar'`
- `Chart.disabled`: `false`
- `Chart.chartHeight`: `240`
- `Chart.showLegend`: `true`
- `Chart.showDataTable`: `true`
