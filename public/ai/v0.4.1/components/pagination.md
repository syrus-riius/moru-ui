# Pagination

Page navigation with bounded values, compact ranges and accessible controls.

Version: 0.4.1. Source hash: 5a0a4b244fa08e5ec114908231ad33098aa6646cb022935d28cab19340a90d48.

## Discovery

- Registry ID: `pagination`
- Import: `@/components/ui/moru/pagination`
- Runtime exports: `Pagination`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [pagination.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/pagination.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/pagination.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/pagination.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

```ts
interface PaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  siblingCount?: number
  disabled?: boolean
  'aria-label'?: string
  className?: string
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Pagination({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  disabled,
  'aria-label': ariaLabelProp,
  className,
}: PaginationProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Pagination.siblingCount`: `1`
