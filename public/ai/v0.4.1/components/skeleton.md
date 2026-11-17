# Skeleton

Placeholder surfaces for content that is still loading.

Version: 0.4.1. Source hash: 2fd87d38eaaf0375eb097047b65a7d17f1067292b1a98efdbfd46ccdaa31ff28.

## Discovery

- Registry ID: `skeleton`
- Import: `@/components/ui/moru/skeleton`
- Runtime exports: `Skeleton`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [skeleton.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/skeleton.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/skeleton.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/skeleton.tsx)

## Usage and interaction

- animation is pulse (default), shimmer or none. paused stops motion. Skeleton is always decorative/aria-hidden.
- Match the eventual content geometry to avoid layout shifts. Mark the containing content aria-busy and announce loading/completion once in a separate live status outside the busy region.

## Minimal example

```tsx
import { Skeleton } from '@/components/ui/moru/skeleton'
export function ContentPlaceholder() {
  return <div aria-busy="true"><Skeleton animation="shimmer" style={{ height: 120 }} /></div>
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes` from `react`

```ts
type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  animation?: 'pulse' | 'shimmer' | 'none'
  paused?: boolean
}
```

Exported value type annotations / generic factory calls from source:

- `Skeleton: forwardRef<HTMLDivElement, SkeletonProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Skeleton.animation`: `'pulse'`
- `Skeleton.paused`: `false`
