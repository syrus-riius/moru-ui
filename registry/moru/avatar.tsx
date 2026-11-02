'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { Avatar as BaseAvatar } from '@base-ui/react/avatar'
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { cn } from './_lib/cn'

export interface AvatarProps extends Omit<ComponentPropsWithoutRef<typeof BaseAvatar.Root>, 'className' | 'children'> {
  src?: string
  alt: string
  fallback?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  return (words.length > 1
    ? words.slice(0, 2).map((word) => Array.from(word)[0]).join('')
    : Array.from(words[0] ?? '').slice(0, 2).join('')).toLocaleUpperCase()
}

/** An image with a stable fallback, labelled once for assistive technology. */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, alt, fallback, size = 'md', className, ...props },
  ref,
) {
  return (
    <BaseAvatar.Root
      role="img"
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      {...props}
      ref={ref}
      className={cn('ui-avatar', className)}
      data-size={size}
    >
      {src && <BaseAvatar.Image src={src} alt="" aria-hidden="true" className="ui-avatar-image" />}
      <BaseAvatar.Fallback className="ui-avatar-fallback" aria-hidden="true">
        {fallback ?? initials(alt)}
      </BaseAvatar.Fallback>
    </BaseAvatar.Root>
  )
})
