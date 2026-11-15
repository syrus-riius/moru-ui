# Collapsible

Expandable content controlled by a keyboard-accessible disclosure trigger.

Version: 0.4.1. Source hash: 5a0a4b244fa08e5ec114908231ad33098aa6646cb022935d28cab19340a90d48.

## Discovery

- Registry ID: `collapsible`
- Import: `@/components/ui/moru/collapsible`
- Runtime exports: `Collapsible`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [collapsible.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/collapsible.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/collapsible.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/collapsible.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ReactNode` from `react`

```ts
interface CollapsibleProps {
  title: ReactNode
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Collapsible({
  title,
  children,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  size = 'md',
  className,
}: CollapsibleProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Collapsible.size`: `'md'`
