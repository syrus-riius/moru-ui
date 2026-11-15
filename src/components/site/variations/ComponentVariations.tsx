import { lazy, Suspense } from 'react'
import { useI18n } from '../../../i18n'
import type { ComponentId } from '../../catalog/component-catalog'
import { componentGroupFor } from '../../catalog/component-pages'

const FormVariations = lazy(() =>
  import('./FormVariations').then((module) => ({ default: module.FormVariations })),
)
const InteractionVariations = lazy(() =>
  import('./InteractionVariations').then((module) => ({ default: module.InteractionVariations })),
)
const ContentVariations = lazy(() =>
  import('./ContentVariations').then((module) => ({ default: module.ContentVariations })),
)

export function ComponentVariations({ id }: { id: ComponentId }) {
  const { t } = useI18n()
  const group = componentGroupFor(id).id
  return (
    <Suspense
      fallback={
        <p className="doc-variation-loading" role="status">
          {t('베리에이션을 불러오는 중')}
        </p>
      }
    >
      {group === 'forms' ? (
        <FormVariations id={id} />
      ) : ['actions', 'overlays', 'navigation'].includes(group) ? (
        <InteractionVariations id={id} />
      ) : (
        <ContentVariations id={id} />
      )}
    </Suspense>
  )
}
