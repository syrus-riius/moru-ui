import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Stepper, canSelectStep, normalizeStepperValue } from './stepper'
import { RingProgress, normalizeRingSections } from './ring-progress'
import { WorkflowPatternsDemo } from '../WorkflowPatternsDemo'

const steps = [
  { id: 'name', label: '이름', content: '프로젝트 이름 입력' },
  { id: 'team', label: '팀', content: '공유 설정 입력' },
  { id: 'review', label: '검토', content: '입력한 내용 검토' },
]
const tags = (markup: string, element: string) => [...markup.matchAll(new RegExp(`<${element}\\b[^>]*>`, 'g'))].map((match) => match[0])
const attribute = (tag: string, name: string) => tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1]

describe('Stepper navigation policy', () => {
  it('bounds indices and preserves the completed sequence sentinel', () => {
    expect([-2, 1.8, 3, 4, NaN, Infinity].map((value) => normalizeStepperValue(value, 3))).toEqual([0, 1, 3, 3, 0, 0])
  })
  it('prevents skipping unvalidated steps by default', () => {
    expect([0, 1, 2].map((index) => canSelectStep(index, 1, 3))).toEqual([true, true, false])
  })
  it('allows future selection only when the host explicitly enables it', () => {
    expect(canSelectStep(2, 0, 3, { allowNextStepsSelect: true })).toBe(true)
  })
  it('never enables a disabled item or a disabled sequence', () => {
    expect(canSelectStep(1, 0, 3, { itemDisabled: true, allowNextStepsSelect: true })).toBe(false)
    expect(canSelectStep(1, 0, 3, { disabled: true, allowNextStepsSelect: true })).toBe(false)
    expect(canSelectStep(0, 2, 3, { allowStepSelect: false })).toBe(false)
  })
  it('ignores nonexistent and fractional step selections', () => {
    expect([-1, 3, 1.2, NaN].map((index) => canSelectStep(index, 3, 3, { allowNextStepsSelect: true }))).toEqual([false, false, false, false])
  })
  it('allows revisiting every available step after completion', () => {
    expect([0, 1, 2].map((index) => canSelectStep(index, 3, 3))).toEqual([true, true, true])
  })
})

describe('Stepper accessible sequence contracts', () => {
  it('exposes exactly one current step in an ordered sequence and a named panel', () => {
    const markup = renderToStaticMarkup(<Stepper items={steps} value={1} aria-label="프로젝트 설정" />)
    const buttons = tags(markup, 'button')
    expect(markup).toContain('<ol class="ui-stepper-list" aria-label="프로젝트 설정">')
    expect(buttons.filter((tag) => tag.includes('aria-current="step"'))).toHaveLength(1)
    expect(buttons[1]).toContain('aria-current="step"')
    const panel = tags(markup, 'div').find((tag) => attribute(tag, 'id') === attribute(buttons[1], 'aria-controls'))
    expect(panel).toContain('role="region"')
    expect(attribute(panel!, 'aria-labelledby')).toBe(attribute(buttons[1], 'id'))
    expect(panel).not.toContain('hidden=""')
    expect(tags(markup, 'div').filter((tag) => tag.includes('hidden=""'))).toHaveLength(2)
    expect(markup).not.toContain('role="tab"')
  })
  it('uses native button disabled semantics for locked future steps', () => {
    const markup = renderToStaticMarkup(<Stepper items={steps} defaultValue={0} />)
    const buttons = tags(markup, 'button')
    expect(buttons[0]).not.toContain('disabled=""')
    expect(buttons.slice(1).every((tag) => tag.includes('disabled=""'))).toBe(true)
  })
  it('supports initial uncontrolled state and controlled state takes precedence', () => {
    const uncontrolled = tags(renderToStaticMarkup(<Stepper items={steps} defaultValue={2} />), 'button')
    const controlled = tags(renderToStaticMarkup(<Stepper items={steps} value={1} defaultValue={2} />), 'button')
    expect(uncontrolled[2]).toContain('aria-current="step"')
    expect(controlled[1]).toContain('aria-current="step"')
  })
  it('announces errors and completion with text as well as icons', () => {
    expect(renderToStaticMarkup(<Stepper items={[{ ...steps[0], error: true }]} />)).toContain('오류 · 확인 필요')
    const complete = renderToStaticMarkup(<Stepper items={steps} value={3} completedContent="입력 완료" />)
    expect(complete).toContain('role="status">입력 완료')
    expect(complete).not.toContain('aria-current="step"')
  })
  it('does not present empty lists as a successful completion', () => {
    const markup = renderToStaticMarkup(<Stepper items={[]} />)
    expect(markup).toContain('등록된 단계가 없어요.')
    expect(markup).not.toContain('모든 단계를 완료했어요.')
  })
  it('does not point aria-controls at a missing content panel', () => {
    const markup = renderToStaticMarkup(<Stepper items={[{ id: 'one', label: '단계' }]} />)
    expect(tags(markup, 'button')[0]).not.toContain('aria-controls')
  })
})

