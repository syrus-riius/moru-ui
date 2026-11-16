import { registryCliVersion, registryRelease } from './registry-install'
import { createNativeThemeExport } from '../theme/native-theme'
import { validateTokens, type ThemeMode, type ThemeTokens } from '../theme/tokens'
import { resolveAppearance } from '../theme/style-packs'

export type AiTarget = 'web-registry' | 'web-starter' | 'expo-starter'
export interface AiCatalogEntry {
  id: string
  title: string
  description: string
  kind: 'foundation' | 'component' | 'block'
  exports: string[]
  docPath: string
  dependencies: string[]
  importPath: string | null
}
export interface AiCatalog {
  schemaVersion: 1
  version: string
  sourceHash: string
  entries: AiCatalogEntry[]
}
export interface AiSelectedItem {
  entry: AiCatalogEntry
  documentation: string
}

const origin = 'https://moru-ui-lab.riius.chatgpt.site'
const directory = `/ai/v${registryRelease}`
export const aiStartPath = () => `${directory}/start.md`
export const aiExpoPath = () => `${directory}/expo.md`
export const aiCatalogPath = () => `${directory}/catalog.json`

/** Gallery IDs stay stable for saved links; new AI instructions use canonical install IDs. */
export function canonicalAiItemId(id: string): string {
  return id === 'dialog' ? 'modal' : id
}

function validDocumentPath(path: unknown): path is string {
  return (
    typeof path === 'string' &&
    path.startsWith(`${directory}/`) &&
    /^\/ai\/v[\d.]+\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.md$/.test(path)
  )
}

/** Validate the small discovery response before using its links. Source text is fetched on demand. */
export function parseAiCatalog(value: unknown): AiCatalog {
  if (!value || typeof value !== 'object') throw new Error('AI 안내 목록을 읽을 수 없어요.')
  const catalog = value as Partial<AiCatalog>
  if (
    catalog.schemaVersion !== 1 ||
    catalog.version !== registryRelease ||
    typeof catalog.sourceHash !== 'string' ||
    !Array.isArray(catalog.entries)
  ) {
    throw new Error('현재 Moru 버전의 AI 안내를 다시 불러와 주세요.')
  }
  const ids = new Set<string>()
  for (const entry of catalog.entries) {
    if (
      !entry ||
      typeof entry !== 'object' ||
      typeof entry.id !== 'string' ||
      !/^[a-z0-9-]+$/.test(entry.id) ||
      ids.has(entry.id) ||
      typeof entry.title !== 'string' ||
      typeof entry.description !== 'string' ||
      !['foundation', 'component', 'block'].includes(entry.kind) ||
      !validDocumentPath(entry.docPath) ||
      !Array.isArray(entry.exports) ||
      !entry.exports.every((item) => typeof item === 'string') ||
      !Array.isArray(entry.dependencies) ||
      !entry.dependencies.every((item) => typeof item === 'string') ||
      (entry.importPath !== null && typeof entry.importPath !== 'string')
    ) {
      throw new Error('AI 안내 목록의 형식을 확인할 수 없어요.')
    }
    ids.add(entry.id)
  }
  if (catalog.entries.some((entry) => entry.dependencies.some((id) => !ids.has(id)))) {
    throw new Error('AI 안내의 컴포넌트 연결을 확인할 수 없어요.')
  }
  return catalog as AiCatalog
}

export async function loadAiCatalog(signal?: AbortSignal): Promise<AiCatalog> {
  const response = await fetch(aiCatalogPath(), { signal })
  if (!response.ok) throw new Error('AI 안내 목록을 불러오지 못했어요. 다시 시도해 주세요.')
  return parseAiCatalog(await response.json())
}

