# Context Menu

Contextual action menu with nested actions and keyboard navigation.

Version: 0.4.1. Source hash: 0b0b1530e773209ed6b6628a4168c3305b7342a1378da2b37377f96c1e54f293.

## Discovery

- Registry ID: `context-menu`
- Import: `@/components/ui/moru/context-menu`
- Runtime exports: `ContextMenu`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [context-menu.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/context-menu.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/context-menu.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/context-menu.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ReactNode` from `react`
- `NavigationAction` from `./navigation-menu-items`

```ts
type ContextMenuItem = NavigationAction

interface ContextMenuProps {
  children: ReactNode
  items: ContextMenuItem[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  'aria-label'?: string
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function ContextMenu({
  children,
  items,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled,
  size = 'md',
  className,
  'aria-label': labelProp,
}: ContextMenuProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `ContextMenu.defaultOpen`: `false`
- `ContextMenu.size`: `'md'`
