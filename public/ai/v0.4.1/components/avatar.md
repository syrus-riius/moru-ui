# Avatar

User image with a fallback representation.

Version: 0.4.1. Source hash: 27e6f5b10b06dae29c6129d5ab80e735d6c44f2d84f74acf4149c979e0f65f4e.

## Discovery

- Registry ID: `avatar`
- Import: `@/components/ui/moru/avatar`
- Runtime exports: `Avatar`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [avatar.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/avatar.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/avatar.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/avatar.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `BaseAvatar` from `@base-ui/react/avatar`
- `ComponentPropsWithoutRef, ReactNode` from `react`

```ts
interface AvatarProps extends Omit<
  ComponentPropsWithoutRef<typeof BaseAvatar.Root>,
  'className' | 'children'
> {
  src?: string
  alt: string
  fallback?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
```

Exported value type annotations / generic factory calls from source:

- `Avatar: forwardRef<HTMLSpanElement, AvatarProps>`

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Avatar.size`: `'md'`
