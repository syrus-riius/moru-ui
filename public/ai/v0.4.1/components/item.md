# Item

Composable list item presentation for leading content, copy and trailing actions.

Version: 0.4.1. Source hash: 0b0b1530e773209ed6b6628a4168c3305b7342a1378da2b37377f96c1e54f293.

## Discovery

- Registry ID: `item`
- Import: `@/components/ui/moru/item`
- Runtime exports: `Item`, `ItemActions`, `ItemContent`, `ItemDescription`, `ItemGroup`, `ItemMedia`, `ItemSeparator`, `ItemTitle`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [item.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/item.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/item.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/item.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes` from `react`

```ts
type ItemProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'outline' | 'muted'
  size?: 'sm' | 'md' | 'lg'
}
```

Exported value type annotations / generic factory calls from source:

- `Item: forwardRef<HTMLDivElement, ItemProps>`

Exported function declaration excerpts (return types may be inferred in source):

```ts
function ItemGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>);
function ItemMedia({ className, ...props }: HTMLAttributes<HTMLDivElement>);
function ItemContent({ className, ...props }: HTMLAttributes<HTMLDivElement>);
function ItemTitle({ className, ...props }: HTMLAttributes<HTMLDivElement>);
function ItemDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>);
function ItemActions({ className, ...props }: HTMLAttributes<HTMLDivElement>);
function ItemSeparator({ className, ...props }: HTMLAttributes<HTMLHRElement>);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Item.variant`: `'default'`
- `Item.size`: `'md'`
