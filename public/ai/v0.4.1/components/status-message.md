# Status Message

Semantic status feedback using text and icons.

Version: 0.4.1. Source hash: baf065ccb1fccaa4eed187992c95b92d1b8fd9b7084c361d9faa54b0f7c55c24.

## Discovery

- Registry ID: `status-message`
- Import: `@/components/ui/moru/status-message`
- Runtime exports: `StatusMessage`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [status-message.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/status-message.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/status-message.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/status-message.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes, ReactNode` from `react`
- `SemanticTone` from `./state`

```ts
interface StatusMessageProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'children'
> {
  tone?: SemanticTone
  title?: string
  children?: ReactNode
  variant?: 'soft' | 'outline'
}
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function StatusMessage({
  tone = 'info',
  title,
  children,
  variant = 'soft',
  className,
  role = 'status',
  ...props
}: StatusMessageProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `StatusMessage.tone`: `'info'`
- `StatusMessage.variant`: `'soft'`
- `StatusMessage.role`: `'status'`
