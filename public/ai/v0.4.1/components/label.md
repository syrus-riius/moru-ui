# Label

Text label for associating an accessible name with a form control.

Version: 0.4.1. Source hash: 2fd87d38eaaf0375eb097047b65a7d17f1067292b1a98efdbfd46ccdaa31ff28.

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
