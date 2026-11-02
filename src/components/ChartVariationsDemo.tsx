import { lazy, Suspense, useId, useState } from 'react'
import type { ChartConfig, ChartType } from './ui/chart'
import './chart-variations-demo.css'

const Chart = lazy(() => import('./ui/chart').then((module) => ({ default: module.Chart })))

const variations: { type: ChartType; name: string; english: string; description: string }[] = [
  { type: 'bar', name: '막대', english: 'Bar', description: '항목별 크기를 비교할 때. 요일별 방문 수의 차이를 확인하세요.' },
  { type: 'line', name: '선', english: 'Line', description: '시간에 따른 변화를 읽을 때. 방문 수가 늘고 줄어드는 흐름을 확인하세요.' },
  { type: 'area', name: '영역', english: 'Area', description: '변화의 흐름과 규모를 함께 볼 때. 채워진 면적으로 양을 비교하세요.' },
  { type: 'donut', name: '도넛', english: 'Donut', description: '전체에서 차지하는 비중을 볼 때. 방문자가 어디에서 왔는지 확인하세요.' },
]
const activityData = [
  { day: '월', visitors: 120, returning: 80 }, { day: '화', visitors: 180, returning: 110 },
  { day: '수', visitors: 150, returning: 95 }, { day: '목', visitors: 240, returning: 160 },
  { day: '금', visitors: 300, returning: 190 },
]
const activityConfig: ChartConfig = {
  visitors: { label: '전체 방문', color: 'var(--ui-primary)' },
  returning: { label: '재방문', color: 'var(--ui-accent)' },
}
const sourceData = [
  { source: '직접 방문', visits: 420 }, { source: '검색', visits: 310 },
  { source: '소셜', visits: 170 }, { source: '기타', visits: 90 },
]
const sourceConfig: ChartConfig = { visits: { label: '방문 수', color: 'var(--ui-primary)' } }

function VariationPreview({ type }: { type: ChartType }) {
  return <svg viewBox="0 0 80 38" aria-hidden="true" focusable="false">
    {type === 'bar' ? <><path className="chart-variation-preview-baseline" d="M5 33H75" /><path className="chart-variation-preview-neutral" d="M10 23h10v10H10zM27 16h10v17H27zM44 19h10v14H44z" /><path className="chart-variation-preview-accent" d="M61 7h10v26H61z" /></>
      : type === 'donut' ? <><circle className="chart-variation-preview-ring" cx="40" cy="19" r="13" /><circle className="chart-variation-preview-arc" cx="40" cy="19" r="13" /></>
        : <><path className="chart-variation-preview-baseline" d="M5 33H75" />{type === 'area' ? <path className="chart-variation-preview-fill" d="M7 28 24 17 41 23 58 11 73 6V33H7z" /> : null}<path className="chart-variation-preview-line" d="m7 28 17-11 17 6 17-12 15-5" /></>}
  </svg>
}

export function ChartVariationsDemo({ disabled }: { disabled: boolean }) {
  const id = useId()
  const [type, setType] = useState<ChartType>('bar')
  const [showLegend, setShowLegend] = useState(true)
  const [showDataTable, setShowDataTable] = useState(true)
  const variation = variations.find((item) => item.type === type)!
  const donut = type === 'donut'
  const total = donut ? sourceData.reduce((sum, row) => sum + row.visits, 0) : activityData.reduce((sum, row) => sum + row.visitors, 0)

  return <div className="chart-variations-demo">
    <div className="chart-variations-intro"><span>CHART BASICS</span><span>4가지 기본 표현</span></div>
    <div className="chart-variation-picker" role="group" aria-label="차트 표현 방식" aria-describedby={`${id}-description`}>
      {variations.map((item) => <button type="button" key={item.type} disabled={disabled} aria-label={`${item.name} 차트로 보기`} aria-pressed={type === item.type} onClick={() => setType(item.type)}>
        <VariationPreview type={item.type} /><span><strong>{item.name}</strong><small>{item.english}</small></span>
      </button>)}
    </div>
    <p className="chart-variation-description" id={`${id}-description`}>{variation.description}</p>
    <div className="chart-variation-metric"><div><span>{donut ? '방문 유입' : '이번 주 방문'}</span><strong>{total.toLocaleString('ko-KR')}<small>명</small></strong></div><span>{donut ? '4개 유입 경로' : '월요일 — 금요일'}</span></div>
    <Suspense fallback={<div className="chart-variation-loading" role="status">차트를 준비하고 있어요.</div>}>
      <Chart type={type} title={donut ? '유입 경로별 방문 비중' : '요일별 방문 추이'} data={donut ? sourceData : activityData} config={donut ? sourceConfig : activityConfig} xKey={donut ? 'source' : 'day'} chartHeight={220} disabled={disabled} showLegend={showLegend} showDataTable={showDataTable} />
    </Suspense>
    <div className="chart-variation-options" role="group" aria-label="차트 표시 옵션">
      <label><input type="checkbox" disabled={disabled} checked={showLegend} onChange={(event) => setShowLegend(event.target.checked)} /><span>범례</span></label>
      <label><input type="checkbox" disabled={disabled} checked={showDataTable} onChange={(event) => setShowDataTable(event.target.checked)} /><span>데이터 표</span></label>
      <span>포인터로 값을 확인하세요.</span>
    </div>
  </div>
}
