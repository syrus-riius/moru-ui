import type { SVGProps } from 'react'
import { moruWordmarkPath, uiWordmarkPath } from './wordmark-paths'

/** The working surface and Moru's M share one consistent, open line. */
const symbolPath = 'M4 7h24M6 26V14l10 8 10-8v12'

function SymbolGeometry() {
  return <path fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" d={symbolPath} />
}

/** A decorative mark by default; the surrounding control supplies its name. */
export function MoruMark({ className, ...props }: SVGProps<SVGSVGElement>) {
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
      <SymbolGeometry />
    </svg>
  )
}

/** Pretendard SemiBold outlines stay fixed regardless of the selected UI font. */
export function MoruLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
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
      <g className="moru-logo__symbol" style={{ color: 'var(--moru-symbol-color, currentColor)' }}><SymbolGeometry /></g>
      <g fill="currentColor">
        <path d={moruWordmarkPath} />
        <path d={uiWordmarkPath} />
      </g>
    </svg>
  )
}
