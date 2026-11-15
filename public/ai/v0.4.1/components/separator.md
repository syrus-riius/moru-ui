# Separator

Horizontal or vertical separation of related content.

Version: 0.4.1. Source hash: baf065ccb1fccaa4eed187992c95b92d1b8fd9b7084c361d9faa54b0f7c55c24.

## Discovery

- Registry ID: `separator`
- Import: `@/components/ui/moru/separator`
- Runtime exports: `Separator`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [separator.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/separator.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/separator.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/separator.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `BaseSeparator` from `@base-ui/react/separator`
- `ComponentPropsWithoutRef` from `react`

```ts
interface SeparatorProps extends Omit<
  ComponentPropsWithoutRef<typeof BaseSeparator>,
  'className'
> {
  decorative?: boolean
  className?: string
}
```

Exported value type annotations / generic factory calls from source:

- `Separator: forwardRef<HTMLDivElement, SeparatorProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Separator.orientation`: `'horizontal'`
- `Separator.decorative`: `true`
