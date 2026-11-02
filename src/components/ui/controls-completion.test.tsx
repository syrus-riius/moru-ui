import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AspectRatio } from './aspect-ratio'
import { Button } from './button'
import { ButtonGroup } from './button-group'
import { DirectionProvider } from './direction-provider'
import { Field } from './field'
import { Input } from './input'
import { InputGroup, InputGroupAddon, InputGroupInput } from './input-group'
import { InputOTP } from './input-otp'
import { insertOTP, normalizeOTP, normalizeOTPLength } from './input-otp-utils'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from './item'
import { Kbd } from './kbd'
import { Label } from './label'
import { NativeSelect } from './native-select'
import { Spinner } from './spinner'
import { Toggle } from './toggle'
import { CompletionControlsDemo } from '../CompletionControlsDemo'
import { controlsComponents } from '../completion-controls-catalog'

function tags(markup: string, element: string) { return [...markup.matchAll(new RegExp(`<${element}\\b[^>]*>`, 'g'))].map((match) => match[0]) }
function attribute(tag: string, name: string) { return tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1] }

describe('OTP normalization and native paste editing', () => {
  it('keeps leading zeros while removing separators and nonnumeric characters', () => { expect(normalizeOTP('00 12-34a')).toBe('001234') })
  it('truncates overflow after normalization, allowing formatted clipboard codes', () => { expect(insertOTP('', '123 456 789', 0, 0)).toEqual({ value: '123456', caret: 6 }) })
  it('replaces only selected digits and preserves the unselected suffix', () => { expect(insertOTP('123456', '98', 2, 4)).toEqual({ value: '129856', caret: 4 }) })
  it('keeps the cursor at the inserted digits when inserting in the middle', () => { expect(insertOTP('1234', '00', 1, 1)).toEqual({ value: '100234', caret: 3 }) })
  it('bounds stale selections and caps the resulting length', () => { expect(insertOTP('12', '345678', 99, 120, 4)).toEqual({ value: '1234', caret: 4 }) })
  it('treats nonnumeric clipboard contents as an empty replacement', () => { expect(insertOTP('123456', 'abc', 1, 3)).toEqual({ value: '1456', caret: 1 }) })
  it('bounds length and handles invalid numeric configuration', () => { expect([normalizeOTPLength(0), normalizeOTPLength(20), normalizeOTPLength(4.9), normalizeOTPLength(NaN)]).toEqual([1, 12, 4, 6]) })
})

describe('OTP form and accessibility contracts', () => {
  it('exposes one real input with a stable submitted value and native autofill', () => {
    const markup = renderToStaticMarkup(<InputOTP name="verification" defaultValue="012 345" aria-label="인증 번호" required />)
    const inputs = tags(markup, 'input')
    expect(inputs).toHaveLength(1)
    expect(attribute(inputs[0], 'value')).toBe('012345')
    expect(attribute(inputs[0], 'name')).toBe('verification')
    expect(attribute(inputs[0], 'inputMode')).toBe('numeric')
    expect(attribute(inputs[0], 'autoComplete')).toBe('one-time-code')
    expect(attribute(inputs[0], 'pattern')).toBe('[0-9]{6}')
    expect(inputs[0]).toContain('required=""')
    expect(markup).toContain('aria-hidden="true"')
  })
  it('connects Field label, helper and error to the editable input', () => {
    const markup = renderToStaticMarkup(<Field label="인증 번호" description="숫자 6자리" error="다시 확인하세요."><InputOTP /></Field>)
    const input = tags(markup, 'input')[0]
    expect(attribute(input, 'id')).toBeTruthy()
    expect(markup).toContain(`for="${attribute(input, 'id')}"`)
    expect(attribute(input, 'aria-describedby')?.split(' ')).toHaveLength(2)
    expect(attribute(input, 'aria-invalid')).toBe('true')
  })
  it('preserves controlled zero-prefixed values and native disabled submission behavior', () => {
    const markup = renderToStaticMarkup(<InputOTP value="000123" disabled name="code" />)
    expect(tags(markup, 'input')[0]).toContain('disabled=""')
    expect(attribute(tags(markup, 'input')[0], 'value')).toBe('000123')
  })
})

