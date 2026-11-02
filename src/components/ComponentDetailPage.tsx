import type { MouseEvent, ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronRight, Code2, LayoutGrid, Link2, SlidersHorizontal } from 'lucide-react'
import { components, type ComponentId } from './component-catalog'
import { adjacentComponents, componentGroupFor, componentPageHash, type ComponentPage } from './component-pages'
import './component-detail-page.css'

export type ComponentDetailPageProps = {
  page: Extract<ComponentPage, { kind: 'detail' }>
  code: boolean
  onCodeChange: (code: boolean) => void
  onNavigate: (page: ComponentPage) => void
  onSelect: (id: ComponentId) => void
  onInspect: () => void
  onCopyLink: () => void
  linkCopied: boolean
  children: ReactNode
}

function isPlainActivation(event: MouseEvent<HTMLAnchorElement>) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.defaultPrevented
}

export function ComponentDetailPage({ page, code, onCodeChange, onNavigate, onSelect, onInspect, onCopyLink, linkCopied, children }: ComponentDetailPageProps) {
  const component = components.find((item) => item.id === page.component)!
  const group = componentGroupFor(page.component)
  const adjacent = adjacentComponents(page.component)
  const categoryPage: ComponentPage = { kind: 'category', group: group.id }
  const previous = adjacent.previous ? components.find((item) => item.id === adjacent.previous) : null
  const next = adjacent.next ? components.find((item) => item.id === adjacent.next) : null

  function navigate(event: MouseEvent<HTMLAnchorElement>, target: ComponentPage) {
    if (!isPlainActivation(event)) return
    event.preventDefault()
    onNavigate(target)
  }
  function select(event: MouseEvent<HTMLAnchorElement>, id: ComponentId) {
    if (!isPlainActivation(event)) return
    event.preventDefault()
    onSelect(id)
  }

  return <div className="component-detail-page">
    <nav className="component-detail-breadcrumb" aria-label="컴포넌트 페이지 위치">
      <a href={componentPageHash({ kind: 'index' })} onClick={(event) => navigate(event, { kind: 'index' })}>컴포넌트</a><ChevronRight size={10} aria-hidden="true" />
      <a href={componentPageHash(categoryPage)} onClick={(event) => navigate(event, categoryPage)}>{group.label}</a><ChevronRight size={10} aria-hidden="true" /><span aria-current="page">{component.name}</span>
    </nav>
    <header className="component-detail-heading">
      <div><span className="component-detail-eyebrow">MORU UI / {group.eyebrow}</span><h1>{component.name}{component.generation === 'completion' ? <small>NEW</small> : null}</h1><p>{component.subtitle}</p></div>
      <span className="component-detail-position">{group.label}<code>{String(adjacent.index + 1).padStart(2, '0')} / {String(adjacent.total).padStart(2, '0')}</code></span>
    </header>
    <div className="component-detail-toolbar">
      <div className="component-detail-view" role="group" aria-label="컴포넌트 보기 방식"><button type="button" aria-pressed={!code} onClick={() => onCodeChange(false)}><LayoutGrid size={13} aria-hidden="true" />미리보기</button><button type="button" aria-pressed={code} onClick={() => onCodeChange(true)}><Code2 size={13} aria-hidden="true" />코드</button></div>
      <div className="component-detail-actions"><button type="button" className="component-detail-copy-link" onClick={onCopyLink} aria-label={`${component.name} 페이지 링크 복사`}>{linkCopied ? <Check size={13} aria-hidden="true" /> : <Link2 size={13} aria-hidden="true" />}<span aria-live="polite">{linkCopied ? '복사됨' : '링크 복사'}</span></button><button type="button" className="component-detail-inspect" onClick={onInspect} aria-label={`${component.name} 세부 조정 열기`}><SlidersHorizontal size={13} aria-hidden="true" />세부 조정</button></div>
    </div>
    <div className="component-detail-preview" aria-label={`${component.name} 작업 영역`}>{children}</div>
    <nav className="component-detail-pagination" aria-label={`${group.label} 컴포넌트 이동`}>
      {previous ? <a className="component-detail-previous" href={componentPageHash({ kind: 'detail', group: group.id, component: previous.id })} onClick={(event) => select(event, previous.id)}><ArrowLeft size={14} aria-hidden="true" /><span><small>이전 컴포넌트</small><strong>{previous.name}</strong></span></a> : <span className="component-detail-boundary"><small>카테고리의 첫 번째</small><span>이전 컴포넌트 없음</span></span>}
      <a className="component-detail-category-return" href={componentPageHash(categoryPage)} onClick={(event) => navigate(event, categoryPage)} aria-label={`${group.label} 목록으로 돌아가기`}><LayoutGrid size={12} aria-hidden="true" /><span>목록</span></a>
      {next ? <a className="component-detail-next" href={componentPageHash({ kind: 'detail', group: group.id, component: next.id })} onClick={(event) => select(event, next.id)}><span><small>다음 컴포넌트</small><strong>{next.name}</strong></span><ArrowRight size={14} aria-hidden="true" /></a> : <span className="component-detail-boundary component-detail-boundary-last"><small>카테고리의 마지막</small><span>다음 컴포넌트 없음</span></span>}
    </nav>
    <p className="component-detail-note">이 페이지에서 컴포넌트를 조작하고, 디자인 편집 패널에서 공통 스타일을 다듬어 보세요.</p>
  </div>
}
