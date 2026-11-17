import { useI18n } from '../../i18n'
import { useId, useState, type MouseEvent } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CircleDot,
  FolderKanban,
  ListTodo,
  Search,
} from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { Progress } from '../ui/progress'
import { MoruHomeExamples } from './MoruHomeExamples'
import { MoruHomeBenefits } from './MoruHomeBenefits'
import { MoruTokenShowcase } from './MoruTokenShowcase'
import type { ThemeMode, ThemeTokens } from '../../theme/tokens'
import './moru-home.css'

const taskFilters = [
  { value: 'all', label: '모든 할 일', icon: ListTodo },
  { value: 'open', label: '진행 중', icon: CircleDot },
  { value: 'done', label: '완료', icon: CheckCircle2 },
] as const

type TaskFilter = (typeof taskFilters)[number]['value']
type PreviewTask = { id: string; title: string; area: string; completed: boolean }

const initialTasks: PreviewTask[] = [
  { id: 'brief', title: '출시 계획 정리', area: '기획', completed: true },
  { id: 'design', title: '홈 화면 시안 검토', area: '디자인', completed: false },
  { id: 'build', title: '설치 가이드 업데이트', area: '개발', completed: false },
  { id: 'qa', title: '모바일 화면 확인', area: '검수', completed: false },
]

type MoruHomeProps = {
  tokens: ThemeTokens
  mode: ThemeMode
  onStart: () => void
  onComponents: () => void
  onExample: () => void
  onEditTokens: (tokens: ThemeTokens) => void
}

function followLink(event: MouseEvent<HTMLAnchorElement>, navigate: () => void) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return
  event.preventDefault()
  navigate()
}

export function MoruHome({
  tokens,
  mode,
  onStart,
  onComponents,
  onExample,
  onEditTokens,
}: MoruHomeProps) {
  const { t } = useI18n()
  const previewTitle = useId()
  const [tasks, setTasks] = useState(initialTasks)
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [query, setQuery] = useState('')
  const completed = tasks.filter((task) => task.completed).length
  const search = query.trim().toLocaleLowerCase()
  const visibleTasks = tasks.filter((task) => {
    const matchesFilter = filter === 'all' || task.completed === (filter === 'done')
    return (
      matchesFilter &&
      `${task.title} ${task.area} ${t(task.title)} ${t(task.area)}`
        .toLocaleLowerCase()
        .includes(search)
    )
  })

  function setTaskCompleted(id: string, checked: boolean) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, completed: checked } : task)),
    )
  }

  return (
    <div className="moru-home">
      <MoruTokenShowcase
        tokens={tokens}
        mode={mode}
        onEditTokens={onEditTokens}
        renderIntro={() => (
          <div className="moru-home-scene">
            <section className="moru-home-hero">
              <h1>{t('단단한 기본에서, 자연스러운 경험까지.')}</h1>
              <p>
                {t('사람에게 자연스럽고, 만드는 과정은 일관되게.')}
                <br />
                {t('디자인 토큰으로 화면을 정돈하고, 세심한 동작으로 사용의 흐름을 이어갑니다.')}
              </p>
              <div className="moru-home-actions">
                <a
                  className="moru-home-action moru-home-action-primary"
                  href="#guide"
                  onClick={(event) => followLink(event, onStart)}
                >
                  {t('시작하기')}
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
                <a
                  className="moru-home-action moru-home-action-secondary"
                  href="#components"
                  onClick={(event) => followLink(event, onComponents)}
                >
                  {t('컴포넌트 둘러보기')}
                </a>
              </div>
              <ol
                className="moru-home-principles"
                aria-label={t('기본부터 디자인까지, 하나의 기준으로.')}
              >
                {['단단한 기본', '세심한 기능', '정교한 기술', '절제된 디자인'].map((principle) => (
                  <li key={principle}>{t(principle)}</li>
                ))}
              </ol>
            </section>
            <MoruHomeBenefits tokens={tokens} mode={mode} />
            <div className="moru-home-showcase-heading">
              <h2>{t('움직이는 예제로 확인하세요.')}</h2>
              <p>
                {t(
                  '같은 컴포넌트가 토큰에 맞춰 달라집니다. 직접 입력하고, 선택하고, 나만의 설정으로 이어가세요.',
                )}
              </p>
            </div>
          </div>
        )}
      >
        <MoruHomeExamples />

        <section className="moru-home-preview" aria-labelledby={previewTitle}>
          <div className="moru-home-preview-heading">
            <h2 id={previewTitle}>{t('프로젝트 미리보기')}</h2>
            <a href="#project-template" onClick={(event) => followLink(event, onExample)}>
              {t('예제 앱 열기')}
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>

          <Card className="moru-home-board">
            <div className="moru-home-board-sidebar">
              <div className="moru-home-board-project">
                <FolderKanban size={18} aria-hidden="true" />
                {t('프로젝트')}
              </div>
              <div
                className="moru-home-board-filters"
                role="group"
                aria-label={t('할 일 상태 필터')}
              >
                {taskFilters.map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    size="sm"
                    variant="ghost"
                    aria-pressed={filter === value}
                    onClick={() => setFilter(value)}
                  >
                    <Icon size={15} aria-hidden="true" />
                    {t(label)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="moru-home-board-content">
              <div className="moru-home-board-header">
                <h3>{t('제품 출시 준비')}</h3>
                <Badge variant="secondary" tone={completed === tasks.length ? 'success' : 'info'}>
                  {t(completed === tasks.length ? '완료' : '진행 중')}
                </Badge>
              </div>

              <div className="moru-home-board-grid">
                <div className="moru-home-task-panel">
                  <div className="moru-home-task-heading">
                    <h4>{t('할 일')}</h4>
                    <div className="moru-home-task-search">
                      <Search size={15} aria-hidden="true" />
                      <Input
                        type="search"
                        size="sm"
                        aria-label={t('할 일 검색')}
                        placeholder={t('할 일 검색')}
                        value={query}
                        onValueChange={setQuery}
                      />
                    </div>
                  </div>

                  {visibleTasks.length > 0 ? (
                    <ul className="moru-home-task-list">
                      {visibleTasks.map((task) => (
                        <li
                          key={task.id}
                          className="moru-home-task-row"
                          data-completed={task.completed || undefined}
                        >
                          <Checkbox
                            size="sm"
                            label={t(task.title)}
                            checked={task.completed}
                            onCheckedChange={(checked) => setTaskCompleted(task.id, checked)}
                          />
                          <span className="moru-home-task-area">{t(task.area)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="moru-home-empty" role="status">
                      {t(search ? '검색 결과가 없어요.' : '이 상태의 할 일이 없어요.')}
                    </p>
                  )}
                </div>

                <Card className="moru-home-progress-card">
                  <h4>{t('프로젝트 진행률')}</h4>
                  <p className="moru-home-progress-count" aria-live="polite">
                    {completed}
                    <span>{t(' / {total}개 완료', { total: tasks.length })}</span>
                  </p>
                  <Progress
                    aria-label={t('프로젝트 진행률')}
                    value={completed}
                    max={tasks.length}
                  />
                </Card>
              </div>
            </div>
          </Card>
        </section>
      </MoruTokenShowcase>
    </div>
  )
}
