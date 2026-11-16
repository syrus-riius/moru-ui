# Dashboard Block

A complete project dashboard with metrics, activity and reusable project search. Local demo data; connect your service for persistence.

Version: 0.4.1. Source hash: 9e7fc610717ab4a2a951696248d6d47b7eb7d11cbfffc90d292087c06ac3c874.

## Discovery

- Registry ID: `dashboard`
- Import: `@/components/ui/moru/blocks/DashboardBlock`
- Runtime exports: `DashboardBlock`, `validateDashboardProject`
- Registry dependencies: [badge](/ai/v0.4.1/components/badge.md), [block-messages](/ai/v0.4.1/components/block-messages.md), [button](/ai/v0.4.1/components/button.md), [card](/ai/v0.4.1/components/card.md), [chart](/ai/v0.4.1/components/chart.md), [core](/ai/v0.4.1/core.md), [field](/ai/v0.4.1/components/field.md), [header](/ai/v0.4.1/components/header.md), [input](/ai/v0.4.1/components/input.md), [modal](/ai/v0.4.1/components/modal.md), [progress](/ai/v0.4.1/components/progress.md), [search-filters](/ai/v0.4.1/blocks/search-filters.md), [textarea](/ai/v0.4.1/components/textarea.md), [toggle-group](/ai/v0.4.1/components/toggle-group.md)
- Install source: [dashboard.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/dashboard.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/blocks/DashboardBlock.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/blocks/DashboardBlock.tsx)

## Usage and interaction

- DashboardBlock composes a complete project overview with Moru controls and SearchFiltersBlock. Its default data and actions are local examples, not a connected backend.
- title and defaultProjects customize the initial screen. onProjectsChange reports local project changes; it is a notification callback, not an awaited persistence handler or a controlled value prop.
- Use #blocks/dashboard for the interactive preview. Keep search filters inside the dashboard instead of treating them as an entire application screen.

## Minimal example

```tsx
import { DashboardBlock } from '@/components/ui/moru/blocks/DashboardBlock'

export function ProjectOverview() {
  return <DashboardBlock />
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `SearchFilterItem` from `./SearchFiltersBlock`

```ts
interface DashboardProject extends SearchFilterItem {
  completedTasks: number
  totalTasks: number
}

interface DashboardBlockProps {
  title?: string
  defaultProjects?: readonly DashboardProject[]
  onProjectsChange?: (projects: DashboardProject[]) => void
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function validateDashboardProject(name: string, projects: readonly DashboardProject[]);
function DashboardBlock({
  title: titleProp,
  defaultProjects = initialProjects,
  onProjectsChange,
}: DashboardBlockProps = {});
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `DashboardBlock.defaultProjects`: `initialProjects`