export async function loadAiDocument(path: string, signal?: AbortSignal): Promise<string> {
  if (!validDocumentPath(path)) throw new Error('지원하지 않는 AI 안내 경로예요.')
  const response = await fetch(path, { signal })
  if (!response.ok) throw new Error('선택한 사용 명세를 불러오지 못했어요. 다시 시도해 주세요.')
  const document = await response.text()
  if (!document.trim().startsWith('#') || document.length > 120_000)
    throw new Error('사용 명세 형식이 올바르지 않아요.')
  return document.trim()
}

const designRules = [
  'Use the existing Moru components and their documented APIs. Read the installed source before changing behavior.',
  'Use typography roles and the card/form/field/control spacing tokens. Let the selected density set S/M/L proportions; preserve explicit component spacing overrides.',
  'Use semantic color roles and the supplied theme. Add responsive layout with wrapping/min-width rules; preserve readable labels and touch targets.',
  'Compose labels, descriptions and errors with Field. Keep keyboard navigation, focus restoration, accessible names and reduced-motion behavior.',
  'Include applicable loading, disabled, error, empty and success states. Reuse InputOTP for paste/selection/autofill; it uses one real input with visual slots.',
  'Login/OTP examples are local demonstrations. Connect real authentication and persistence through the app service layer; never treat demo success as authentication.',
]

export interface AiContextOptions {
  target: AiTarget
  mode: ThemeMode
  tokens: ThemeTokens
  items: readonly AiSelectedItem[]
  goal?: string
  platformGuide?: string
}

