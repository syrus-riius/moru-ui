export interface QuestionnaireOption { value: string; label: string; description?: string; disabled?: boolean }
export type QuestionnaireAnswer = string | string[]
export type QuestionnaireAnswers = Record<string, QuestionnaireAnswer | undefined>
export interface QuestionnaireQuestion {
  id: string
  title: string
  description?: string
  type: 'single' | 'multiple' | 'text'
  options?: QuestionnaireOption[]
  required?: boolean
  placeholder?: string
  validate?: (answer: QuestionnaireAnswer | undefined, answers: QuestionnaireAnswers) => string | undefined
}
export function validateQuestionnaireAnswer(question: QuestionnaireQuestion, answer: QuestionnaireAnswer | undefined, answers: QuestionnaireAnswers = {}) {
  const empty = answer === undefined || (typeof answer === 'string' ? !answer.trim() : answer.length === 0)
  if (empty) return question.required ? '답변을 입력하거나 선택해 주세요.' : question.validate?.(answer, answers)
  if (question.type === 'text' && typeof answer !== 'string') return '텍스트로 답변해 주세요.'
  if (question.type === 'single' && typeof answer !== 'string') return '하나의 답변을 선택해 주세요.'
  if (question.type === 'multiple' && !Array.isArray(answer)) return '목록에서 답변을 선택해 주세요.'
  if (question.type !== 'text') {
    const allowed = new Set(question.options?.filter((option) => !option.disabled).map((option) => option.value))
    const values = typeof answer === 'string' ? [answer] : answer ?? []
    if (values.some((value) => !allowed.has(value))) return '선택할 수 있는 답변을 골라 주세요.'
  }
  return question.validate?.(answer, answers)
}
export function questionnaireAnswerLabel(question: QuestionnaireQuestion, answer: QuestionnaireAnswer | undefined) {
  if (answer === undefined || (typeof answer === 'string' ? !answer.trim() : !answer.length)) return '건너뜀'
  if (question.type === 'text') return typeof answer === 'string' ? answer.trim() : ''
  const values = typeof answer === 'string' ? [answer] : answer
  return values.map((value) => question.options?.find((option) => option.value === value)?.label ?? value).join(', ')
}
