import { useI18n } from '../../i18n'
import {
  ArrowRight,
  Download,
  FolderKanban,
  KeyRound,
  ListChecks,
  LayoutDashboard,
  Search,
  Settings2,
  ShieldCheck,
} from 'lucide-react'
import { BLOCKS, type BlockId } from '../blocks/block-metadata'
import { Button } from '../ui/button'
import './examples-hub-launcher.css'

const icons = {
  dashboard: LayoutDashboard,
  login: KeyRound,
  signup: ShieldCheck,
  settings: Settings2,
}
export function ExamplesHub({
  onWorkspace,
  onBlocks,
  onProjectTemplate,
}: {
  onWorkspace: () => void
  onBlocks?: (id?: BlockId) => void
  onProjectTemplate?: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="examples-launcher">
      <header className="catalog-intro">
        <span className="eyebrow">MORU UI / EXAMPLES</span>
        <h1>{t('예제 허브')}</h1>
        <p>
          {t('자주 쓰는 조합에서 하나의 제품 흐름까지. 내 아이디어에 맞는 시작점을 골라보세요.')}
        </p>
        <div className="catalog-meta">
          <span>{BLOCKS.length} SCREENS / APP TEMPLATE / 6 WORKSPACE FLOWS</span>
          <span>{t('미리보기 · 소스 다운로드 · 시뮬레이터')}</span>
        </div>
      </header>
      <section className="examples-template-card" aria-labelledby="examples-project-template-title">
        <div className="examples-template-copy">
          <span className="eyebrow">APP TEMPLATE / v0.3.2</span>
          <ListChecks size={27} aria-hidden="true" />
          <h2 id="examples-project-template-title">{t('프로젝트와 할 일을, 한곳에서.')}</h2>
          <p>
            {t(
              'Moru 검색 필터와 설정 폼으로 만든 작은 관리 앱입니다. 프로젝트와 할 일을 만들고, 검색하고, 수정한 뒤 브라우저에 저장하세요.',
            )}
          </p>
          <div className="examples-flow-tags">
            <span>{t('검색·필터')}</span>
            <span>{t('생성·상세 편집')}</span>
            <span>{t('설정 저장')}</span>
            <span>{t('라이트·다크')}</span>
          </div>
          <div className="examples-template-actions">
            <Button onClick={onProjectTemplate} disabled={!onProjectTemplate}>
              {t('앱 템플릿 실행')}
              <ArrowRight size={15} aria-hidden="true" />
            </Button>
            <a href="/downloads/moru-project-starter.zip" download>
              <Download size={15} aria-hidden="true" />
              {t('소스 다운로드')}
            </a>
          </div>
          <small>{t('React · TypeScript · Base UI · 필요한 Moru 소스 포함')}</small>
        </div>
        <div className="examples-template-preview" aria-hidden="true">
          <span>MORU / PROJECTS</span>
          <strong>{t('작은 일부터, 다음 단계로.')}</strong>
          <div className="examples-template-preview-filter">
            <Search size={14} />
            {t('프로젝트와 할 일 검색')}
            <span>{t('모든 상태⌄')}</span>
          </div>
          <div>
            <i />
            <span>
              {t('브랜드 가이드 정리')}
              <small>{t('프로젝트 · 디자인 시스템')}</small>
            </span>
            <b>{t('진행 중')}</b>
          </div>
          <div>
            <i />
            <span>
              {t('온보딩 플로우 확인')}
              <small>{t('할 일 · 제품 경험')}</small>
            </span>
            <b>{t('예정')}</b>
          </div>
          <div>
            <i />
            <span>
              {t('설정 화면 검토')}
              <small>{t('할 일 · 관리 앱')}</small>
            </span>
            <b>{t('완료')}</b>
          </div>
        </div>
      </section>
      <section className="examples-featured" aria-labelledby="example-workspace-title">
        <div className="examples-featured-copy">
          <span className="eyebrow">FEATURED / WORKSPACE</span>
          <span className="examples-featured-icon" aria-hidden="true">
            <FolderKanban size={24} />
          </span>
          <h2 id="example-workspace-title">{t('작은 팀의 하루를, 하나의 흐름으로.')}</h2>
          <p>
            {t(
              '프로젝트를 시작하고, 일정을 계획하고, 대화와 릴리스를 이어가세요. 여섯 화면의 데이터가 함께 움직입니다.',
            )}
          </p>
          <div className="examples-flow-tags">
            <span>{t('프로젝트 시작')}</span>
            <span>{t('운영')}</span>
            <span>{t('일정')}</span>
            <span>{t('대화')}</span>
            <span>{t('릴리스')}</span>
            <span>{t('설정')}</span>
          </div>
          <Button onClick={onWorkspace}>
            {t('작업 공간 예제 실행')}
            <ArrowRight size={15} aria-hidden="true" />
          </Button>
        </div>
        <div className="examples-workspace-sketch" aria-hidden="true">
          <div className="examples-sketch-nav">
            <strong>Moru Studio</strong>
            <span className="is-current">{t('프로젝트')}</span>
            <span>{t('일정 계획')}</span>
            <span>{t('팀 대화')}</span>
            <span>{t('릴리스 준비')}</span>
          </div>
          <div className="examples-sketch-main">
            <span>GOOD MORNING / MORU</span>
            <strong>{t('함께, 다음 단계로.')}</strong>
            <div className="examples-sketch-stats">
              <div>
                <small>{t('진행 중')}</small>
                <b>12</b>
              </div>
              <div>
                <small>{t('완료한 작업')}</small>
                <b>48</b>
              </div>
            </div>
            <div className="examples-sketch-task">
              <i />
              <div>
                {t('브랜드 가이드 정리')}
                <small>{t('오늘 · 디자인')}</small>
              </div>
              <span>{t('진행 중')}</span>
            </div>
            <div className="examples-sketch-task">
              <i />
              <div>
                {t('새로운 아이디어')}
                <small>{t('내일 · 제품')}</small>
              </div>
              <span>{t('계획')}</span>
            </div>
          </div>
        </div>
      </section>
      <section aria-labelledby="examples-blocks-title" className="examples-blocks-section">
        <div className="examples-launcher-section-heading">
          <div>
            <span className="eyebrow">START WITH A SCREEN</span>
            <h2 id="examples-blocks-title">{t('필요한 화면부터 시작하세요.')}</h2>
            <p>
              {t('대시보드·회원가입·로그인·설정 화면을 실행하고 내 제품의 시작점으로 가져가세요.')}
            </p>
          </div>
          {onBlocks ? (
            <Button variant="secondary" onClick={() => onBlocks()}>
              {t('화면 블록 전체 보기')}
              <ArrowRight size={14} aria-hidden="true" />
            </Button>
          ) : null}
        </div>
        <div className="examples-block-links">
          {BLOCKS.map((block) => {
            const Icon = icons[block.id]
            return (
              <button
                type="button"
                key={block.id}
                onClick={() => onBlocks?.(block.id)}
                disabled={!onBlocks}
                aria-label={t('{name} 블록 살펴보기', { name: t(block.title) })}
              >
                <span className="examples-block-link-top">
                  <Icon size={20} aria-hidden="true" />
                  <span>{t(block.category)}</span>
                </span>
                <strong>{t(block.title)}</strong>
                <p>{t(block.description)}</p>
                <span className="examples-block-link-bottom">
                  {block.flow.map((step) => t(step)).join(' → ')}
                  <ArrowRight size={15} aria-hidden="true" />
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
