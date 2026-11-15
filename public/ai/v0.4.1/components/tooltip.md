# Tooltip

Short supplementary information with optional shared TooltipProvider timing.

Version: 0.4.1. Source hash: 330cfc12106a86e9393b1d2a455d5a28d7d11fdeccfe17f602eda7db8f347a38.

## Discovery

- Registry ID: `tooltip`
- Import: `@/components/ui/moru/tooltip`
- Runtime exports: `Tooltip`, `TooltipProvider`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [tooltip.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/tooltip.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/tooltip.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/tooltip.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `ComponentPropsWithoutRef, ReactElement, ReactNode` from `react`
- `BaseTooltip` from `@base-ui/react/tooltip`

```ts
interface TooltipProviderProps {
  children: ReactNode
  delay?: number
  closeDelay?: number
  timeout?: number
}

interface TooltipProps {
  trigger: ReactElement
  children: ReactNode
  side?: ComponentPropsWithoutRef<typeof BaseTooltip.Positioner>['side']
  align?: ComponentPropsWithoutRef<typeof BaseTooltip.Positioner>['align']
  className?: string
  delay?: number
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function TooltipProvider({
  children,
  delay = 400,
  closeDelay = 100,
  timeout = 400,
}: TooltipProviderProps);
function Tooltip({
  trigger,
  children,
  side = 'top',
  align = 'center',
  className,
  delay,
}: TooltipProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `TooltipProvider.delay`: `400`
- `TooltipProvider.closeDelay`: `100`
- `TooltipProvider.timeout`: `400`
- `Tooltip.side`: `'top'`
- `Tooltip.align`: `'center'`
