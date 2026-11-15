import { lazy, Suspense } from 'react'
import type { ComponentId } from '../../catalog/component-catalog'
import { LayoutVariations } from './content/LayoutVariations'
import { PageLayoutVariations } from './content/PageLayoutVariations'
import { FeedbackVariations } from './content/FeedbackVariations'
import { ConversationVariations } from './content/ConversationVariations'

// Keep optional charting, table, carousel and panel libraries out of unrelated previews.
const ChartVariations = lazy(() => import('./content/ChartVariations'))
const DataTableVariations = lazy(() => import('./content/DataTableVariations'))
const TableVariations = lazy(() => import('./content/TableVariations'))
const CarouselVariations = lazy(() => import('./content/CarouselVariations'))
const ResizableVariations = lazy(() => import('./content/ResizableVariations'))

export function ContentVariations({ id }: { id: ComponentId }) {
  switch (id) {
    case 'header':
    case 'footer':
    case 'card':
      return <PageLayoutVariations id={id} />
    case 'badge':
    case 'alert':
    case 'progress':
    case 'ring-progress':
    case 'skeleton':
    case 'toast':
    case 'empty':
    case 'spinner':
    case 'loading-overlay':
    case 'status-indicator':
    case 'marker':
      return <FeedbackVariations id={id} />
    case 'bubble':
    case 'code-block':
    case 'message':
    case 'message-scroller':
    case 'trace':
      return <ConversationVariations id={id} />
    case 'chart':
      return (
        <Suspense fallback={null}>
          <ChartVariations />
        </Suspense>
      )
    case 'data-table':
      return (
        <Suspense fallback={null}>
          <DataTableVariations />
        </Suspense>
      )
    case 'table':
      return (
        <Suspense fallback={null}>
          <TableVariations />
        </Suspense>
      )
    case 'carousel':
      return (
        <Suspense fallback={null}>
          <CarouselVariations />
        </Suspense>
      )
    case 'resizable':
      return (
        <Suspense fallback={null}>
          <ResizableVariations />
        </Suspense>
      )
    default:
      return <LayoutVariations id={id} />
  }
}
