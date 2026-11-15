# Menu

Dropdown actions with keyboard navigation, disabled items and scoped popup theming.

Version: 0.4.0. Source hash: c7657160432134a41ca0feec508cb24f0ded72c14d22567531868ef45f3e6dcc.

## Discovery

- Registry ID: `menu`
- Import: `@/components/ui/moru/menu`
- Runtime exports: `Menu`
- Registry dependencies: [core](/ai/v0.4.0/core.md)
- Install source: [menu.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/menu.json)
- Setup and import-path differences: [start](/ai/v0.4.0/start.md)
- Source: [src/components/ui/menu.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/menu.tsx)

## Usage and interaction

- Menu accepts a ReactElement trigger and items with onClick. The export is Menu, not DropdownMenu.
- Use a trigger that forwards its props/ref (Moru Button does). Preserve focus restoration and keyboard activation.

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
  finalFocus?: ComponentPropsWithoutRef<typeof BaseMenu.Popup>['finalFocus']
  size?: 'sm' | 'md' | 'lg'
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Menu({ trigger, items, className, disabled, finalFocus, size = 'md' }: MenuProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Menu.size`: `'md'`
