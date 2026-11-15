import { useI18n } from '../../lib/i18n'
import {
  Group,
  Panel,
  Separator,
  type GroupProps,
  type PanelProps,
  type SeparatorProps,
} from 'react-resizable-panels'
import { GripVertical } from 'lucide-react'
import { cn } from '../../lib/cn'
import './data-completion.css'

export function ResizablePanelGroup({ className, ...props }: GroupProps) {
  return <Group {...props} className={cn('ui-resizable-group', className)} />
}
export function ResizablePanel({ className, ...props }: PanelProps) {
  return <Panel {...props} className={cn('ui-resizable-panel', className)} />
}
export function ResizableHandle({
  className,
  withHandle = true,
  'aria-label': labelProp,
  ...props
}: SeparatorProps & { withHandle?: boolean }) {
  const { t } = useI18n()
  const label = labelProp ?? t('패널 크기 조절')

  return (
    <Separator {...props} aria-label={label} className={cn('ui-resizable-handle', className)}>
      {withHandle && (
        <span>
          <GripVertical size={14} aria-hidden="true" />
        </span>
      )}
    </Separator>
  )
}
export type { GroupProps as ResizablePanelGroupProps, PanelProps as ResizablePanelProps }
