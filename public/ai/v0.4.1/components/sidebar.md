# Sidebar

Collapsible application navigation with a mobile modal panel.

Version: 0.4.1. Source hash: 330cfc12106a86e9393b1d2a455d5a28d7d11fdeccfe17f602eda7db8f347a38.

## Discovery

- Registry ID: `sidebar`
- Import: `@/components/ui/moru/sidebar`
- Runtime exports: `Sidebar`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [sidebar.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/sidebar.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/sidebar.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/sidebar.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ReactNode` from `react`

```ts
interface SidebarItem {
  id: string
  label: string
  icon?: ReactNode
  badge?: string | number
  disabled?: boolean
}

interface SidebarProps {
  title: string
  items: SidebarItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
  footer?: ReactNode
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  'aria-label'?: string
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Sidebar({
  title,
  items,
  value,
  defaultValue,
  onValueChange,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  mobileOpen,
  onMobileOpenChange,
  footer,
  disabled,
  size = 'md',
  className,
  'aria-label': label,
}: SidebarProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Sidebar.defaultCollapsed`: `false`
- `Sidebar.size`: `'md'`
