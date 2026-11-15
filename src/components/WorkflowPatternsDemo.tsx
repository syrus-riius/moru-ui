import { useI18n } from '../i18n'
import { useId, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import { Button } from './ui/button'
import { Field } from './ui/field'
import { Input } from './ui/input'
import { Checkbox } from './ui/checkbox'
import { Stepper } from './ui/stepper'
import { RingProgress } from './ui/ring-progress'
import type { WorkflowPatternId } from './workflow-patterns-catalog'
import './workflow-patterns-demo.css'

export interface WorkflowPatternsDemoProps {
  id: WorkflowPatternId
  disabled: boolean
  size: 'sm' | 'md' | 'lg'
  onNotice?: (message: string) => void
}

export function WorkflowPatternsDemo({ id, disabled, size, onNotice }: WorkflowPatternsDemoProps) {
  const { t } = useI18n()
  const confirmationId = useId()
  const nameRef = useRef<HTMLInputElement>(null)
  const confirmationRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [name, setName] = useState('Moru Studio')
  const [confirmed, setConfirmed] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [progress, setProgress] = useState(68)
  const [segmented, setSegmented] = useState(false)
  const nameError = attempted && active === 0 && !name.trim()
  const confirmError = attempted && active === 1 && !confirmed
  function next() {
    if (disabled) return
    if (active === 0 && !name.trim()) {
      setAttempted(true)
      nameRef.current?.focus()
      return
    }
    if (active === 1 && !confirmed) {
      setAttempted(true)
      confirmationRef.current?.querySelector<HTMLElement>('[role="checkbox"]')?.focus()
      return
    }
    setAttempted(false)
    setActive((current) => Math.min(3, current + 1))
    if (active === 2) onNotice?.(t('프로젝트 준비를 완료했어요.'))
  }
  if (id === 'stepper')
    return (
      <div className="workflow-pattern-demo">
        <Stepper
          value={active}
          onValueChange={(value) => {
            setActive(value)
            setAttempted(false)
          }}
          disabled={disabled}
          size={size}
          aria-label={t('프로젝트 시작 단계')}
          items={[
            {
              id: 'name',
              label: t('기본 정보'),
              description: t('이름 정하기'),
              error: nameError,
              content: (
                <Field
                  label={t('프로젝트 이름')}
                  description={t('한 글자 이상 입력하세요.')}
                  error={nameError ? t('프로젝트 이름을 입력하세요.') : undefined}
                >
                  <Input
                    ref={nameRef}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={disabled}
                    size={size}
                    autoComplete="off"
                  />
                </Field>
              ),
            },
            {
              id: 'team',
              label: t('공개 범위'),
              description: t('설정 확인'),
              error: confirmError,
              content: (
                <div className="workflow-pattern-demo-fields" ref={confirmationRef}>
                  <Checkbox
                    label={t('팀원에게 프로젝트를 공유할게요.')}
                    checked={confirmed}
                    onCheckedChange={setConfirmed}
                    disabled={disabled}
                    aria-invalid={confirmError || undefined}
                    aria-describedby={confirmError ? `${confirmationId}-error` : undefined}
                  />
                  {confirmError && (
                    <p
                      id={`${confirmationId}-error`}
                      className="workflow-pattern-demo-error"
                      role="alert"
                    >
                      {t('공유 설정을 확인한 뒤 다음으로 이동하세요.')}
                    </p>
                  )}
                  <p className="workflow-pattern-demo-caption">
                    {t('이 예제에서는 공유 설정 확인이 필요합니다.')}
                  </p>
                </div>
              ),
            },
            {
              id: 'review',
              label: t('최종 확인'),
              description: t('시작 준비'),
              content: (
                <div className="workflow-pattern-demo-review">
                  <span className="workflow-pattern-demo-caption">{t('만들 프로젝트')}</span>
                  <strong>{name.trim()}</strong>
                  <span>{t('팀과 공유 · 준비 완료')}</span>
                </div>
              ),
            },
          ]}
          completedContent={
            <div className="workflow-pattern-demo-review">
              <strong>{t('프로젝트 준비를 마쳤어요.')}</strong>
              <span>
                {name.trim()}
                {t('· 언제든 이전 단계로 돌아가 수정할 수 있어요.')}
              </span>
            </div>
          }
        />
        <div className="workflow-pattern-demo-actions">
          <Button
            size="sm"
            variant="secondary"
            disabled={disabled || active === 0}
            onClick={() => {
              setActive((current) => Math.max(0, current - 1))
              setAttempted(false)
            }}
          >
            <ArrowLeft />
            {t('이전')}
          </Button>
          {active < 3 ? (
            <Button size="sm" disabled={disabled} onClick={next}>
              {active === 2 ? t('완료하기') : t('다음')}
              <ArrowRight />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              disabled={disabled}
              onClick={() => {
                setActive(0)
                setAttempted(false)
                setConfirmed(false)
              }}
            >
              <RotateCcw />
              {t('다시 시작')}
            </Button>
          )}
        </div>
        <p className="workflow-pattern-demo-caption">
          {t('단계 제목은 현재·이전 단계로 이동합니다. 다음 단계는 입력을 확인한 뒤 열립니다.')}
        </p>
      </div>
    )
  return (
    <div className="workflow-pattern-demo">
      <div
        className="workflow-pattern-demo-actions"
        role="group"
        aria-label={t('원형 진행률 표시 방식')}
      >
        <Button
          size="sm"
          variant={!segmented ? 'primary' : 'secondary'}
          aria-pressed={!segmented}
          disabled={disabled}
          onClick={() => setSegmented(false)}
        >
          {t('단일 목표')}
        </Button>
        <Button
          size="sm"
          variant={segmented ? 'primary' : 'secondary'}
          aria-pressed={segmented}
          disabled={disabled}
          onClick={() => setSegmented(true)}
        >
          {t('항목별 구성')}
        </Button>
      </div>
      {segmented ? (
        <RingProgress
          label={t('팀 저장 공간')}
          max={100}
          sections={[
            { label: t('문서'), value: 42, tone: 'primary' },
            { label: t('미디어'), value: 26, tone: 'accent' },
            { label: t('기타'), value: 12, tone: 'info' },
          ]}
        />
      ) : (
        <RingProgress label={t('이번 주 목표')} value={progress} />
      )}
      {!segmented && (
        <div className="workflow-pattern-demo-actions">
          <Button
            size="sm"
            variant="secondary"
            disabled={disabled || progress <= 0}
            onClick={() => setProgress((current) => Math.max(0, current - 10))}
          >
            {t('10% 줄이기')}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={disabled || progress >= 100}
            onClick={() => setProgress((current) => Math.min(100, current + 10))}
          >
            {t('10% 늘리기')}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={disabled || progress === 68}
            onClick={() => setProgress(68)}
          >
            {t('초기화')}
          </Button>
        </div>
      )}
      <p className="workflow-pattern-demo-caption">
        {t('숫자와 항목 이름을 함께 제공해 색상 없이도 진행률을 읽을 수 있습니다.')}
      </p>
    </div>
  )
}