/** Pure snapshot: only explicit task text, selected docs and validated design tokens enter the clipboard. */
export function buildAiContext({
  target,
  mode,
  tokens,
  items,
  goal = '',
  platformGuide,
}: AiContextOptions): string {
  const safeTokens = validateTokens(tokens)
  const appearance = resolveAppearance(safeTokens.appearance)
  const native = target === 'expo-starter'
  const selected = [...new Map(items.map((item) => [item.entry.id, item])).values()].slice(0, 6)
  const title =
    target === 'web-registry'
      ? 'React web · selective registry'
      : native
        ? 'React Native · Expo starter'
        : 'React web · source starter'
  const lines = [
    `# Build with Moru UI ${registryRelease}`,
    `Target: ${title}. Theme: ${mode}. This packet contains design settings and API references, not application data.`,
    `Style pack: ${appearance.preset}. Effects are independent from palette, typography and density.`,
    '',
    '## Task',
    goal.trim().slice(0, 2000) ||
      'Describe the screen or workflow to build, then use the requirements below.',
    '',
    '## Project setup',
  ]

  if (native) {
    lines.push(
      `Start from ${origin}/downloads/moru-native-starter.zip and preserve its apps/ + packages/ layout. @moru/native is a local package, not a published npm dependency.`,
      'Use MoruNativeProvider inside SafeAreaProvider. Pass the exported mode and tokens below. Use native exports, onPress and onChangeText; do not use web DOM components, CSS variables or registry install commands.',
      'Use numeric native typography/spacing. webFontFamily applies only to React Native Web; device fonts require registration. Keep system fonts until native font files have been registered. Test safe areas, keyboard avoidance and accessibility on a device.',
      'Style-pack intent is preserved in designIntent.appearance. The current native exporter uses solid surfaces: web glass blur/neon glow are not implemented by MoruNativeProvider. Do not claim effect parity or paste CSS into native views.',
      `Read ${origin}${aiExpoPath()} for native exports and boundaries.`,
      '',
      '## Native design snapshot',
      '```json',
      JSON.stringify(createNativeThemeExport(safeTokens, mode)),
      '```',
    )
    if (platformGuide?.trim()) lines.push('', '## Native usage guide', platformGuide.trim())
  } else {
    lines.push(
      'This packet describes a source distribution. The published moru-ui npm package is a separate installation option; follow https://github.com/syrus-riius/moru-ui/blob/main/packages/moru-react/README.md for its imports and setup instead of mixing the two installation paths.',
      'Inspect the project first. Supported baseline: Vite, React 19.3, TypeScript, Tailwind CSS 4, Node.js 24+. Check the project dependencies before choosing another runtime or SSR setup.',
    )
    if (target === 'web-registry') {
      lines.push(
        'Resolve the UI alias from components.json. The examples use @/components/ui/moru; adapt this prefix to the actual alias. Install only missing items and review local edits before updates; do not overwrite customized source blindly.',
        'Import moru/styles.css once and wrap the area in MoruProvider from moru/provider. Pass the complete tokens snapshot and mode below. This registry installation copies source files into the project; it does not install the moru-ui npm package.',
        '',
        '```sh',
        ...selected.map(
          ({ entry }) =>
            `npx shadcn@${registryCliVersion} add ${origin}/r/v${registryRelease}/${entry.id}.json`,
        ),
        ...(selected.length
          ? []
          : [
              `# Select items from ${origin}${aiCatalogPath()}; core provides the shared foundation.`,
            ]),
        '```',
      )
    } else {
      lines.push(
        `Start from ${origin}/downloads/moru-web-starter.zip, then npm ci and npm run dev. Keep its existing main.tsx stylesheet imports.`,
        'The starter uses src/components/ui/*, src/components/blocks/* and src/theme/*. Use its ThemeScope with tokens and mode; it does not ship registry provider.tsx.',
        'Reuse the starter’s copied components before installing anything. Per-item registry installation links below are reference metadata for the other distribution.',
        'Selected examples below use relative imports as if written in src/App.tsx. Resolve them from the file being edited. Linked references retain the registry paths; the starter uses ThemeScope instead of MoruProvider.',
      )
    }
    lines.push(
      '',
      '## Design and human experience',
      ...designRules.map((rule) => `- ${rule}`),
      '- Apply the supplied appearance through the theme tokens and existing styles. Reuse Button/Input/Card instead of making GlassButton or NeonInput copies. Keep focus/error indicators, opaque input text backgrounds, and the solid fallback for unsupported or reduced-transparency environments. Verify glass text contrast against the actual backdrop.',
      '',
      '## Current design tokens',
      'This is the complete token object for the selected mode, including density/typography overrides. Apply it directly; do not run createDarkTokens on an already-dark snapshot. Other modes need their own tokens.',
      '```json',
      JSON.stringify(safeTokens),
      '```',
      '',
      '## Selected usage references',
      ...(selected.length
        ? selected.flatMap(({ entry, documentation }) => [
            `### ${entry.title}`,
            `Reference: ${origin}${entry.docPath}`,
            target === 'web-starter'
              ? starterReference(entry, documentation.trim())
              : documentation.trim(),
            '',
          ])
        : [
            'No components selected. Discover only the items needed for the task before writing code.',
          ]),
    )
  }
  lines.push(
    '',
    '## Before delivery',
    'Check actual exports and callback signatures, type-check/build the project, and verify the relevant keyboard/focus/state flows and narrow/light/dark layouts. Report what was verified and any remaining platform limits.',
    `Read more only when needed: ${origin}/llms.txt · ${origin}${aiCatalogPath()}`,
  )
  return lines.join('\n')
}

function starterReference(entry: AiCatalogEntry, documentation: string): string {
  if (entry.kind === 'foundation')
    return [
      'The source starter already includes the foundation. Import { ThemeScope } from ./components/ui/theme-scope and wrap the UI with <ThemeScope tokens={tokens} mode={mode}>. Use the full snapshot above for tokens and the selected mode for mode.',
      'Keep main.tsx stylesheet imports. MoruProvider belongs to the registry distribution and is not a starter export.',
      `Starter setup: ${origin}${aiStartPath()}#web-starter-setup`,
    ].join('\n')
  return documentation
    .replaceAll('Also install:', 'Example additionally uses:')
    .replaceAll('@/components/ui/moru/blocks/', './components/blocks/')
    .replaceAll('@/components/ui/moru/_theme/', './theme/')
    .replaceAll('@/components/ui/moru/', './components/ui/')
}
