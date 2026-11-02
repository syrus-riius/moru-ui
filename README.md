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

Moru currently ships source starters. It is **not published on npm**, and a
selective component registry is **not available yet**. The gallery and simulator
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
React 19, TypeScript, Vite and Tailwind CSS 4 on Node.js 24+. Other frameworks,
React versions and SSR setups need separate validation. Native compatibility is
documented in the Expo app guide.

## Selective installation roadmap

The next distribution step is a shadcn-compatible GitHub registry: a shared core,
selected component sources and reusable blocks. The plan includes isolated install
paths, dependency resolution and clean-project installation tests. It does not
require publishing Moru as an npm library or running a registry backend.

Read the [registry design plan (한국어)](docs/registry-plan.ko.md).
No registry installation command is advertised as working in this release.

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
수정하는 방식이며, 컴포넌트 선택 설치 레지스트리는 다음 단계로 준비합니다.
자세한 사용법은 [한국어 랩 가이드](docs/lab-guide.ko.md)를 참고하세요.
