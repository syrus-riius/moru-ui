import { useI18n } from '../../i18n'
import { useState } from 'react'
import { Copy, FileText, Folder, Home, Link, Mail, Settings, Trash2, Users } from 'lucide-react'
import { Breadcrumb } from '../ui/breadcrumb'
import { Collapsible } from '../ui/collapsible'
import { ContextMenu } from '../ui/context-menu'
import { Drawer } from '../ui/drawer'
import { HoverCard } from '../ui/hover-card'
import { Menubar } from '../ui/menubar'
import { NavigationMenu } from '../ui/navigation-menu'
import { Sidebar } from '../ui/sidebar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Field } from '../ui/field'
import { Input } from '../ui/input'
import type { NavigationComponentId } from './completion-navigation-catalog'
import './completion-navigation-demo.css'

export interface CompletionNavigationDemoProps {
  id: NavigationComponentId
  disabled: boolean
  size: 'sm' | 'md' | 'lg'
  onNotice?: (message: string) => void
}

export function CompletionNavigationDemo({
  id,
  disabled,
  size,
  onNotice,
}: CompletionNavigationDemoProps) {
  const { t } = useI18n()
  const [lastAction, setLastAction] = useState('아직 선택한 동작이 없어요.')
  const [breadcrumbLevel, setBreadcrumbLevel] = useState(2)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [projectName, setProjectName] = useState('Moru Studio')
  const [draftName, setDraftName] = useState(projectName)
  const [sidebarValue, setSidebarValue] = useState('overview')
  function act(message: string) {
    setLastAction(message)
    onNotice?.(t(message))
  }
  const actionStatus = (
    <p className="completion-navigation-caption" role="status">
      {t(lastAction)}
    </p>
  )
  switch (id) {
    case 'breadcrumb': {
      const labels = ['홈', '워크스페이스', '컴포넌트']
      return (
        <div className="completion-navigation-stack">
          <Breadcrumb
            size={size}
            disabled={disabled}
            items={labels.slice(0, breadcrumbLevel + 1).map((label, index) => ({
              label: t(label),
              onClick: () => setBreadcrumbLevel(index),
            }))}
          />
          <p className="completion-navigation-caption">
            {t('현재 위치 ·')}
            {t(labels[breadcrumbLevel])}
          </p>
          {breadcrumbLevel < 2 ? (
            <Button
              variant="secondary"
              size={size}
              disabled={disabled}
              onClick={() => setBreadcrumbLevel((current) => current + 1)}
            >
              {t('다음 단계로 이동')}
            </Button>
          ) : null}
        </div>
      )
    }
    case 'collapsible':
      return (
        <Collapsible title={t('프로젝트 파일 · 3개')} size={size} disabled={disabled}>
          <ul className="completion-navigation-file-list">
            <li>
              <FileText size={15} aria-hidden="true" />
              README.md
            </li>
            <li>
              <Folder size={15} aria-hidden="true" />
              components
            </li>
            <li>
              <Folder size={15} aria-hidden="true" />
              tokens
            </li>
          </ul>
        </Collapsible>
      )
    case 'context-menu':
      return (
        <div className="completion-navigation-stack">
          <ContextMenu
            size={size}
            disabled={disabled}
            aria-label={t('프로젝트 작업 메뉴')}
            items={[
              {
                id: 'open',
                label: t('프로젝트 열기'),
                icon: <Folder />,
                onSelect: () => act('프로젝트를 열었어요.'),
              },
              {
                id: 'copy',
                label: t('사본 만들기'),
                icon: <Copy />,
                onSelect: () => act('프로젝트 사본을 만들었어요.'),
              },
              {
                id: 'share',
                label: t('공유하기'),
                children: [
                  {
                    id: 'link',
                    label: t('공유 링크 준비'),
                    icon: <Link />,
                    onSelect: () => act('예제 공유 링크를 준비했어요.'),
                  },
                  {
                    id: 'email',
                    label: t('이메일 초대 준비'),
                    icon: <Mail />,
                    onSelect: () => act('초대할 이메일을 입력할 준비가 됐어요.'),
                  },
                ],
              },
              {
                id: 'delete',
                label: t('삭제하기'),
                destructive: true,
                disabled: true,
                icon: <Trash2 />,
              },
            ]}
          >
            <Folder size={22} aria-hidden="true" />
            <span>{t('우클릭 또는 길게 누르기')}</span>
            <span className="completion-navigation-caption">{t('키보드 · Shift + F10')}</span>
          </ContextMenu>
          {actionStatus}
        </div>
      )
    case 'drawer':
      return (
        <div className="completion-navigation-stack">
          <span className="completion-navigation-label">{projectName}</span>
          <Drawer
            title={t('프로젝트 이름 바꾸기')}
            description={t('아래쪽 패널에서 수정하고, 위쪽 손잡이를 아래로 끌어 닫으세요.')}
            size={size}
            disabled={disabled}
            open={drawerOpen}
            onOpenChange={(next) => {
              if (next) setDraftName(projectName)
              setDrawerOpen(next)
            }}
            trigger={
              <Button variant="secondary" size={size} disabled={disabled}>
                {t('아래에서 편집')}
              </Button>
            }
            footer={
              <>
                <Button variant="secondary" size={size} onClick={() => setDrawerOpen(false)}>
                  {t('취소')}
                </Button>
                <Button
                  size={size}
                  disabled={!draftName.trim()}
                  onClick={() => {
                    setProjectName(draftName.trim())
                    setDrawerOpen(false)
                    act('프로젝트 이름을 저장했어요.')
                  }}
                >
                  {t('저장하기')}
                </Button>
              </>
            }
          >
            <Field label={t('프로젝트 이름')}>
              <Input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                size={size}
              />
            </Field>
          </Drawer>
          {actionStatus}
        </div>
      )
    case 'hover-card':
      return (
        <div className="completion-navigation-stack">
          <HoverCard
            title={t('민지 · 프로덕트 디자이너')}
            description={t('Moru에서 제품의 작은 디테일을 다듬고 있어요.')}
            disabled={disabled}
            size={size}
            trigger={
              <button type="button" disabled={disabled} className="completion-navigation-profile">
                <span aria-hidden="true">{t('민')}</span>
                <strong>@minji</strong>
              </button>
            }
          >
            <div className="completion-navigation-profile-meta">
              <Badge variant="secondary" tone="success">
                {t('함께 작업 중')}
              </Badge>
              <span>{t('참여 프로젝트 · 4개')}</span>
            </div>
          </HoverCard>
          <p className="completion-navigation-caption">
            {t('이름에 마우스를 올리거나 Tab으로 포커스해 보세요.')}
          </p>
        </div>
      )
    case 'menubar':
      return (
        <div className="completion-navigation-stack">
          <Menubar
            size={size}
            disabled={disabled}
            menus={[
              {
                id: 'file',
                label: t('파일'),
                items: [
                  {
                    id: 'new',
                    label: t('새 프로젝트'),
                    onSelect: () => act('새 프로젝트를 만들었어요.'),
                  },
                  {
                    id: 'export',
                    label: t('내보내기'),
                    children: [
                      {
                        id: 'json',
                        label: t('JSON으로 준비'),
                        onSelect: () => act('JSON 내보내기를 준비했어요.'),
                      },
                      {
                        id: 'css',
                        label: t('CSS로 준비'),
                        onSelect: () => act('CSS 내보내기를 준비했어요.'),
                      },
                    ],
                  },
                ],
              },
              {
                id: 'edit',
                label: t('편집'),
                items: [
                  { id: 'undo', label: t('실행 취소'), disabled: true },
                  {
                    id: 'copy',
                    label: t('사본 만들기'),
                    onSelect: () => act('프로젝트 사본을 만들었어요.'),
                  },
                ],
              },
              {
                id: 'view',
                label: t('보기'),
                items: [
                  {
                    id: 'zoom',
                    label: t('화면 맞추기'),
                    onSelect: () => act('작업 화면을 맞췄어요.'),
                  },
                ],
              },
            ]}
          />
          {actionStatus}
          <p className="completion-navigation-caption">
            {t('좌우 방향키로 메뉴를 이동하고, 아래 방향키로 펼치세요.')}
          </p>
        </div>
      )
    case 'navigation-menu':
      return (
        <div className="completion-navigation-stack">
          <NavigationMenu
            size={size}
            disabled={disabled}
            items={[
              {
                id: 'start',
                label: t('시작'),
                href: '#guide',
                onSelect: () => act('시작 가이드를 선택했어요.'),
              },
              {
                id: 'resources',
                label: t('리소스'),
                links: [
                  {
                    id: 'tokens',
                    label: t('디자인 토큰'),
                    href: '#tokens',
                    description: t('색상과 크기의 공통 언어'),
                    onSelect: () => act('디자인 토큰을 선택했어요.'),
                  },
                  {
                    id: 'components',
                    label: t('컴포넌트'),
                    href: '#components',
                    description: t('제품을 만드는 작은 도구'),
                    onSelect: () => act('컴포넌트를 선택했어요.'),
                  },
                ],
              },
            ]}
          />
          {actionStatus}
        </div>
      )
    case 'sidebar':
      return (
        <div className="completion-navigation-stack">
          <Sidebar
            title="Moru Studio"
            disabled={disabled}
            size={size}
            value={sidebarValue}
            onValueChange={setSidebarValue}
            items={[
              { id: 'overview', label: t('개요'), icon: <Home /> },
              { id: 'projects', label: t('프로젝트'), icon: <Folder />, badge: 4 },
              { id: 'team', label: t('팀원'), icon: <Users />, badge: 5 },
              { id: 'settings', label: t('설정'), icon: <Settings />, disabled: true },
            ]}
            footer={t('차근차근, 우리답게.')}
          />
          <p className="completion-navigation-caption" role="status">
            {t('선택한 화면 ·')}{' '}
            {t(
              ({ overview: '개요', projects: '프로젝트', team: '팀원' } as Record<string, string>)[
                sidebarValue
              ] ?? sidebarValue,
            )}
          </p>
        </div>
      )
  }
}
