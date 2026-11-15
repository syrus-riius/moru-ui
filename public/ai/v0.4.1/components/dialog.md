# Modal (legacy alias)

Compatibility export for existing Dialog imports. Use modal for new code.

Version: 0.4.1. Source hash: 3d50d8d1c9951acff47d57ffd227011e1e268683be793d82d543261e48d83ef7.

## Discovery

- Registry ID: `dialog`
- Import: `@/components/ui/moru/dialog`
- Runtime exports: `Dialog`
- Registry dependencies: [core](/ai/v0.4.1/core.md), [modal](/ai/v0.4.1/components/modal.md)
- Install source: [dialog.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/dialog.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/dialog.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/dialog.tsx)

## Usage and interaction

- Legacy compatibility entry only. Dialog and DialogProps alias Modal and ModalProps. Existing imports remain valid; use modal.json and the Modal export for new code.
- Read the modal dependency documentation for the canonical API, supported variations and examples. Dialog is not a second, different component.

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

```ts
export type { ModalProps as DialogProps } from './modal'
```

No standalone public props declaration is exported. Inspect the installed source for inferred types.
