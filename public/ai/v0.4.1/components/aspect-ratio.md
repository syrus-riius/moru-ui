# Aspect Ratio

A responsive content frame that preserves a chosen aspect ratio.

Version: 0.4.1. Source hash: cf8221846caa9e729f2295329aa88140290148a595053c1c2cd671fc80cb0e9b.

## Discovery

- Registry ID: `aspect-ratio`
- Import: `@/components/ui/moru/aspect-ratio`
- Runtime exports: `AspectRatio`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [aspect-ratio.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/aspect-ratio.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/aspect-ratio.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/aspect-ratio.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes` from `react`

```ts
type AspectRatioProps = HTMLAttributes<HTMLDivElement> & { ratio?: number }
```

Exported value type annotations / generic factory calls from source:

- `AspectRatio: forwardRef<HTMLDivElement, AspectRatioProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `AspectRatio.ratio`: `16 / 9`
