import { useI18n } from '../../../../i18n'
import { Badge } from '../../../ui/badge'
import { Skeleton } from '../../../ui/skeleton'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../ui/table'
import { VariationExample, VariationGroup } from '../VariationLayout'

export default function TableVariations() {
  return (
    <VariationGroup title="베리에이션" wide>
      <VariationExample label="기본" code="<Table><TableCaption />…<TableFooter /></Table>" wide>
        <ExampleTable state="ready" />
      </VariationExample>
      <VariationExample label="빈 상태" code="<TableCell colSpan={3}>…</TableCell>" wide>
        <ExampleTable state="empty" />
      </VariationExample>
      <VariationExample
        label="로딩"
        code="<Table aria-busy><TableCell><Skeleton /></TableCell>…</Table>"
        wide
      >
        <ExampleTable state="loading" />
      </VariationExample>
    </VariationGroup>
  )
}

function ExampleTable({ state }: { state: 'ready' | 'empty' | 'loading' }) {
  const { t } = useI18n()
  return (
    <Table aria-busy={state === 'loading' || undefined}>
      <TableCaption>{t('프로젝트')}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>{t('이름')}</TableHead>
          <TableHead>{t('상태')}</TableHead>
          <TableHead>{t('진행률')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {state === 'empty' ? (
          <TableRow>
            <TableCell colSpan={3}>{t('검색 결과가 없어요.')}</TableCell>
          </TableRow>
        ) : (
          ['디자인 토큰', 'UI 라이브러리', '브랜드 가이드'].map((name, index) => (
            <TableRow key={name}>
              {state === 'loading' ? (
                [0, 1, 2].map((cell) => (
                  <TableCell key={cell}>
                    <Skeleton style={{ height: 16, minWidth: 48 }} />
                  </TableCell>
                ))
              ) : (
                <>
                  <TableCell>{t(name)}</TableCell>
                  <TableCell>
                    <Badge tone={index === 0 ? 'success' : 'info'}>
                      {t(index === 0 ? '완료' : '진행 중')}
                    </Badge>
                  </TableCell>
                  <TableCell>{100 - index * 20}%</TableCell>
                </>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
      {state === 'ready' ? (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>{t('전체')}</TableCell>
            <TableCell>3</TableCell>
          </TableRow>
        </TableFooter>
      ) : null}
    </Table>
  )
}
