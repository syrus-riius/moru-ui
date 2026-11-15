# Bubble

Message bubble presentation for conversational interfaces.

Version: 0.4.1. Source hash: 5a0a4b244fa08e5ec114908231ad33098aa6646cb022935d28cab19340a90d48.

## Discovery

- Registry ID: `bubble`
- Import: `@/components/ui/moru/bubble`
- Runtime exports: `Bubble`, `BubbleContent`, `BubbleFooter`, `BubbleGroup`, `BubbleReactions`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [bubble.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/bubble.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/bubble.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/bubble.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes` from `react`

```ts
interface BubbleProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline'
  align?: 'start' | 'end'
}
```

Exported value type annotations / generic factory calls from source:

- `Bubble: forwardRef<HTMLDivElement, BubbleProps>`

Exported function declaration excerpts (return types may be inferred in source):

```ts
function BubbleContent({ className, ...props }: HTMLAttributes<HTMLDivElement>);
function BubbleFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>);
function BubbleReactions({
  className,
  'aria-label': labelProp,
  ...props
}: HTMLAttributes<HTMLDivElement>);
function BubbleGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Bubble.variant`: `'default'`
- `Bubble.align`: `'start'`
