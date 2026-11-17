import { ArrowUpRight } from 'lucide-react'
import { useI18n } from '../../i18n'
import { MoruLogo } from '../brand'
import { Footer } from '../ui/footer'
import './moru-site-footer.css'

const links = [
  { href: '#guide', label: '시작하기' },
  { href: '#components', label: '컴포넌트' },
  { href: '#blocks', label: '블록' },
  { href: '#playground', label: 'Playground' },
  { href: '#tokens', label: '스튜디오' },
  { href: '#brand', label: 'Moru 이야기' },
] as const

type MoruSiteFooterProps = {
  version: string
  compact?: boolean
}

/** The site's own footer is a composition of the installable Moru Footer. */
export function MoruSiteFooter({ version, compact = false }: MoruSiteFooterProps) {
  const { t } = useI18n()

  return (
    <Footer
      role="contentinfo"
      className="moru-site-footer"
      variant={compact ? 'compact' : 'simple'}
      size="sm"
      brand={
        <a className="moru-site-footer__brand" href="#home" aria-label={t('Moru UI 홈')}>
          <MoruLogo aria-hidden="true" />
        </a>
      }
      description={compact ? undefined : t('Moru UI · 직접 다듬고, 오래 쓰는 UI.')}
      navigation={
        compact ? (
          <a href="#brand">{t('Moru 이야기')}</a>
        ) : (
          links.map(({ href, label }) => (
            <a key={href} href={href}>
              {href === '#playground' ? label : t(label)}
            </a>
          ))
        )
      }
      copyright={<span>Moru UI Lab · v{version} · MIT</span>}
      meta={
        <a
          className="moru-site-footer__source"
          href="https://github.com/syrus-riius/moru-ui"
          target="_blank"
          rel="noreferrer"
          aria-label={t('GitHub 소스 코드')}
        >
          GitHub
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      }
    />
  )
}
