import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Attachment, formatFileSize, getFileExtension } from './attachment'
import { Bubble, BubbleContent, BubbleReactions } from './bubble'
import { CodeBlock } from './code-block'
import { Marker, MarkerContent, MarkerIcon } from './marker'
import { Message, MessageContent, MessageHeader } from './message'
import { MessageScroller, MessageScrollerItem, isMessageScrollerAtEnd } from './message-scroller'
import { Questionnaire } from './questionnaire'
import { questionnaireAnswerLabel, validateQuestionnaireAnswer, type QuestionnaireQuestion } from './questionnaire-utils'
import { Trace, formatTraceDuration } from './trace'

const single: QuestionnaireQuestion = { id: 'kind', title: '종류', type: 'single', required: true, options: [{ value: 'one', label: '첫 번째' }, { value: 'two', label: '두 번째', disabled: true }] }
const multiple: QuestionnaireQuestion = { id: 'colors', title: '색상', type: 'multiple', options: [{ value: 'blue', label: '파랑' }, { value: 'green', label: '초록' }] }

describe('Attachment file metadata', () => {
  it.each([[0, '0 B'], [1023, '1023 B'], [1024, '1 KB'], [1536, '1.5 KB'], [1048576, '1 MB']] as const)('formats %s bytes with a readable unit', (bytes, expected) => expect(formatFileSize(bytes, 'en-US')).toBe(expected))
  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1])('does not expose invalid file size %s', (size) => expect(formatFileSize(size)).toBe('크기 알 수 없음'))
  it.each([['guide.Pdf', 'PDF'], ['archive.tar.gz', 'GZ'], ['README', 'FILE'], ['.gitignore', 'FILE'], ['name.', 'FILE']] as const)('reads the extension of %s', (file, expected) => expect(getFileExtension(file)).toBe(expected))
  it('exposes clamped progress, file name, size and independently named remove action', () => {
    const markup = renderToStaticMarkup(<Attachment fileName="guide.pdf" fileSize={1024} status="uploading" progress={140} onRemove={() => {}} />)
    expect(markup).toContain('aria-busy="true"')
    expect(markup).toContain('value="100"')
    expect(markup).toContain('aria-label="guide.pdf 제거"')
    expect(markup).toContain('PDF · 1 KB')
  })
  it('keeps unknown upload progress indeterminate and announces failures', () => {
    const markup = renderToStaticMarkup(<Attachment fileName="draft.txt" status="uploading" progress={Number.NaN} />)
    expect(markup).not.toContain('value=')
    expect(markup).not.toContain('NaN')
    expect(renderToStaticMarkup(<Attachment fileName="draft.txt" status="error" />)).toContain('role="alert"')
  })
})

describe('Conversation composition contracts', () => {
  it('renders user supplied text as text instead of executable markup', () => {
    const markup = renderToStaticMarkup(<Message aria-label="민지의 메시지"><MessageContent><MessageHeader>민지</MessageHeader><Bubble><BubbleContent>{'<script>alert(1)</script>'}</BubbleContent></Bubble></MessageContent></Message>)
    expect(markup).toContain('<article')
    expect(markup).toContain('aria-label="민지의 메시지"')
    expect(markup).toContain('&lt;script&gt;')
    expect(markup).not.toContain('<script>')
  })
  it('exposes the reaction group once, and hides decorative marker icons', () => {
    expect(renderToStaticMarkup(<BubbleReactions />)).toContain('aria-label="메시지 반응"')
    const markup = renderToStaticMarkup(<Marker variant="separator" role="status"><MarkerIcon>✓</MarkerIcon><MarkerContent>완료</MarkerContent></Marker>)
    expect(markup).toContain('role="status"')
    expect(markup).toContain('aria-hidden="true"')
    expect(markup).toContain('>완료</span>')
  })
  it('labels the scrolling log and retains stable message identifiers', () => {
    const markup = renderToStaticMarkup(<MessageScroller aria-label="팀 대화"><MessageScrollerItem messageId="stable-1">안녕하세요.</MessageScrollerItem></MessageScroller>)
    expect(markup).toContain('role="log"')
    expect(markup).toContain('aria-label="팀 대화"')
    expect(markup).toContain('data-message-id="stable-1"')
  })
  it.each([[0, 200, 300, true], [400, 700, 300, true], [375, 700, 300, false], [376, 700, 300, true], [-20, 700, 300, false]] as const)('detects live edge at %s/%s with viewport %s', (top, height, viewport, expected) => expect(isMessageScrollerAtEnd(top, height, viewport)).toBe(expected))
})

