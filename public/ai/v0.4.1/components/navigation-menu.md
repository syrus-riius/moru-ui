# Navigation Menu

Grouped navigation links and popup content with keyboard navigation.

Version: 0.4.1. Source hash: 27e6f5b10b06dae29c6129d5ab80e735d6c44f2d84f74acf4149c979e0f65f4e.

## Discovery

- Registry ID: `navigation-menu`
- Import: `@/components/ui/moru/navigation-menu`
- Runtime exports: `NavigationMenu`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [navigation-menu.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/navigation-menu.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/navigation-menu.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/navigation-menu.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

```ts
interface NavigationMenuLink {
  id: string
  label: string
  href: string
  description?: string
  disabled?: boolean
  onSelect?: () => void
}

interface NavigationMenuItem {
  id: string
  label: string
  href?: string
  onSelect?: () => void
  disabled?: boolean
  active?: boolean
  links?: NavigationMenuLink[]
}

interface NavigationMenuProps {
  items: NavigationMenuItem[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  'aria-label'?: string
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function NavigationMenu({
  items,
  value,
  defaultValue = null,
  onValueChange,
  disabled,
  size = 'md',
  className,
  'aria-label': labelProp,
}: NavigationMenuProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `NavigationMenu.defaultValue`: `null`
- `NavigationMenu.size`: `'md'`
