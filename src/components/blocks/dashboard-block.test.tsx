import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DashboardBlock, validateDashboardProject, type DashboardProject } from './DashboardBlock'

const projects: DashboardProject[] = [
  {
    id: 'test-project',
    name: 'Design System',
    summary: '공통 컴포넌트 점검',
    status: 'active',
    owner: 'me',
    completedTasks: 2,
    totalTasks: 5,
  },
]

describe('Dashboard screen composition', () => {
  it('rejects empty, overlong and case-insensitive duplicate project names', () => {
    expect(validateDashboardProject('   ', projects)).toContain('입력')
    expect(validateDashboardProject('가'.repeat(61), projects)).toContain('60자')
    expect(validateDashboardProject('  design SYSTEM ', projects)).toContain('같은 이름')
    expect(validateDashboardProject('새 프로젝트', projects)).toBe('')
    expect(validateDashboardProject('가'.repeat(60), projects)).toBe('')
  })

  it('composes the actual reusable header, chart and searchable project list', () => {
    const html = renderToStaticMarkup(
      <DashboardBlock title="우리 팀 개요" defaultProjects={projects} />,
    )
    expect(html).toContain('ui-header')
    expect(html).toContain('ui-chart')
    expect(html).toContain('role="search"')
    expect(html).toContain('aria-label="프로젝트 대시보드"')
    expect(html).toContain('우리 팀 개요')
    expect(html).toContain('Design System 상세 보기')
    expect(html).toContain('검색 결과 1개')
    expect(html).not.toContain('브랜드 가이드')
    expect(projects[0].completedTasks).toBe(2)
  })

  it('renders an empty workspace with a working create entry and empty search state', () => {
    const html = renderToStaticMarkup(<DashboardBlock defaultProjects={[]} />)
    expect(html).toContain('새 프로젝트')
    expect(html).toContain('검색 결과가 없어요')
    expect(html).toContain('전체 프로젝트 보기')
    expect(html).not.toContain('NaN')
    expect(html).not.toContain('Infinity')
  })
})
