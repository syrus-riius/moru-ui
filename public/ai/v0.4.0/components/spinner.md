# Spinner

Ring, dots and bars loading indicators with accessible labels and motion controls.

Version: 0.4.0. Source hash: e068de2cd7d2d1f2f198a786dcd23f4fee5b398de94b2591cabeb3a5ceb100f6.

## Discovery

- Registry ID: `spinner`
- Import: `@/components/ui/moru/spinner`
- Runtime exports: `Spinner`
- Registry dependencies: [core](/ai/v0.4.0/core.md)
- Install source: [spinner.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/spinner.json)
- Setup and import-path differences: [start](/ai/v0.4.0/start.md)
- Source: [src/components/ui/spinner.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/spinner.tsx)

## Usage and interaction

- Variants are ring (default), dots and bars; sizes are sm/md/lg. Use for waiting whose percentage is unknown.
- Provide a meaningful label for a standalone Spinner. Use decorative when a surrounding status message already announces the same operation, to avoid duplicate announcements.
- paused stops repeating motion and reduced-motion is respected automatically. Do not leave users waiting indefinitely without a way to cancel or retry real work.

## Minimal example

```tsx
import { Spinner } from '@/components/ui/moru/spinner'
export function SaveStatus() {
  return <div role="status"><Spinner variant="dots" decorative /> Saving changes</div>
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes` from `react`

```ts
type SpinnerProps = HTMLAttributes<HTMLSpanElement> & {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ring' | 'dots' | 'bars'
  label?: string
  paused?: boolean
  /** Use inside an already labelled loading button or status to avoid duplicate announcements. */
  decorative?: boolean
}
```

Exported value type annotations / generic factory calls from source:

- `Spinner: forwardRef<HTMLSpanElement, SpinnerProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Spinner.size`: `'md'`
- `Spinner.variant`: `'ring'`
- `Spinner.paused`: `false`
- `Spinner.decorative`: `false`
