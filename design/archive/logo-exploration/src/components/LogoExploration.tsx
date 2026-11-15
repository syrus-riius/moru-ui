import { useState } from 'react'
import { ArrowDownToLine, Check, ArrowUpRight } from 'lucide-react'
import { adoptedLogoConcept, ConceptLogo, ConceptMark, logoConcepts } from './brand/logo-concepts'
import type { LogoConceptId } from './brand/logo-concepts'
import './logo-exploration.css'

const sizes = [16, 24, 32, 64] as const

export function LogoExploration() {
  const [selected, setSelected] = useState<LogoConceptId>(adoptedLogoConcept)
  const [color, setColor] = useState<'ink' | 'sage'>('ink')
  const concept = logoConcepts.find((item) => item.id === selected)!

  return <section className={`logo-exploration logo-color-${color}`} aria-labelledby="logo-exploration-title">
    <header className="logo-exploration-heading">
      <div><span className="eyebrow">LOGO EXPLORATION / 01</span><h2 id="logo-exploration-title">Moru를 담는 다섯 가지 형태.</h2><p>채택한 ‘선으로 쓴 M’과 다른 네 가지 시안을 같은 크기와 배경에서 비교해 보세요.</p></div>
      <div className="logo-color-control" role="group" aria-label="로고 비교 색상">
        <button aria-pressed={color === 'ink'} onClick={() => setColor('ink')}><i />단색</button>
        <button aria-pressed={color === 'sage'} onClick={() => setColor('sage')}><i />세이지</button>
      </div>
    </header>

    <div className="logo-concept-grid" role="group" aria-label="로고 시안 선택">
      {logoConcepts.map((item) => <button key={item.id} className="logo-concept-card" aria-label={`${item.code} ${item.name} 미리보기`} aria-describedby={item.id === adoptedLogoConcept ? `logo-badge-${item.id}` : undefined} aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}>
        <div className="logo-concept-meta"><span>{item.code}</span>{item.id === adoptedLogoConcept ? <span id={`logo-badge-${item.id}`}>현재 로고</span> : null}</div>
        <div className="logo-concept-symbol"><ConceptMark concept={item.id} width={64} height={64} /></div>
        <span className="logo-concept-name">{item.name}</span><span className="logo-concept-english">{item.englishName}</span>
        <span className="logo-concept-traits">{item.characteristics}</span>
        <span className="logo-concept-action">{selected === item.id ? <><Check size={12} />미리보는 안</> : <>미리보기 <ArrowUpRight size={12} /></>}</span>
      </button>)}
    </div>

    <div className="logo-selection-note"><span className="logo-note-dot" />시안을 누르면 아래 미리보기가 바뀝니다. 현재 사용 중인 로고는 유지됩니다.</div>

    <section className="logo-selected" aria-labelledby="logo-selected-title">
      <header className="logo-selected-heading">
        <div><span className="eyebrow">SELECTED DIRECTION / {concept.code}</span><h3 id="logo-selected-title">{concept.name}<span> {concept.englishName}</span></h3><p>{concept.description}</p></div>
        <div className="logo-concept-downloads">
          <a href={`/brand/concepts/${selected}-symbol.svg`} download={`moru-${selected}-symbol.svg`}><ArrowDownToLine size={13} />이 심벌 SVG 받기</a>
          <a href={`/brand/concepts/${selected}-logo.svg`} download={`moru-${selected}-logo.svg`}><ArrowDownToLine size={13} />워드마크 SVG 받기</a>
        </div>
      </header>

      <div className="logo-background-grid">
        {(['light', 'dark'] as const).map((background) => <div className={`logo-background-preview logo-background-${background}`} key={background} aria-label={`${background === 'light' ? '라이트' : '다크'} 배경의 ${concept.name} 로고`}>
          <div className="logo-preview-label"><span>{background === 'light' ? 'LIGHT' : 'DARK'}</span><span>WORDMARK + SYMBOL</span></div>
          <div className="logo-lockup-stage"><ConceptLogo concept={selected} className="logo-lockup" aria-label={`Moru UI ${concept.name}`} /></div>
          <div className="logo-size-row">{sizes.map((size) => <div key={size}><div className="logo-size-symbol"><ConceptMark concept={selected} width={size} height={size} /></div><span>{size}px</span></div>)}</div>
        </div>)}
      </div>

      <div className="logo-use-case">
        <div className="logo-use-case-copy"><span className="eyebrow">IN CONTEXT</span><h3>작업 화면에 놓아보기</h3><p>같은 워드마크에 심벌만 바꿔, 화면 속 크기와 무게를 확인합니다.</p></div>
        <div className="logo-mini-workspace" aria-label={`${concept.name} 로고를 넣은 작업 화면 예시`}>
          <div className="logo-mini-header"><ConceptLogo concept={selected} className="logo-mini-lockup" aria-label={`Moru UI ${concept.name}`} /><span>UI LIBRARY</span></div>
          <div className="logo-mini-body" aria-hidden="true"><div className="logo-mini-sidebar"><span><ConceptMark concept={selected} width={16} height={16} />Workspace</span><i /><i /><i /></div><div className="logo-mini-canvas"><span>단단한 기본, 당신만의 UI.</span><div><i /><i /></div><i /></div></div>
        </div>
      </div>
    </section>
    <div className="logo-review-note"><strong>이렇게 비교해 보세요.</strong><p>16px에서도 형태가 남는지, 단색과 반전에서 균형이 맞는지, 만드는 사람을 받쳐 주는 기반이라는 의미가 느껴지는지 살펴보세요.</p></div>
  </section>
}
