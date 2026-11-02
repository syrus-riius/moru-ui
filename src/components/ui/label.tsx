import { forwardRef, type LabelHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { useFieldContext } from './field-context'
import './controls-completion.css'

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label({ htmlFor, className, ...props }, ref) {
  const field = useFieldContext()
  return <label {...props} ref={ref} htmlFor={htmlFor ?? field?.controlId} className={cn('ui-label', className)} />
})
