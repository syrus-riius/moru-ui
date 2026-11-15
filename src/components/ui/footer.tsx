import { useI18n } from '../../lib/i18n'
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import './page-chrome.css'

export interface FooterColumn {
  title: string
  content: ReactNode
  /** Distinguish repeated group titles when more than one footer is present. */
  label?: string
}

export type FooterProps = HTMLAttributes<HTMLElement> & {
  brand?: ReactNode
  description?: ReactNode
  navigation?: ReactNode
  navigationLabel?: string
  columns?: readonly FooterColumn[]
  copyright?: ReactNode
  meta?: ReactNode
  variant?: 'simple' | 'columns' | 'compact'
  size?: 'sm' | 'md' | 'lg'
}

/** Compose product links, legal information, and status without imposing a router. */
export const Footer = forwardRef<HTMLElement, FooterProps>(function Footer(
  {
    brand,
    description,
    navigation,
    navigationLabel: navigationLabelProp,
    columns,
    copyright,
    meta,
    variant = 'simple',
    size = 'md',
    children,
    className,
    ...props
  },
  ref,
) {
  const { t } = useI18n()
  const navigationLabel = navigationLabelProp ?? t('푸터 탐색')

  return (
    <footer
      {...props}
      ref={ref}
      className={cn('ui-footer', className)}
      data-variant={variant}
      data-size={size}
    >
      {brand || description || navigation || columns?.length ? (
        <div className="ui-footer-main">
          {brand || description ? (
            <div className="ui-footer-identity">
              {brand ? <div className="ui-footer-brand">{brand}</div> : null}
              {description ? <div className="ui-footer-description">{description}</div> : null}
            </div>
          ) : null}
          {navigation ? (
            <nav className="ui-footer-navigation" aria-label={navigationLabel}>
              {navigation}
            </nav>
          ) : null}
          {columns?.length ? (
            <div className="ui-footer-columns">
              {columns.map((column) => (
                <nav
                  key={column.title}
                  className="ui-footer-column"
                  aria-label={column.label ?? column.title}
                >
                  <h3>{column.title}</h3>
                  {column.content}
                </nav>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      {children ? <div className="ui-footer-content">{children}</div> : null}
      {copyright || meta ? (
        <div className="ui-footer-bottom">
          {copyright ? <div className="ui-footer-copyright">{copyright}</div> : null}
          {meta ? <div className="ui-footer-meta">{meta}</div> : null}
        </div>
      ) : null}
    </footer>
  )
})
