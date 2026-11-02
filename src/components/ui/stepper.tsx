import { useId, useState, type HTMLAttributes, type ReactNode } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import './workflow-patterns.css'

export interface StepperItem {
  id: string
  label: string
  description?: string
  content?: ReactNode
  disabled?: boolean
  error?: boolean
}

export interface StepperProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'defaultValue' | 'onChange'> {
  items: readonly StepperItem[]
  /** Zero-based index. items.length represents the completed sequence. */
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** Future steps stay unavailable until the host form validates and advances. */
  allowNextStepsSelect?: boolean
  allowStepSelect?: boolean
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  completedContent?: ReactNode
}

export function normalizeStepperValue(value: number, count: number) {
  return Number.isFinite(value) ? Math.min(count, Math.max(0, Math.floor(value))) : 0
}

export function canSelectStep(index: number, active: number, count: number, options: { disabled?: boolean; itemDisabled?: boolean; allowStepSelect?: boolean; allowNextStepsSelect?: boolean } = {}) {
  return Number.isInteger(index) && index >= 0 && index < count && !options.disabled && !options.itemDisabled && options.allowStepSelect !== false && (options.allowNextStepsSelect === true || index <= active)
}

/** A form sequence uses an ordered list and native buttons, rather than tab semantics. */
export function Stepper({ items, value, defaultValue = 0, onValueChange, allowNextStepsSelect = false, allowStepSelect = true, disabled, orientation = 'horizontal', size = 'md', completedContent, className, 'aria-label': label = '진행 단계', ...props }: StepperProps) {
  const [localValue, setLocalValue] = useState(defaultValue)
  const active = normalizeStepperValue(value ?? localValue, items.length)
  const id = useId()
  const completed = items.length > 0 && active === items.length
  function select(index: number) {
    if (!canSelectStep(index, active, items.length, { disabled, itemDisabled: items[index]?.disabled, allowStepSelect, allowNextStepsSelect })) return
    if (value === undefined) setLocalValue(index)
    if (index !== active) onValueChange?.(index)
  }
  return <div {...props} className={cn('ui-stepper', className)} data-orientation={orientation} data-size={size} data-disabled={disabled || undefined}>
    {items.length ? <ol className="ui-stepper-list" aria-label={label}>{items.map((item, index) => {
      const status = item.error ? 'error' : index < active ? 'complete' : index === active ? 'current' : 'pending'
      const selectable = canSelectStep(index, active, items.length, { disabled, itemDisabled: item.disabled, allowStepSelect, allowNextStepsSelect })
      const statusLabel = item.error ? '오류 · 확인 필요' : index < active ? '완료' : index === active ? '현재 단계' : '대기'
      return <li key={item.id} className="ui-stepper-item" data-status={status}>
        <button type="button" id={`${id}-step-${index}`} className="ui-stepper-button" aria-current={index === active ? 'step' : undefined} aria-controls={item.content != null ? `${id}-panel-${index}` : undefined} disabled={!selectable} onClick={() => select(index)}>
          <span className="ui-stepper-marker" aria-hidden="true">{item.error ? <X size={15} /> : index < active ? <Check size={15} /> : index + 1}</span>
          <span className="ui-stepper-copy"><span className="ui-stepper-label">{item.label}</span>{item.description && <span className="ui-stepper-description">{item.description}</span>}<span className="ui-workflow-sr-only">{statusLabel}</span></span>
        </button>
      </li>
    })}</ol> : <p className="ui-stepper-empty">등록된 단계가 없어요.</p>}
    {items.map((item, index) => item.content != null && <div key={item.id} id={`${id}-panel-${index}`} role="region" aria-labelledby={`${id}-step-${index}`} className="ui-stepper-panel" hidden={active !== index}>{item.content}</div>)}
    {completed && <div className="ui-stepper-completed" role="status">{completedContent ?? '모든 단계를 완료했어요.'}</div>}
  </div>
}
