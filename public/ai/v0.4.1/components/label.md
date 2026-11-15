# Label

Text label for associating an accessible name with a form control.

Version: 0.4.1. Source hash: 330cfc12106a86e9393b1d2a455d5a28d7d11fdeccfe17f602eda7db8f347a38.

## Discovery

- Registry ID: `label`
- Import: `@/components/ui/moru/label`
- Runtime exports: `Label`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [label.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/label.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/label.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/label.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `LabelHTMLAttributes` from `react`

```ts
type LabelProps = LabelHTMLAttributes<HTMLLabelElement>
```

Exported value type annotations / generic factory calls from source:

- `Label: forwardRef<HTMLLabelElement, LabelProps>`
