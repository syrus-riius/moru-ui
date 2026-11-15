'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { useBlockI18n } from '../_lib/block-i18n'
import { useId, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { ArrowLeft, Check, FolderKanban, Plus } from 'lucide-react'
import { Badge } from '../badge'
import { Button } from '../button'
import { Card } from '../card'
import { Chart } from '../chart'
import { Field } from '../field'
import { Header } from '../header'
import { Input } from '../input'
import { Modal } from '../modal'
import { Progress } from '../progress'
import { Textarea } from '../textarea'
import { ToggleGroup } from '../toggle-group'
import {
  SearchFiltersBlock,
  type SearchFilterItem,
  type SearchFiltersValue,
} from './SearchFiltersBlock'

export interface DashboardProject extends SearchFilterItem {
  completedTasks: number
  totalTasks: number
}

export interface DashboardBlockProps {
  title?: string
  defaultProjects?: readonly DashboardProject[]
  onProjectsChange?: (projects: DashboardProject[]) => void
}

const initialProjects: readonly DashboardProject[] = [
  {
    id: 'brand',
    name: '브랜드 가이드',
    summary: '브랜드의 공통 언어를 정리해요.',
    status: 'active',
    owner: 'me',
    completedTasks: 8,
    totalTasks: 12,
  },
  {
    id: 'website',
    name: '제품 소개 웹사이트',
    summary: '새로운 제품을 소개하는 첫 화면.',
    status: 'active',
    owner: 'team',
    completedTasks: 6,
    totalTasks: 10,
  },
  {
    id: 'onboarding',
    name: '팀 온보딩',
    summary: '함께 시작하기 위한 체크리스트.',
    status: 'planned',
    owner: 'me',
    completedTasks: 0,
    totalTasks: 5,
  },
  {
    id: 'mobile',
    name: '모바일 앱 리서치',
    summary: '작은 화면에서 더 나은 경험을 찾아요.',
    status: 'done',
    owner: 'team',
    completedTasks: 9,
    totalTasks: 9,
  },
]

const activity = {
  week: [
    { day: '월', completed: 5 },
    { day: '화', completed: 8 },
    { day: '수', completed: 6 },
    { day: '목', completed: 11 },
    { day: '금', completed: 9 },
    { day: '토', completed: 3 },
    { day: '일', completed: 2 },
  ],
  month: [
    { day: '1주', completed: 32 },
    { day: '2주', completed: 41 },
    { day: '3주', completed: 38 },
    { day: '4주', completed: 44 },
  ],
}
const chartConfig = { completed: { label: '완료한 작업', color: 'var(--ui-primary)' } }
const statusLabels: Record<string, string> = { active: '진행 중', planned: '예정', done: '완료' }
const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 'var(--ui-control-gap, 8px)',
}
const stackStyle: CSSProperties = { display: 'grid', gap: 'var(--ui-form-gap, 20px)', minWidth: 0 }
const captionStyle: CSSProperties = {
  margin: 0,
  color: 'var(--ui-muted)',
  fontSize: 'var(--ui-type-caption-size, 12px)',
  lineHeight: 'var(--ui-type-caption-line-height, 1.5)',
}

export function validateDashboardProject(name: string, projects: readonly DashboardProject[]) {
  const normalized = name.trim()
  if (!normalized) return '프로젝트 이름을 입력해 주세요.'
  if (normalized.length > 60) return '프로젝트 이름은 60자 이하로 입력해 주세요.'
  if (
    projects.some(
      (project) => project.name.trim().toLocaleLowerCase() === normalized.toLocaleLowerCase(),
    )
  ) {
    return '같은 이름의 프로젝트가 있어요. 다른 이름을 입력해 주세요.'
  }
  return ''
}

