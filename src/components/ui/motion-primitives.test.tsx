import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Progress } from './progress'
import { Skeleton } from './skeleton'
import { Spinner } from './spinner'

function attributes(tag: string) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]),
  )
}

function root(markup: string) {
  return attributes(markup.slice(0, markup.indexOf('>') + 1))
}

function bufferStyle(markup: string) {
  return [...markup.matchAll(/<div\b[^>]*>/g)]
    .map(([tag]) => attributes(tag))
    .find((attrs) => attrs['aria-hidden'] === 'true')?.style
}

describe('Progress buffering represents prepared work without overstating completion', () => {
  it('keeps the accessible progress at the completed value, not the buffered value', () => {
    const markup = renderToStaticMarkup(
      <Progress value={30} bufferValue={70} label="Video ready" showValue locale="en-US" />,
    )
    expect(root(markup)).toMatchObject({
      role: 'progressbar',
      'aria-valuemin': '0',
      'aria-valuemax': '100',
      'aria-valuenow': '30',
      'aria-valuetext': '30%',
    })
    expect(bufferStyle(markup)).toBe('width:70%')
    expect(markup.match(/role="progressbar"/g)).toHaveLength(1)
  })

  it.each([
    { value: 30, buffer: 10, max: 100, expected: 'width:30%' },
    { value: 30, buffer: -10, max: 100, expected: 'width:30%' },
    { value: 30, buffer: 200, max: 100, expected: 'width:100%' },
    { value: 2, buffer: 6, max: 8, expected: 'width:75%' },
    { value: -10, buffer: 25, max: 0, expected: 'width:25%' },
  ])('normalizes buffer $buffer in range $max', ({ value, buffer, max, expected }) => {
    expect(
      bufferStyle(renderToStaticMarkup(<Progress value={value} bufferValue={buffer} max={max} />)),
    ).toBe(expected)
  })

  it.each([undefined, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'omits invalid or absent buffered amounts (%s)',
    (bufferValue) => {
      const markup = renderToStaticMarkup(<Progress value={30} bufferValue={bufferValue} />)
      expect(bufferStyle(markup)).toBeUndefined()
      expect(markup).not.toMatch(/NaN|Infinity/)
      expect(root(markup)['aria-valuenow']).toBe('30')
    },
  )

  it('does not turn indeterminate work into a false percentage through its buffer', () => {
    const markup = renderToStaticMarkup(
      <Progress value={null} bufferValue={80} striped animated paused label="Preparing files" />,
    )
    expect(root(markup)).not.toHaveProperty('aria-valuenow')
    expect(root(markup)['aria-valuetext']).toBe('진행 중')
    expect(bufferStyle(markup)).toBeUndefined()
  })

  it.each(['primary', 'success', 'warning', 'danger', 'info'] as const)(
    'retains progress semantics with the %s presentation',
    (tone) => {
      const markup = renderToStaticMarkup(
        <Progress value={44} tone={tone} size="lg" striped animated paused aria-label="Import" />,
      )
      expect(root(markup)).toMatchObject({
        role: 'progressbar',
        'aria-label': 'Import',
        'aria-valuenow': '44',
      })
      expect(root(markup)).not.toHaveProperty('paused')
      expect(root(markup)).not.toHaveProperty('bufferValue')
    },
  )
})

describe('Spinner names each loading status once', () => {
  it.each(['ring', 'dots', 'bars'] as const)(
    '%s retains an accessible loading status',
    (variant) => {
      const markup = renderToStaticMarkup(<Spinner variant={variant} label="Saving draft" paused />)
      expect(root(markup)).toMatchObject({ role: 'status', 'aria-label': 'Saving draft' })
      expect(markup.match(/role="status"/g)).toHaveLength(1)
      expect(markup).toContain('aria-hidden="true"')
      expect(root(markup)).not.toHaveProperty('paused')
    },
  )

  it('uses the existing localized loading name by default', () => {
    expect(root(renderToStaticMarkup(<Spinner />))['aria-label']).toBe('불러오는 중')
  })

  it('preserves the existing aria-hidden option for decorative callers', () => {
    expect(root(renderToStaticMarkup(<Spinner aria-hidden="true" />))['aria-hidden']).toBe('true')
  })

  it('accepts a custom accessible name', () => {
    expect(root(renderToStaticMarkup(<Spinner aria-label="Syncing" />))['aria-label']).toBe(
      'Syncing',
    )
  })

  it('uses a visible external label without adding a competing name', () => {
    const attrs = root(renderToStaticMarkup(<Spinner aria-labelledby="save-status" />))
    expect(attrs['aria-labelledby']).toBe('save-status')
    expect(attrs).not.toHaveProperty('aria-label')
  })

  it.each(['ring', 'dots', 'bars'] as const)(
    'decorative %s does not announce a second status inside an already labelled control',
    (variant) => {
      const attrs = root(
        renderToStaticMarkup(
          <Spinner
            variant={variant}
            decorative
            label="Saving draft"
            role="status"
            aria-label="Saving draft"
            aria-labelledby="another-label"
            aria-live="polite"
          />,
        ),
      )
      expect(attrs['aria-hidden']).toBe('true')
      for (const name of ['role', 'aria-label', 'aria-labelledby', 'aria-live'])
        expect(attrs).not.toHaveProperty(name)
    },
  )
})

describe('Skeleton appearance does not introduce loading announcements', () => {
  it.each(['pulse', 'shimmer', 'none'] as const)(
    '%s remains decorative when paused',
    (animation) => {
      const attrs = root(renderToStaticMarkup(<Skeleton animation={animation} paused />))
      expect(attrs['aria-hidden']).toBe('true')
      expect(attrs).not.toHaveProperty('role')
      expect(attrs).not.toHaveProperty('aria-live')
      expect(attrs).not.toHaveProperty('animation')
      expect(attrs).not.toHaveProperty('paused')
    },
  )
})
