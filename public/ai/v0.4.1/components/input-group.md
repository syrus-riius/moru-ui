# Input Group

Composable input or textarea with connected addons and action buttons.

Version: 0.4.1. Source hash: 5a0a4b244fa08e5ec114908231ad33098aa6646cb022935d28cab19340a90d48.

## Discovery

- Registry ID: `input-group`
- Import: `@/components/ui/moru/input-group`
- Runtime exports: `InputGroup`, `InputGroupAddon`, `InputGroupButton`, `InputGroupInput`, `InputGroupTextarea`
- Registry dependencies: [button](/ai/v0.4.1/components/button.md), [core](/ai/v0.4.1/core.md), [input](/ai/v0.4.1/components/input.md), [textarea](/ai/v0.4.1/components/textarea.md)
- Install source: [input-group.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/input-group.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/input-group.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/input-group.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes` from `react`
- `InputProps` from `./input`
- `TextareaProps` from `./textarea`
- `ButtonProps` from `./button`

```ts
type InputGroupProps = HTMLAttributes<HTMLDivElement>

type InputGroupAddonProps = HTMLAttributes<HTMLDivElement> & {
  align?: 'inline-start' | 'inline-end' | 'block-start' | 'block-end'
}
```

Exported value type annotations / generic factory calls from source:

- `InputGroup: forwardRef<HTMLDivElement, InputGroupProps>`
- `InputGroupInput: forwardRef<HTMLInputElement, InputProps>`
- `InputGroupTextarea: forwardRef<HTMLTextAreaElement, TextareaProps>`
- `InputGroupButton: forwardRef<HTMLButtonElement, ButtonProps>`

Exported function declaration excerpts (return types may be inferred in source):

```ts
function InputGroupAddon({
  align = 'inline-start',
  className,
  ...props
}: InputGroupAddonProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `InputGroupAddon.align`: `'inline-start'`
- `InputGroupButton.variant`: `'ghost'`
- `InputGroupButton.size`: `'sm'`