/** A composed project overview. Example actions stay in memory; connect persistence in your app. */
export function DashboardBlock({
  title: titleProp,
  defaultProjects = initialProjects,
  onProjectsChange,
}: DashboardBlockProps = {}) {
  const { t, formatLocale } = useBlockI18n()
  const title = titleProp ?? t('팀의 오늘을 한눈에.')
  const weekdayFormatter = new Intl.DateTimeFormat(formatLocale, { weekday: 'short' })
  const id = useId()
  const sequence = useRef(0)
  const [projects, setProjects] = useState<DashboardProject[]>(() =>
    defaultProjects.map((project) => ({ ...project })),
  )
  const [filters, setFilters] = useState<SearchFiltersValue>({
    query: '',
    status: 'all',
    mineOnly: false,
  })
  const detailTriggerRef = useRef<HTMLElement | null>(null)
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState({
    message: '프로젝트를 검색하거나 새 프로젝트를 만들어 보세요.',
    name: '',
  })
  const nameRef = useRef<HTMLInputElement>(null)
  const detailCloseRef = useRef<HTMLButtonElement>(null)
  const searchRegionRef = useRef<HTMLDivElement>(null)
  const selected = projects.find((project) => project.id === selectedId)
  const activeCount = projects.filter((project) => project.status === 'active').length
  const completedTasks = projects.reduce((sum, project) => sum + project.completedTasks, 0)
  const totalTasks = projects.reduce((sum, project) => sum + project.totalTasks, 0)

  function updateProjects(next: DashboardProject[]) {
    setProjects(next)
    onProjectsChange?.(next.map((project) => ({ ...project })))
  }

  function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextError = validateDashboardProject(name, projects)
    setError(nextError)
    if (nextError) {
      nameRef.current?.focus()
      return
    }
    let projectId: string
    do {
      projectId = `${id}-project-${++sequence.current}`
    } while (projects.some((project) => project.id === projectId))
    const project: DashboardProject = {
      id: projectId,
      name: name.trim(),
      summary: summary.trim() || '새로운 프로젝트를 함께 시작해요.',
      status: 'planned',
      owner: 'me',
      completedTasks: 0,
      totalTasks: 1,
    }
    updateProjects([project, ...projects])
    setFilters({ query: '', status: 'all', mineOnly: false })
    setNotice({
      message: '“{name}” 프로젝트를 추가했어요. 검색 목록에서 확인하세요.',
      name: project.name,
    })
    setCreateOpen(false)
    setName('')
    setSummary('')
  }

  return (
    <section
      aria-label={t('프로젝트 대시보드')}
      style={{
        ...stackStyle,
        width: '100%',
        maxWidth: 760,
        margin: '0 auto',
        overflowWrap: 'anywhere',
        color: 'var(--ui-text)',
      }}
    >
      <Header
        brand={
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--ui-control-gap, 8px)',
            }}
          >
            <FolderKanban size={18} aria-hidden="true" />
            Moru Workspace
          </span>
        }
        size="sm"
        actions={
          <Modal
            title={t('새 프로젝트')}
            description={t('이 대시보드에 새 작업을 추가합니다.')}
            variant="form"
            size="sm"
            open={createOpen}
            onOpenChange={(open) => {
              setCreateOpen(open)
              if (open) setError('')
            }}
            initialFocus={nameRef}
            trigger={
              <Button size="sm">
                <Plus size={14} aria-hidden="true" />
                {t('새 프로젝트')}
              </Button>
            }
            footer={
              <>
                <Button variant="secondary" size="sm" onClick={() => setCreateOpen(false)}>
                  {t('취소')}
                </Button>
                <Button type="submit" form={`${id}-create`} size="sm">
                  {t('프로젝트 만들기')}
                </Button>
              </>
            }
          >
            <form id={`${id}-create`} onSubmit={createProject} noValidate style={stackStyle}>
              <Field label={t('프로젝트 이름')} error={t(error)}>
                <Input
                  ref={nameRef}
                  name="projectName"
                  value={name}
                  maxLength={60}
                  required
                  autoComplete="off"
                  placeholder={t('새로운 프로젝트')}
                  onChange={(event) => {
                    setName(event.target.value)
                    setError('')
                  }}
                />
              </Field>
              <Field label={t('프로젝트 소개')} description={t('선택 사항 · 최대 160자')}>
                <Textarea
                  name="projectSummary"
                  value={summary}
                  maxLength={160}
                  rows={3}
                  onChange={(event) => setSummary(event.target.value)}
                />
              </Field>
            </form>
          </Modal>
        }
      />

      <div style={{ display: 'grid', gap: 'var(--ui-field-gap, 8px)' }}>
        <div style={rowStyle}>
          <h3
            style={{
              margin: 0,
              fontSize: 'var(--ui-type-heading-size, 24px)',
              fontWeight: 'var(--ui-type-heading-weight, 600)',
              lineHeight: 'var(--ui-type-heading-line-height, 1.35)',
              letterSpacing: 'var(--ui-type-heading-letter-spacing, -.025em)',
            }}
          >
            {title}
          </h3>
          <Badge variant="outline">{t('{count}개 프로젝트', { count: projects.length })}</Badge>
        </div>
        <p style={captionStyle}>{t('진행 상황을 살피고, 다음 작업으로 자연스럽게 이어가세요.')}</p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 'var(--ui-control-gap, 12px)',
        }}
      >
        <Card style={{ minWidth: 0, display: 'grid', gap: 'var(--ui-field-gap, 8px)' }}>
          <span style={captionStyle}>{t('진행 중 프로젝트')}</span>
          <strong
            style={{
              fontSize: 'var(--ui-type-display-size, 32px)',
              lineHeight: 1.1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {activeCount}
          </strong>
          <span style={captionStyle}>{t('전체 {count}개 중', { count: projects.length })}</span>
        </Card>
        <Card style={{ minWidth: 0, display: 'grid', gap: 'var(--ui-field-gap, 8px)' }}>
          <span style={captionStyle}>{t('완료한 작업')}</span>
          <strong
            style={{
              fontSize: 'var(--ui-type-display-size, 32px)',
              lineHeight: 1.1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {completedTasks}
            <span style={{ ...captionStyle, marginInlineStart: 6 }}>/ {totalTasks}</span>
          </strong>
          <Progress value={completedTasks} max={totalTasks || 1} label={t('전체 작업 진행률')} />
        </Card>
      </div>

      <Card style={stackStyle}>
        <div style={rowStyle}>
          <strong style={{ fontSize: 'var(--ui-type-label-size, 14px)' }}>{t('작업 흐름')}</strong>
          <ToggleGroup
            size="sm"
            aria-label={t('대시보드 활동 기간')}
            preventEmpty
            value={[period]}
            onValueChange={([value]) => setPeriod(value === 'month' ? 'month' : 'week')}
            items={[
              { value: 'week', label: t('주간') },
              { value: 'month', label: t('월간') },
            ]}
          />
        </div>
        <Chart
          type="bar"
          title={t(period === 'week' ? '이번 주 완료한 작업' : '이번 달 완료한 작업')}
          description={t('활동 추이를 보여 주는 예시 데이터입니다.')}
          xKey="day"
          data={activity[period].map((point, index) => ({
            ...point,
            day:
              period === 'week'
                ? weekdayFormatter.format(new Date(2024, 0, index + 1))
                : t(point.day),
          }))}
          config={{
            completed: { ...chartConfig.completed, label: t(chartConfig.completed.label) },
          }}
          chartHeight={180}
          showLegend={false}
          style={{ margin: 0, minWidth: 0 }}
        />
      </Card>

      <div ref={searchRegionRef} tabIndex={-1} style={{ minWidth: 0 }}>
        <SearchFiltersBlock
          items={projects}
          title={t('프로젝트')}
          description={t('검색과 상태 필터로 집중할 작업을 골라보세요.')}
          selectLabel={t('상세 보기')}
          filters={filters}
          onFiltersChange={setFilters}
          onSelect={(projectId) => {
            detailTriggerRef.current =
              document.activeElement instanceof HTMLElement ? document.activeElement : null
            setSelectedId(projectId)
          }}
        />
      </div>

      <p role="status" style={captionStyle}>
        {t(notice.message, { name: notice.name })}
      </p>
      <p style={captionStyle}>{t('예제 변경 사항은 이 미리보기 안에서만 유지됩니다.')}</p>

      <Modal
        title={selected?.name ?? t('프로젝트 상세')}
        description={selected?.summary}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
        finalFocus={() =>
          detailTriggerRef.current?.isConnected ? detailTriggerRef.current : searchRegionRef.current
        }
        size="sm"
        footer={
          <Button ref={detailCloseRef} variant="secondary" onClick={() => setSelectedId(null)}>
            <ArrowLeft size={14} aria-hidden="true" />
            {t('목록으로 돌아가기')}
          </Button>
        }
      >
        {selected ? (
          <div style={stackStyle}>
            <div style={rowStyle}>
              <Badge tone={selected.status === 'done' ? 'success' : undefined}>
                {t(statusLabels[selected.status] ?? selected.status)}
              </Badge>
              <span style={captionStyle}>
                {t(selected.owner === 'me' ? '내가 담당' : '팀 담당')}
              </span>
            </div>
            <Progress
              label={t('프로젝트 진행률')}
              value={selected.completedTasks}
              max={selected.totalTasks || 1}
              showValue
            />
            <p role="status" style={captionStyle}>
              {t('{total}개 작업 중 {completed}개를 완료했어요.', {
                total: selected.totalTasks,
                completed: selected.completedTasks,
              })}
            </p>
            <Button
              disabled={selected.status === 'done'}
              onClick={() => {
                updateProjects(
                  projects.map((project) =>
                    project.id === selected.id
                      ? { ...project, status: 'done', completedTasks: project.totalTasks }
                      : project,
                  ),
                )
                setNotice({
                  message: '“{name}” 프로젝트를 완료했어요. 대시보드 통계에 반영했어요.',
                  name: selected.name,
                })
                detailCloseRef.current?.focus()
              }}
            >
              <Check size={16} aria-hidden="true" />
              {t(selected.status === 'done' ? '완료된 프로젝트' : '프로젝트 완료하기')}
            </Button>
          </div>
        ) : null}
      </Modal>
    </section>
  )
}
