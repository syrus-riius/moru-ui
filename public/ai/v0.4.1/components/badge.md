# Badge

Compact status and category labels using semantic tokens.

Version: 0.4.1. Source hash: 9e7fc610717ab4a2a951696248d6d47b7eb7d11cbfffc90d292087c06ac3c874.

## Discovery

- Registry ID: `badge`
- Import: `@/components/ui/moru/badge`
- Runtime exports: `Badge`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [badge.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/badge.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/badge.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/badge.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes` from `react`
- `SemanticTone` from `./state`

```ts
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  tone?: SemanticTone
}
```

Exported value type annotations / generic factory calls from source:

- `Badge: forwardRef<HTMLSpanElement, BadgeProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Badge.variant`: `'primary'`
