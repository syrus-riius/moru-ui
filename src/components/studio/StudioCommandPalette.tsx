import { useI18n } from '../../i18n'
import type { ThemeMode } from '../../theme/tokens'
import { Command } from '../ui/command'
import { componentAliases, components, type ComponentId } from '../catalog/component-catalog'
import type { View } from './studio-route'

/** Global search (Cmd/Ctrl+K): pages, components and a few studio actions. */
export function StudioCommandPalette({
  open,
  onOpenChange,
  view,
  mode,
  onModeChange,
  go,
  selectComponent,
  openBlocks,
  openEditor,
  openInvite,
  onExport,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  view: View
  mode: ThemeMode
  onModeChange: (mode: ThemeMode) => void
  go: (view: View) => void
  selectComponent: (id: ComponentId) => void
  openBlocks: () => void
  openEditor: () => void
  openInvite: (target: 'preview' | 'workspace') => void
  onExport: () => void
}) {
  const { t } = useI18n()
  return (
    <Command
      open={open}
      onOpenChange={onOpenChange}
      title={t('Moru 검색')}
      placeholder={t('컴포넌트, 문서, 화면을 검색하세요')}
      items={[
        { id: 'home', label: t('홈'), group: t('문서'), onSelect: () => go('home') },
        {
          id: 'guide',
          label: t('시작하기 · 설치 가이드'),
          group: t('문서'),
          keywords: ['install', 'guide'],
          onSelect: () => go('guide'),
        },
        {
          id: 'token-guide',
          label: t('내 프로젝트에 적용'),
          group: t('문서'),
          keywords: ['npm', 'install', 'provider', 'tokens', 'json', '내보내기'],
          onSelect: () => go('token-guide'),
        },
        ...components.map((component) => ({
          id: `component:${component.id}`,
          label: component.name,
          group: t('컴포넌트'),
          keywords: [component.id, componentAliases[component.id], component.subtitle],
          onSelect: () => selectComponent(component.id),
        })),
        {
          id: 'components',
          label: t('컴포넌트 둘러보기'),
          group: t('화면'),
          keywords: ['components'],
          onSelect: () => go('components'),
        },
        {
          id: 'blocks',
          label: t('화면 블록 둘러보기'),
          group: t('화면'),
          keywords: ['blocks', 'patterns', 'screens', '대시보드', '회원가입', '로그인', '설정'],
          onSelect: () => openBlocks(),
        },
        {
          id: 'examples',
          label: t('예제 화면 열기'),
          group: t('화면'),
          keywords: ['workspace', 'team'],
          onSelect: () => go('examples'),
        },
        {
          id: 'project-template',
          label: t('프로젝트·할 일 템플릿 열기'),
          group: t('화면'),
          keywords: ['template', 'tasks', 'starter'],
          onSelect: () => go('project-template'),
        },
        {
          id: 'simulator',
          label: `${t('시뮬레이터 열기')} · BETA`,
          group: t('화면'),
          keywords: ['simulator', 'wireframe', '와이어프레임', 'beta', '베타'],
          onSelect: () => go('simulator'),
        },
        {
          id: 'mobile',
          label: t('모바일 UI · Expo'),
          group: t('화면'),
          keywords: ['mobile', 'native', 'SwiftUI', 'iOS', 'Android'],
          onSelect: () => go('mobile'),
        },
        {
          id: 'tokens',
          label: t('디자인 토큰 보기'),
          group: t('화면'),
          keywords: ['tokens'],
          onSelect: () => go('tokens'),
        },
        {
          id: 'states',
          label: t('상태 표현 비교'),
          group: t('화면'),
          keywords: ['states'],
          onSelect: () => go('states'),
        },
        { id: 'brand', label: t('Moru 이야기'), group: t('화면'), onSelect: () => go('brand') },
        {
          id: 'editor',
          label: t('디자인 편집 열기'),
          group: t('작업'),
          onSelect: () => {
            if (view === 'brand' || view === 'simulator') go('components')
            requestAnimationFrame(() => openEditor())
          },
        },
        {
          id: 'invite',
          label: t('팀원 명단에 추가'),
          group: t('작업'),
          keywords: ['invite'],
          onSelect: () => {
            go('examples')
            openInvite('workspace')
          },
        },
        {
          id: 'export',
          label: t('토큰 내보내기'),
          group: t('작업'),
          onSelect: onExport,
        },
        {
          id: 'mode',
          label: mode === 'light' ? t('다크 모드로 전환') : t('라이트 모드로 전환'),
          group: t('작업'),
          onSelect: () => onModeChange(mode === 'light' ? 'dark' : 'light'),
        },
      ]}
    />
  )
}
