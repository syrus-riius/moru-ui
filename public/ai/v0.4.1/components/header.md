# Header

Responsive page header with branding, navigation and action slots.

Version: 0.4.1. Source hash: 08414026dbe9c50ebadb9391b938ed8ed1e97050bc3c6b5f7c1b6fd190aa8ab2.

## Discovery

- Registry ID: `header`
- Import: `@/components/ui/moru/header`
- Runtime exports: `Header`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [header.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/header.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/header.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/header.tsx)

## Usage and interaction

- brand is required. Compose navigation and actions as React nodes; Header does not invent routes or own authentication.
- Variants are navigation, centered and app. The small-screen navigation is an inline disclosure; preserve its menu button, Escape handling and focus return.
- Use ordinary links for page navigation and mark the current destination with aria-current="page". Give separate navigation regions distinct navigationLabel values.

## Minimal example

```tsx
import { Header } from '@/components/ui/moru/header'

export function SiteHeader() {
  return <Header brand={<a href="/">Moru</a>} navigationLabel="Primary navigation"
    navigation={<><a href="/projects" aria-current="page">Projects</a><a href="/settings">Settings</a></>}
    actions={<a href="/account">Account</a>} />
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes, ReactNode` from `react`

```ts
type HeaderProps = HTMLAttributes<HTMLElement> & {
  brand: ReactNode
  navigation?: ReactNode
  actions?: ReactNode
  variant?: 'navigation' | 'centered' | 'app'
  size?: 'sm' | 'md' | 'lg'
  navigationLabel?: string
  menuLabel?: string
  /** Control the narrow-screen navigation disclosure, for example when opening search. */
  menuOpen?: boolean
  defaultMenuOpen?: boolean
  onMenuOpenChange?: (open: boolean) => void
}
```

Exported value type annotations / generic factory calls from source:

- `Header: forwardRef<HTMLElement, HeaderProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Header.variant`: `'navigation'`
- `Header.size`: `'md'`
- `Header.defaultMenuOpen`: `false`
