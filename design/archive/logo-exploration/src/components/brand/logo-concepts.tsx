import type { SVGProps } from 'react'
import './brand.css'

export type LogoConceptId = 'classic' | 'plane' | 'monogram' | 'counterform' | 'joint'

export const adoptedLogoConcept: LogoConceptId = 'monogram'

export interface LogoConcept {
  id: LogoConceptId
  code: string
  name: string
  englishName: string
  description: string
  characteristics: string
  recommended?: boolean
}

export const logoConcepts: readonly LogoConcept[] = [
  {
    id: 'classic',
    code: '00',
    name: '모루의 원형',
    englishName: 'Classic',
    description: '넓은 작업면과 두 발을 하나의 실루엣으로 연결한 초기안입니다. 이름의 뜻이 가장 직접적으로 드러납니다.',
    characteristics: '실루엣 · 곡선 · 직접적인 의미',
  },
  {
    id: 'plane',
    code: '01',
    name: '면과 받침',
    englishName: 'Plane',
    description: '평평한 작업면과 넓게 받치는 기반을 두 개의 면으로 줄였습니다. 그 사이의 여백은 직접 다듬어 갈 가능성을 남깁니다.',
    characteristics: '면 · 대칭 · 단단함',
  },
  {
    id: 'monogram',
    code: '02',
    name: '선으로 쓴 M',
    englishName: 'Monogram',
    description: 'Moru UI의 로고로 채택한 안입니다. 작업면의 수평선과 Moru의 M을 같은 굵기의 선으로 그려, 가볍고 열린 인상을 담았습니다.',
    characteristics: '선 · 이니셜 · 열린 구조',
  },
  {
    id: 'counterform',
    code: '03',
    name: '여백의 모루',
    englishName: 'Counterform',
    description: '단단한 정사각형 안에서 모루의 형태를 비워 냈습니다. 작은 아이콘에서도 바탕과 여백의 대비가 분명합니다.',
    characteristics: '음각 · 대비 · 응축된 형태',
  },
  {
    id: 'joint',
    code: '04',
    name: '모듈의 맞댐',
    englishName: 'Joint',
    description: '같은 모듈 두 개를 마주 놓아 하나의 작업면과 받침을 만들었습니다. 작은 부품을 조합해 화면을 만드는 방식을 담습니다.',
    characteristics: '모듈 · 반복 · 조합',
  },
]

function ConceptGeometry({ concept }: { concept: LogoConceptId }) {
  switch (concept) {
    case 'classic':
      return <path fill="currentColor" d="M4 5h24a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-5l-3 6v2l5.3 4.4a2 2 0 0 1 .7 1.5V27h-7l-3-4-3 4H6v-1.1a2 2 0 0 1 .7-1.5L12 20v-2l-2-4H8a6 6 0 0 1-6-6V7a2 2 0 0 1 2-2Z" />
    case 'plane':
      return <path fill="currentColor" d="M3 5h26v6H3ZM12 15h8l7 12H5Z" />
    case 'monogram':
      return <path fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" d="M4 7h24M6 26V14l10 8 10-8v12" />
    case 'counterform':
      return <path fill="currentColor" fillRule="evenodd" d="M10 4h12a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V10a6 6 0 0 1 6-6ZM7 9h18v5h-5v5l5 5H7l5-5v-5H7Z" />
    case 'joint':
      return (
        <g fill="currentColor">
          <path d="M3 6h12v6h-3v8l3 6H5l3-6v-8H3Z" />
          <path d="M29 6H17v6h3v8l-3 6h10l-3-6v-8h5Z" />
        </g>
      )
  }
}

export type ConceptMarkProps = SVGProps<SVGSVGElement> & { concept: LogoConceptId }

/** Reference designs remain fixed when the adopted logo changes. */
export function ConceptMark({ concept, className, ...props }: ConceptMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={32}
      height={32}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={['moru-mark', className].filter(Boolean).join(' ')}
      {...props}
    >
      <ConceptGeometry concept={concept} />
    </svg>
  )
}

export type ConceptLogoProps = SVGProps<SVGSVGElement> & { concept: LogoConceptId }

/** The lettering stays fixed so the comparison concerns the symbol alone. */
export function ConceptLogo({ concept, className, ...props }: ConceptLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 152 32"
      width={152}
      height={32}
      fill="none"
      role="img"
      aria-label="Moru UI"
      focusable="false"
      className={['moru-logo', className].filter(Boolean).join(' ')}
      {...props}
    >
      <g className="moru-logo__symbol" style={{ color: 'var(--moru-symbol-color, currentColor)' }}><ConceptGeometry concept={concept} /></g>
      <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M43 26V16a5 5 0 0 1 10 0v10m0-10a5 5 0 0 1 10 0v10" />
        <circle cx="76" cy="18.5" r="7.5" />
        <path d="M91 26V11m0 6a7 7 0 0 1 10-5.4M108 11v8a7 7 0 0 0 14 0v-8" />
      </g>
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M135 17v5.5a3.5 3.5 0 0 0 7 0V17m6 0v9" />
      </g>
    </svg>
  )
}
