import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FileInput } from './file-input'
import { Field } from './field'
import { acceptsFile, validateFiles } from './file-input-utils'

const pdf = { name: 'Design.PDF', type: '', size: 2048 }
describe('file selection validation', () => {
  it('supports extension-based formats even when a platform supplies no MIME type', () => {
    expect(acceptsFile(pdf, '.pdf,image/*')).toBe(true)
    expect(acceptsFile({ name: 'photo', type: 'image/heic', size: 1 }, '.pdf,image/*')).toBe(true)
    expect(acceptsFile(pdf, 'image/*')).toBe(false)
  })
  it('enforces size and count before handing files to a consumer', () => {
    expect(validateFiles([pdf], { maxSize: 2048 })).toBeNull()
    expect(validateFiles([pdf], { maxSize: 2047 })).toContain('크기')
    expect(validateFiles([pdf, pdf], { maxFiles: 1 })).toContain('최대 1개')
    expect(validateFiles([pdf], { accept: 'image/png' })).toContain(pdf.name)
  })
  it('keeps an empty optional selection valid and ignores nonfinite limits', () => {
    expect(validateFiles([], { maxSize: 0 })).toBeNull()
    expect(validateFiles([pdf], { maxSize: NaN, maxFiles: Infinity })).toBeNull()
  })
})
describe('FileInput form semantics', () => {
  it('retains native file selection, form name and label/error association', () => {
    const html = renderToStaticMarkup(<Field label="첨부" error="파일을 선택하세요."><FileInput name="brief" accept=".pdf" multiple required /></Field>)
    const input = html.match(/<input[^>]+>/)?.[0] ?? ''
    expect(input).toContain('type="file"')
    expect(input).toContain('name="brief"')
    expect(input).toContain('multiple=""')
    expect(input).toContain('required=""')
    expect(input).toContain('aria-invalid="true"')
    expect(input).toContain('aria-describedby=')
    expect(html).toContain(`for="${input.match(/ id="([^"]+)"/)?.[1]}"`)
  })
  it('passes disabled behavior to the actual input', () => {
    expect(renderToStaticMarkup(<FileInput disabled aria-label="첨부" />)).toMatch(/<input[^>]*disabled=""/)
  })
})
