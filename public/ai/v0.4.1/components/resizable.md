# Resizable

Resizable panel groups, panels and handles with optional grip decoration.

Version: 0.4.1. Source hash: 08414026dbe9c50ebadb9391b938ed8ed1e97050bc3c6b5f7c1b6fd190aa8ab2.

## Discovery

- Registry ID: `resizable`
- Import: `@/components/ui/moru/resizable`
- Runtime exports: `ResizableHandle`, `ResizablePanel`, `ResizablePanelGroup`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [resizable.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/resizable.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/resizable.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/resizable.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `GroupProps, PanelProps, SeparatorProps` from `react-resizable-panels`

Exported function declaration excerpts (return types may be inferred in source):

```ts
function ResizablePanelGroup({ className, ...props }: GroupProps);
function ResizablePanel({ className, ...props }: PanelProps);
function ResizableHandle({
  className,
  withHandle = true,
  'aria-label': labelProp,
  ...props
}: SeparatorProps & { withHandle?: boolean });
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `ResizableHandle.withHandle`: `true`
