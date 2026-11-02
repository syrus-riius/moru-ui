'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from './_lib/cn'
import './controls-completion.css'

export type AspectRatioProps = HTMLAttributes<HTMLDivElement> & { ratio?: number }

export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio({ ratio = 16 / 9, style, className, ...props }, ref) {
  const safeRatio = Number.isFinite(ratio) && ratio > 0 ? ratio : 16 / 9
  return <div {...props} ref={ref} className={cn('ui-aspect-ratio', className)} style={{ ...style, aspectRatio: safeRatio }} />
})