describe('Native Select form contracts', () => {
  it('keeps browser-native choices, stable option values and disabled options', () => {
    const markup = renderToStaticMarkup(<NativeSelect name="visibility" defaultValue="team" aria-label="공개 범위" items={[{ value: 'team', label: '팀과 공유' }, { value: 'public', label: '전체 공개', disabled: true }]} />)
    expect(attribute(tags(markup, 'select')[0], 'name')).toBe('visibility')
    expect(markup).toContain('<option value="team" selected="">팀과 공유</option>')
    expect(tags(markup, 'option')[1]).toContain('disabled=""')
    expect(markup).not.toContain('role="combobox"')
  })
  it('associates with Field label and errors without a second hidden form input', () => {
    const markup = renderToStaticMarkup(<Field label="공개 범위" description="누가 볼 수 있나요?" error="선택하세요."><NativeSelect value="team" onValueChange={() => {}} items={[{ value: 'team', label: '팀' }]} /></Field>)
    const select = tags(markup, 'select')[0]
    expect(markup).toContain(`for="${attribute(select, 'id')}"`)
    expect(attribute(select, 'aria-invalid')).toBe('true')
    expect(attribute(select, 'aria-describedby')?.split(' ')).toHaveLength(2)
    expect(tags(markup, 'input')).toHaveLength(0)
  })
})

describe('Composed content and interaction contracts', () => {
  it('keeps Input Group decorations out of the labelled input semantics', () => {
    const markup = renderToStaticMarkup(<Field label="검색"><InputGroup><InputGroupAddon><svg aria-hidden="true" /></InputGroupAddon><InputGroupInput name="query" /></InputGroup></Field>)
    expect(tags(markup, 'input')).toHaveLength(1)
    expect(markup).toContain(`for="${attribute(tags(markup, 'input')[0], 'id')}"`)
  })
  it('keeps standalone labels associated with explicit controls', () => {
    const markup = renderToStaticMarkup(<><Label htmlFor="name">이름</Label><Input id="name" /></>)
    expect(markup).toContain('for="name"')
    expect(attribute(tags(markup, 'input')[0], 'id')).toBe('name')
  })
  it('uses a native pressed button for Toggle and respects disabled state', () => {
    const markup = renderToStaticMarkup(<Toggle aria-label="굵게" pressed disabled>굵게</Toggle>)
    expect(attribute(tags(markup, 'button')[0], 'aria-pressed')).toBe('true')
    expect(tags(markup, 'button')[0]).toContain('disabled=""')
  })
  it('labels a button group and preserves the native action controls', () => {
    const markup = renderToStaticMarkup(<ButtonGroup orientation="vertical" aria-label="항목 동작"><Button>저장</Button><Button>취소</Button></ButtonGroup>)
    expect(tags(markup, 'div')[0]).toContain('role="group"')
    expect(tags(markup, 'div')[0]).toContain('aria-label="항목 동작"')
    expect(tags(markup, 'button')).toHaveLength(2)
  })
  it('does not turn an Item containing a button into a nested interactive control', () => {
    const markup = renderToStaticMarkup(<Item><ItemContent><ItemTitle>프로젝트</ItemTitle><ItemDescription>함께 시작하기</ItemDescription></ItemContent><ItemActions><Button>열기</Button></ItemActions></Item>)
    expect(tags(markup, 'button')).toHaveLength(1)
    expect(tags(markup, 'div')[0]).not.toContain('role="button"')
  })
  it('exposes an accessible loading name and hides decorative SVG geometry', () => {
    const markup = renderToStaticMarkup(<Spinner label="프로젝트 불러오는 중" />)
    expect(tags(markup, 'span')[0]).toContain('role="status"')
    expect(tags(markup, 'span')[0]).toContain('aria-label="프로젝트 불러오는 중"')
    expect(tags(markup, 'svg')[0]).toContain('aria-hidden="true"')
  })
  it('keeps Kbd semantic and rejects invalid aspect ratios', () => {
    expect(renderToStaticMarkup(<Kbd>Enter</Kbd>)).toContain('<kbd')
    const markup = renderToStaticMarkup(<AspectRatio ratio={-1}>미리보기</AspectRatio>)
    expect(markup).toContain('aspect-ratio:1.7777777777777777')
  })
  it('does not emit an extra DOM element for Direction Provider', () => {
    expect(renderToStaticMarkup(<DirectionProvider direction="rtl"><span dir="rtl">مرحبا</span></DirectionProvider>)).toBe('<span dir="rtl">مرحبا</span>')
  })
  it('renders every documented control example without a browser or providers', () => {
    for (const component of controlsComponents) expect(renderToStaticMarkup(<CompletionControlsDemo id={component.id} disabled={false} size="md" />).length).toBeGreaterThan(0)
  })
})
