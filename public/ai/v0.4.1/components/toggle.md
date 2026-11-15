# Toggle

Accessible pressed-state action with token-based size and styling.

Version: 0.4.1. Source hash: 92d4b85e1d28cd9eda9391ef75e1e633fa26d884c86603172df42465b8fa832c.

## Discovery

- Registry ID: `toggle`
- Import: `@/components/ui/moru/toggle`
- Runtime exports: `Toggle`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [toggle.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/toggle.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/toggle.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/toggle.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ComponentPropsWithoutRef` from `react`
- `BaseToggle` from `@base-ui/react/toggle`

```ts
type ToggleProps = Omit<
  ComponentPropsWithoutRef<typeof BaseToggle>,
  'className' | 'onPressedChange'
> & {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline'
  onPressedChange?: (pressed: boolean) => void
}
```

Exported value type annotations / generic factory calls from source:

- `Toggle: forwardRef<HTMLButtonElement, ToggleProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Toggle.size`: `'md'`
- `Toggle.variant`: `'default'`
