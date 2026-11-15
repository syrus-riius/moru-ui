import { localizeCatalogItems } from '../catalog/catalog-search'
import { useI18n } from '../../i18n'
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import {
  ArrowRight,
  Check,
  Copy,
  FolderKanban,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Star,
} from 'lucide-react'
import { useExampleSession } from './ExampleSessionContext'
import type { ExampleProject, ProjectStatus } from './example-session-state'
import { useWorkspaceMembers } from '../workspace-example/WorkspaceMembersContext'
import type { WorkspaceMember } from '../workspace-example/workspace-members-state'
import { MoruMark } from '../brand'
import { AspectRatio } from '../ui/aspect-ratio'
import { Avatar } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Carousel } from '../ui/carousel'
import { Combobox } from '../ui/combobox'
import { ContextMenu } from '../ui/context-menu'
import { DataTable, type DataTableFeatures } from '../ui/data-table'
import { Drawer } from '../ui/drawer'
import { Empty } from '../ui/empty'
import { HoverCard } from '../ui/hover-card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '../ui/item'
import { Label } from '../ui/label'
import { Menubar } from '../ui/menubar'
import { NativeSelect } from '../ui/native-select'
import { NavigationMenu } from '../ui/navigation-menu'
import type { NavigationAction } from '../ui/navigation-menu-items'
import { Progress } from '../ui/progress'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable'
import { Skeleton } from '../ui/skeleton'
import { Slider } from '../ui/slider'
import { Textarea } from '../ui/textarea'
import { Toggle } from '../ui/toggle'
import { useToast } from '../ui/toast'
import { Typography } from '../ui/typography'
import './project-operations.css'

const Chart = lazy(() => import('../ui/chart').then((module) => ({ default: module.Chart })))
const helper = createColumnHelper<DataTableFeatures, ExampleProject>()
const statusItems: { value: ProjectStatus; label: string }[] = [
  { value: 'planning', label: '준비 중' },
  { value: 'active', label: '진행 중' },
  { value: 'review', label: '검토 중' },
  { value: 'done', label: '완료' },
]
const statusTone = {
  planning: undefined,
  active: 'info',
  review: 'warning',
  done: 'success',
} as const
const chartConfig = { count: { label: '프로젝트 수', color: 'var(--ui-primary)' } }
const priorities = [
  { value: 'low', label: '낮음' },
  { value: 'normal', label: '보통' },
  { value: 'high', label: '높음' },
]
const statusLabel = (status: ProjectStatus) =>
  statusItems.find((item) => item.value === status)?.label ?? '준비 중'
const readStatus = (value: string): ProjectStatus =>
  statusItems.find((item) => item.value === value)?.value ?? 'planning'
const projectRowId = (project: ExampleProject) => project.id

function ProjectOwner({ member }: { member: WorkspaceMember | undefined }) {
  const { t } = useI18n()
  if (!member) return <span className="project-operations-note">{t('담당자 미정')}</span>
  return (
    <HoverCard
      title={member.name}
      description={member.title || t('프로젝트 팀원')}
      trigger={
        <button
          type="button"
          className="project-operations-owner"
          aria-label={t('{name} 담당자 정보', { name: member.name })}
        >
          <Avatar alt="" fallback={member.name.slice(0, 2)} size="sm" />
          <span>{member.name}</span>
        </button>
      }
    >
      <div className="project-operations-owner-details">
        <p>{member.email}</p>
        <Badge tone={member.status === 'invited' ? 'warning' : 'success'} variant="secondary">
          {member.status === 'invited' ? t('초대 중') : t('함께하는 중')}
        </Badge>
      </div>
    </HoverCard>
  )
}

