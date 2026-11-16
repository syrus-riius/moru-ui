# Moru UI

**A solid foundation. Made yours.**

Moru is an MIT-licensed React UI library and design lab built with TypeScript
and Base UI. The lab uses Tailwind CSS; the npm library does not require it.
Start with working components and tokens, then shape them into your own product.

[Explore Moru](https://moru-ui-lab.riius.chatgpt.site/) ·
[Components](https://moru-ui-lab.riius.chatgpt.site/#components) ·
[Blocks](https://moru-ui-lab.riius.chatgpt.site/#blocks) ·
[Examples](https://moru-ui-lab.riius.chatgpt.site/#examples) ·
[한국어 가이드](docs/lab-guide.ko.md)

## What is included

- Web components with keyboard, focus, validation and loading states.
- Shared color, typography, spacing, size and density tokens; light and dark modes.
- Default, Glass and Neon style packs, with independent surface and emphasis effects.
- Dashboard, login, signup and workspace settings screens composed from real Moru components, with reusable OTP and search-filter patterns.
- A responsive wireframe simulator with auto layout and linked screens.
- A separate React Native / Expo implementation and mobile examples.

Moru is available as an **npm beta**, source starters, and a **selective component
registry**. The gallery and simulator are a design lab; authentication, uploads
and persistence in examples are local demonstrations. Connect your own
application services.

## Start a web app

### Install the npm package

In a React app using React and React DOM `^19.3.0`:

```sh
npm install moru-ui@beta
```

Import the shared stylesheet once and render components inside `MoruProvider`:

```tsx
import { Button, MoruProvider } from 'moru-ui'
import 'moru-ui/styles.css'

export function Example() {
  return (
    <MoruProvider mode="light" locale="en">
      <Button>Continue</Button>
    </MoruProvider>
  )
}
```

The published `0.5.0-beta.3` includes the full web component library, with
separate block and optional-dependency entry points. Both `npm install moru-ui`
and `npm install moru-ui@beta` currently install this beta release. See the
[npm package guide](packages/moru-react/README.md) for import paths, optional
dependencies, tokens, and Next.js setup.

### Build with an AI coding assistant

Open **AI에 전달** in the guide, components, blocks, tokens or mobile lab. Choose
the installation target and up to six web components, review the current theme
and usage references, then copy the context into your coding assistant. Expo has
its own native guide. Nothing is sent to an AI service by the lab.

Assistants can start at [llms.txt](https://moru-ui-lab.riius.chatgpt.site/llms.txt),
then read only the selected versioned documents from the linked catalog. Export
names and type declarations are derived from the registry's installed sources;
examples explain the intended behavior and platform limits.

After changing relevant source, run `npm run registry:build` followed by
`npm run ai:build`. `npm run ai:check` rejects stale generated references and is
part of the lab build. Existing component APIs and installation steps are unchanged.

### Download the source starter

Download the [web starter](https://moru-ui-lab.riius.chatgpt.site/downloads/moru-web-starter.zip),
extract it and open the `moru-web-starter` directory. Use Node.js 24+ and npm:

```sh
npm ci
npm run dev
```

The starter contains UI sources, tokens, styles, fonts via npm dependencies and
six reusable blocks. Its README explains the required style imports and theming.
You own the copied files and can edit them directly.

## Run the complete lab

```sh
git clone https://github.com/syrus-riius/moru-ui.git
cd moru-ui
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

The checked-in native web preview and starter downloads allow the root build to
run without installing Expo. After editing source files used in generated
artifacts, rebuild those artifacts as described in [CONTRIBUTING.md](CONTRIBUTING.md).

## Project and task app template

[Run the template](https://moru-ui-lab.riius.chatgpt.site/#project-template) or
[download its sources](https://moru-ui-lab.riius.chatgpt.site/downloads/moru-project-starter.zip).
It connects Moru's Search Filters and Settings blocks to real project/task data:
create, edit, complete, delete and undo, with versioned browser-local persistence.
The standalone Vite app includes only the Moru sources and dependencies it needs.
Authentication and shared-server persistence are integration points for your app.
See the [template guide (한국어)](docs/project-template.ko.md).

## React Native / Expo

Native components live in `packages/moru-native`; the example app lives in
`apps/moru-expo`. They share design principles and token values with the web
library, but use native implementations instead of DOM and CSS.

See the [native package guide](packages/moru-native/README.md),
[Expo app guide](apps/moru-expo/README.md) and
[mobile audit](docs/mobile-audit.md). You can also download the
[Expo starter](https://moru-ui-lab.riius.chatgpt.site/downloads/moru-native-starter.zip).
OS behavior and assistive technology require device testing; browser previews
are not proof of native runtime support.

## Supported baseline

The web starter is tested with the versions pinned in `package-lock.json`, using
React 19.3, TypeScript, Vite and Tailwind CSS 4 on Node.js 24+. Other frameworks,
React versions and SSR setups need separate validation. Native compatibility is
documented in the Expo app guide.

## Install only what you need

Prepare a React + TypeScript + Tailwind CSS 4 project with shadcn's
[Vite setup](https://ui.shadcn.com/docs/installation/vite), then install a component
or block with the tested CLI version:

```sh
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/button.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/login.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/otp.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/tabs.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/menu.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/popover.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/drawer.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/calendar.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/date-picker.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/date-range-picker.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/time-picker.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/time-range-picker.json
```

The v0.4.1 registry contains **90 installable entries**: core, 81 UI entries,
six blocks, the legacy Dialog alias and the `block-messages` support entry that
blocks install for their translations. It covers the full 79-component gallery
plus StatusMessage and FormattedInput. Use Modal for new code; existing Dialog imports remain valid.
Required supporting components
are resolved automatically. Sources install under your UI alias's `moru/` folder.
Import its `styles.css` once and wrap the area in `MoruProvider`.

| Category | UI entries | Examples |
| --- | ---: | --- |
| Forms and input | 26 | NumberInput, FormattedInput, MultiSelect, FileInput, Calendar, Questionnaire |
| Actions | 5 | Button, Command, ButtonGroup, Kbd, Toggle |
| Overlays | 9 | Modal, Menu, Tooltip, Sheet, ContextMenu, HoverCard |
| Navigation | 7 | Tabs, Menubar, NavigationMenu, Sidebar, Stepper |
| Layout | 14 | Header, Footer, Card, DirectionProvider, Carousel, Resizable, ScrollArea |
| Status and feedback | 12 | Toast, Alert, RingProgress, LoadingOverlay, StatusIndicator, StatusMessage |
| Data | 3 | Table, Chart, DataTable |
| Conversation and content | 5 | Bubble, CodeBlock, Message, MessageScroller, Trace |

For example:

```sh
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/number-input.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/command.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/context-menu.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/navigation-menu.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/carousel.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/toast.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/chart.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/code-block.json
```

Toast requires `ToastProvider` inside `MoruProvider`; DataTable requires Moru's
column type and stable row IDs; Chart takes `data`, `config`, `xKey`, `title` and
a visible chart height. The detailed guides include these APIs and the complete
item-name table. Optional chart/table/carousel/panel packages follow selected
dependencies rather than every installation. The supported React baseline is
19.3, including DataTable's `useEffectEvent` dependency.

Published `/r/v0.3.1/`, `/r/v0.3.2/`, `/r/v0.3.3/`, `/r/v0.3.4/` and `/r/v0.4.0/` URLs remain unchanged.
v0.4.1 was checked locally with the unit tests, the production build, an installation
smoke test against the v0.4.1 payloads and a before/after comparison of the lab in a
browser. CI has not run for it. See the [installation guide](docs/registry.md#upgrading-from-v040)
for what changes when upgrading from v0.4.0.

See the [installation guide](docs/registry.md), [한국어 안내](docs/registry.ko.md)
and [registry implementation notes](docs/registry-plan.ko.md). The web registry
currently targets Vite/React/Tailwind 4; Native/Expo remains a separate source starter.

## Contributing

Bug reports and focused pull requests are welcome. See
[CONTRIBUTING.md](CONTRIBUTING.md) for development, accessibility checks and
artifact updates. For security-sensitive reports, use the repository's private
vulnerability reporting feature if enabled; do not put credentials in issues.

## License

Original Moru UI code and documentation are [MIT licensed](LICENSE), like the
source-distribution model that inspired this project. Keep the copyright and
license notice when redistributing copies or substantial portions. Third-party
packages and fonts retain their own terms; see [NOTICE.md](NOTICE.md). The Expo
starter's original license is preserved in `apps/moru-expo/LICENSE`.

## 한국어

Moru UI는 **단단한 기본, 당신만의 UI**를 지향합니다. 웹 스타터를 받아
실행하거나 이 저장소 전체를 실행할 수 있습니다. `npm install moru-ui@beta`로
공개된 베타 패키지를 설치하거나, 소스를 가져와 직접 수정할 수 있습니다.
npm 공개 범위와 다음 릴리스 준비 상태는 위 설치 안내와 [패키지 가이드](packages/moru-react/README.md)를 참고하세요.
소스 레지스트리 v0.4.1에서는 갤러리 전체 79종과 StatusMessage·FormattedInput을 포함한 UI 81개·공통 기반 1개·블록 6개,
Dialog 호환 별칭과 블록 번역 지원 항목을 포함한 총 90개 항목을 선택 설치할 수 있습니다. 8개 분야의 전체 설치 이름과 Toast·DataTable·Chart 등의
실제 API 예시는 [한국어 선택 설치 안내](docs/registry.ko.md)를 참고하세요.
자세한 사용법은 [한국어 랩 가이드](docs/lab-guide.ko.md)를 참고하세요.
