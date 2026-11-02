import { lazy, Suspense } from 'react'
import { getSimChartType, parseSimChartData } from './simulator-chart-data'
import type { SimNode } from './simulator-types'
import './simulator-chart.css'

const Chart = lazy(() => import('../ui/chart').then((module) => ({ default: module.Chart })))
const config = { value: { label: '값', color: 'var(--sim-chart-color)' } }

export function SimulatorChartNode({ node, interactive = false }: { node: SimNode; interactive?: boolean }) {
  const type = getSimChartType(node.props.value)
  const { data, invalidRows } = parseSimChartData(node.props.options, type)
  const title = node.props.label.trim() || '새 차트'
  const description = node.props.text.trim()
  const chartHeight = Math.max(48, node.height - (description ? 98 : 76) - (invalidRows.length ? 24 : 0))
  return <div className="sim-component-chart" data-chart-type={type}>
    <Suspense fallback={<p className="sim-chart-loading" role="status">차트를 준비하고 있어요.</p>}>
      <Chart title={title} description={description || undefined} data={data} config={config} xKey="label" type={type} disabled={!interactive || node.props.state === 'disabled'} showLegend={false} showDataTable={false} chartHeight={chartHeight} />
    </Suspense>
    {invalidRows.length ? <p className="sim-chart-invalid" role={interactive ? 'status' : undefined}>{invalidRows.join(', ')}번째 줄을 확인해 주세요.{type === 'donut' ? ' 도넛에는 0 이상의 값을 사용해요.' : ''}</p> : null}
  </div>
}
