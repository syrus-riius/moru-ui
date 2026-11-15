# Avatar

User image with a fallback representation.

Version: 0.4.0. Source hash: e068de2cd7d2d1f2f198a786dcd23f4fee5b398de94b2591cabeb3a5ceb100f6.

## Discovery

- Registry ID: `avatar`
- Import: `@/components/ui/moru/avatar`
- Runtime exports: `Avatar`
- Registry dependencies: [core](/ai/v0.4.0/core.md)
- Install source: [avatar.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/avatar.json)
- Setup and import-path differences: [start](/ai/v0.4.0/start.md)
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
