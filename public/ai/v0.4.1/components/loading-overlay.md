# Loading Overlay

Contained loading boundary that preserves content and safely blocks interaction while busy.

Version: 0.4.1. Source hash: 0b0b1530e773209ed6b6628a4168c3305b7342a1378da2b37377f96c1e54f293.

## Discovery

- Registry ID: `loading-overlay`
- Import: `@/components/ui/moru/loading-overlay`
- Runtime exports: `LoadingOverlay`
- Registry dependencies: [core](/ai/v0.4.1/core.md), [spinner](/ai/v0.4.1/components/spinner.md)
- Install source: [loading-overlay.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/loading-overlay.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/loading-overlay.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/loading-overlay.tsx)

## Usage and interaction

- Wrap content in LoadingOverlay and control loading from the actual request lifecycle. Content remains mounted and becomes inert while busy. The status lives outside the busy/inert content.
- Keep cancel/retry/complete controls outside the covered content. Close already-open portaled menus before starting loading; inert covers only descendants.
- If loading starts while a child owns focus, focus moves to the loading status without scrolling. It restores only if the status still owns focus. Focus elsewhere is not stolen. This is a local boundary, not a modal or focus trap.
- label defaults to the localized loading text; description adds detail. spinnerVariant accepts ring/dots/bars and paused stops its motion.

## Minimal example

Also install: `input`.

```tsx
import { LoadingOverlay } from '@/components/ui/moru/loading-overlay'
import { Input } from '@/components/ui/moru/input'
export function SavingForm({ saving }: { saving: boolean }) {
  return <LoadingOverlay loading={saving} label="Saving settings" spinnerVariant="dots">
    <label>Project name<Input name="name" defaultValue="Moru" /></label>
  </LoadingOverlay>
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes, ReactNode` from `react`
- `SpinnerProps` from `./spinner`

```ts
interface LoadingOverlayProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  loading: boolean
  label?: string
  description?: string
  spinnerVariant?: SpinnerProps['variant']
  paused?: boolean
  children: ReactNode
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function LoadingOverlay({
  loading,
  label: labelProp,
  description,
  spinnerVariant = 'ring',
  paused = false,
  children,
  className,
  tabIndex = -1,
  ...props
}: LoadingOverlayProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `LoadingOverlay.spinnerVariant`: `'ring'`
- `LoadingOverlay.paused`: `false`
- `LoadingOverlay.tabIndex`: `-1`
