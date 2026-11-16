# Menu

Dropdown actions with keyboard navigation, disabled items and scoped popup theming.

Version: 0.4.1. Source hash: 27e6f5b10b06dae29c6129d5ab80e735d6c44f2d84f74acf4149c979e0f65f4e.

## Discovery

- Registry ID: `menu`
- Import: `@/components/ui/moru/menu`
- Runtime exports: `Menu`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [menu.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/menu.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/menu.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/menu.tsx)

## Usage and interaction

- Menu accepts a ReactElement trigger and items with onClick. The export is Menu, not DropdownMenu.
- Use a trigger that forwards its props/ref (Moru Button does). Preserve focus restoration and keyboard activation.
- Menu manages its own open state by default. open/defaultOpen/onOpenChange are available when the application needs to control it, as with Popover and Modal.

## Minimal example

Also install: `button`.

```tsx
import { Button } from '@/components/ui/moru/button'
import { Menu } from '@/components/ui/moru/menu'

export function Actions() {
  return <Menu trigger={<Button type="button" variant="secondary">Actions</Button>}
    items={[{ label: 'Copy project name', onClick: () => void navigator.clipboard.writeText('Moru project') }]} />
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ComponentPropsWithoutRef, ReactElement, ReactNode` from `react`
- `BaseMenu` from `@base-ui/react/menu`

```ts
interface MenuProps {
  trigger: ReactElement
  items: Array<{
    label: string
    onClick?: () => void
    destructive?: boolean
    disabled?: boolean
    icon?: ReactNode
  }>
  className?: string
  disabled?: boolean
  /** Controlled open state, matching Popover and Modal. Omit it to let the menu manage itself. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  finalFocus?: ComponentPropsWithoutRef<typeof BaseMenu.Popup>['finalFocus']
  size?: 'sm' | 'md' | 'lg'
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Menu({
  trigger,
  items,
  className,
  disabled,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  finalFocus,
  size = 'md',
}: MenuProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Menu.defaultOpen`: `false`
- `Menu.size`: `'md'`