describe('CodeBlock copy and reading contract', () => {
  it('keeps code LTR, keyboard scrollable and labels its source', () => {
    const markup = renderToStaticMarkup(<CodeBlock filename="app.tsx" language="tsx" value={'const x = "<div>"\n\nreturn x'} lineNumbers />)
    expect(markup).toContain('dir="ltr"')
    expect(markup).toContain('tabindex="0"')
    expect(markup).toContain('aria-label="코드 복사"')
    expect(markup).toContain('&lt;div&gt;')
    expect(markup.match(/class="ui-code-block-line"/g)).toHaveLength(3)
    expect(markup.match(/class="ui-code-block-number" aria-hidden="true"/g)).toHaveLength(3)
  })
  it('can omit the copy action and highlight caller selected lines', () => {
    const markup = renderToStaticMarkup(<CodeBlock value={'one\ntwo'} copyable={false} highlightLines={[2]} />)
    expect(markup).not.toContain('aria-label="코드 복사"')
    expect(markup).toContain('data-highlighted="true"')
    expect(markup).not.toContain('data-line-numbers="true"')
  })
})

describe('Questionnaire answer validation', () => {
  it('requires a value for mandatory questions without restricting optional questions', () => {
    expect(validateQuestionnaireAnswer(single, undefined)).toBeTruthy()
    expect(validateQuestionnaireAnswer(single, '  ')).toBeTruthy()
    expect(validateQuestionnaireAnswer(multiple, [])).toBeUndefined()
    expect(validateQuestionnaireAnswer(single, 'one')).toBeUndefined()
  })
  it('rejects disabled and unknown values, including restored answers', () => {
    expect(validateQuestionnaireAnswer(single, 'two')).toBeTruthy()
    expect(validateQuestionnaireAnswer(single, 'missing')).toBeTruthy()
    expect(validateQuestionnaireAnswer(multiple, ['blue', 'missing'])).toBeTruthy()
  })
  it('guards the expected answer shape for each question type', () => {
    expect(validateQuestionnaireAnswer(single, ['one'])).toBeTruthy()
    expect(validateQuestionnaireAnswer(multiple, 'blue')).toBeTruthy()
    expect(validateQuestionnaireAnswer({ id: 'note', title: '메모', type: 'text' }, ['a'])).toBeTruthy()
  })
  it('lets validation compare related answers', () => {
    const confirm: QuestionnaireQuestion = { id: 'confirm', title: '확인', type: 'text', validate: (answer, answers) => answer !== answers.name ? '이름이 일치하지 않아요.' : undefined }
    expect(validateQuestionnaireAnswer(confirm, 'Moru', { name: 'Moru' })).toBeUndefined()
    expect(validateQuestionnaireAnswer(confirm, 'Other', { name: 'Moru' })).toBe('이름이 일치하지 않아요.')
  })
  it('summarizes choice labels, trimmed freeform text and explicit skips', () => {
    expect(questionnaireAnswerLabel(single, 'one')).toBe('첫 번째')
    expect(questionnaireAnswerLabel(multiple, ['green', 'blue'])).toBe('초록, 파랑')
    expect(questionnaireAnswerLabel({ id: 'n', title: '이름', type: 'text' }, '  Moru  ')).toBe('Moru')
    expect(questionnaireAnswerLabel(multiple, [])).toBe('건너뜀')
  })
  it('renders one active semantic fieldset and named progress', () => {
    const markup = renderToStaticMarkup(<Questionnaire questions={[single, multiple]} />)
    expect(markup.match(/<fieldset/g)).toHaveLength(1)
    expect(markup).toContain('<legend')
    expect(markup).toContain('aria-label="질문 진행 상황"')
    expect(markup).not.toContain('>색상<')
  })
  it('provides an accessible empty result when there are no questions', () => expect(renderToStaticMarkup(<Questionnaire questions={[]} />)).toContain('등록된 질문이 없어요.'))
})

describe('Trace statuses and disclosures', () => {
  it.each([[0, '0ms'], [320, '320ms'], [1520, '1.5초'], [61000, '1분 1초'], [-1, '시간 알 수 없음'], [Number.NaN, '시간 알 수 없음']] as const)('formats %s elapsed milliseconds', (duration, expected) => expect(formatTraceDuration(duration)).toBe(expected))
  it('uses real disclosure buttons with an identified panel and textual statuses', () => {
    const markup = renderToStaticMarkup(<Trace defaultExpanded={['read']} items={[{ id: 'read', title: '토큰 확인', status: 'complete', durationMs: 320, details: '확인한 항목' }, { id: 'check', title: '검증', status: 'error', details: '실패 이유' }]} />)
    expect(markup).toContain('aria-expanded="true"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).toContain('aria-controls=')
    expect(markup).toContain('hidden=""')
    expect(markup).toContain('>완료</span>')
    expect(markup).toContain('>오류</span>')
  })
})
