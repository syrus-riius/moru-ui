# Menubar

Application menu bar with nested actions and keyboard focus handling.

Version: 0.4.1. Source hash: 92d4b85e1d28cd9eda9391ef75e1e633fa26d884c86603172df42465b8fa832c.

## Discovery

- Registry ID: `menubar`
- Import: `@/components/ui/moru/menubar`
- Runtime exports: `Menubar`
- Registry dependencies: [context-menu](/ai/v0.4.1/components/context-menu.md), [core](/ai/v0.4.1/core.md)
- Install source: [menubar.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/menubar.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/menubar.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/menubar.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `NavigationAction` from `./navigation-menu-items`

```ts
interface MenubarMenu {
  id: string
  label: string
  disabled?: boolean
  items: NavigationAction[]
}

interface MenubarProps {
  menus: MenubarMenu[]
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  'aria-label'?: string
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Menubar({
  menus,
  disabled,
  size = 'md',
  className,
  'aria-label': labelProp,
}: MenubarProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Menubar.size`: `'md'`
