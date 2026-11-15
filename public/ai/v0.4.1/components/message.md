# Message

Composable message content, metadata and action presentation.

Version: 0.4.1. Source hash: 92d4b85e1d28cd9eda9391ef75e1e633fa26d884c86603172df42465b8fa832c.

## Discovery

- Registry ID: `message`
- Import: `@/components/ui/moru/message`
- Runtime exports: `Message`, `MessageAvatar`, `MessageContent`, `MessageFooter`, `MessageGroup`, `MessageHeader`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [message.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/message.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/message.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/message.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes` from `react`

```ts
interface MessageProps extends HTMLAttributes<HTMLElement> {
  align?: 'start' | 'end'
}
```

Exported value type annotations / generic factory calls from source:

- `Message: forwardRef<HTMLElement, MessageProps>`

Exported function declaration excerpts (return types may be inferred in source):

```ts
function MessageAvatar({ className, ...props }: HTMLAttributes<HTMLDivElement>);
function MessageContent({ className, ...props }: HTMLAttributes<HTMLDivElement>);
function MessageHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>);
function MessageFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>);
function MessageGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Message.align`: `'start'`
