# Table

Semantic table, caption, header, row, cell and footer primitives.

Version: 0.4.1. Source hash: 330cfc12106a86e9393b1d2a455d5a28d7d11fdeccfe17f602eda7db8f347a38.

## Discovery

- Registry ID: `table`
- Import: `@/components/ui/moru/table`
- Runtime exports: `Table`, `TableBody`, `TableCaption`, `TableCell`, `TableFooter`, `TableHead`, `TableHeader`, `TableRow`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [table.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/table.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/table.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/table.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ComponentPropsWithoutRef` from `react`

```ts
type TableProps = ComponentPropsWithoutRef<'table'> & {
  scrollLabel?: string
  wrapperClassName?: string
}
```

Exported value type annotations / generic factory calls from source:

- `Table: forwardRef<HTMLTableElement, TableProps>`
- `TableHeader: forwardRef<HTMLTableSectionElement, ComponentPropsWithoutRef<'thead'>>`
- `TableBody: forwardRef<HTMLTableSectionElement, ComponentPropsWithoutRef<'tbody'>>`
- `TableFooter: forwardRef<HTMLTableSectionElement, ComponentPropsWithoutRef<'tfoot'>>`
- `TableRow: forwardRef<HTMLTableRowElement, ComponentPropsWithoutRef<'tr'>>`
- `TableHead: forwardRef<HTMLTableCellElement, ComponentPropsWithoutRef<'th'>>`
- `TableCell: forwardRef<HTMLTableCellElement, ComponentPropsWithoutRef<'td'>>`
- `TableCaption: forwardRef<
  HTMLTableCaptionElement,
  ComponentPropsWithoutRef<'caption'>
>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `TableHead.scope`: `'col'`
