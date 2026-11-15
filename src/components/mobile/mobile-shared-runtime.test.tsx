import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { defaultTokens } from '../../theme/tokens'
import { MobileReadinessLab } from './MobileReadinessLab'

describe('mobile shared runtime lab', () => {
  it('loads the actual Expo web application and exposes source and platform distinctions', () => {
    const markup = renderToStaticMarkup(<MobileReadinessLab tokens={defaultTokens} mode="light" />)
    expect(markup).toContain('src="/native-preview/?embedded=1"')
    expect(markup).toContain('title="실제 Moru Native 모바일 예제"')
    expect(markup).toContain('플랫폼 지원')
    expect(markup).toContain('BrowserDatePicker.tsx')
    expect(markup).toContain('기기 OS 전용 동작')
    expect(markup).toContain('추가 연결 필요')
    expect(markup).not.toContain('class="mobile-active-card"')
    expect(markup).not.toContain('class="mobile-task-card"')
  })
})
