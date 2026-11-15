# Toggle Group

Grouped toggle options with single or multiple selection.

Version: 0.4.1. Source hash: 92d4b85e1d28cd9eda9391ef75e1e633fa26d884c86603172df42465b8fa832c.

## Discovery

- Registry ID: `toggle-group`
- Import: `@/components/ui/moru/toggle-group`
- Runtime exports: `ToggleGroup`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [toggle-group.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/toggle-group.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/toggle-group.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/toggle-group.tsx)

## Usage and interaction

- layout="wrap" is the default for groups that may use multiple rows. Use layout="segmented" for equal-width choices that must stay together in one row.
- In a narrow card, move the whole segmented group below neighboring content. Long labels can wrap inside each choice; keep a meaningful aria-label and the existing keyboard order.

## Minimal example

```tsx
import { ToggleGroup } from '@/components/ui/moru/toggle-group'
export function ReportingPeriod() {
  return <ToggleGroup layout="segmented" aria-label="Reporting period" preventEmpty
    defaultValue={["week"]} items={[{ value: "week", label: "Weekly" }, { value: "month", label: "Monthly" }]} />
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ReactNode` from `react`

```ts
interface ToggleGroupItem {
  value: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

interface ToggleGroupProps {
  items: ToggleGroupItem[]
  type?: 'single' | 'multiple'
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  preventEmpty?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  /** Segmented options share equal columns and stay together; long labels can wrap. */
  layout?: 'wrap' | 'segmented'
  'aria-label'?: string
  'aria-labelledby'?: string
  className?: string
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function ToggleGroup({
  items,
  type = 'single',
  value,
  defaultValue = [],
  onValueChange,
  preventEmpty = false,
  disabled,
  size = 'md',
  layout = 'wrap',
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  className,
}: ToggleGroupProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `ToggleGroup.type`: `'single'`
- `ToggleGroup.defaultValue`: `[]`
- `ToggleGroup.preventEmpty`: `false`
- `ToggleGroup.size`: `'md'`
- `ToggleGroup.layout`: `'wrap'`
