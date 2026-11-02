import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Field } from './field'
import { Checkbox } from './checkbox'
import { RadioGroup } from './radio-group'
import { Slider } from './slider'
import { Switch } from './switch'

function escapePattern(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function openingTags(markup: string, element: string) {
  return markup.match(new RegExp(`<${element}\\b[^>]*>`, 'g')) ?? []
}

function attribute(tag: string, name: string) {
  const match = tag.match(new RegExp(`(?:^|\\s)${escapePattern(name)}(?:="([^"]*)")?(?=\\s|/?>|$)`))
  return match ? match[1] ?? '' : undefined
}

function roleTag(markup: string, role: string) {
  const tag = (markup.match(/<[a-z][^>]*>/g) ?? []).find((candidate) => attribute(candidate, 'role') === role)
  expect(tag, `Expected an element with role ${role}`).toBeDefined()
  return tag!
}

function textById(markup: string, id: string | undefined) {
  expect(id, 'Expected a nonempty accessible text reference').toBeTruthy()
  return markup.match(new RegExp(`\\bid="${escapePattern(id!)}"[^>]*>([^<]*)<`))?.[1]
}

describe('Switch accessibility and native form contract', () => {
  it('separates the visible label from its description', () => {
    const markup = renderToStaticMarkup(<Switch label="알림 받기" description="새 소식을 이메일로 보냅니다." />)
    const control = roleTag(markup, 'switch')
    const labelId = attribute(control, 'aria-labelledby')
    const descriptionId = attribute(control, 'aria-describedby')

    expect(textById(markup, labelId)).toBe('알림 받기')
    expect(textById(markup, descriptionId)).toBe('새 소식을 이메일로 보냅니다.')
    expect(labelId).not.toBe(descriptionId)
  })

  it('lets an explicit aria-label override the visible label', () => {
    const markup = renderToStaticMarkup(<Switch label="알림" description="이메일 알림" aria-label="이메일 알림 켜기" />)
    const control = roleTag(markup, 'switch')

    expect(attribute(control, 'aria-label')).toBe('이메일 알림 켜기')
    expect(attribute(control, 'aria-labelledby')).toBeUndefined()
    expect(textById(markup, attribute(control, 'aria-describedby'))).toBe('이메일 알림')
  })

  it.each([
    { props: { checked: true }, checked: true, mode: 'controlled checked' },
    { props: { checked: false }, checked: false, mode: 'controlled unchecked' },
    { props: { defaultChecked: true }, checked: true, mode: 'uncontrolled checked' },
    { props: { defaultChecked: false }, checked: false, mode: 'uncontrolled unchecked' },
  ])('projects $mode state to a named checkbox', ({ props, checked }) => {
    const markup = renderToStaticMarkup(<Switch {...props} label="알림" name="notifications" value="enabled" />)
    const input = openingTags(markup, 'input').find((tag) => attribute(tag, 'type') === 'checkbox')!

    expect(input).toBeDefined()
    expect(attribute(input, 'name')).toBe('notifications')
    expect(attribute(input, 'value')).toBe('enabled')
    expect(attribute(input, 'checked') !== undefined).toBe(checked)
    expect(attribute(roleTag(markup, 'switch'), 'aria-checked')).toBe(String(checked))
  })

  it('disables the native form input and the accessible switch together', () => {
    const markup = renderToStaticMarkup(<Switch label="알림" name="notifications" disabled defaultChecked />)
    const input = openingTags(markup, 'input')[0]!

    expect(attribute(input, 'disabled')).toBeDefined()
    expect(attribute(roleTag(markup, 'switch'), 'aria-disabled')).toBe('true')
  })

  it('merges Field descriptions and errors with its own description', () => {
    const markup = renderToStaticMarkup(
      <Field label="서비스 알림" description="설정은 언제든 바꿀 수 있습니다." error="동의가 필요합니다.">
        <Switch label="수신 동의" description="이메일로 발송됩니다." name="consent" />
      </Field>,
    )
    const control = roleTag(markup, 'switch')
    const descriptionIds = attribute(control, 'aria-describedby')?.split(' ') ?? []

    expect(attribute(control, 'aria-invalid')).toBe('true')
    expect(descriptionIds.map((id) => textById(markup, id))).toEqual([
      '설정은 언제든 바꿀 수 있습니다.', '동의가 필요합니다.', '이메일로 발송됩니다.',
    ])
  })
})

describe('RadioGroup accessibility and native form contract', () => {
  const items = [
    { value: 'standard', label: '기본', description: '일반적인 작업 환경' },
    { value: 'compact', label: '간결', description: '촘촘한 정보 밀도' },
    { value: 'comfortable', label: '여유', disabled: true },
  ]

  it('names the group and each option independently of the option description', () => {
    const markup = renderToStaticMarkup(<RadioGroup aria-label="밀도" items={items} name="density" defaultValue="standard" />)
    const options = openingTags(markup, 'span').filter((tag) => attribute(tag, 'role') === 'radio')

    expect(attribute(roleTag(markup, 'radiogroup'), 'aria-label')).toBe('밀도')
    expect(options).toHaveLength(3)
    expect(options.map((tag) => textById(markup, attribute(tag, 'aria-labelledby')))).toEqual(['기본', '간결', '여유'])
    expect(textById(markup, attribute(options[0], 'aria-describedby'))).toBe('일반적인 작업 환경')
  })

  it.each(['controlled', 'uncontrolled'] as const)('projects a single %s value into the named native radios', (mode) => {
    const props = mode === 'controlled' ? { value: 'compact' } : { defaultValue: 'compact' }
    const markup = renderToStaticMarkup(<RadioGroup {...props} aria-label="밀도" items={items} name="density" />)
    const inputs = openingTags(markup, 'input').filter((tag) => attribute(tag, 'type') === 'radio')

    expect(inputs).toHaveLength(3)
    expect(inputs.map((tag) => attribute(tag, 'name'))).toEqual(['density', 'density', 'density'])
    expect(inputs.filter((tag) => attribute(tag, 'checked') !== undefined).map((tag) => attribute(tag, 'value'))).toEqual(['compact'])
    expect(attribute(inputs.find((tag) => attribute(tag, 'value') === 'comfortable')!, 'disabled')).toBeDefined()
  })

  it('disables every option when the group is disabled', () => {
    const markup = renderToStaticMarkup(<RadioGroup aria-label="밀도" items={items} name="density" disabled />)
    const inputs = openingTags(markup, 'input').filter((tag) => attribute(tag, 'type') === 'radio')

    expect(attribute(roleTag(markup, 'radiogroup'), 'aria-disabled')).toBe('true')
    expect(inputs).toHaveLength(3)
    expect(inputs.every((tag) => attribute(tag, 'disabled') !== undefined)).toBe(true)
  })

  it('exposes the shared Field error on its group and each option', () => {
    const markup = renderToStaticMarkup(
      <Field label="화면 밀도" error="한 가지를 골라주세요.">
        <RadioGroup items={items} name="density" />
      </Field>,
    )
    const group = roleTag(markup, 'radiogroup')
    const options = openingTags(markup, 'span').filter((tag) => attribute(tag, 'role') === 'radio')

    expect(attribute(group, 'aria-invalid')).toBe('true')
    expect(options.every((tag) => attribute(tag, 'aria-invalid') === 'true')).toBe(true)
    expect(textById(markup, attribute(options[2], 'aria-describedby'))).toBe('한 가지를 골라주세요.')
  })

  it('gives every option a unique control ID when nested inside a Field', () => {
    const markup = renderToStaticMarkup(
      <Field label="화면 밀도" description="작업에 맞는 밀도를 골라주세요.">
        <RadioGroup items={items} name="density" defaultValue="standard" />
      </Field>,
    )
    const inputIds = openingTags(markup, 'input')
      .filter((tag) => attribute(tag, 'type') === 'radio')
      .map((tag) => attribute(tag, 'id'))
    const allIds = (markup.match(/<[a-z][^>]*>/g) ?? [])
      .map((tag) => attribute(tag, 'id'))
      .filter((id) => id !== undefined)

    expect(inputIds).toHaveLength(items.length)
    expect(inputIds.every(Boolean)).toBe(true)
    expect(new Set(inputIds).size).toBe(items.length)
    expect(new Set(allIds).size).toBe(allIds.length)
  })
})

describe('Slider accessibility and native form contract', () => {
  it.each(['controlled', 'uncontrolled'] as const)('renders one named numeric input with %s value and explicit bounds', (mode) => {
    const props = mode === 'controlled' ? { value: 2.5 } : { defaultValue: 2.5 }
    const markup = renderToStaticMarkup(<Slider {...props} aria-label="행간" name="lineHeight" min={1} max={4} step={0.25} />)
    const inputs = openingTags(markup, 'input').filter((tag) => attribute(tag, 'type') === 'range')

    expect(inputs).toHaveLength(1)
    expect(attribute(inputs[0], 'name')).toBe('lineHeight')
    expect(attribute(inputs[0], 'value')).toBe('2.5')
    expect(attribute(inputs[0], 'min')).toBe('1')
    expect(attribute(inputs[0], 'max')).toBe('4')
    expect(attribute(inputs[0], 'step')).toBe('0.25')
    expect(attribute(inputs[0], 'aria-label')).toBe('행간')
  })

  it('exposes a visible slider label and an optional output', () => {
    const markup = renderToStaticMarkup(<Slider label="볼륨" defaultValue={40} showValue />)
    const label = openingTags(markup, 'div').find((tag) => attribute(tag, 'class') === 'ui-slider-label')!

    // Base UI associates Slider.Label after hydration; its visible text is available in SSR.
    expect(textById(markup, attribute(label, 'id'))).toBe('볼륨')
    expect(markup).toMatch(/<output\b[^>]*>40<\/output>/)
  })

  it('keeps a disabled slider out of native form submission', () => {
    const markup = renderToStaticMarkup(<Slider aria-label="볼륨" name="volume" disabled defaultValue={40} />)
    const input = openingTags(markup, 'input').find((tag) => attribute(tag, 'type') === 'range')!

    expect(attribute(input, 'disabled')).toBeDefined()
  })

  it('connects its input to the Field label, description, and error', () => {
    const markup = renderToStaticMarkup(
      <Field label="볼륨" description="0부터 100까지 조절합니다." error="볼륨을 확인해주세요.">
        <Slider name="volume" defaultValue={40} />
      </Field>,
    )
    const input = openingTags(markup, 'input').find((tag) => attribute(tag, 'type') === 'range')!
    const descriptionIds = attribute(input, 'aria-describedby')?.split(' ') ?? []
    const label = openingTags(markup, 'label')[0]!

    expect(textById(markup, attribute(label, 'id'))).toBe('볼륨')
    expect(attribute(label, 'for')).toBe(attribute(input, 'id'))
    expect(attribute(input, 'aria-invalid')).toBe('true')
    expect(descriptionIds.map((id) => textById(markup, id))).toEqual(['0부터 100까지 조절합니다.', '볼륨을 확인해주세요.'])
  })
})

describe('Checkbox accessible name', () => {
  it('keeps its help text out of its name and announces it as a description', () => {
    const markup = renderToStaticMarkup(<Checkbox label="이메일 알림" description="새 소식을 보내드려요." />)
    const control = roleTag(markup, 'checkbox')
    expect(textById(markup, attribute(control, 'aria-labelledby'))).toBe('이메일 알림')
    expect(textById(markup, attribute(control, 'aria-describedby'))).toBe('새 소식을 보내드려요.')
  })
  it('preserves the caller’s accessible name override', () => {
    const markup = renderToStaticMarkup(<Checkbox label="알림" aria-label="이메일 알림 수신 동의" />)
    const control = roleTag(markup, 'checkbox')
    expect(attribute(control, 'aria-label')).toBe('이메일 알림 수신 동의')
    expect(attribute(control, 'aria-labelledby')).toBeUndefined()
  })
})
