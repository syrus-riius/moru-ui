import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { createSimNode } from './simulator-model'
import { SimulatorNodeView } from './SimulatorNodeView'

describe('Simulator OTP uses the shared accessible control', () => {
  it('renders one labeled numeric control rather than six unrelated inputs', () => {
    const node = createSimNode('input-otp', 'code')
    const html = renderToStaticMarkup(<SimulatorNodeView node={node} interactive value="123456" />)
    expect(html.match(/<input\b/g)).toHaveLength(1)
    expect(html).toContain('class="ui-input-otp-control"')
    expect(html).toContain('inputMode="numeric"')
    expect(html).toContain('pattern="[0-9]{6}"')
    expect(html).toContain('aria-label="인증번호"')
  })

  it('connects an invalid OTP error to the control and keeps design mode read-only', () => {
    const html = renderToStaticMarkup(<SimulatorNodeView node={createSimNode('input-otp', 'code')} error="6자리 코드를 입력하세요." />)
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('aria-describedby=')
    expect(html).toContain('readOnly=""')
    expect(html).toContain('6자리 코드를 입력하세요.')
  })
})
