export const pageChromeComponents = [
  {
    id: 'header',
    name: 'Header',
    subtitle: '브랜드·탐색·작업 도구',
    category: 'layout',
    generation: 'completion',
  },
  {
    id: 'footer',
    name: 'Footer',
    subtitle: '링크·정책·제품 정보',
    category: 'layout',
    generation: 'completion',
  },
] as const

export type PageChromeId = (typeof pageChromeComponents)[number]['id']

export const pageChromeAliases: Record<PageChromeId, string> = {
  header: '헤더 상단바 내비게이션 네비게이션 브랜드 로고 모바일 메뉴 navigation centered toolbar',
  footer: '푸터 하단바 사이트맵 정책 저작권 링크 simple columns compact',
}

export const pageChromeSnippets: Record<PageChromeId, string> = {
  header: `import { Header } from './components/ui/header'
import { Button } from './components/ui/button'

<Header
  brand={<a href="/">Moru Studio</a>}
  navigation={<><a href="/projects" aria-current="page">프로젝트</a><a href="/team">팀</a></>}
  actions={<Button onClick={createProject}>새 프로젝트</Button>}
/>
{/* variant: navigation | centered | app. 좁은 화면의 메뉴와 Escape를 기본 지원합니다. */}`,
  footer: `import { Footer } from './components/ui/footer'

<Footer
  variant="columns"
  brand="Moru Studio"
  description="단단한 기본에서 자연스러운 경험까지."
  columns={[
    { title: '제품', content: <ul><li><a href="/guide">사용 가이드</a></li></ul> },
    { title: '안내', content: <ul><li><a href="/privacy">개인정보 처리방침</a></li></ul> },
  ]}
  copyright="© Moru Studio"
/>
{/* variant: simple | columns | compact. 각 링크는 앱의 실제 경로를 연결하세요. */}`,
}
