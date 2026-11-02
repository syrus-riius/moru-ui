import { createElement, type HTMLAttributes } from 'react'
import type { TypographyRole } from '../../theme/tokens'
import { cn } from '../../lib/cn'

type TypographyElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label' | 'strong' | 'small' | 'code'

export type TypographyProps = HTMLAttributes<HTMLElement> & {
  variant?: TypographyRole
  as?: TypographyElement
}

const defaultElements: Record<TypographyRole, TypographyElement> = {
  display: 'h1',
  heading: 'h2',
  body: 'p',
  label: 'span',
  caption: 'span',
  code: 'code',
}

/** Text styling is independent from document hierarchy; choose `as` for the context. */
export function Typography({ variant = 'body', as, className, children, ...props }: TypographyProps) {
  return createElement(as ?? defaultElements[variant], {
    ...props,
    className: cn('ui-typography', className),
    'data-role': variant,
  }, children)
}