function ProjectCard({
  project,
  member,
  onEdit,
  onFavorite,
  actions,
}: {
  project: ExampleProject
  member: WorkspaceMember | undefined
  onEdit: () => void
  onFavorite: (favorite: boolean) => void
  actions: NavigationAction[]
}) {
  const { t } = useI18n()
  return (
    <ContextMenu
      className="project-operations-context"
      aria-label={t('{name} 프로젝트 작업', { name: project.name })}
      items={localizeCatalogItems(actions, t)}
    >
      <Card className="project-operations-card">
        <AspectRatio ratio={16 / 5} className="project-operations-card-cover" aria-hidden="true">
          <MoruMark width={72} height={72} />
          <span>
            MORU STUDIO
            <br />
            PROJECT / {t(statusLabel(project.status))}
          </span>
        </AspectRatio>
        <div className="project-operations-card-top">
          <Badge variant="secondary" tone={statusTone[project.status]}>
            {t(statusLabel(project.status))}
          </Badge>
          <Toggle
            size="sm"
            pressed={project.favorite}
            onPressedChange={onFavorite}
            aria-label={t('{name} 즐겨찾기', { name: project.name })}
          >
            <Star size={15} fill={project.favorite ? 'currentColor' : 'none'} />
          </Toggle>
        </div>
        <div className="project-operations-card-copy">
          <h4>{project.name}</h4>
          <p>{project.description || t('프로젝트 설명을 추가해 보세요.')}</p>
        </div>
        <Progress value={project.progress} label={t('진행률')} showValue />
        <div className="project-operations-card-footer">
          <ProjectOwner member={member} />
          <Button size="sm" variant="secondary" onClick={onEdit}>
            {t('상세 편집')}
            <Pencil size={13} aria-hidden="true" />
          </Button>
        </div>
        <p className="project-operations-note">
          {project.dueDate ? (
            <time dateTime={project.dueDate}>
              {project.dueDate.replaceAll('-', '.')}
              {t('마감')}
            </time>
          ) : (
            t('마감일 미정')
          )}{' '}
          {t('· 우클릭 또는 Shift+F10으로 작업')}
        </p>
      </Card>
    </ContextMenu>
  )
}

