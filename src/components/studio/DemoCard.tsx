import type { ReactNode } from 'react'
import { ArrowUpRight, Check, Copy } from 'lucide-react'
import { useI18n } from '../../i18n'
import { components, snippets, type ComponentId } from '../catalog/component-catalog'
import { componentGroupFor, componentPageHash } from '../catalog/component-pages'

/** One gallery specimen: heading, live preview or source, and its actions. */
export function DemoCard({
  id,
  children,
  selected,
  onSelect,
  code,
  copied,
  onCopy,
  onOpenDocumentation,
}: {
  id: ComponentId
  children: ReactNode
  selected: boolean
  onSelect: () => void
  code: boolean
  copied: boolean
  onCopy: () => void
  onOpenDocumentation?: () => void
}) {
  const { t } = useI18n()
  const meta = components.find((component) => component.id === id)!
  return (
    <section
      id={`component-${id}`}
      tabIndex={-1}
      className={`specimen ${selected ? 'is-selected' : ''}`}
      aria-label={t('{v0} 컴포넌트', { v0: meta.name })}
    >
      <div className="specimen-heading">
        <h2 className="specimen-title">
          <button className="specimen-name" onClick={onSelect} aria-pressed={selected}>
            <span className="specimen-number">
              {String(components.indexOf(meta) + 1).padStart(2, '0')}
            </span>
            <span className="specimen-label">
              <span className="specimen-component-name">
                {meta.name}
                {meta.generation === 'completion' ? (
                  <span className="component-new-marker">NEW</span>
                ) : null}
              </span>
              <span className="specimen-subtitle">{t(meta.subtitle)}</span>
            </span>
          </button>
        </h2>
        <button
          className="icon-button specimen-code"
          aria-label={t('{v0} 코드 복사', { v0: meta.name })}
          onClick={onCopy}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      {code ? (
        <pre
          className="specimen-source"
          tabIndex={0}
          role="region"
          aria-label={t('{v0} 사용 예시 코드', { v0: meta.name })}
        >
          <code>{snippets[id]}</code>
        </pre>
      ) : (
        <div className={`specimen-content specimen-${id}`}>{children}</div>
      )}
      <div className="specimen-footer">
        <span>
          <i />
          {code ? t('TSX · 코드') : t('미리보기')}
        </span>
        {onOpenDocumentation ? (
          <a
            href={componentPageHash({
              kind: 'detail',
              group: componentGroupFor(id).id,
              component: id,
            })}
            onClick={(event) => {
              if (
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.altKey ||
                event.shiftKey
              )
                return
              event.preventDefault()
              onOpenDocumentation()
            }}
          >
            {meta.name}
            {t(' 문서 ')}
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        ) : (
          <button onClick={onSelect} aria-label={t('{v0} 세부 조정', { v0: meta.name })}>
            {t('세부 조정 ')}
            <ArrowUpRight size={13} />
          </button>
        )}
      </div>
    </section>
  )
}
