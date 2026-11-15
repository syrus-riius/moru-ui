# Direction

Base UI DirectionProvider for LTR or RTL behavior; pair with dir on the DOM boundary.

Version: 0.4.1. Source hash: 0b0b1530e773209ed6b6628a4168c3305b7342a1378da2b37377f96c1e54f293.

## Discovery

- Registry ID: `direction`
- Import: `@/components/ui/moru/direction-provider`
- Runtime exports: `DirectionProvider`
- Registry dependencies: [core](/ai/v0.4.1/core.md)
- Install source: [direction.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/direction.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/direction-provider.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/direction-provider.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `BaseDirectionProvider` from `@base-ui/react/direction-provider`

```ts
type DirectionProviderProps = BaseDirectionProvider.Props
```
