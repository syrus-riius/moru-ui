# Command

Searchable command dialog with grouped actions and keyboard navigation.

Version: 0.4.0. Source hash: c7657160432134a41ca0feec508cb24f0ded72c14d22567531868ef45f3e6dcc.

## Discovery

- Registry ID: `command`
- Import: `@/components/ui/moru/command`
- Runtime exports: `Command`
- Registry dependencies: [core](/ai/v0.4.0/core.md)
- Install source: [command.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/command.json)
- Setup and import-path differences: [start](/ai/v0.4.0/start.md)
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
