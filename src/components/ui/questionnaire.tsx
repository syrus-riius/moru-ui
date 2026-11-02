import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Button } from './button'
import { Checkbox } from './checkbox'
import { Input } from './input'
import { RadioGroup } from './radio-group'
import { questionnaireAnswerLabel, validateQuestionnaireAnswer, type QuestionnaireAnswers, type QuestionnaireQuestion } from './questionnaire-utils'
import './content-completion.css'

export type { QuestionnaireAnswer, QuestionnaireAnswers, QuestionnaireOption, QuestionnaireQuestion } from './questionnaire-utils'
export interface QuestionnaireProps {
  questions: QuestionnaireQuestion[]
  value?: QuestionnaireAnswers
  defaultValue?: QuestionnaireAnswers
  onValueChange?: (answers: QuestionnaireAnswers) => void
  onComplete?: (answers: QuestionnaireAnswers) => void | Promise<void>
  submitLabel?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  'aria-label'?: string
}
export function Questionnaire({ questions, value, defaultValue = {}, onValueChange, onComplete, submitLabel = '답변 완료', disabled, size = 'md', className, 'aria-label': label = '질문에 답하기' }: QuestionnaireProps) {
  const [localAnswers, setLocalAnswers] = useState(defaultValue)
  const answers = value ?? localAnswers
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [complete, setComplete] = useState(false)
  const fieldset = useRef<HTMLFieldSetElement>(null)
  const summary = useRef<HTMLDivElement>(null)
  const needsFocus = useRef(false)
  const mounted = useRef(true)
  const id = useId()
  const activeStep = Math.min(step, Math.max(0, questions.length - 1))
  const question = questions[activeStep]
  const answer = question ? answers[question.id] : undefined
  const unavailable = disabled || busy
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  useEffect(() => {
    if (!needsFocus.current) return
    needsFocus.current = false
    if (complete) summary.current?.focus()
    else if (error) fieldset.current?.querySelector<HTMLElement>('input:not(:disabled), [role="radio"]:not([aria-disabled="true"]), button:not(:disabled)')?.focus()
    else fieldset.current?.focus()
  }, [activeStep, error, complete])
  function update(nextAnswer: string | string[] | undefined) {
    if (!question || unavailable) return
    const next = { ...answers, [question.id]: nextAnswer }
    if (value === undefined) setLocalAnswers(next)
    onValueChange?.(next); setError('')
  }
  function changeStep(next: number) { needsFocus.current = true; setError(''); setStep(next) }
  async function next() {
    if (!question || unavailable) return
    const issue = validateQuestionnaireAnswer(question, answer, answers)
    if (issue) { needsFocus.current = true; setError(issue); return }
    if (activeStep < questions.length - 1) { changeStep(activeStep + 1); return }
    const invalidIndex = questions.findIndex((item) => validateQuestionnaireAnswer(item, answers[item.id], answers))
    if (invalidIndex !== -1) {
      needsFocus.current = true; setStep(invalidIndex); setError(validateQuestionnaireAnswer(questions[invalidIndex], answers[questions[invalidIndex].id], answers) ?? '답변을 확인해 주세요.'); return
    }
    setBusy(true); setError('')
    try {
      await onComplete?.({ ...answers })
      if (mounted.current) { needsFocus.current = true; setComplete(true) }
    } catch (cause) { if (mounted.current) { needsFocus.current = true; setError(cause instanceof Error ? cause.message : '저장하지 못했어요. 다시 시도해 주세요.') } }
    finally { if (mounted.current) setBusy(false) }
  }
  if (!question) return <div className={cn('ui-questionnaire', className)} role="status">등록된 질문이 없어요.</div>
  return <div className={cn('ui-questionnaire', className)} data-size={size}>
    {complete ? <div ref={summary} tabIndex={-1} className="ui-questionnaire-summary" aria-label="답변 요약">
      <div className="ui-content-label"><Check size={16} aria-hidden="true" /> 답변을 모두 정리했어요.</div>
      <dl>{questions.map((item) => <div key={item.id}><dt>{item.title}</dt><dd>{questionnaireAnswerLabel(item, answers[item.id])}</dd></div>)}</dl>
      <Button variant="secondary" size={size} disabled={disabled} onClick={() => { needsFocus.current = true; setComplete(false); setStep(0) }}>답변 수정</Button>
    </div> : <form aria-label={label} noValidate aria-busy={busy || undefined} onSubmit={(event) => { event.preventDefault(); void next() }}>
      <div className="ui-questionnaire-progress"><span>{activeStep + 1} / {questions.length} 질문</span><progress max={questions.length} value={activeStep + 1} aria-label="질문 진행 상황" /></div>
      <fieldset ref={fieldset} tabIndex={-1} disabled={unavailable} aria-invalid={!!error || undefined} aria-describedby={`${question.description ? `${id}-description ` : ''}${error ? `${id}-error` : ''}`.trim() || undefined}>
        <legend id={`${id}-title`}>{question.title}{question.required && <span className="ui-content-caption"> (필수)</span>}</legend>
        {question.description && <p id={`${id}-description`} className="ui-content-caption">{question.description}</p>}
        {question.type === 'text' ? <Input key={question.id} aria-label={question.title} aria-invalid={!!error || undefined} aria-describedby={error ? `${id}-error` : undefined} value={typeof answer === 'string' ? answer : ''} placeholder={question.placeholder} onValueChange={update} disabled={unavailable} size={size} /> : question.type === 'single' ? <RadioGroup key={question.id} aria-labelledby={`${id}-title`} aria-invalid={!!error || undefined} aria-describedby={error ? `${id}-error` : undefined} items={question.options ?? []} value={typeof answer === 'string' ? answer : ''} onValueChange={update} disabled={unavailable} size={size} /> : <div className="ui-questionnaire-choices">{question.options?.map((option) => <Checkbox key={option.value} label={option.label} description={option.description} checked={Array.isArray(answer) && answer.includes(option.value)} onCheckedChange={(checked) => update(checked ? [...(Array.isArray(answer) ? answer : []), option.value] : (Array.isArray(answer) ? answer : []).filter((item) => item !== option.value))} disabled={unavailable || option.disabled} aria-invalid={!!error || undefined} aria-describedby={error ? `${id}-error` : undefined} size={size} />)}</div>}
        {error && <p id={`${id}-error`} className="ui-questionnaire-error" role="alert">{error}</p>}
      </fieldset>
      <div className="ui-questionnaire-actions">
        <Button type="button" variant="secondary" size={size} disabled={unavailable || activeStep === 0} onClick={() => changeStep(activeStep - 1)}><ChevronLeft size={14} aria-hidden="true" />이전</Button>
        {!question.required && activeStep < questions.length - 1 && <Button type="button" variant="ghost" size={size} disabled={unavailable} onClick={() => { update(undefined); changeStep(activeStep + 1) }}>건너뛰기</Button>}
        <Button type="submit" size={size} disabled={disabled} loading={busy}>{activeStep === questions.length - 1 ? submitLabel : <>다음<ChevronRight size={14} aria-hidden="true" /></>}</Button>
      </div>
    </form>}
  </div>
}
