import { useId, type ReactNode } from 'react'
import { useI18n } from '../../../i18n'
import './component-variations.css'

export const sizes = ['sm', 'md', 'lg'] as const

/** A labelled comparison row. Each example keeps its real component dimensions. */
export function VariationGroup({
  title,
  description,
  children,
  wide = false,
}: {
  title: string
  description?: string
  children: ReactNode
  wide?: boolean
}) {
  const { t } = useI18n()
  const id = useId()
  return (
    <div className="doc-variation-group" role="group" aria-labelledby={id}>
      <div className="doc-variation-group-heading">
        <h3 id={id}>{t(title)}</h3>
        {description ? <p>{t(description)}</p> : null}
      </div>
      <div className="doc-variation-grid" data-wide={wide || undefined}>
        {children}
      </div>
    </div>
  )
}

export function VariationExample({
  label,
  code,
  children,
  wide = false,
}: {
  label: string
  code?: string
  children: ReactNode
  wide?: boolean
}) {
  const { t } = useI18n()
  const id = useId()
  return (
    <section className="doc-variation-example" data-wide={wide || undefined} aria-labelledby={id}>
      <header className="doc-variation-example-heading">
        <h4 id={id}>{t(label)}</h4>
        {code ? <code>{code}</code> : null}
      </header>
      <div className="doc-variation-preview">{children}</div>
    </section>
  )
}
