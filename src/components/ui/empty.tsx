import { useId, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import './advanced-controls.css'

export interface EmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string
  description?: ReactNode
  icon?: ReactNode
}

export function Empty({ title, description, icon, children, className, 'aria-label': ariaLabel, 'aria-labelledby': labelledBy, 'aria-describedby': describedBy, ...props }: EmptyProps) {
  const id = useId()
  return <div role="region" aria-label={ariaLabel} aria-labelledby={labelledBy ?? (ariaLabel ? undefined : `${id}-title`)} aria-describedby={describedBy ?? (description ? `${id}-description` : undefined)} {...props} className={cn('ui-empty', className)}>
    {icon && <span className="ui-empty-icon" aria-hidden="true">{icon}</span>}
    <h3 className="ui-empty-title" id={`${id}-title`}>{title}</h3>
    {description && <div className="ui-empty-description" id={`${id}-description`}>{description}</div>}
    {children && <div className="ui-empty-actions">{children}</div>}
  </div>
}
