import { Check, Code2, Copy, Moon, Sun } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import type { ColorTokenKey, ThemeMode, ThemeTokens, TokenChange, TypographyChange } from '../theme/tokens'
import type { ColorSchemeSettings } from '../theme/color-scheme'
import { ColorSchemeEditor } from './ColorSchemeEditor'
import { ShapeRhythmEditor } from './ShapeRhythmEditor'
import { DesignQualityWorkbench } from './DesignQualityWorkbench'
import './design-tokens-page.css'

export type DesignTokensPageProps = {
  tokens: ThemeTokens
  mode: ThemeMode
  onModeChange: (mode: ThemeMode) => void
  onChange: TokenChange
  onTokensChange: (update: ThemeTokens | ((previous: ThemeTokens) => ThemeTokens)) => void
  onTypographyChange: TypographyChange
  colorSchemeSettings?: ColorSchemeSettings
  onApplyScheme: (settings: ColorSchemeSettings, group: 'foundation' | 'semantic' | 'all') => void
  cssText: string
  copied: boolean
  onCopy: () => void
  onEditColor: (key: ColorTokenKey) => void
}

const workbenchTabs = [
  { id: 'color', label: '컬러 스키마' },
  { id: 'shape', label: '형태와 리듬' },
  { id: 'quality', label: '가독성 · 품질' },
  { id: 'export', label: '내보내기' },
] as const

export function DesignTokensPage({ tokens, mode, onModeChange, onChange, onTokensChange, onTypographyChange, colorSchemeSettings, onApplyScheme, cssText, copied, onCopy, onEditColor }: DesignTokensPageProps) {
  const id = useId()
  const [activeTab, setActiveTab] = useState<typeof workbenchTabs[number]['id']>('color')
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([])
  function panelProps(tab: typeof activeTab) {
    return { role: 'tabpanel' as const, id: `${id}-panel-${tab}`, 'aria-labelledby': `${id}-tab-${tab}`, hidden: activeTab !== tab, tabIndex: 0 }
  }
  return (
    <div className="design-tokens-page">
      <div className="design-token-workbench-bar">
        <div role="tablist" aria-label="디자인 토큰 작업 영역" className="design-token-workbench-tabs">{workbenchTabs.map((tab, index) => <button type="button" key={tab.id} ref={(element) => { tabButtons.current[index] = element }} role="tab" id={`${id}-tab-${tab.id}`} aria-controls={`${id}-panel-${tab.id}`} aria-selected={activeTab === tab.id} tabIndex={activeTab === tab.id ? 0 : -1}
          onClick={() => setActiveTab(tab.id)} onKeyDown={(event) => {
            const next = event.key === 'ArrowRight' ? (index + 1) % workbenchTabs.length : event.key === 'ArrowLeft' ? (index - 1 + workbenchTabs.length) % workbenchTabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? workbenchTabs.length - 1 : null
            if (next === null) return
            event.preventDefault(); setActiveTab(workbenchTabs[next].id); tabButtons.current[next]?.focus({ preventScroll: true })
          }}>{tab.label}</button>)}</div>
        <div role="group" aria-label="디자인 토큰 화면 모드"><button type="button" aria-pressed={mode === 'light'} onClick={() => onModeChange('light')}><Sun size={13} aria-hidden="true" />라이트</button><button type="button" aria-pressed={mode === 'dark'} onClick={() => onModeChange('dark')}><Moon size={13} aria-hidden="true" />다크</button></div>
      </div>
      <section {...panelProps('color')} className="design-token-section">
        <header className="design-token-section-heading">
          <div><span>FOUNDATIONS / COLOR SYSTEM</span><h2 id="design-token-color-heading">컬러 스키마</h2></div>
          <p>색의 관계를 정하고, 역할과 대비를 확인한 뒤 현재 모드에 적용하세요.</p>
        </header>
        <ColorSchemeEditor tokens={tokens} mode={mode} settings={colorSchemeSettings} onApply={onApplyScheme} onEditColor={onEditColor} />
      </section>
      <section {...panelProps('shape')} className="design-token-section">
        <header className="design-token-section-heading">
          <div><span>FOUNDATIONS / SHAPE & RHYTHM</span><h2 id="design-token-scale-heading">형태와 리듬</h2></div>
          <p>모서리, 깊이, 간격과 글자의 기준을 직접 조절하고 미리보기에 반영하세요.</p>
        </header>
        <ShapeRhythmEditor tokens={tokens} onChange={onChange} onTokensChange={onTokensChange} onTypographyChange={onTypographyChange} />
      </section>
      <section {...panelProps('quality')} className="design-token-section">
        <header className="design-token-section-heading">
          <div><span>FOUNDATIONS / QUALITY</span><h2>가독성과 디자인 품질</h2></div>
          <p>색 대비와 정보의 간격을 확인하고, 글자 확대와 사용자 간격 변경으로 레이아웃을 점검하세요.</p>
        </header>
        <DesignQualityWorkbench tokens={tokens} mode={mode} onTokensChange={onTokensChange} />
      </section>
      <section {...panelProps('export')} className="design-token-section">
        <header className="design-token-section-heading">
          <div><span>FOUNDATIONS / EXPORT</span><h2 id="design-token-css-heading">프로젝트로 가져가기</h2></div>
          <p>현재 모드의 CSS 변수와 공통 간격 규칙을 복사하세요. 두 모드와 생성 설정은 JSON으로 보관할 수 있어요.</p>
        </header>
        <details className="design-token-export-details">
          <summary><Code2 size={14} aria-hidden="true" /><span>현재 디자인 토큰 CSS</span><small>tokens.css</small></summary>
          <div className="design-token-code-panel">
            <div className="design-token-code-toolbar">
              <span><Code2 size={16} aria-hidden="true" /><code>tokens.css</code></span>
              <button type="button" onClick={onCopy} aria-label={copied ? '디자인 토큰 CSS 복사됨' : '디자인 토큰 CSS 전체 복사'}>
                {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                <span aria-live="polite">{copied ? '복사됨' : '전체 복사'}</span>
              </button>
            </div>
            <pre tabIndex={0} role="region" aria-label="디자인 토큰 CSS 코드"><code>{cssText}</code></pre>
          </div>
        </details>
        <p className="design-token-standards">배색은 <a href="https://www.w3.org/TR/css-color-4/#ok-lab" target="_blank" rel="noreferrer">OKLCH 색 공간</a>에서 구성하며, 대비 표시는 <a href="https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html" target="_blank" rel="noreferrer">WCAG의 일반 텍스트 기준 4.5:1</a>로 계산합니다. 개별 색상 쌍의 검사 결과입니다.</p>
      </section>
    </div>
  )
}
