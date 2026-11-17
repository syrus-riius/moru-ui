# Marker

Small status, count or activity marker for surrounding content.

Version: 0.4.1. Source hash: 2fd87d38eaaf0375eb097047b65a7d17f1067292b1a98efdbfd46ccdaa31ff28.

## Discovery

- Registry ID: `marker`
- Import: `@/components/ui/moru/marker`
- Runtime exports: `Marker`, `MarkerContent`, `MarkerIcon`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [marker.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/marker.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/marker.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/marker.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes` from `react`
- `SemanticTone` from `./state`

```ts
interface MarkerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'border' | 'separator'
  tone?: SemanticTone
}
```

Exported value type annotations / generic factory calls from source:

- `Marker: forwardRef<HTMLDivElement, MarkerProps>`

Exported function declaration excerpts (return types may be inferred in source):

```ts
function MarkerIcon({ className, ...props }: HTMLAttributes<HTMLSpanElement>);
function MarkerContent({ className, ...props }: HTMLAttributes<HTMLSpanElement>);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Marker.variant`: `'default'`
