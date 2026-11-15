# Accordion

Expandable sections with accessible headings and keyboard interaction.

Version: 0.4.1. Source hash: 08414026dbe9c50ebadb9391b938ed8ed1e97050bc3c6b5f7c1b6fd190aa8ab2.

## Discovery

- Registry ID: `accordion`
- Import: `@/components/ui/moru/accordion`
- Runtime exports: `Accordion`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [accordion.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/accordion.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/accordion.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/accordion.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes, ReactNode` from `react`

```ts
interface AccordionItem {
  value: string
  title: ReactNode
  content: ReactNode
  disabled?: boolean
}

interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  items: AccordionItem[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  multiple?: boolean
  disabled?: boolean
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Accordion({
  items,
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  disabled = false,
  className,
  ...props
}: AccordionProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Accordion.multiple`: `false`
- `Accordion.disabled`: `false`
