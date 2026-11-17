# Trace

Expandable execution or workflow history with step status and details.

Version: 0.4.1. Source hash: 2fd87d38eaaf0375eb097047b65a7d17f1067292b1a98efdbfd46ccdaa31ff28.

## Discovery

- Registry ID: `trace`
- Import: `@/components/ui/moru/trace`
- Runtime exports: `Trace`, `formatTraceDuration`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [trace.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/trace.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/trace.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/trace.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `koreanTranslator, Translator` from `./_lib/locale`
- `HTMLAttributes, ReactNode` from `react`

```ts
type TraceStatus = 'pending' | 'running' | 'complete' | 'error'

interface TraceStep {
  id: string
  title: string
  description?: string
  status?: TraceStatus
  durationMs?: number
  details?: ReactNode
}

interface TraceProps extends Omit<HTMLAttributes<HTMLOListElement>, 'children'> {
  items: TraceStep[]
  expanded?: string[]
  defaultExpanded?: string[]
  onExpandedChange?: (expanded: string[]) => void
  disabled?: boolean
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function formatTraceDuration(durationMs: number, t: Translator = koreanTranslator);
function Trace({
  items,
  expanded,
  defaultExpanded = [],
  onExpandedChange,
  disabled,
  className,
  'aria-label': labelProp,
  ...props
}: TraceProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Trace.defaultExpanded`: `[]`
