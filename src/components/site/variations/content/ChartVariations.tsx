import { useI18n } from '../../../../i18n'
import { Chart } from '../../../ui/chart'
import { VariationExample, VariationGroup } from '../VariationLayout'

export default function ChartVariations() {
  const { t } = useI18n()
  const data = [
    { day: t('월'), tasks: 24 },
    { day: t('화'), tasks: 38 },
    { day: t('수'), tasks: 30 },
    { day: t('목'), tasks: 52 },
    { day: t('금'), tasks: 64 },
  ]
  const config = { tasks: { label: t('완료한 작업'), color: 'var(--ui-primary)' } }
  const base = { data, config, xKey: 'day', title: t('팀 활동') }
  return (
    <>
      <VariationGroup title="베리에이션" wide>
        {(['bar', 'line', 'area', 'donut'] as const).map((type) => (
          <VariationExample key={type} label={type} code={`type="${type}" chartHeight={220}`}>
            <Chart {...base} type={type} chartHeight={220} />
          </VariationExample>
        ))}
      </VariationGroup>
      <VariationGroup title="상태 비교" wide>
        <VariationExample label="데이터 표" code="showDataTable" wide>
          <Chart {...base} type="bar" showDataTable chartHeight={180} />
        </VariationExample>
        <VariationExample label="비활성" code="disabled">
          <Chart {...base} disabled chartHeight={180} />
        </VariationExample>
        <VariationExample label="빈 상태" code="data={[]}">
          <Chart {...base} data={[]} chartHeight={180} />
        </VariationExample>
      </VariationGroup>
      <VariationGroup title="크기 비교" wide>
        {[160, 240, 320].map((height) => (
          <VariationExample key={height} label={`${height}px`} code={`chartHeight={${height}}`}>
            <Chart {...base} chartHeight={height} />
          </VariationExample>
        ))}
      </VariationGroup>
    </>
  )
}
