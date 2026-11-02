import { ArrowDownToLine, ArrowRight } from 'lucide-react'
import { MoruLogo, MoruMark } from './brand'
import './brand-story.css'

const principles = [
  { title: '기본은 단단하게', description: '크기와 간격, 타이포그래피와 상태를 같은 규칙으로 연결합니다.' },
  { title: '선택은 자유롭게', description: '색상과 글꼴, 밀도를 직접 고르며 제품의 개성과 쓰임에 맞춥니다.' },
  { title: '오래 쓰도록', description: '공통 규칙 위에서 세부를 바꾸며, 제품의 변화에도 이어 쓸 수 있게 합니다.' },
]

const assets = [
  { id: 'light', label: '밝은 배경용', className: 'brand-asset brand-asset-light', logo: '/brand/moru-logo.svg', symbol: '/brand/moru-symbol.svg', logoName: 'moru-ui-logo.svg', symbolName: 'moru-ui-symbol.svg' },
  { id: 'dark', label: '어두운 배경용', className: 'brand-asset brand-asset-dark', logo: '/brand/moru-logo-white.svg', symbol: '/brand/moru-symbol-white.svg', logoName: 'moru-ui-logo-white.svg', symbolName: 'moru-ui-symbol-white.svg' },
]

export function BrandStory({ onExplore }: { onExplore: () => void }) {
  return <div className="brand-story">
    <section className="brand-story-hero" aria-labelledby="brand-title">
      <div className="brand-story-intro catalog-intro">
        <span className="eyebrow">MORU UI / OUR FOUNDATION</span>
        <h1 id="brand-title">단단한 기본,<br /><span>당신만의 UI.</span></h1>
        <p>잘 갖춰진 컴포넌트와 디자인 토큰을 바탕으로,<br className="brand-desktop-break" /> 각자의 제품에 맞는 화면을 만드는 UI 라이브러리.</p>
        <button type="button" className="brand-explore" onClick={onExplore}>나만의 UI 다듬기 <ArrowRight size={15} /></button>
      </div>
      <div className="brand-logo-stage">
        <span className="brand-stage-label">THE MORU MONOGRAM</span>
        <MoruLogo />
        <p>A solid foundation.<br />Made yours.</p>
        <span className="brand-stage-caption">모루 · 만드는 사람을 위한 기반</span>
      </div>
    </section>

    <section className="brand-symbol-story" aria-labelledby="brand-symbol-title">
      <div className="brand-symbol-diagram" aria-hidden="true"><MoruMark /><span>선으로 쓴 M</span></div>
      <div className="brand-symbol-copy">
        <span className="eyebrow">THE MEANING</span>
        <h2 id="brand-symbol-title">작업면의 수평선,<br className="brand-symbol-break" /> Moru의 M.</h2>
        <p>위의 수평선은 모루의 작업면을, 아래의 M은 Moru의 이름을 나타냅니다. 같은 굵기의 선과 둥근 끝으로 단단함과 열린 인상을 함께 담았습니다.</p>
        <p>모루가 만드는 사람의 손을 받쳐 주듯, Moru UI는 제품을 만드는 기반이 됩니다. 마지막 모습은 만드는 사람이 결정합니다.</p>
      </div>
    </section>

    <section className="brand-principles" aria-label="Moru UI의 세 가지 원칙">
      {principles.map((principle, index) => <article key={principle.title}>
        <span className="brand-principle-number">0{index + 1}</span>
        <h2>{principle.title}</h2>
        <p>{principle.description}</p>
      </article>)}
    </section>

    <section className="brand-assets" aria-labelledby="brand-assets-title">
      <header className="brand-assets-heading"><div><span className="eyebrow">BRAND ASSETS</span><h2 id="brand-assets-title">필요한 곳에, 같은 Moru.</h2></div><p>밝고 어두운 배경에 맞춰<br />로고와 심벌을 준비했습니다.</p></header>
      <div className="brand-assets-grid">
        {assets.map((asset) => <section className={asset.className} key={asset.id} aria-labelledby={'brand-asset-' + asset.id}>
          <div className="brand-asset-label"><h3 id={'brand-asset-' + asset.id}>{asset.label}</h3><span>SVG</span></div>
          <div className="brand-asset-preview"><MoruLogo aria-label={asset.label + ' Moru UI 로고'} /><MoruMark width={32} height={32} /></div>
          <div className="brand-downloads"><a href={asset.logo} download={asset.logoName} aria-label={asset.label + ' 로고 SVG 받기'}><ArrowDownToLine size={14} />로고 SVG 받기</a><a href={asset.symbol} download={asset.symbolName} aria-label={asset.label + ' 심벌 SVG 받기'}><ArrowDownToLine size={14} />심벌 SVG 받기</a></div>
        </section>)}
      </div>
      <p className="brand-asset-guidance">비율과 선의 굵기를 유지하고, 주변에 여백을 두어 사용하세요. 배경과 선명하게 구분되는 색을 선택하면 작은 크기에서도 또렷하게 보입니다.</p>
    </section>
  </div>
}