describe('RingProgress value normalization', () => {
  it('caps cumulative section values so segments cannot overlap', () => {
    const data = normalizeRingSections([{ label: '문서', value: 80 }, { label: '미디어', value: 50 }, { label: '기타', value: 10 }])
    expect(data.map((section) => section.value)).toEqual([80, 20, 0])
    expect(data.reduce((total, section) => total + section.percent, 0)).toBe(100)
  })
  it('supports units other than percent with a shared maximum', () => {
    const data = normalizeRingSections([{ label: '완료', value: 30 }, { label: '진행', value: 20 }], 200)
    expect(data.map((section) => section.percent)).toEqual([15, 10])
  })
  it('treats malformed and negative sections as zero without consuming capacity', () => {
    const data = normalizeRingSections([{ label: '음수', value: -10 }, { label: '없음', value: NaN }, { label: '무한대', value: Infinity }, { label: '정상', value: 50 }])
    expect(data.map((section) => section.value)).toEqual([0, 0, 0, 50])
  })
  it('uses a safe default for invalid maximum values', () => {
    expect([0, -1, NaN, Infinity].map((max) => normalizeRingSections([{ label: '진행', value: 25 }], max)[0].percent)).toEqual([25, 25, 25, 25])
  })
  it('accepts empty data without producing a fabricated section', () => {
    expect(normalizeRingSections([])).toEqual([])
  })
})

describe('RingProgress accessible visual and textual values', () => {
  it('exposes a named single progressbar with a bounded numeric value', () => {
    const markup = renderToStaticMarkup(<RingProgress label="프로젝트 준비" value={150} />)
    const diagram = tags(markup, 'div').find((tag) => tag.includes('role="progressbar"'))!
    expect(diagram).toContain('aria-label="프로젝트 준비"')
    expect(diagram).toContain('aria-valuenow="100"')
    expect(diagram).toContain('aria-valuemax="100"')
    expect(diagram).toContain('aria-valuetext="100 / 100 · 100%"')
    expect(markup).toContain(`id="${attribute(diagram, 'aria-describedby')}"`)
  })
  it('exposes composition as a named image and readable values rather than a fake progressbar', () => {
    const markup = renderToStaticMarkup(<RingProgress label="저장 공간" sections={[{ label: '문서', value: 80 }, { label: '미디어', value: 50 }]} />)
    expect(markup).toContain('role="img" aria-label="저장 공간"')
    expect(markup).not.toContain('role="progressbar"')
    expect(markup).toContain('20 / 100')
    expect(markup).toContain('미디어')
    expect(markup).toContain('stroke-dashoffset="-80"')
    expect(markup).not.toContain('stroke-dasharray="50 50"')
  })
  it('preserves the screen reader data alternative when the visible legend is hidden', () => {
    const markup = renderToStaticMarkup(<RingProgress label="목표" value={33} showLegend={false} />)
    expect(markup).toContain('class="ui-workflow-sr-only"')
    expect(markup).toContain('33 / 100')
  })
  it('renders a named empty state without NaN geometry', () => {
    const markup = renderToStaticMarkup(<RingProgress label="업로드 구성" sections={[]} size={NaN} thickness={Infinity} />)
    expect(markup).toContain('표시할 항목이 없어요. 0%')
    expect(markup).not.toContain('NaN')
    expect(markup).not.toContain('Infinity')
  })
  it('keeps the SVG decorative so its circles do not duplicate the accessible values', () => {
    const markup = renderToStaticMarkup(<RingProgress label="목표" value={50} />)
    expect(tags(markup, 'svg')[0]).toContain('aria-hidden="true"')
    expect(tags(markup, 'svg')[0]).toContain('focusable="false"')
  })
  it('renders the workflow demos with actual form inputs and textual chart alternatives', () => {
    const stepper = renderToStaticMarkup(<WorkflowPatternsDemo id="stepper" disabled={false} size="md" />)
    const ring = renderToStaticMarkup(<WorkflowPatternsDemo id="ring-progress" disabled={false} size="md" />)
    expect(stepper).toContain('프로젝트 이름')
    expect(stepper).toContain('Moru Studio')
    expect(stepper).toContain('다음')
    expect(ring).toContain('이번 주 목표')
    expect(ring).toContain('68 / 100')
  })
})
