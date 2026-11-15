# Status Indicator

Readable connection or synchronization status with an optional pulse and polite announcement.

Version: 0.4.1. Source hash: 0b0b1530e773209ed6b6628a4168c3305b7342a1378da2b37377f96c1e54f293.

## Discovery

- Registry ID: `status-indicator`
- Import: `@/components/ui/moru/status-indicator`
- Runtime exports: `StatusIndicator`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [status-indicator.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/status-indicator.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/status-indicator.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/status-indicator.tsx)

## Usage and interaction

- Always provide readable label text: color and an animated dot alone do not explain status. tone is neutral/success/warning/danger/info.
- pulse is opt-in for ongoing activity; paused and system reduced-motion stop the animation. Use live="polite" for changing status text; default static indicators do not announce themselves.
- Use Spinner for a wait, Progress for a known amount, and StatusIndicator for persistent connectivity or synchronization state.

## Minimal example

```tsx
import { StatusIndicator } from '@/components/ui/moru/status-indicator'
export function SyncStatus({ syncing }: { syncing: boolean }) {
  return <StatusIndicator label={syncing ? "Syncing" : "Saved"}
    tone={syncing ? "info" : "success"} pulse={syncing} live="polite" />
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes` from `react`

```ts
interface StatusIndicatorProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Always include readable text; a colored dot alone does not explain a status. */
  label: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  paused?: boolean
  /** Opt in for changing status text; static indicators do not need a live region. */
  live?: 'off' | 'polite'
}
```

Exported value type annotations / generic factory calls from source:

- `StatusIndicator: forwardRef<HTMLSpanElement, StatusIndicatorProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `StatusIndicator.tone`: `'neutral'`
- `StatusIndicator.size`: `'md'`
- `StatusIndicator.pulse`: `false`
- `StatusIndicator.paused`: `false`
- `StatusIndicator.live`: `'off'`
