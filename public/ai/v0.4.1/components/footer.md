# Footer

Page footer with branding, grouped navigation and supporting content.

Version: 0.4.1. Source hash: 92d4b85e1d28cd9eda9391ef75e1e633fa26d884c86603172df42465b8fa832c.

## Discovery

- Registry ID: `footer`
- Import: `@/components/ui/moru/footer`
- Runtime exports: `Footer`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [footer.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/footer.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/footer.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/footer.tsx)

## Usage and interaction

- Variants are simple, columns and compact. Use navigation for a flat group, or columns with title and content for grouped links.
- columns is an array of {title, content, label?}; it is not a list of route objects. Each content value is a React node.
- Use copyright and meta for supporting information; preserve semantic footer/nav landmarks and give repeated navigation groups distinct labels.

## Minimal example

```tsx
import { Footer } from '@/components/ui/moru/footer'

export function SiteFooter() {
  return <Footer variant="columns" brand="Moru" description="Build with care."
    columns={[
      { title: 'Product', content: <><a href="/components">Components</a><a href="/docs">Documentation</a></> },
      { title: 'Company', content: <><a href="/about">About</a><a href="/contact">Contact</a></> },
    ]}
    copyright="© Moru" meta={<a href="/privacy">Privacy</a>} />
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes, ReactNode` from `react`

```ts
interface FooterColumn {
  title: string
  content: ReactNode
  /** Distinguish repeated group titles when more than one footer is present. */
  label?: string
}

type FooterProps = HTMLAttributes<HTMLElement> & {
  brand?: ReactNode
  description?: ReactNode
  navigation?: ReactNode
  navigationLabel?: string
  columns?: readonly FooterColumn[]
  copyright?: ReactNode
  meta?: ReactNode
  variant?: 'simple' | 'columns' | 'compact'
  size?: 'sm' | 'md' | 'lg'
}
```

Exported value type annotations / generic factory calls from source:

- `Footer: forwardRef<HTMLElement, FooterProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Footer.variant`: `'simple'`
- `Footer.size`: `'md'`
