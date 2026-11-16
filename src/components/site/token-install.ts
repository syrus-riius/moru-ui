import { isLocale, type Locale } from '../../lib/locale'
import {
  colorTokenKeys,
  densityProfiles,
  fontFamilies,
  normalizeColor,
  typographyRoleOptions,
  validateTokens,
  type FontFamily,
  type ThemeMode,
  type ThemeTokens,
} from '../../theme/tokens'

export const moruNpmVersion = '0.5.0-beta.3'
export type TokenInstallTarget = 'vite' | 'next'
export type TokenInstallFile = {
  path: string
  code: string
  language: 'json' | 'tsx' | 'ts' | 'css'
}
export type TokenInstallGuide = {
  command: string
  files: TokenInstallFile[]
  text: string
  mode: ThemeMode
  fontFamily: FontFamily
  compatibilityNote: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function sameValue(left: unknown, right: unknown): boolean {
  if (left === right) return true
  if (!isRecord(left) || !isRecord(right)) return false
  const keys = Object.keys(left)
  return (
    keys.length === Object.keys(right).length &&
    keys.every((key) => sameValue(left[key], right[key]))
  )
}

function validTheme(value: unknown): value is ThemeTokens {
  if (!isRecord(value)) return false
  if (colorTokenKeys.some((key) => !normalizeColor(value[key]))) return false
  if (typeof value.fontFamily !== 'string' || !Object.hasOwn(fontFamilies, value.fontFamily))
    return false
  if (typeof value.density !== 'string' || !Object.hasOwn(densityProfiles, value.density))
    return false
  if (!isRecord(value.densityOverrides) || !isRecord(value.componentSpacing)) return false
  for (const key of [
    'radius',
    'spacing',
    'fontSize',
    'controlHeight',
    'borderWidth',
    'shadow',
    'duration',
  ]) {
    if (typeof value[key] !== 'number' || !Number.isFinite(value[key])) return false
  }
  const typography = value.typography
  if (!isRecord(typography)) return false
  if (
    !typographyRoleOptions.every(({ value: role }) => {
      const style = typography[role]
      return (
        isRecord(style) &&
        ['size', 'lineHeight', 'weight', 'letterSpacing'].every(
          (key) => typeof style[key] === 'number' && Number.isFinite(style[key]),
        )
      )
    })
  )
    return false
  const normalized = validateTokens(value)
  // validateTokens is intentionally forgiving at runtime. Export is stricter:
  // reject settings that would silently be replaced, clamped or dropped.
  return Object.entries(normalized).every(([key, expected]) =>
    colorTokenKeys.some((color) => color === key)
      ? normalizeColor(value[key]) === expected
      : sameValue(value[key], expected),
  )
}

/** Keep the saved editor metadata as well as both themes; never export repaired defaults silently. */
function readDesign(json: string) {
  let design: unknown
  try {
    design = JSON.parse(json)
  } catch {
    throw new Error('토큰 JSON 형식을 확인해 주세요.')
  }
  if (
    !isRecord(design) ||
    (design.mode !== 'light' && design.mode !== 'dark') ||
    !isRecord(design.themes)
  ) {
    throw new Error('라이트·다크 설정이 포함된 Moru 토큰 JSON을 내보내 주세요.')
  }
  if (
    typeof design.schemaVersion !== 'number' ||
    !Number.isInteger(design.schemaVersion) ||
    design.schemaVersion < 1 ||
    design.schemaVersion > 9
  ) {
    throw new Error('지원하지 않는 토큰 파일 버전입니다.')
  }
  if (!validTheme(design.themes.light) || !validTheme(design.themes.dark)) {
    throw new Error('토큰 설정이 올바르지 않습니다. 스튜디오에서 다시 내보내 주세요.')
  }
  const mode: ThemeMode = design.mode
  const current = mode === 'dark' ? design.themes.dark : design.themes.light
  return {
    json: JSON.stringify(design, null, 2) + '\n',
    mode,
    fontFamily: current.fontFamily,
    fonts: new Set([design.themes.light.fontFamily, design.themes.dark.fontFamily]),
  }
}

const fontAssets = {
  pretendard: {
    packages: ['pretendard@1.3.9'],
    imports: ['pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'],
  },
  'noto-sans': {
    packages: ['@fontsource-variable/noto-sans@5.3.0', '@fontsource-variable/noto-sans-kr@5.3.1'],
    imports: ['@fontsource-variable/noto-sans', '@fontsource-variable/noto-sans-kr'],
  },
} as const

function fontsFor(families: Set<FontFamily>) {
  const packages = new Set<string>()
  const imports = new Set<string>()
  for (const family of families) {
    const key = family === 'sans' ? 'pretendard' : family
    if (key !== 'pretendard' && key !== 'noto-sans') continue
    for (const item of fontAssets[key].packages) packages.add(item)
    for (const item of fontAssets[key].imports) imports.add(item)
  }
  return {
    packages: [...packages],
    code: [...imports].map((file) => `import ${JSON.stringify(file)}`).join('\n'),
  }
}

function providerCode(target: TokenInstallTarget, locale: Locale) {
  return `${target === 'next' ? "'use client'\n\n" : ''}import type { ReactNode } from 'react'
import { MoruProvider, validateTokens, type ThemeMode } from 'moru-ui'
import design from './moru-tokens.json'

export const defaultMoruMode: ThemeMode = design.mode === 'dark' ? 'dark' : 'light'
const themes = {
  light: validateTokens(design.themes.light),
  dark: validateTokens(design.themes.dark),
}

export function AppMoruProvider({
  children,
  mode = defaultMoruMode,
}: {
  children: ReactNode
  mode?: ThemeMode
}) {
  return (
    <MoruProvider mode={mode} tokens={themes[mode]} locale=${JSON.stringify(locale)}>
      {children}
    </MoruProvider>
  )
}
`
}

const sampleCopy: Record<Locale, { title: string; toggle: string; action: string }> = {
  ko: { title: '내 디자인으로 시작하기', toggle: '라이트 · 다크 전환', action: '시작하기' },
  en: { title: 'Start with your design', toggle: 'Switch light / dark', action: 'Get started' },
  ja: { title: '自分のデザインで始める', toggle: 'ライト・ダークを切り替え', action: '始める' },
  'zh-CN': { title: '从你的设计开始', toggle: '切换浅色 / 深色', action: '开始使用' },
}

const guideCopy: Record<Locale, string[]> = {
  ko: [
    'React와 React DOM ^19.3.0을 사용하는 기존 TypeScript 프로젝트에서 실행하세요.',
    '예제 코드를 기존 파일에 병합하세요. 앱의 경로, Provider, 스타일, 메타데이터는 유지하세요.',
    'Next.js에서 src/app을 사용한다면 아래 app/ 파일을 모두 src/app/에 넣으세요.',
    'JSON import가 비활성화되어 있다면 tsconfig.json의 compilerOptions.resolveJsonModule을 true로 설정하세요.',
    'mode와 해당 모드의 토큰이 함께 바뀝니다. 저장한 다크 색상을 다시 변환할 필요가 없습니다.',
    '시스템 Serif·Mono 폰트는 기기마다 다를 수 있습니다. 그 외 선택한 폰트는 설치 명령과 스타일 import에 포함됩니다.',
    '디자인을 바꿀 때는 moru-tokens.json을 교체하고 앱을 다시 빌드·배포하세요. Moru 패키지를 다시 배포할 필요는 없습니다.',
  ],
  en: [
    'Run this in an existing TypeScript project using React and React DOM ^19.3.0.',
    'Merge the examples with existing files. Keep your app routes, providers, styles and metadata.',
    'For a src/app Next.js project, place every app/ file below under src/app/.',
    'If JSON imports are disabled, enable compilerOptions.resolveJsonModule in tsconfig.json.',
    'Mode and its saved theme are selected together. Do not convert the saved dark colors again.',
    'System serif and monospace fonts can vary by device. Other selected fonts are included in the install command and style imports.',
    'To update the design, replace moru-tokens.json and rebuild/deploy your app. No Moru package publication is needed.',
  ],
  ja: [
    'ReactとReact DOM ^19.3.0を使用する既存のTypeScriptプロジェクトで実行してください。',
    'サンプルを既存のファイルに統合してください。アプリのルート、Provider、スタイル、メタデータは保持してください。',
    'Next.jsでsrc/appを使う場合は、以下のapp/ファイルをすべてsrc/app/に配置してください。',
    'JSON importが無効な場合は、tsconfig.jsonのcompilerOptions.resolveJsonModuleをtrueに設定してください。',
    'modeと保存されたテーマを一緒に切り替えます。保存済みのダークカラーを再変換する必要はありません。',
    'システムのSerif・Monoフォントは端末ごとに異なる場合があります。その他の選択フォントはインストールコマンドとスタイルimportに含まれます。',
    'デザインを更新するにはmoru-tokens.jsonを置き換え、アプリを再ビルド・デプロイしてください。Moruパッケージの再公開は不要です。',
  ],
  'zh-CN': [
    '请在使用React和React DOM ^19.3.0的现有TypeScript项目中运行。',
    '将示例合并到现有文件中，并保留应用的路由、Provider、样式和元数据。',
    '如果Next.js项目使用src/app，请将下面的所有app/文件放在src/app/下。',
    '如果禁用了JSON import，请在tsconfig.json中将compilerOptions.resolveJsonModule设为true。',
    'mode与保存的对应主题一起切换，无需再次转换已保存的深色主题颜色。',
    '系统Serif和Mono字体可能因设备而异。其他选定字体已包含在安装命令和样式import中。',
    '更新设计时，替换moru-tokens.json并重新构建、部署应用即可，无需重新发布Moru包。',
  ],
}

// The Lab may lead the published package. Keep this limit visible in both UI and copied instructions.
const focusCompatibility: Record<Locale, string> = {
  ko: '입력 포커스의 슬림·서피스·언더라인·링 설정은 현재 Lab과 최신 소스에서 지원합니다. npm 0.5.0-beta.3에서는 기존 포커스 표시가 유지됩니다. JSON에는 설정이 보존되며, npm 반영 후 해당 기능을 지원하는 버전으로 업데이트해야 적용됩니다.',
  en: 'Slim, Surface, Underline and Ring input focus settings are currently supported in the Lab and latest source. npm 0.5.0-beta.3 keeps its existing focus indicators. The settings stay in your JSON; update to an npm version that supports them once released to apply them.',
  ja: '入力フォーカスのスリム・サーフェス・アンダーライン・リング設定は、現在Labと最新ソースで対応しています。npm 0.5.0-beta.3では従来のフォーカス表示が維持されます。設定はJSONに保存され、対応するnpmバージョンの公開後に更新すると適用できます。',
  'zh-CN':
    '输入焦点的细线、表面、下划线和外环设置目前适用于Lab和最新源码。npm 0.5.0-beta.3仍保留原有焦点样式。设置会保存在JSON中；待支持该功能的npm版本发布后，更新即可应用。',
}

const pageStyle = `{
        display: 'grid',
        alignContent: 'start',
        justifyItems: 'start',
        minHeight: '100dvh',
        gap: 'var(--ui-form-gap)',
        padding: 'var(--ui-card-padding)',
        background: 'var(--ui-background)',
        color: 'var(--ui-text)',
      }`

/** Generate complete files that use the published npm API, not the Lab's internal theme hook. */
export function createTokenInstallGuide(
  json: string,
  target: TokenInstallTarget,
  locale: Locale = 'ko',
): TokenInstallGuide {
  if (target !== 'vite' && target !== 'next') throw new Error('지원하지 않는 프로젝트 형식입니다.')
  if (!isLocale(locale)) throw new Error('지원하지 않는 언어입니다.')
  const design = readDesign(json)
  const fonts = fontsFor(design.fonts)
  const command = ['npm install', `moru-ui@${moruNpmVersion}`, ...fonts.packages].join(' ')
  const root = target === 'vite' ? 'src' : 'app'
  const files: TokenInstallFile[] = [
    { path: `${root}/moru-tokens.json`, code: design.json, language: 'json' },
    {
      path: `${root}/${target === 'vite' ? 'MoruProvider' : 'providers'}.tsx`,
      code: providerCode(target, locale),
      language: 'tsx',
    },
  ]
  const copy = sampleCopy[locale]
  if (target === 'vite') {
    files.push({
      path: 'src/App.tsx',
      language: 'tsx',
      code: `import { useState } from 'react'
import { Button, type ThemeMode } from 'moru-ui'
import { AppMoruProvider, defaultMoruMode } from './MoruProvider'
import 'moru-ui/styles.css'
${fonts.code ? `${fonts.code}\n` : ''}
export default function App() {
  const [mode, setMode] = useState<ThemeMode>(defaultMoruMode)

  return (
    <AppMoruProvider mode={mode}>
      <main style={${pageStyle}}>
        <h1>{${JSON.stringify(copy.title)}}</h1>
        <Button onClick={() => setMode((current) => current === 'light' ? 'dark' : 'light')}>
          {${JSON.stringify(copy.toggle)}}
        </Button>
      </main>
    </AppMoruProvider>
  )
}
`,
    })
  } else {
    files.push(
      {
        path: 'app/layout.tsx',
        language: 'tsx',
        code: `import type { ReactNode } from 'react'
import { AppMoruProvider } from './providers'
import 'moru-ui/styles.css'
${fonts.code ? `${fonts.code}\n` : ''}
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang=${JSON.stringify(locale)}>
      <body style={{ margin: 0 }}>
        <AppMoruProvider>{children}</AppMoruProvider>
      </body>
    </html>
  )
}
`,
      },
      {
        path: 'app/page.tsx',
        language: 'tsx',
        code: `import { Button } from 'moru-ui'

export default function Page() {
  return (
    <main style={${pageStyle}}>
      <h1>{${JSON.stringify(copy.title)}}</h1>
      <Button>{${JSON.stringify(copy.action)}}</Button>
    </main>
  )
}
`,
      },
    )
  }

  const text = [
    `# Moru UI · ${target === 'vite' ? 'React / Vite' : 'Next.js App Router'}`,
    '',
    ...guideCopy[locale].slice(0, -1),
    focusCompatibility[locale],
    '',
    '```bash',
    command,
    '```',
    ...files.flatMap((file) => [
      '',
      `## ${file.path}`,
      '',
      `\`\`\`${file.language}`,
      file.code.trimEnd(),
      '```',
    ]),
    '',
    guideCopy[locale].at(-1),
    '',
  ].join('\n')
  return {
    command,
    files,
    text,
    mode: design.mode,
    fontFamily: design.fontFamily,
    compatibilityNote: focusCompatibility[locale],
  }
}
