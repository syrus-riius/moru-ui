# Command

Searchable command dialog with grouped actions and keyboard navigation.

Version: 0.4.1. Source hash: 0b0b1530e773209ed6b6628a4168c3305b7342a1378da2b37377f96c1e54f293.

## Discovery

- Registry ID: `command`
- Import: `@/components/ui/moru/command`
- Runtime exports: `Command`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [command.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/command.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/command.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/command.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ReactElement` from `react`

```ts
interface CommandItem {
  id: string
  label: string
  description?: string
  keywords?: string[]
  group?: string
  disabled?: boolean
  onSelect: () => void
}

interface CommandProps {
  items: CommandItem[]
  trigger?: ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  placeholder?: string
  className?: string
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Command({
  items,
  trigger,
  open,
  onOpenChange,
  title: titleProp,
  placeholder: placeholderProp,
  className,
}: CommandProps);
```
