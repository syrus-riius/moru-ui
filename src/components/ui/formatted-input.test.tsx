import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Field } from './field'
import { FormattedInput, type InputFormat } from './formatted-input'

describe('FormattedInput native input contract', () => {
  it.each<[InputFormat, string, string]>([
    ['card-number', 'numeric', 'cc-number'],
    ['card-expiry', 'numeric', 'cc-exp'],
    ['card-cvc', 'numeric', 'cc-csc'],
    ['postal-code', 'numeric', 'postal-code'],
    ['phone', 'tel', 'tel'],
    ['email', 'email', 'email'],
    ['url', 'url', 'url'],
    ['ipv4', 'decimal', 'off'],
    ['ipv6', 'text', 'off'],
  ])('%s exposes its keyboard and autofill intent', (format, inputMode, autoComplete) => {
    const markup = renderToStaticMarkup(<FormattedInput format={format} aria-label="Value" />)
    expect(markup).toContain(`inputMode="${inputMode}"`)
    expect(markup).toContain(`autoComplete="${autoComplete}"`)
    expect(markup.match(/<input\b/g)).toHaveLength(1)
    expect(markup).not.toContain(' format=')
  })

  it('submits the displayed string through the existing native form control', () => {
    const markup = renderToStaticMarkup(
      <FormattedInput
        format="card-number"
        name="card"
        form="payment"
        defaultValue="4242424242424242"
      />,
    )
    expect(markup).toContain('name="card"')
    expect(markup).toContain('form="payment"')
    expect(markup).toContain('value="4242 4242 4242 4242"')
    expect(markup).not.toContain('type="hidden"')
  })

  it('keeps caller-owned controlled values and explicit autofill settings', () => {
    const markup = renderToStaticMarkup(
      <FormattedInput
        format="postal-code"
        value="01234"
        defaultValue="99999"
        autoComplete="off"
        readOnly
      />,
    )
    expect(markup).toContain('value="01234"')
    expect(markup).toContain('readOnly=""')
    expect(markup).toContain('autoComplete="off"')
    expect(markup).not.toContain('99999')
  })

  it('inherits Field errors, labels, size, and disabled loading behavior', () => {
    const markup = renderToStaticMarkup(
      <Field label="Card" error="Check the card number">
        <FormattedInput format="card-number" loading size="lg" />
      </Field>,
    )
    const input = markup.match(/<input\b[^>]*>/)?.[0] ?? ''
    expect(input).toContain('disabled=""')
    expect(input).toContain('aria-busy="true"')
    expect(input).toContain('aria-invalid="true"')
    expect(input).toContain('aria-describedby=')
    expect(input).toContain('data-size="lg"')
    expect(markup).toContain('ui-loading-indicator')
  })

  it('does not show an error merely because the user is midway through typing', () => {
    const markup = renderToStaticMarkup(<FormattedInput format="ipv4" defaultValue="192.168." />)
    expect(markup).not.toContain('aria-invalid="true"')
    expect(markup).toContain('value="192.168."')
  })
})
