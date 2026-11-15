# Message Scroller

Message viewport that preserves reading position and offers a latest-message action.

Version: 0.4.1. Source hash: baf065ccb1fccaa4eed187992c95b92d1b8fd9b7084c361d9faa54b0f7c55c24.

## Discovery

- Registry ID: `message-scroller`
- Import: `@/components/ui/moru/message-scroller`
- Runtime exports: `MessageScroller`, `MessageScrollerItem`, `isMessageScrollerAtEnd`
- Registry dependencies: [button](/ai/v0.4.1/components/button.md), [core](/ai/v0.4.1/core.md)
- Install source: [message-scroller.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/message-scroller.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/message-scroller.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/message-scroller.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `CSSProperties, HTMLAttributes` from `react`

```ts
interface MessageScrollerHandle {
  scrollToLatest: () => void
  scrollToMessage: (id: string) => boolean
}

interface MessageScrollerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onScroll'> {
  height?: CSSProperties['height']
  initialPosition?: 'start' | 'end'
  followOutput?: boolean
  disabled?: boolean
  'aria-label'?: string
}
```

Exported value type annotations / generic factory calls from source:

- `MessageScroller: forwardRef<MessageScrollerHandle, MessageScrollerProps>`

Exported function declaration excerpts (return types may be inferred in source):

```ts
function isMessageScrollerAtEnd(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
  threshold = 24,
);
function MessageScrollerItem({
  messageId,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { messageId: string });
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `MessageScroller.height`: `320`
- `MessageScroller.initialPosition`: `'end'`
- `MessageScroller.followOutput`: `true`
- `MessageScroller.aria-live`: `'polite'`
