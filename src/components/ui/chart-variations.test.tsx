import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Chart, getDonutSlices, type ChartDatum } from './chart'

const config = { count: { label: '프로젝트', color: 'var(--ui-accent)' }, previous: { label: '지난 달', color: 'var(--ui-muted)' } }
const data = [{ status: '진행 중', count: 12, previous: 8 }, { status: '준비', count: 6, previous: 4 }, { status: '완료', count: 0, previous: 2 }]

describe('Chart variations', () => {
  it('uses categorical rows as donut slices, preserving zero and custom colors', () => {
    const slices = getDonutSlices([{ status: '진행 중', count: 12, fill: '#000' }, { status: '준비', count: 0 }], 'status', 'count')
    expect(slices).toEqual([
      { name: '진행 중', value: 12, color: '#000', index: 0 },
      { name: '준비', value: 0, color: 'var(--ui-primary)', index: 1 },
    ])
  })

  it('omits invalid, negative and non-finite magnitudes instead of changing their meaning', () => {
    const source: ChartDatum[] = [
      { status: 'positive', count: 12 }, { status: 'negative', count: -8 },
      { status: 'nan', count: NaN }, { status: 'infinite', count: Infinity },
      { status: 'missing' }, { status: 'null', count: null }, { status: 'numeric-string', count: '15' },
    ]
    expect(getDonutSlices(source, 'status', 'count').map(({ name, value }) => ({ name, value }))).toEqual([{ name: 'positive', value: 12 }])
    expect(source[1].count).toBe(-8)
  })

  it('names a missing category without mutating the source', () => {
    const source = Object.freeze({ count: 3 })
    expect(getDonutSlices([source], 'status', 'count')[0].name).toBe('항목 1')
    expect(source).toEqual({ count: 3 })
  })

  it('keeps every series in the data table and initially selects the first donut metric', () => {
    const markup = renderToStaticMarkup(<Chart type="donut" data={data} config={config} xKey="status" title="프로젝트 분포" />)
    expect(markup).toContain('data-chart-type="donut"')
    expect(markup).toContain('프로젝트 합계 18')
    expect(markup).toContain('프로젝트 분포 범주별 값')
    expect(markup).toContain('<th scope="col">지난 달</th>')
    expect(markup).toContain('<td>12</td><td>8</td>')
    expect(markup).toContain('<td>0</td><td>2</td>')
    expect(markup).toContain('67%')
    expect(markup).toContain('aria-pressed="true"')
    expect(markup).toContain('aria-pressed="false"')
  })

  it.each([{ rows: [] }, { rows: [{ status: '준비', count: 0 }] }, { rows: [{ status: '준비', count: -4 }] }, { rows: [{ status: '준비', count: Infinity }] }])('shows an honest empty state for unusable donut data', ({ rows }) => {
    const markup = renderToStaticMarkup(<Chart type="donut" data={rows} config={config} xKey="status" title="분포" />)
    expect(markup).toContain(rows.length ? '도넛에 표시할 수 있는 데이터가 없습니다.' : '표시할 데이터가 없습니다.')
    expect(markup).not.toContain('ui-chart-donut-center')
  })

  it('lets the simulator omit interactive chrome without removing the chart title', () => {
    const markup = renderToStaticMarkup(<Chart type="donut" data={data} config={config} xKey="status" title="계획 현황" description="이번 주" chartHeight={160} showLegend={false} showDataTable={false} style={{ height: '100%' }} />)
    expect(markup).toContain('계획 현황')
    expect(markup).toContain('이번 주')
    expect(markup).toContain('aria-describedby=')
    expect(markup).toContain('height:160px')
    expect(markup).toContain('height:100%')
    expect(markup).not.toContain('범주별 값')
    expect(markup).not.toContain('표시할 계열')
    expect(markup).not.toContain('<table')
  })

  it('disables metric selectors together with the other component controls', () => {
    const markup = renderToStaticMarkup(<Chart type="donut" data={data} config={config} xKey="status" title="분포" disabled />)
    expect(markup.match(/ disabled=""/g)).toHaveLength(2)
  })

  it('renders invalid values as missing in the accessible table while keeping valid zero values', () => {
    const markup = renderToStaticMarkup(<Chart type="donut" data={[{ status: '준비', count: 0, previous: NaN }]} config={config} xKey="status" title="분포" />)
    expect(markup).toContain('<td>0</td><td>—</td>')
  })

  it('clamps invalid plot heights and keeps existing presentations available', () => {
    for (const type of ['bar', 'line', 'area'] as const) {
      const markup = renderToStaticMarkup(<Chart type={type} data={data} config={config} xKey="status" title="주간 현황" chartHeight={NaN} />)
      expect(markup).toContain(`data-chart-type="${type}"`)
      expect(markup).toContain('height:240px')
      expect(markup).toContain('<summary>데이터 표로 보기</summary>')
    }
  })
})
