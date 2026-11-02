import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Breadcrumb } from './breadcrumb'
import { Collapsible } from './collapsible'
import { ContextMenu } from './context-menu'
import { Drawer } from './drawer'
import { shouldDismissDrawer } from './drawer-utils'
import { HoverCard } from './hover-card'
import { Menubar } from './menubar'
import { NavigationMenu } from './navigation-menu'
import { Sidebar } from './sidebar'

describe('Navigation semantics and unavailable actions', () => {
  it('keeps the current breadcrumb as text even if a caller supplies a destination', () => {
    const markup = renderToStaticMarkup(<Breadcrumb items={[{ label: '홈', href: '/' }, { label: '프로젝트', href: '/project' }]} />)
    expect(markup).toContain('<nav aria-label="현재 위치"')
    expect(markup).toContain('href="/"')
    expect(markup).toContain('<span aria-current="page">프로젝트</span>')
    expect(markup).not.toContain('href="/project"')
  })

  it('removes breadcrumb destinations and callbacks from the tab order when disabled', () => {
    const markup = renderToStaticMarkup(<Breadcrumb disabled items={[{ label: '홈', href: '/' }, { label: '팀', onClick: () => {} }, { label: '민지' }]} />)
    expect(markup).not.toContain('<a ')
    expect(markup).not.toContain('<button')
    expect(markup).toContain('aria-disabled="true"')
    expect(markup).toContain('aria-current="page"')
  })

  it('connects a collapsible trigger and panel while preserving its initial expanded state', () => {
    const markup = renderToStaticMarkup(<Collapsible title="프로젝트 파일" defaultOpen><p>README.md</p></Collapsible>)
    expect(markup).toContain('type="button"')
    expect(markup).toContain('aria-expanded="true"')
    expect(markup).toContain('aria-controls=')
    expect(markup).toContain('README.md')
  })

  it('disables a collapsible trigger without discarding its content state', () => {
    const markup = renderToStaticMarkup(<Collapsible title="파일" disabled defaultOpen>파일 목록</Collapsible>)
    expect(markup).toContain('disabled=""')
    expect(markup).toContain('aria-expanded="true"')
    expect(markup).toContain('파일 목록')
  })

  it('makes a context region reachable by keyboard and keeps its menu private until opened', () => {
    const markup = renderToStaticMarkup(<ContextMenu aria-label="프로젝트 작업" items={[{ id: 'private', label: '아직 열지 않은 동작' }]}>프로젝트</ContextMenu>)
    expect(markup).toContain('tabindex="0"')
    expect(markup).toContain('aria-haspopup="menu"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).toContain('aria-label="프로젝트 작업"')
    expect(markup).not.toContain('아직 열지 않은 동작')
  })

  it('excludes a disabled context region from keyboard activation', () => {
    const markup = renderToStaticMarkup(<ContextMenu disabled defaultOpen items={[]}>프로젝트</ContextMenu>)
    expect(markup).toContain('tabindex="-1"')
    expect(markup).toContain('aria-disabled="true"')
    expect(markup).toContain('aria-expanded="false"')
  })

  it('gives menubar triggers the correct menu contract and disables the whole group', () => {
    const markup = renderToStaticMarkup(<Menubar disabled menus={[{ id: 'file', label: '파일', items: [{ id: 'new', label: '새 프로젝트' }] }]} />)
    expect(markup).toContain('role="menubar"')
    expect(markup).toContain('role="menuitem"')
    expect(markup).toContain('aria-haspopup="menu"')
    expect(markup).toMatch(/disabled=""|aria-disabled="true"/)
    expect(markup).not.toContain('새 프로젝트')
  })

  it('retains navigation destinations and marks disabled destinations as unavailable', () => {
    const markup = renderToStaticMarkup(<NavigationMenu items={[{ id: 'guide', label: '가이드', href: '/guide', active: true }, { id: 'private', label: '비공개', href: '/private', disabled: true }]} />)
    expect(markup).toContain('href="/guide"')
    expect(markup).toContain('aria-current="page"')
    expect(markup).toContain('href="/private"')
    expect(markup).toContain('aria-disabled="true"')
    expect(markup).toContain('tabindex="-1"')
  })

  it('keeps navigation submenu controls safe inside forms', () => {
    const markup = renderToStaticMarkup(<NavigationMenu items={[{ id: 'resources', label: '리소스', links: [{ id: 'tokens', label: '토큰', href: '/tokens' }] }]} />)
    expect(markup).toContain('type="button"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).not.toContain('href="/tokens"')
  })

  it('preserves active sidebar context and accessible labels when the rail is collapsed', () => {
    const markup = renderToStaticMarkup(<Sidebar title="Moru Studio" defaultCollapsed defaultValue="team" items={[{ id: 'home', label: '개요' }, { id: 'team', label: '팀원', badge: 5 }]} />)
    expect(markup).toContain('aria-label="사이드바 펼치기"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).toContain('aria-current="page"')
    expect(markup).toContain('aria-label="팀원"')
    expect(markup).toContain('Moru Studio 메뉴')
  })

  it('chooses the first available sidebar item rather than an unavailable first item', () => {
    const markup = renderToStaticMarkup(<Sidebar title="Moru" items={[{ id: 'locked', label: '잠김', disabled: true }, { id: 'open', label: '프로젝트' }]} />)
    expect(markup).toMatch(/aria-current="page"[^>]*>.*?프로젝트/)
    expect(markup).not.toMatch(/aria-current="page"[^>]*>.*?잠김/)
  })
})

describe('Bottom drawer and profile preview contracts', () => {
  it('uses a non-submitting dialog trigger and does not render hidden drawer contents on the server', () => {
    const markup = renderToStaticMarkup(<Drawer trigger={<button>편집</button>} title="프로젝트 편집">아직 열지 않은 내용</Drawer>)
    expect(markup).toContain('type="button"')
    expect(markup).toContain('aria-haspopup="dialog"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).not.toContain('아직 열지 않은 내용')
  })

  it('preserves disabled drawer prerequisites even when the supplied trigger is enabled', () => {
    const markup = renderToStaticMarkup(<Drawer disabled trigger={<button>편집</button>} title="프로젝트 편집" />)
    expect(markup).toContain('disabled=""')
    expect(markup).toContain('aria-expanded="false"')
  })

  it('does not expose disabled profile previews through keyboard focus', () => {
    const markup = renderToStaticMarkup(<HoverCard disabled trigger={<button type="button">민지</button>} title="프로필" description="비공개 설명" />)
    expect(markup).toContain('tabindex="-1"')
    expect(markup).toContain('aria-disabled="true"')
    expect(markup).not.toContain('비공개 설명')
  })

  it.each([
    [0, 0, false], [27, 1, false], [28, 50, true], [28, 100, false],
    [87, 1000, false], [88, 1000, true], [100, 0, true], [-20, 10, false],
    [100, -1, false], [Number.NaN, 10, false], [100, Number.POSITIVE_INFINITY, false],
  ])('uses deliberate downward drag distance and velocity (%s px over %s ms)', (distance, duration, expected) => {
    expect(shouldDismissDrawer(distance, duration)).toBe(expected)
  })
})
