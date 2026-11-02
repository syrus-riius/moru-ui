import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AlertDialog } from './alert-dialog'
import { Sheet } from './sheet'
import { ToastProvider, useToast } from './toast'

describe('Overlay trigger contracts', () => {
  it('makes alert triggers safe inside forms and exposes the destructive confirmation as a dialog', () => {
    const markup = renderToStaticMarkup(
      <AlertDialog trigger={<button>워크스페이스 삭제</button>} title="워크스페이스를 삭제할까요?" onConfirm={() => {}} destructive />,
    )
    expect(markup).toContain('type="button"')
    expect(markup).toContain('aria-haspopup="dialog"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).toContain('워크스페이스 삭제')
  })

  it('preserves a disabled alert trigger so confirmation cannot bypass its prerequisite', () => {
    const markup = renderToStaticMarkup(
      <AlertDialog trigger={<button disabled>삭제</button>} title="삭제 확인" onConfirm={() => {}} />,
    )
    expect(markup).toContain('disabled=""')
    expect(markup).toContain('aria-expanded="false"')
  })

  it('gives sheet triggers a closed dialog state without server-rendering hidden contents', () => {
    const markup = renderToStaticMarkup(
      <Sheet trigger={<button>팀원 보기</button>} title="팀원 상세"><p>아직 열지 않은 개인 정보</p></Sheet>,
    )
    expect(markup).toContain('type="button"')
    expect(markup).toContain('aria-haspopup="dialog"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).not.toContain('아직 열지 않은 개인 정보')
  })
})

describe('Toast context isolation', () => {
  function Consumer() {
    const { toast, dismiss } = useToast()
    return <span>{typeof toast}:{typeof dismiss}</span>
  }

  it('supplies the public notification API without requiring a browser during SSR', () => {
    expect(renderToStaticMarkup(<ToastProvider><Consumer /></ToastProvider>)).toContain('function:function')
  })

  it('fails clearly outside its own provider instead of silently dropping notifications', () => {
    expect(() => renderToStaticMarkup(<Consumer />)).toThrow(/Toast\.Provider/)
  })
})
