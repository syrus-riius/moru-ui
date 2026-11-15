# Search Filters Block

Composable query, status and assignee filters with local demo data and a controlled application API.

Version: 0.4.1. Source hash: baf065ccb1fccaa4eed187992c95b92d1b8fd9b7084c361d9faa54b0f7c55c24.

## Discovery

- Registry ID: `search-filters`
- Import: `@/components/ui/moru/blocks/SearchFiltersBlock`
- Runtime exports: `SearchFiltersBlock`, `filterBlockItems`
- Registry dependencies: [badge](/ai/v0.4.1/components/badge.md), [block-messages](/ai/v0.4.1/components/block-messages.md), [button](/ai/v0.4.1/components/button.md), [card](/ai/v0.4.1/components/card.md), [checkbox](/ai/v0.4.1/components/checkbox.md), [core](/ai/v0.4.1/core.md), [field](/ai/v0.4.1/components/field.md), [input](/ai/v0.4.1/components/input.md), [select](/ai/v0.4.1/components/select.md)
- Install source: [search-filters.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/search-filters.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/blocks/SearchFiltersBlock.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/blocks/SearchFiltersBlock.tsx)

## Usage and interaction

- A supporting region for dashboard and application screens. The screen preview is #blocks/dashboard.
- Omitting props shows demo data. Supply items, filters/onFiltersChange and onSelect for application data.
- Filtering is local. Connect server requests/pagination explicitly if your dataset requires them.

## Minimal example

```tsx
import { useState } from 'react'
import { SearchFiltersBlock, type SearchFiltersValue } from '@/components/ui/moru/blocks/SearchFiltersBlock'

export function ProjectSearch() {
  const [filters, setFilters] = useState<SearchFiltersValue>({ query: '', status: 'all', mineOnly: false })
  return <SearchFiltersBlock filters={filters} onFiltersChange={setFilters}
    items={[{ id: 'launch', name: 'Launch', summary: 'Prepare the next release.', status: 'active', owner: 'me' }]}
    onSelect={(id) => window.alert(id)} />
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

```ts
interface SearchFilterItem {
  id: string
  name: string
  summary: string
  status: string
  owner: string
}

interface SearchFiltersValue {
  query: string
  status: string
  mineOnly: boolean
}

interface SearchFiltersBlockProps {
  items?: readonly SearchFilterItem[]
  filters?: SearchFiltersValue
  defaultFilters?: Partial<SearchFiltersValue>
  onFiltersChange?: (filters: SearchFiltersValue) => void
  onSelect?: (id: string) => void
  currentOwner?: string
  statusOptions?: readonly { value: string; label: string }[]
  title?: string
  description?: string
  searchLabel?: string
  mineLabel?: string
  resultsLabel?: string
  selectLabel?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyActionLabel?: string
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function filterBlockItems(
  query: string,
  status: string,
  mineOnly: boolean,
  items: readonly SearchFilterItem[] = projects,
  currentOwner = 'me',
);
function SearchFiltersBlock({
  items = projects,
  filters,
  defaultFilters,
  onFiltersChange,
  onSelect,
  currentOwner = 'me',
  statusOptions: statusOptionsProp,
  title: titleProp,
  description: descriptionProp,
  searchLabel: searchLabelProp,
  mineLabel: mineLabelProp,
  resultsLabel: resultsLabelProp,
  selectLabel: selectLabelProp,
  emptyTitle: emptyTitleProp,
  emptyDescription: emptyDescriptionProp,
  emptyActionLabel: emptyActionLabelProp,
}: SearchFiltersBlockProps = {});
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `SearchFiltersBlock.items`: `projects`
- `SearchFiltersBlock.currentOwner`: `'me'`
