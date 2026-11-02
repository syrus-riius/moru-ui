# Moru UI

**A solid foundation. Made yours.**

Moru is an MIT-licensed UI source library and design lab built with React,
TypeScript, Base UI and Tailwind CSS. Start with working components and tokens,
then shape them into your own product.

[Explore Moru](https://moru-ui-lab.riius.chatgpt.site/) ·
[Components](https://moru-ui-lab.riius.chatgpt.site/#components) ·
[Blocks](https://moru-ui-lab.riius.chatgpt.site/#blocks) ·
[Examples](https://moru-ui-lab.riius.chatgpt.site/#examples) ·
[한국어 가이드](docs/lab-guide.ko.md)

## What is included

- Web components with keyboard, focus, validation and loading states.
- Shared color, typography, spacing, size and density tokens; light and dark modes.
- Login, OTP, search filter and settings blocks composed from real Moru components.
- A responsive wireframe simulator with auto layout and linked screens.
- A separate React Native / Expo implementation and mobile examples.

Moru ships source starters and a **selective component registry**. It is **not
published as an npm library**. The gallery and simulator
are a design lab; authentication, uploads and persistence in examples are local
demonstrations. Connect your own application services.

## Start a web app

Download the [web starter](https://moru-ui-lab.riius.chatgpt.site/downloads/moru-web-starter.zip),
extract it and open the `moru-web-starter` directory. Use Node.js 24+ and npm:

```sh
npm ci
npm run dev
```

The starter contains UI sources, tokens, styles, fonts via npm dependencies and
four reusable blocks. Its README explains the required style imports and theming.
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
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/button.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/login.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/otp.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/tabs.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/menu.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/popover.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/drawer.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/calendar.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/date-picker.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/date-range-picker.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/time-picker.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/time-range-picker.json
```

The v0.4.0 registry contains **81 installable entries**: core, 76 UI entries and
four blocks. It covers the full 75-component gallery plus StatusMessage, adding
the remaining 54 UI entries. Required supporting components
are resolved automatically. Sources install under your UI alias's `moru/` folder.
Import its `styles.css` once and wrap the area in `MoruProvider`.

| Category | UI entries | Examples |
| --- | ---: | --- |
| Forms and input | 25 | NumberInput, MultiSelect, FileInput, Calendar, Questionnaire |
| Actions | 5 | Button, Command, ButtonGroup, Kbd, Toggle |
| Overlays | 9 | Dialog, Menu, Tooltip, Sheet, ContextMenu, HoverCard |
| Navigation | 7 | Tabs, Menubar, NavigationMenu, Sidebar, Stepper |
| Layout | 12 | Card, DirectionProvider, Carousel, Resizable, ScrollArea |
| Status and feedback | 10 | Toast, Alert, RingProgress, Marker, StatusMessage |
| Data | 3 | Table, Chart, DataTable |
| Conversation and content | 5 | Bubble, CodeBlock, Message, MessageScroller, Trace |

For example:

```sh
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/number-input.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/command.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/context-menu.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/navigation-menu.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/carousel.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/toast.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/chart.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/code-block.json
```

Toast requires `ToastProvider` inside `MoruProvider`; DataTable requires Moru's
column type and stable row IDs; Chart takes `data`, `config`, `xKey`, `title` and
a visible chart height. The detailed guides include these APIs and the complete
item-name table. Optional chart/table/carousel/panel packages follow selected
dependencies rather than every installation. The supported React baseline is
19.3, including DataTable's `useEffectEvent` dependency.

Published `/r/v0.3.1/`, `/r/v0.3.2/`, `/r/v0.3.3/` and `/r/v0.3.4/` URLs remain unchanged. This release uses
artifact generation and a production build; new tests, installation smoke checks
and browser checks, as well as CI runs, are skipped for the v0.4.0 additions.

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
실행하거나 이 저장소 전체를 실행할 수 있습니다. 현재는 소스를 가져와
수정하는 방식이며, v0.4.0에서 갤러리 전체 75종과 StatusMessage를 포함한 UI 76개·공통 기반 1개·블록 4개,
총 81개 항목을 선택 설치할 수 있습니다. 8개 분야의 전체 설치 이름과 Toast·DataTable·Chart 등의
실제 API 예시는 [한국어 선택 설치 안내](docs/registry.ko.md)를 참고하세요.
자세한 사용법은 [한국어 랩 가이드](docs/lab-guide.ko.md)를 참고하세요.
