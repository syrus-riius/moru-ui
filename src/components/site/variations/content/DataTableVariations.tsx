import { useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { useI18n } from '../../../../i18n'
import { DataTable, type DataTableFeatures } from '../../../ui/data-table'
import { VariationExample, VariationGroup } from '../VariationLayout'

type Project = { id: string; name: string; progress: number }
const helper = createColumnHelper<DataTableFeatures, Project>()
const getRowId = (project: Project) => project.id

export default function DataTableVariations() {
  const { t } = useI18n()
  const data = useMemo(
    () =>
      ['디자인 토큰', 'UI 라이브러리', '브랜드 가이드', '시작 가이드'].map((name, index) => ({
        id: `project-${index}`,
        name: t(name),
        progress: 100 - index * 20,
      })),
    [t],
  )
  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor('name', { header: t('프로젝트'), sortFn: 'text' }),
        helper.accessor('progress', {
          header: t('진행률'),
          sortFn: 'basic',
          cell: ({ getValue }) => `${getValue()}%`,
        }),
      ]),
    [t],
  )
  const base = { data, columns, getRowId, caption: t('프로젝트') }
  return (
    <VariationGroup title="베리에이션" wide>
      <VariationExample label="기본" code="pageSize={3} selectable" wide>
        <DataTable {...base} pageSize={3} />
      </VariationExample>
      <VariationExample label="선택 없음" code="selectable={false}" wide>
        <DataTable {...base} selectable={false} />
      </VariationExample>
      <VariationExample label="비활성" code="disabled" wide>
        <DataTable {...base} disabled />
      </VariationExample>
      <VariationExample label="빈 상태" code="data={[]}" wide>
        <DataTable {...base} data={[]} />
      </VariationExample>
    </VariationGroup>
  )
}
