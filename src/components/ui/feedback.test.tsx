import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Alert } from './alert'
import { Avatar } from './avatar'
import { Progress } from './progress'
import { Separator } from './separator'
import { Skeleton } from './skeleton'

/** Inspect the public HTML contract without depending on class names or CSS. */
function rootAttributes(markup: string) {
  const openingTag = markup.match(/^<(?:div|span)\b[^>]*>/)?.[0]
  if (!openingTag) throw new Error(`Expected a component root, received: ${markup}`)
  return Object.fromEntries([...openingTag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]))
}

describe('Progress value and accessible status', () => {
  it('starts at zero with a finite default range and accessible name', () => {
    const attrs = rootAttributes(renderToStaticMarkup(<Progress locale="en-US" />))
    expect(attrs).toMatchObject({ role: 'progressbar', 'aria-label': '진행률', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0', 'aria-valuetext': '0%' })
  })

  it.each([
    { value: -20, expected: '0', text: '0%' },
    { value: 125, expected: '100', text: '100%' },
  ])('clamps $value so the accessible value stays inside the range', ({ value, expected, text }) => {
    const attrs = rootAttributes(renderToStaticMarkup(<Progress value={value} locale="en-US" />))
    expect(attrs['aria-valuenow']).toBe(expected)
    expect(attrs['aria-valuetext']).toBe(text)
  })

  it('normalizes a custom maximum consistently for visible and accessible percentages', () => {
    const markup = renderToStaticMarkup(<Progress value={2} max={8} showValue locale="en-US" />)
    expect(rootAttributes(markup)).toMatchObject({ 'aria-valuemax': '8', 'aria-valuenow': '2', 'aria-valuetext': '25%' })
    expect(markup).toContain('>25%</span>')
  })

  it('clamps completion to a custom maximum', () => {
    const attrs = rootAttributes(renderToStaticMarkup(<Progress value={14} max={8} locale="en-US" />))
    expect(attrs).toMatchObject({ 'aria-valuemax': '8', 'aria-valuenow': '8', 'aria-valuetext': '100%' })
  })

  it.each([0, -10, Number.NaN, Number.POSITIVE_INFINITY])('restores a valid range when max=%s', (max) => {
    const attrs = rootAttributes(renderToStaticMarkup(<Progress value={45} max={max} locale="en-US" />))
    expect(attrs).toMatchObject({ 'aria-valuemax': '100', 'aria-valuenow': '45', 'aria-valuetext': '45%' })
  })

  it.each([null, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('does not claim a numeric percentage when value=%s is indeterminate', (value) => {
    const markup = renderToStaticMarkup(<Progress value={value} showValue locale="en-US" />)
    const attrs = rootAttributes(markup)
    expect(attrs).not.toHaveProperty('aria-valuenow')
    expect(attrs['aria-valuetext']).toBe('진행 중')
    expect(markup).toContain('>진행 중</span>')
    expect(markup).not.toMatch(/NaN|Infinity/)
  })

  it('preserves caller supplied accessible labels and human-readable progress text', () => {
    const attrs = rootAttributes(renderToStaticMarkup(
      <Progress value={3} max={5} aria-label="사진 업로드" getAriaValueText={(_, value) => `사진 5개 중 ${value}개 완료`} />,
    ))
    expect(attrs).toMatchObject({ 'aria-label': '사진 업로드', 'aria-valuetext': '사진 5개 중 3개 완료' })
  })
})

describe('Alert announcement semantics', () => {
  it('uses a polite status by default and connects its visible title', () => {
    const markup = renderToStaticMarkup(<Alert title="새 업데이트">변경 사항을 확인하세요.</Alert>)
    const attrs = rootAttributes(markup)
    expect(attrs).toMatchObject({ role: 'status', 'aria-atomic': 'true' })
    expect(attrs['aria-labelledby']).toBeTruthy()
    expect(markup).toContain(`id="${attrs['aria-labelledby']}"`)
    expect(markup).toContain('새 업데이트')
    expect(markup).toContain('변경 사항을 확인하세요.')
  })

  it.each(['success', 'warning', 'info'] as const)('keeps %s messages polite', (tone) => {
    expect(rootAttributes(renderToStaticMarkup(<Alert title="상태 안내" tone={tone} />)).role).toBe('status')
  })

  it('announces danger promptly while allowing the caller to choose a quieter role', () => {
    expect(rootAttributes(renderToStaticMarkup(<Alert title="저장 실패" tone="danger" />)).role).toBe('alert')
    expect(rootAttributes(renderToStaticMarkup(<Alert title="저장 실패" tone="danger" role="status" />)).role).toBe('status')
  })

  it('allows a custom accessible label without a competing title reference', () => {
    const attrs = rootAttributes(renderToStaticMarkup(<Alert title="저장 실패" aria-label="문서 저장 오류" />))
    expect(attrs['aria-label']).toBe('문서 저장 오류')
    expect(attrs).not.toHaveProperty('aria-labelledby')
  })
})

describe('Avatar fallback and accessible name', () => {
  it('exposes the full name once and hides the initials from assistive technology', () => {
    const markup = renderToStaticMarkup(<Avatar alt="Alex Brown" />)
    expect(rootAttributes(markup)).toMatchObject({ role: 'img', 'aria-label': 'Alex Brown' })
    expect(markup.match(/aria-label="Alex Brown"/g)).toHaveLength(1)
    expect(markup).toMatch(/<span[^>]*aria-hidden="true"[^>]*>AB<\/span>/)
  })

  it('keeps a custom fallback visual while retaining the full accessible name', () => {
    const markup = renderToStaticMarkup(<Avatar alt="박다은" fallback="다은" />)
    expect(rootAttributes(markup)['aria-label']).toBe('박다은')
    expect(markup).toMatch(/<span[^>]*aria-hidden="true"[^>]*>다은<\/span>/)
  })

  it('makes an explicitly empty alt decorative', () => {
    const attrs = rootAttributes(renderToStaticMarkup(<Avatar alt="" fallback="M" />))
    expect(attrs['aria-hidden']).toBe('true')
    expect(attrs).not.toHaveProperty('aria-label')
  })
})

describe('Decorative loading and separators', () => {
  it('hides a decorative separator from assistive technology', () => {
    const attrs = rootAttributes(renderToStaticMarkup(<Separator />))
    expect(attrs).toMatchObject({ role: 'presentation', 'aria-hidden': 'true' })
    expect(attrs).not.toHaveProperty('aria-orientation')
  })

  it('exposes a structural separator and its vertical orientation', () => {
    const attrs = rootAttributes(renderToStaticMarkup(<Separator decorative={false} orientation="vertical" />))
    expect(attrs).toMatchObject({ role: 'separator', 'aria-orientation': 'vertical' })
    expect(attrs).not.toHaveProperty('aria-hidden')
  })

  it('keeps a skeleton decorative so its containing region can announce loading once', () => {
    const attrs = rootAttributes(renderToStaticMarkup(<Skeleton />))
    expect(attrs['aria-hidden']).toBe('true')
    expect(attrs).not.toHaveProperty('role')
    expect(attrs).not.toHaveProperty('aria-live')
  })
})
