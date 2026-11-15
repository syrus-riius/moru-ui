# Scroll Area

Styled scrollable viewport with accessible native scrolling behavior.

Version: 0.4.1. Source hash: 330cfc12106a86e9393b1d2a455d5a28d7d11fdeccfe17f602eda7db8f347a38.

## Discovery

- Registry ID: `scroll-area`
- Import: `@/components/ui/moru/scroll-area`
- Runtime exports: `ScrollArea`, `ScrollBar`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [scroll-area.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/scroll-area.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/scroll-area.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/scroll-area.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ComponentPropsWithoutRef` from `react`
- `BaseScrollArea` from `@base-ui/react/scroll-area`

```ts
interface ScrollAreaProps extends ComponentPropsWithoutRef<'div'> {
  orientation?: 'vertical' | 'horizontal' | 'both'
  viewportClassName?: string
}
```

Exported value type annotations / generic factory calls from source:

- `ScrollArea: forwardRef<HTMLDivElement, ScrollAreaProps>`

Exported function declaration excerpts (return types may be inferred in source):

```ts
function ScrollBar({
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof BaseScrollArea.Scrollbar>, 'className'> & {
  className?: string
});
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `ScrollArea.orientation`: `'vertical'`
