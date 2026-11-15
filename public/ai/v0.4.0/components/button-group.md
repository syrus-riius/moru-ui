# Button Group

Horizontal or vertical grouping for related buttons and actions.

Version: 0.4.0. Source hash: e068de2cd7d2d1f2f198a786dcd23f4fee5b398de94b2591cabeb3a5ceb100f6.

## Discovery

- Registry ID: `button-group`
- Import: `@/components/ui/moru/button-group`
- Runtime exports: `ButtonGroup`, `ButtonGroupText`
- Registry dependencies: [core](/ai/v0.4.0/core.md)
- Install source: [button-group.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/button-group.json)
- Setup and import-path differences: [start](/ai/v0.4.0/start.md)
- Source: [src/components/ui/button-group.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/button-group.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes` from `react`

```ts
type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: 'horizontal' | 'vertical'
}
```

Exported value type annotations / generic factory calls from source:

- `ButtonGroup: forwardRef<HTMLDivElement, ButtonGroupProps>`

Exported function declaration excerpts (return types may be inferred in source):

```ts
function ButtonGroupText({ className, ...props }: HTMLAttributes<HTMLSpanElement>);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `ButtonGroup.orientation`: `'horizontal'`
- `ButtonGroup.role`: `'group'`
