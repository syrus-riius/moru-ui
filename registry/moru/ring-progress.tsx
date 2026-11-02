'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { useId, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from './_lib/cn'
import type { SemanticTone } from './_theme/tokens'
import './workflow-patterns.css'

export interface RingProgressSection {
  label: string
  value: number
  tone?: SemanticTone | 'primary' | 'accent'
  color?: string
}

export interface RingProgressProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  label: string
  value?: number
  max?: number
  sections?: readonly RingProgressSection[]
  size?: number
  thickness?: number
  roundCaps?: boolean
  showLegend?: boolean
  centerLabel?: ReactNode
}

const numberFormatter = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 })
const formatNumber = (value: number) => numberFormatter.format(value)
export function normalizeRingSections(sections: readonly RingProgressSection[], max = 100) {
  const resolvedMax = Number.isFinite(max) && max > 0 ? max : 100
  let remaining = resolvedMax
  return sections.map((section) => {
    const value = Number.isFinite(section.value) ? Math.min(remaining, Math.max(0, section.value)) : 0
    remaining = Math.max(0, remaining - value)
    return { ...section, value, percent: value / resolvedMax * 100 }
  })
}

/** Goal/capacity progress with readable values; multi-segment totals never overlap. */
export function RingProgress({ label, value = 0, max = 100, sections, size = 144, thickness = 10, roundCaps, showLegend = true, centerLabel, className, ...props }: RingProgressProps) {
  const id = useId()
  const resolvedMax = Number.isFinite(max) && max > 0 ? max : 100
  const data = normalizeRingSections(sections ?? [{ label, value, tone: 'primary' }], resolvedMax)
  const multiple = sections !== undefined
  const total = Math.min(resolvedMax, data.reduce((sum, section) => sum + section.value, 0))
  const percent = total / resolvedMax * 100
  const resolvedSize = Number.isFinite(size) ? Math.min(320, Math.max(80, size)) : 144
  const resolvedThickness = Number.isFinite(thickness) ? Math.min(resolvedSize / 4, Math.max(2, thickness)) : 10
  const svgThickness = resolvedThickness / resolvedSize * 100
  const radius = (100 - svgThickness) / 2
  let offset = 0
  return <figure {...props} className={cn('ui-ring-progress', className)}>
    <div className="ui-ring-progress-diagram" style={{ width: resolvedSize }} role={multiple ? 'img' : 'progressbar'} aria-label={label} aria-describedby={`${id}-values`} {...(multiple ? {} : { 'aria-valuemin': 0, 'aria-valuemax': resolvedMax, 'aria-valuenow': total, 'aria-valuetext': `${formatNumber(total)} / ${formatNumber(resolvedMax)} · ${formatNumber(percent)}%` })}>
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle className="ui-ring-progress-track" cx="50" cy="50" r={radius} fill="none" strokeWidth={svgThickness} />{data.map((section, index) => {
        const start = offset
        offset += section.percent
        return section.percent > 0 ? <circle key={index} className="ui-ring-progress-section" cx="50" cy="50" r={radius} fill="none" pathLength="100" strokeWidth={svgThickness} strokeDasharray={`${section.percent} ${100 - section.percent}`} strokeDashoffset={-start} strokeLinecap={(roundCaps ?? !multiple) ? 'round' : 'butt'} transform="rotate(-90 50 50)" style={{ stroke: section.color ?? `var(--ui-${section.tone ?? 'primary'})` }} /> : null
      })}</svg>
      <div className="ui-ring-progress-center" aria-hidden="true">{centerLabel ?? <><strong>{formatNumber(percent)}<span>%</span></strong><span>{label}</span></>}</div>
    </div>
    <figcaption id={`${id}-values`} className={showLegend ? 'ui-ring-progress-caption' : 'ui-workflow-sr-only'}>
      <span className="ui-ring-progress-title">{label}</span>
      {data.length ? <ul className="ui-ring-progress-legend">{data.map((section, index) => <li key={index}><span className="ui-ring-progress-key"><span className="ui-ring-progress-swatch" aria-hidden="true" style={{ background: section.color ?? `var(--ui-${section.tone ?? 'primary'})` }} />{section.label}</span><span className="ui-ring-progress-value">{formatNumber(section.value)} / {formatNumber(resolvedMax)} <span>({formatNumber(section.percent)}%)</span></span></li>)}</ul> : <p className="ui-ring-progress-empty">표시할 항목이 없어요. 0%</p>}
    </figcaption>
  </figure>
}
