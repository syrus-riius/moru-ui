# Kbd

Compact visual representation of keyboard keys and shortcuts.

Version: 0.4.1. Source hash: 9e7fc610717ab4a2a951696248d6d47b7eb7d11cbfffc90d292087c06ac3c874.

## Discovery

- Registry ID: `kbd`
- Import: `@/components/ui/moru/kbd`
- Runtime exports: `Kbd`, `KbdGroup`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [kbd.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/kbd.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/kbd.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/kbd.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes` from `react`

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>);
function KbdGroup({ className, ...props }: HTMLAttributes<HTMLSpanElement>);
```
