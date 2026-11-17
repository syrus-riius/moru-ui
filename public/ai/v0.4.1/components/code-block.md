# Code Block

Readable code presentation with copy and line-wrap controls.

Version: 0.4.1. Source hash: 2fd87d38eaaf0375eb097047b65a7d17f1067292b1a98efdbfd46ccdaa31ff28.

## Discovery

- Registry ID: `code-block`
- Import: `@/components/ui/moru/code-block`
- Runtime exports: `CodeBlock`
- Registry dependencies: [button](/ai/v0.4.1/components/button.md), [core](/ai/v0.4.1/core.md)
- Install source: [code-block.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/code-block.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/code-block.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/code-block.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `HTMLAttributes` from `react`

```ts
interface CodeBlockProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onCopy'
> {
  value: string
  language?: string
  filename?: string
  lineNumbers?: boolean
  defaultWrap?: boolean
  copyable?: boolean
  disabled?: boolean
  highlightLines?: number[]
  onCopy?: () => void
  onCopyError?: (error: unknown) => void
  size?: 'sm' | 'md' | 'lg'
}
```

Exported value type annotations / generic factory calls from source:

- `CodeBlock: forwardRef<HTMLDivElement, CodeBlockProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `CodeBlock.language`: `'text'`
- `CodeBlock.lineNumbers`: `false`
- `CodeBlock.defaultWrap`: `false`
- `CodeBlock.copyable`: `true`
- `CodeBlock.highlightLines`: `[]`
- `CodeBlock.size`: `'md'`
