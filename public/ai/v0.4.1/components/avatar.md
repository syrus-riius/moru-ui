# Avatar

User image with a fallback representation.

Version: 0.4.1. Source hash: cf8221846caa9e729f2295329aa88140290148a595053c1c2cd671fc80cb0e9b.

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
