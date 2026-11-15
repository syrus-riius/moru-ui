# Progress

Accessible progress indicator for known or indeterminate work.

Version: 0.4.1. Source hash: 3d50d8d1c9951acff47d57ffd227011e1e268683be793d82d543261e48d83ef7.

## Discovery

- Registry ID: `progress`
- Import: `@/components/ui/moru/progress`
- Runtime exports: `Progress`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [progress.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/progress.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/progress.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/progress.tsx)

## Usage and interaction

- Use value=null for indeterminate work; never invent a completion percentage. max defaults to 100; invalid numeric values are normalized.
- bufferValue uses the same units as value and describes work prepared ahead, not completed. It cannot be below the completion value. Use an adjacent description to explain buffering when needed.
- size is sm/md/lg, tone is primary/success/warning/danger/info. striped adds a pattern; animated opts into moving stripes. paused stops repeating motion. System reduced-motion settings disable animation.
- Keep cancel and retry buttons outside Progress: progressbar descendants are presentational. Announce start and completion in a separate status region, not every percentage change.

## Minimal example

```tsx
import { Progress } from '@/components/ui/moru/progress'
export function UploadProgress() {
  return <Progress label="Uploading files" value={42} bufferValue={68} showValue size="md" />
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `BaseProgress` from `@base-ui/react/progress`
- `ComponentPropsWithoutRef` from `react`

```ts
interface ProgressProps extends Omit<
  ComponentPropsWithoutRef<typeof BaseProgress.Root>,
  'className' | 'children' | 'min' | 'max' | 'value'
> {
  value?: number | null
  max?: number
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** Amount prepared or buffered, in the same units as value. This does not change completion. */
  bufferValue?: number
  striped?: boolean
  /** Animate stripes only when striped is enabled. Indeterminate progress moves by default. */
  animated?: boolean
  paused?: boolean
  className?: string
}
```

Exported value type annotations / generic factory calls from source:

- `Progress: forwardRef<HTMLDivElement, ProgressProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Progress.value`: `0`
- `Progress.max`: `100`
- `Progress.showValue`: `false`
- `Progress.size`: `'md'`
- `Progress.tone`: `'primary'`
- `Progress.striped`: `false`
- `Progress.animated`: `false`
- `Progress.paused`: `false`
