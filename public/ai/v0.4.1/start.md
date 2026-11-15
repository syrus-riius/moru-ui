# Build with Moru UI

Version 0.4.1 · source 08414026dbe9c50ebadb9391b938ed8ed1e97050bc3c6b5f7c1b6fd190aa8ab2

Read this file once, then [catalog.json](/ai/v0.4.1/catalog.json) and only the selected item docs. Moru is a source-owned design system: fundamentals → behavior → technology → visual refinement. Use the existing components and interaction behavior before adding bespoke UI.

## Choose the platform and installation mode

- **Web registry:** install individual source items into an existing React application. The catalog covers web items. Default import prefix is `@/components/ui/moru/`; honor the actual `components.json` UI alias.
- **Web starter:** `templates/moru-web-starter` contains copied source with `./components/ui/` imports and `./theme/` tokens. It does not contain the registry-generated MoruProvider. Keep the starter setup and source imports.
- **Expo / React Native:** read [expo.md](/ai/v0.4.1/expo.md). Native source, APIs, provider and styles are separate. Do not import the web registry into a native screen.
- The registry currently targets Vite + React. Do not claim SSR/Next.js or native support for these web components without doing the necessary integration work. Neither `moru-ui` nor `@moru/native` should be assumed to exist as a published npm UI package.

## Web registry setup

Use the existing project’s React/TypeScript setup and configured shadcn CLI alias. Install the smallest useful set; dependencies are included automatically. Add other items by the same versioned URL.

```sh
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/button.json https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/input.json https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/field.json
```

Import the core CSS once and wrap the components. MoruProvider supplies theme tokens and the popup portal scope.

```tsx
import '@/components/ui/moru/styles.css'
import { MoruProvider } from '@/components/ui/moru/provider'
import { Button } from '@/components/ui/moru/button'

export default function App() {
  return <MoruProvider mode="light"><Button type="button">Continue</Button></MoruProvider>
}
```

MoruProvider defaults to light and derives dark defaults when mode="dark". If passing custom `tokens`, pass a complete ThemeTokens object already appropriate for the selected mode; mode does not recolor custom tokens. Fonts are optional and not installed by the registry. Retain the installed MIT license notices.

## Style packs

Default, Glass and Neon are optional token-driven styles for the same components. Preserve component behavior and APIs. Import applyStylePack from `@/components/ui/moru/_theme/style-packs` (registry) or `./theme/style-packs` (starter), then pass `applyStylePack(tokens, 'glass')` to the existing provider. Use 'default' to remove the effects. Color, typography and density stay independent.

The optional `tokens.appearance` contains `preset`, `surfaceOpacity` (0.55–1), `blur` (0–24 px), `glow` (0–24 px), and `highlight` (0–1). Use the exported snapshot if supplied. ThemeScope carries the appearance variables into popup portals. Shared core styles include the recipes; do not duplicate controls as GlassButton or NeonInput. Glass applies to surfaces, Neon to important actions/selected states. Inputs retain readable solid backgrounds. Keep focus/error indicators, reduced-transparency/unsupported-browser fallbacks, and check contrast against the real backdrop.

## Web starter setup

Keep the starter’s existing `main.tsx` imports: `styles.css`, `theme/fonts.css`, `theme/default.css`, `components/ui/styles.css`, `theme/readability.css`. Reuse its ThemeScope and token generation:

```tsx
import { ThemeScope } from './components/ui/theme-scope'
import { Button } from './components/ui/button'
import { createDarkTokens, defaultTokens } from './theme/tokens'

const darkTokens = createDarkTokens(defaultTokens)
export default function App() {
  return <ThemeScope mode="dark" tokens={darkTokens}><Button type="button">Continue</Button></ThemeScope>
}
```

In per-item examples replace `@/components/ui/moru/NAME` with the starter’s actual `./components/ui/NAME` path; registry blocks `moru/blocks/NAME` correspond to starter `./components/blocks/NAME` only when that block has actually been copied. ThemeScope requires both mode and tokens; setting mode alone does not generate dark tokens.

## Design and human experience rules

- Choose semantic tokens for surfaces, text, accent and statuses. Reuse density, typography roles, control sizes, spacing and component spacing instead of scattering arbitrary pixel values.
- Keep labels visible. Preserve Field’s ID/description/error connections, focus-visible styling, keyboard navigation, focus return and popup behavior.
- Preserve OTP paste/autofill, loading locks, input values on errors and meaningful empty/success/error feedback. Do not replace robust controls with lookalikes.
- loading locks a control without removing it from the tab order: buttons and date triggers become aria-disabled, fields become read-only, and their values are still submitted. Only FileInput and NativeSelect use the disabled attribute while busy. Use disabled, not loading, when a value must not be sent.
- Compose screen blocks first: dashboard, login, signup or workspace settings. Signup includes email verification; Dashboard embeds project search and filters. OTP/search-filters remain supporting patterns. Authentication previews are local demos; server verification and persistence belong to the application.
- Prefer responsive flow/grid, min-width: 0 for shrinking content and deliberate overflow. Respect reduced motion and keep text readable in light/dark and at narrow widths.
- Keep imports, controlled callbacks and prop names from the selected item docs. Moru shares infrastructure with other libraries but does not share every public API. Never invent shadcn-style compound exports.
- Read the source when an inherited API or behavior is not documented. This compact catalog deliberately does not duplicate all React and Base UI declarations.

## Progressive discovery

1. Pick web-registry, web-starter or Expo before generating code.
2. Read [catalog.json](/ai/v0.4.1/catalog.json) for IDs, exports, import paths and registry dependencies.
3. Fetch only each selected docPath and the relevant dependency docs; do not load every component by default.
4. Use the real minimal example and source-derived declarations. Preserve existing project structure and styling setup.

Source: [Moru repository](https://github.com/syrus-riius/moru-ui) · [Registry guide](https://github.com/syrus-riius/moru-ui/blob/main/docs/registry.ko.md)
