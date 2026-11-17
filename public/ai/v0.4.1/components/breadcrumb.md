# Breadcrumb

Current-location trail with links, actions and an accessible current item.

Version: 0.4.1. Source hash: 2fd87d38eaaf0375eb097047b65a7d17f1067292b1a98efdbfd46ccdaa31ff28.

## Discovery

- Registry ID: `breadcrumb`
- Import: `@/components/ui/moru/breadcrumb`
- Runtime exports: `Breadcrumb`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [breadcrumb.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/breadcrumb.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/breadcrumb.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/breadcrumb.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ReactNode` from `react`

```ts
interface BreadcrumbItem {
  label: ReactNode
  href?: string
  onClick?: () => void
  disabled?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  'aria-label'?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Breadcrumb({
  items,
  disabled = false,
  size = 'md',
  className,
  'aria-label': labelProp,
}: BreadcrumbProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Breadcrumb.disabled`: `false`
- `Breadcrumb.size`: `'md'`
