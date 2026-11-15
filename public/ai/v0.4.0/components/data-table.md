# Data Table

TanStack-based table with filtering, sorting, row selection, visible columns and pagination.

Version: 0.4.0. Source hash: e068de2cd7d2d1f2f198a786dcd23f4fee5b398de94b2591cabeb3a5ceb100f6.

## Discovery

- Registry ID: `data-table`
- Import: `@/components/ui/moru/data-table`
- Runtime exports: `DataTable`, `dataTableFeatures`
- Registry dependencies: [button](/ai/v0.4.0/components/button.md), [checkbox](/ai/v0.4.0/components/checkbox.md), [core](/ai/v0.4.0/core.md), [input](/ai/v0.4.0/components/input.md), [pagination](/ai/v0.4.0/components/pagination.md), [popover](/ai/v0.4.0/components/popover.md), [table](/ai/v0.4.0/components/table.md)
- Install source: [data-table.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/data-table.json)
- Setup and import-path differences: [start](/ai/v0.4.0/start.md)
- Source: [src/components/ui/data-table.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/data-table.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ColumnDef, RowData` from `@tanstack/react-table`

```ts
type DataTableFeatures = typeof dataTableFeatures

type DataTableColumn<T extends RowData> = ColumnDef<DataTableFeatures, T>

interface DataTableProps<T extends RowData> {
  data: T[]
  columns: DataTableColumn<T>[]
  getRowId: (row: T) => string
  caption: string
  pageSize?: number
  selectable?: boolean
  disabled?: boolean
  searchPlaceholder?: string
  onSelectionChange?: (ids: string[]) => void
  className?: string
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function DataTable<T extends RowData>({
  data,
  columns,
  getRowId,
  caption,
  pageSize = 5,
  selectable = true,
  disabled = false,
  searchPlaceholder: searchPlaceholderProp,
  onSelectionChange,
  className,
}: DataTableProps<T>);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `DataTable.pageSize`: `5`
- `DataTable.selectable`: `true`
- `DataTable.disabled`: `false`
