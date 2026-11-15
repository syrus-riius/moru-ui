# Tabs

Accessible horizontal or vertical tabs with controlled selection and keyboard navigation.

Version: 0.4.1. Source hash: 0b0b1530e773209ed6b6628a4168c3305b7342a1378da2b37377f96c1e54f293.

## Discovery

- Registry ID: `tabs`
- Import: `@/components/ui/moru/tabs`
- Runtime exports: `Tabs`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [tabs.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/tabs.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/tabs.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/tabs.tsx)

## Usage and interaction

- Tabs uses items with value, label and content; do not invent TabsList/TabTrigger exports.
- Default activateOnFocus=false: arrows move focus; Enter/Space selects. Use tabs for views inside a page, ordinary links for navigation.

## Minimal example

```tsx
import { Tabs } from '@/components/ui/moru/tabs'

export function ProjectTabs() {
  return <Tabs aria-label="Project views" defaultValue="overview" items={[
    { value: 'overview', label: 'Overview', content: <p>Project summary</p> },
    { value: 'activity', label: 'Activity', content: <p>Recent updates</p> },
  ]} />
}
```

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ReactNode` from `react`

```ts
interface TabsProps {
  items: Array<{ value: string; label: string; content: ReactNode; disabled?: boolean }>
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  'aria-label'?: string
  size?: 'sm' | 'md' | 'lg'
  orientation?: 'horizontal' | 'vertical'
  /** Arrow keys move focus; Enter/Space activates by default. */
  activateOnFocus?: boolean
  loopFocus?: boolean
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Tabs({
  items,
  defaultValue,
  value,
  onValueChange,
  className,
  size = 'md',
  orientation = 'horizontal',
  activateOnFocus = false,
  loopFocus = true,
  'aria-label': ariaLabelProp,
}: TabsProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Tabs.size`: `'md'`
- `Tabs.orientation`: `'horizontal'`
- `Tabs.activateOnFocus`: `false`
- `Tabs.loopFocus`: `true`
