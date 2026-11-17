# Attachment

File attachment presentation with metadata and optional removal actions.

Version: 0.4.1. Source hash: cf8221846caa9e729f2295329aa88140290148a595053c1c2cd671fc80cb0e9b.

## Discovery

- Registry ID: `attachment`
- Import: `@/components/ui/moru/attachment`
- Runtime exports: `Attachment`, `AttachmentActions`, `AttachmentContent`, `AttachmentDescription`, `AttachmentGroup`, `AttachmentMedia`, `AttachmentTitle`, `formatFileSize`, `getFileExtension`
- Registry dependencies: [button](/ai/v0.4.1/components/button.md), [core](/ai/v0.4.1/core.md)
- Install source: [attachment.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/attachment.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/attachment.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/attachment.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes, ReactNode` from `react`

```ts
type AttachmentStatus = 'idle' | 'uploading' | 'processing' | 'error' | 'done'

interface AttachmentProps extends HTMLAttributes<HTMLDivElement> {
  fileName?: string
  fileSize?: number
  media?: ReactNode
  status?: AttachmentStatus
  progress?: number
  size?: 'sm' | 'md' | 'lg'
  orientation?: 'horizontal' | 'vertical'
  disabled?: boolean
  onRemove?: () => void
  onRetry?: () => void
}
```

Exported value type annotations / generic factory calls from source:

- `Attachment: forwardRef<HTMLDivElement, AttachmentProps>`

Exported function declaration excerpts (return types may be inferred in source):

```ts
function formatFileSize(bytes: number, locale = 'ko-KR');
function getFileExtension(name: string);
function AttachmentMedia({ className, ...props }: HTMLAttributes<HTMLDivElement>);
function AttachmentContent({ className, ...props }: HTMLAttributes<HTMLDivElement>);
function AttachmentTitle({ className, ...props }: HTMLAttributes<HTMLDivElement>);
function AttachmentDescription({ className, ...props }: HTMLAttributes<HTMLDivElement>);
function AttachmentActions({ className, ...props }: HTMLAttributes<HTMLDivElement>);
function AttachmentGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Attachment.status`: `'idle'`
- `Attachment.size`: `'md'`
- `Attachment.orientation`: `'horizontal'`
