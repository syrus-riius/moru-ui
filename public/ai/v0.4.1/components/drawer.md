# Drawer

Bottom modal drawer with managed focus and keyboard or pointer dismissal.

Version: 0.4.1. Source hash: 08414026dbe9c50ebadb9391b938ed8ed1e97050bc3c6b5f7c1b6fd190aa8ab2.

## Discovery

- Registry ID: `drawer`
- Import: `@/components/ui/moru/drawer`
- Runtime exports: `Drawer`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [drawer.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/drawer.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/drawer.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/drawer.tsx)

## Usage and interaction

- Drawer is a bottom modal with a required title. Preserve its focus management and keyboard-accessible dismissal.
- Use the component’s existing pointer/keyboard handle; do not make swipe the only way to close.

## Minimal example

Also install: `button`.

```tsx
import { Button } from '@/components/ui/moru/button'
import { Drawer } from '@/components/ui/moru/drawer'

export function MobileDetails() {
  return <Drawer trigger={<Button type="button">Details</Button>} title="Project details" description="Your current milestone.">
    <p>Three tasks remain before launch.</p>
  </Drawer>
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ComponentPropsWithoutRef, ReactElement, ReactNode` from `react`
- `BaseDialog` from `@base-ui/react/dialog`

```ts
interface DrawerProps {
  trigger?: ReactElement
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  initialFocus?: ComponentPropsWithoutRef<typeof BaseDialog.Popup>['initialFocus']
  finalFocus?: ComponentPropsWithoutRef<typeof BaseDialog.Popup>['finalFocus']
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Drawer({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled,
  size = 'md',
  className,
  initialFocus,
  finalFocus,
}: DrawerProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Drawer.defaultOpen`: `false`
- `Drawer.size`: `'md'`
