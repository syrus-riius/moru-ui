import { useI18n } from '../i18n'
import { useId } from 'react'
import { Badge } from './ui/badge'
import { Card } from './ui/card'
import { Checkbox } from './ui/checkbox'
import { Progress } from './ui/progress'
import './workspace-readiness.css'

export interface ReadinessTask {
  id: string
  label: string
  done: boolean
}

interface WorkspaceReadinessProps {
  tasks: ReadinessTask[]
  onTaskChange: (id: string, done: boolean) => void
}

export function WorkspaceReadiness({ tasks, onTaskChange }: WorkspaceReadinessProps) {
  const { t } = useI18n()
  const titleId = `${useId()}-readiness-title`
  const completedCount = tasks.filter((task) => task.done).length
  const percentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0
  const complete = tasks.length > 0 && completedCount === tasks.length

  return (
    <section className="workspace-readiness" aria-labelledby={titleId}>
      <Card className="workspace-readiness-card">
        <header className="workspace-readiness-heading">
          <h3 id={titleId}>{t('워크스페이스 준비')}</h3>
          <Badge variant="secondary" tone={complete ? 'success' : undefined}>
            {t(complete ? '준비 완료' : '준비 중')}
          </Badge>
        </header>
        <p className="workspace-readiness-caption">
          {t('작은 단계부터 하나씩, 팀을 위한 공간을 준비하세요.')}
        </p>
        <div className="workspace-readiness-progress">
          <Progress label={t('시작 준비')} value={percentage} showValue />
          <span className="workspace-readiness-count" aria-live="polite" aria-atomic="true">
            {t('{completed} / {total} 단계 완료', {
              completed: completedCount,
              total: tasks.length,
            })}
          </span>
        </div>
        {tasks.length > 0 && (
          <ul className="workspace-readiness-checklist">
            {tasks.map((task) => (
              <li key={task.id} data-complete={task.done || undefined}>
                <Checkbox
                  label={t(task.label)}
                  checked={task.done}
                  onCheckedChange={(done) => onTaskChange(task.id, done)}
                />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  )
}
