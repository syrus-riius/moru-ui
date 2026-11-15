# Popover

Anchored popup with managed focus, collision handling and scoped portal styling.

Version: 0.4.1. Source hash: 330cfc12106a86e9393b1d2a455d5a28d7d11fdeccfe17f602eda7db8f347a38.

## Discovery

- Registry ID: `popover`
- Import: `@/components/ui/moru/popover`
- Runtime exports: `Popover`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [popover.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/popover.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/popover.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/popover.tsx)

## Usage and interaction

- Use Popover for anchored supporting content. Keep its trigger focusable and give the popup a title or aria-label.
- Positioning and portals are owned by Moru; do not move the popup outside the theme provider manually.

## Minimal example

Also install: `button`.

```tsx
import { Button } from '@/components/ui/moru/button'
import { Popover } from '@/components/ui/moru/popover'

export function Help() {
  return <Popover trigger={<Button type="button" variant="ghost">About visibility</Button>} title="Team visibility">
    <p>Only invited teammates can open this project.</p>
  </Popover>
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ComponentPropsWithoutRef, ReactElement, ReactNode` from `react`
- `BasePopover` from `@base-ui/react/popover`

```ts
interface PopoverProps {
  trigger: ReactElement
  title?: string
  description?: string
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: ComponentPropsWithoutRef<typeof BasePopover.Positioner>['side']
  align?: ComponentPropsWithoutRef<typeof BasePopover.Positioner>['align']
  sideOffset?: number
  className?: string
  /** Override focus when opened; omitted values retain Base UI's touch-safe default. */
  initialFocus?: ComponentPropsWithoutRef<typeof BasePopover.Popup>['initialFocus']
  /** Override the return target when the trigger is removed or the workflow moves elsewhere. */
  finalFocus?: ComponentPropsWithoutRef<typeof BasePopover.Popup>['finalFocus']
  'aria-label'?: string
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Popover({
  trigger,
  title,
  description,
  children,
  open,
  defaultOpen,
  onOpenChange,
  side = 'bottom',
  align = 'start',
  sideOffset = 8,
  className,
  initialFocus,
  finalFocus,
  'aria-label': ariaLabelProp,
}: PopoverProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Popover.side`: `'bottom'`
- `Popover.align`: `'start'`
- `Popover.sideOffset`: `8`