export function ProjectOperations() {
  const { t } = useI18n()
  const { state, dispatch, setScene, updateProject, addProject } = useExampleSession()
  const { members } = useWorkspaceMembers()
  const { toast } = useToast()
  const id = useId()
  const nameRef = useRef<HTMLInputElement>(null)
  const createRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const layoutRef = useRef<HTMLDivElement>(null)
  const [wideLayout, setWideLayout] = useState(false)
  const [draft, setDraft] = useState<ExampleProject | null>(null)
  const [creating, setCreating] = useState(false)
  const [nameError, setNameError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [cardIndex, setCardIndex] = useState(0)
  const [projectRevision, setProjectRevision] = useState(0)

  useEffect(() => {
    const node = layoutRef.current
    if (!node || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => setWideLayout(entry.contentRect.width >= 800))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const membersById = useMemo(
    () => new Map(members.map((member) => [member.id, member])),
    [members],
  )
  const filtered = useMemo(
    () =>
      state.projects.filter((project) => statusFilter === 'all' || project.status === statusFilter),
    [state.projects, statusFilter],
  )
  const clampedCardIndex = Math.min(cardIndex, Math.max(0, filtered.length - 1))
  const visibleCardId = filtered[clampedCardIndex]?.id ?? null
  const currentProject =
    state.projectView === 'cards'
      ? filtered[clampedCardIndex]
      : (state.projects.find((project) => project.id === state.selectedProjectId) ??
        state.projects[0])
  const selectedProjects = state.projects.filter((project) => selectedIds.includes(project.id))
  const pending = state.projects.filter((project) => project.status !== 'done')
  const completedCount = state.projects.length - pending.length
  const averageProgress = state.projects.length
    ? Math.round(
        state.projects.reduce((sum, project) => sum + project.progress, 0) / state.projects.length,
      )
    : 0
  const chartData = statusItems.map((item) => ({
    status: t(item.label),
    count: state.projects.filter((project) => project.status === item.value).length,
  }))
  const highlighted = [...pending]
    .sort((left, right) => Number(right.priority === 'high') - Number(left.priority === 'high'))
    .slice(0, 3)

  useEffect(() => {
    if (cardIndex !== clampedCardIndex) setCardIndex(clampedCardIndex)
    if (state.projectView === 'cards' && state.selectedProjectId !== visibleCardId)
      dispatch({ type: 'project/select', id: visibleCardId })
  }, [
    cardIndex,
    clampedCardIndex,
    state.projectView,
    state.selectedProjectId,
    visibleCardId,
    dispatch,
  ])

  const rememberOpener = useCallback(() => {
    const active = document.activeElement
    openerRef.current =
      active instanceof HTMLElement && active.closest('.project-operations')
        ? active
        : createRef.current
  }, [])

  const editProject = useCallback(
    (project: ExampleProject) => {
      rememberOpener()
      dispatch({ type: 'project/select', id: project.id })
      setCreating(false)
      setNameError('')
      setDraft({ ...project })
    },
    [dispatch, rememberOpener],
  )

  function createProject() {
    rememberOpener()
    setCreating(true)
    setNameError('')
    setDraft({
      id: crypto.randomUUID(),
      name: '',
      description: '',
      ownerId: null,
      status: 'planning',
      progress: 0,
      dueDate: null,
      priority: 'normal',
      favorite: false,
    })
  }

  const changeStatus = useCallback(
    (project: ExampleProject, next: ProjectStatus) => {
      dispatch({ type: 'project/select', id: project.id })
      updateProject(project.id, {
        status: next,
        progress: next === 'done' ? 100 : project.status === 'done' ? 95 : project.progress,
      })
    },
    [dispatch, updateProject],
  )

  function completeSelection() {
    const available = selectedProjects.filter((project) => project.status !== 'done')
    available.forEach((project) => updateProject(project.id, { status: 'done', progress: 100 }))
    if (available.length)
      toast({
        title: t('{length}개 프로젝트를 완료했어요.', { length: available.length }),
        description: t('표와 현황 차트에 함께 반영했습니다.'),
        tone: 'success',
      })
  }

  const duplicateProject = useCallback(
    (project: ExampleProject) => {
      dispatch({ type: 'project/duplicate', id: project.id, newId: crypto.randomUUID() })
      setStatusFilter('all')
      setCardIndex(0)
      setProjectRevision((revision) => revision + 1)
      toast({
        title: t('프로젝트 사본을 만들었어요.'),
        description: t('{name}의 설정으로 새 작업을 준비합니다.', { name: project.name }),
        tone: 'success',
      })
    },
    [dispatch, toast, t],
  )

  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor('name', {
          header: t('프로젝트'),
          sortFn: 'text',
          cell: ({ row, getValue }) => (
            <div className="project-operations-row-title">
              <button type="button" onClick={() => editProject(row.original)}>
                {getValue()}
              </button>
              <span>
                {row.original.dueDate
                  ? t('{value1} 마감', { value1: row.original.dueDate.replaceAll('-', '.') })
                  : t('마감일 미정')}
              </span>
            </div>
          ),
        }),
        helper.accessor(
          (project) => membersById.get(project.ownerId ?? '')?.name ?? t('담당자 미정'),
          {
            id: 'owner',
            header: t('담당자'),
            sortFn: 'text',
            cell: ({ row }) => (
              <ProjectOwner member={membersById.get(row.original.ownerId ?? '')} />
            ),
          },
        ),
        helper.accessor('status', {
          header: t('상태'),
          cell: ({ row, getValue }) => (
            <NativeSelect
              size="sm"
              value={getValue()}
              aria-label={t('{name} 상태', { name: row.original.name })}
              items={localizeCatalogItems(statusItems, t)}
              onValueChange={(value) => changeStatus(row.original, readStatus(value))}
            />
          ),
        }),
        helper.accessor('progress', {
          header: t('진행률'),
          sortFn: 'basic',
          cell: ({ row, getValue }) => (
            <Progress
              value={getValue()}
              aria-label={t('{name} 진행률', { name: row.original.name })}
              showValue
            />
          ),
        }),
        helper.display({
          id: 'actions',
          header: t('작업'),
          enableHiding: false,
          cell: ({ row }) => (
            <Button
              size="sm"
              variant="ghost"
              aria-label={t('{name} 편집', { name: row.original.name })}
              onClick={() => editProject(row.original)}
            >
              <Pencil size={14} aria-hidden="true" />
            </Button>
          ),
        }),
      ]),
    [membersById, editProject, changeStatus, t],
  )

  function projectActions(project: ExampleProject): NavigationAction[] {
    return [
      {
        id: 'edit',
        label: t('상세 편집'),
        icon: <Pencil size={14} />,
        onSelect: () => editProject(project),
      },
      {
        id: 'copy',
        label: t('프로젝트 복제'),
        icon: <Copy size={14} />,
        onSelect: () => duplicateProject(project),
      },
      {
        id: 'complete',
        label: t('완료로 변경'),
        icon: <Check size={14} />,
        disabled: project.status === 'done',
        onSelect: () => changeStatus(project, 'done'),
      },
    ]
  }

  function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft) return
    if (!draft.name.trim()) {
      setNameError(t('프로젝트 이름을 입력해 주세요.'))
      nameRef.current?.focus()
      return
    }
    const project = {
      ...draft,
      name: draft.name.trim(),
      ownerId: membersById.has(draft.ownerId ?? '') ? draft.ownerId : null,
    }
    if (creating) {
      addProject(project)
      setStatusFilter('all')
      setCardIndex(0)
      setProjectRevision((revision) => revision + 1)
    } else {
      const { id: projectId, ...patch } = project
      updateProject(projectId, patch)
    }
    setDraft(null)
    toast({
      title: creating ? t('새 프로젝트를 만들었어요.') : t('프로젝트 변경을 저장했어요.'),
      description: t('목록과 카드, 현황 차트가 같은 내용을 보여줍니다.'),
      tone: 'success',
    })
  }

  const chartPane = (
    <section
      className="project-operations-pane project-operations-chart"
      aria-labelledby={`${id}-chart-title`}
    >
      <div className="project-operations-pane-heading">
        <div>
          <h3 id={`${id}-chart-title`}>{t('프로젝트 진행 현황')}</h3>
          <p>
            {t('상태를 바꾸면 전체')}
            {state.projects.length}
            {t('개 프로젝트의 분포가 함께 바뀝니다.')}
          </p>
        </div>
        <Badge variant="outline">{t('실시간 반영')}</Badge>
      </div>
      <Suspense
        fallback={
          <div role="status" aria-label={t('프로젝트 현황 차트 준비 중')}>
            <Skeleton style={{ height: 300 }} />
          </div>
        }
      >
        <Chart
          title={t('상태별 프로젝트 수')}
          data={chartData}
          config={{ count: { ...chartConfig.count, label: t(chartConfig.count.label) } }}
          xKey="status"
        />
      </Suspense>
    </section>
  )
  const highlightPane = (
    <section className="project-operations-pane" aria-labelledby={`${id}-highlights-title`}>
      <div className="project-operations-pane-heading">
        <div>
          <h3 id={`${id}-highlights-title`}>{t('지금 확인할 일')}</h3>
          <p>{t('진행 중인 일에서 우선순위가 높은 프로젝트부터 보여드려요.')}</p>
        </div>
      </div>
      {highlighted.length ? (
        <ItemGroup className="project-operations-highlights">
          {highlighted.map((project) => (
            <Item variant="outline" key={project.id}>
              <ItemMedia>
                <FolderKanban size={18} aria-hidden="true" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  <button type="button" onClick={() => editProject(project)}>
                    {project.name}
                  </button>
                </ItemTitle>
                <ItemDescription>
                  {t(statusLabel(project.status))}
                  {t('· 진행률')}
                  {project.progress}%
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => editProject(project)}
                  aria-label={t('{name} 확인', { name: project.name })}
                >
                  {t('확인')}
                  <ArrowRight size={13} aria-hidden="true" />
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      ) : (
        <Empty
          title={t('모든 프로젝트를 완료했어요.')}
          description={t('새로운 아이디어를 다음 프로젝트로 시작해 보세요.')}
        >
          <Button size="sm" variant="secondary" onClick={createProject}>
            {t('프로젝트 만들기')}
          </Button>
        </Empty>
      )}
    </section>
  )

  return (
    <section className="project-operations" aria-labelledby={`${id}-title`}>
      <header className="project-operations-heading">
        <div className="project-operations-heading-copy">
          <Typography variant="heading" as="h2" id={`${id}-title`}>
            {t('아이디어를 다음 단계로.')}
          </Typography>
          <p>{t('프로젝트를 찾고, 상태를 바꾸고, 함께 만드는 사람의 일을 정리해 보세요.')}</p>
        </div>
        <Button ref={createRef} onClick={createProject}>
          <Plus size={15} aria-hidden="true" />
          {t('새 프로젝트')}
        </Button>
      </header>
      <div className="project-operations-navigation">
        <NavigationMenu
          size="sm"
          aria-label={t('프로젝트 화면 탐색')}
          items={[
            {
              id: 'table',
              label: t('목록 보기'),
              active: state.projectView === 'table',
              onSelect: () => dispatch({ type: 'project/view', view: 'table' }),
            },
            {
              id: 'cards',
              label: t('카드 보기'),
              active: state.projectView === 'cards',
              onSelect: () => dispatch({ type: 'project/view', view: 'cards' }),
            },
            {
              id: 'next',
              label: t('함께할 다음 일'),
              links: [
                {
                  id: 'conversation',
                  label: t('팀과 이야기하기'),
                  description: t('프로젝트에 관한 의견과 파일을 모아요.'),
                  href: '#examples',
                  onSelect: () => setScene('conversation'),
                },
                {
                  id: 'release',
                  label: t('릴리스 준비하기'),
                  description: t('프로젝트를 고르고 배포 전 점검을 진행해요.'),
                  href: '#examples',
                  onSelect: () => setScene('release'),
                },
              ],
            },
          ]}
        />
        <Menubar
          size="sm"
          aria-label={t('프로젝트 관리 메뉴')}
          menus={[
            {
              id: 'project',
              label: t('프로젝트'),
              items: [
                {
                  id: 'new',
                  label: t('새 프로젝트'),
                  icon: <Plus size={14} />,
                  onSelect: createProject,
                },
                {
                  id: 'edit',
                  label: t('현재 프로젝트 편집'),
                  icon: <Pencil size={14} />,
                  disabled: !currentProject,
                  onSelect: () => currentProject && editProject(currentProject),
                },
                {
                  id: 'copy',
                  label: t('현재 프로젝트 복제'),
                  icon: <Copy size={14} />,
                  disabled: !currentProject,
                  onSelect: () => currentProject && duplicateProject(currentProject),
                },
                {
                  id: 'complete',
                  label: t('현재 프로젝트 완료'),
                  icon: <Check size={14} />,
                  disabled: !currentProject || currentProject.status === 'done',
                  onSelect: () => currentProject && changeStatus(currentProject, 'done'),
                },
              ],
            },
            {
              id: 'selection',
              label: t('선택 작업'),
              disabled: state.projectView !== 'table',
              items: [
                {
                  id: 'complete-selection',
                  label: t('{length}개 선택 항목 완료', { length: selectedProjects.length }),
                  icon: <Check size={14} />,
                  disabled: !selectedProjects.some((project) => project.status !== 'done'),
                  onSelect: completeSelection,
                },
              ],
            },
          ]}
        />
      </div>
      <dl className="project-operations-summary">
        <div className="project-operations-summary-item">
          <dt className="project-operations-summary-label">{t('전체 프로젝트')}</dt>
          <dd className="project-operations-summary-value">{state.projects.length}</dd>
        </div>
        <div className="project-operations-summary-item">
          <dt className="project-operations-summary-label">{t('완료한 프로젝트')}</dt>
          <dd className="project-operations-summary-value">{completedCount}</dd>
        </div>
        <div className="project-operations-summary-item">
          <dt className="project-operations-summary-label">{t('평균 진행률')}</dt>
          <dd className="project-operations-summary-value">{averageProgress}%</dd>
        </div>
      </dl>
      <div className="project-operations-layout" ref={layoutRef}>
        {wideLayout ? (
          <ResizablePanelGroup orientation="horizontal" className="project-operations-panels">
            <ResizablePanel defaultSize="60%" minSize="45%">
              {chartPane}
            </ResizablePanel>
            <ResizableHandle aria-label={t('진행 현황과 확인할 일의 너비 조절')} />
            <ResizablePanel defaultSize="40%" minSize="30%">
              {highlightPane}
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="project-operations-panels ui-resizable-group" data-vertical="true">
            {chartPane}
            {highlightPane}
          </div>
        )}
      </div>
      <section className="project-operations-list" aria-labelledby={`${id}-list-title`}>
        <div className="project-operations-pane-heading">
          <div>
            <h3 id={`${id}-list-title`}>{t('우리의 프로젝트')}</h3>
            <p>
              {currentProject
                ? t('현재 프로젝트 · {name}', { name: currentProject.name })
                : t('다음 프로젝트를 시작해 보세요.')}
            </p>
          </div>
          <Badge variant="outline">
            {filtered.length}
            {t('개')}
          </Badge>
        </div>
        <div className="project-operations-toolbar">
          <div className="project-operations-filter">
            <Label htmlFor={`${id}-filter`}>{t('상태로 모아 보기')}</Label>
            <NativeSelect
              id={`${id}-filter`}
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setCardIndex(0)
              }}
              items={[
                { value: 'all', label: t('모든 상태') },
                ...localizeCatalogItems(statusItems, t),
              ]}
            />
          </div>
          <div className="project-operations-toolbar-buttons">
            <Button
              size="sm"
              variant="secondary"
              aria-pressed={state.projectView === 'table'}
              onClick={() => dispatch({ type: 'project/view', view: 'table' })}
            >
              <List size={14} aria-hidden="true" />
              {t('목록')}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              aria-pressed={state.projectView === 'cards'}
              onClick={() => dispatch({ type: 'project/view', view: 'cards' })}
            >
              <LayoutGrid size={14} aria-hidden="true" />
              {t('카드')}
            </Button>
          </div>
        </div>
        {state.projectView === 'table' ? (
          <>
            <div className="project-operations-toolbar">
              <p className="project-operations-selection" role="status">
                {selectedProjects.length
                  ? t('{length}개 선택 · 완료 처리하면 현황에도 반영돼요.', {
                      length: selectedProjects.length,
                    })
                  : t('체크박스로 여러 프로젝트를 한 번에 완료할 수 있어요.')}
              </p>
              <Button
                size="sm"
                variant="secondary"
                disabled={!selectedProjects.some((project) => project.status !== 'done')}
                onClick={completeSelection}
              >
                {t('선택 항목 완료')}
                <Check size={14} aria-hidden="true" />
              </Button>
            </div>
            <DataTable
              key={projectRevision}
              className="project-operations-table"
              data={filtered}
              columns={columns}
              getRowId={projectRowId}
              caption={t('Moru Studio 프로젝트 목록')}
              pageSize={4}
              searchPlaceholder={t('프로젝트 또는 담당자 검색')}
              onSelectionChange={setSelectedIds}
            />
          </>
        ) : filtered.length ? (
          <Carousel
            key={`${statusFilter}-${projectRevision}`}
            className="project-operations-carousel"
            aria-label={t('프로젝트 카드 모아 보기')}
            onValueChange={setCardIndex}
            items={filtered.map((project) => ({
              id: project.id,
              label: project.name,
              content: (
                <ProjectCard
                  project={project}
                  member={membersById.get(project.ownerId ?? '')}
                  onEdit={() => editProject(project)}
                  onFavorite={(favorite) => updateProject(project.id, { favorite })}
                  actions={projectActions(project)}
                />
              ),
            }))}
          />
        ) : (
          <Empty
            title={t('이 상태의 프로젝트가 없어요.')}
            description={t('다른 상태를 선택하거나 새 프로젝트를 만들어 보세요.')}
          >
            <Button variant="secondary" size="sm" onClick={() => setStatusFilter('all')}>
              {t('모든 프로젝트 보기')}
            </Button>
          </Empty>
        )}
      </section>
      <p className="project-operations-note">
        {t('변경 내용은 다른 예제에서도 유지됩니다. 새로고침하면 처음 상태로 돌아가요.')}
      </p>
      <Drawer
        className="project-operations-drawer"
        open={draft !== null}
        onOpenChange={(open) => {
          if (!open) setDraft(null)
        }}
        title={creating ? t('새 프로젝트 만들기') : t('프로젝트 상세 편집')}
        description={t(
          '이름과 담당자, 작업 상태를 다듬어 보세요. 저장하면 목록과 현황에 함께 반영됩니다.',
        )}
        initialFocus={nameRef}
        finalFocus={() => (openerRef.current?.isConnected ? openerRef.current : createRef.current)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDraft(null)}>
              {t('취소')}
            </Button>
            <Button form={`${id}-form`} type="submit">
              {creating ? t('프로젝트 만들기') : t('변경 저장')}
              <Check size={14} aria-hidden="true" />
            </Button>
          </>
        }
      >
        {draft ? (
          <form
            id={`${id}-form`}
            className="project-operations-drawer-form"
            onSubmit={saveProject}
            noValidate
          >
            <div className="project-operations-drawer-field">
              <Label htmlFor={`${id}-name`}>{t('프로젝트 이름')}</Label>
              <InputGroup>
                <InputGroupAddon>
                  <FolderKanban size={15} aria-hidden="true" />
                </InputGroupAddon>
                <InputGroupInput
                  ref={nameRef}
                  id={`${id}-name`}
                  value={draft.name}
                  onValueChange={(name) => {
                    setDraft({ ...draft, name })
                    setNameError('')
                  }}
                  placeholder={t('어떤 일을 시작할까요?')}
                  maxLength={100}
                  required
                  aria-invalid={Boolean(nameError) || undefined}
                  aria-describedby={nameError ? `${id}-name-error` : undefined}
                />
              </InputGroup>
              {nameError ? (
                <p className="project-operations-error" id={`${id}-name-error`} role="alert">
                  {nameError}
                </p>
              ) : null}
            </div>
            <div className="project-operations-drawer-field">
              <Label htmlFor={`${id}-description`}>{t('프로젝트 설명')}</Label>
              <Textarea
                id={`${id}-description`}
                value={t(draft.description)}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                maxLength={500}
                rows={3}
                placeholder={t('함께 만들어 갈 내용을 적어주세요.')}
              />
            </div>
            <div className="project-operations-drawer-field">
              <Label id={`${id}-owner-label`}>{t('담당자')}</Label>
              <Combobox
                aria-labelledby={`${id}-owner-label`}
                value={membersById.has(draft.ownerId ?? '') ? draft.ownerId : null}
                onValueChange={(ownerId) => setDraft({ ...draft, ownerId })}
                placeholder={t('이름 또는 이메일로 검색')}
                items={members.map((member) => ({
                  value: member.id,
                  label: member.name,
                  description: member.email,
                }))}
              />
            </div>
            <div className="project-operations-drawer-columns">
              <div className="project-operations-drawer-field">
                <Label htmlFor={`${id}-status`}>{t('작업 상태')}</Label>
                <NativeSelect
                  id={`${id}-status`}
                  value={draft.status}
                  items={localizeCatalogItems(statusItems, t)}
                  onValueChange={(value) => {
                    const status = readStatus(value)
                    setDraft({
                      ...draft,
                      status,
                      progress:
                        status === 'done' ? 100 : draft.status === 'done' ? 95 : draft.progress,
                    })
                  }}
                />
              </div>
              <div className="project-operations-drawer-field">
                <Label htmlFor={`${id}-priority`}>{t('우선순위')}</Label>
                <NativeSelect
                  id={`${id}-priority`}
                  value={draft.priority}
                  items={localizeCatalogItems(priorities, t)}
                  onValueChange={(value) =>
                    setDraft({
                      ...draft,
                      priority: value === 'high' ? 'high' : value === 'low' ? 'low' : 'normal',
                    })
                  }
                />
              </div>
            </div>
            <Slider
              label={t('진행률')}
              value={draft.progress}
              min={0}
              max={100}
              step={5}
              showValue
              disabled={draft.status === 'done'}
              onValueChange={(progress) => setDraft({ ...draft, progress })}
            />
            <p className="project-operations-note">
              {t('완료한 프로젝트는 진행률 100%로 표시됩니다. 입력한 내용은 저장할 때 적용돼요.')}
            </p>
          </form>
        ) : null}
      </Drawer>
    </section>
  )
}
