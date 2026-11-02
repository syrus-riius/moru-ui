# Contributing to Moru UI

한국어와 영어로 이슈와 PR을 작성할 수 있습니다. 문제를 재현하는 방법과 변경 후 동작을 알려 주세요.

Moru is a source-first UI library: reusable React components, shared design tokens, blocks, examples, and a separate React Native implementation. Contributions should keep the defaults useful, the public API understandable, and the components accessible.

## Start a change

Search [existing issues](https://github.com/syrus-riius/moru-ui/issues) before reporting a bug or proposing a feature. Include a small reproduction for bugs. For a large API change or a new dependency, open an issue first so we can agree on the scope.

Fork the repository, create a branch from `main`, and open a pull request against `main`. Keep a PR focused on one problem. Describe the resulting behavior, relevant API changes, and how you verified it. Include before/after screenshots for visible changes and a migration example when existing usage changes.

## Run the web project

Use Node.js 24 or newer and npm. From the repository root:

```sh
npm ci
npm run dev
```

The root project and `apps/moru-expo` have separate dependencies. Do not combine their `node_modules` directories. Root commands operate on the web library unless a command explicitly says otherwise.

## Implement and verify

Prefer existing Moru components and tokens over new one-off controls or hard-coded styles. Keep web DOM/CSS implementations separate from React Native implementations. Preserve existing copyright and third-party notices.

For component behavior changes, add or update focused tests for the behavior that could regress. Verify keyboard operation, a visible focus indicator, accessible names, and any relevant error, disabled, or loading state. For layout changes, check narrow mobile and desktop widths, light and dark themes, long content, and text enlargement. Check focus entry, containment, dismissal, and return for overlays. Keep reduced-motion preferences in mind when adding animation.

Before submitting a code change, run:

```sh
npm test
npm run build
```

`npm run build` checks the generated native web preview, all source starters and registry before TypeScript and the Vite production build. If a check reports a stale artifact, regenerate it from its source as described below. CI runs the same tests and build; it does not automatically rewrite generated files. Documentation-only changes do not need new tests.

Report the checks you actually performed. A passing browser preview or platform bundle does not establish VoiceOver/TalkBack, physical-device, gesture, or OS keyboard compatibility. Mention any relevant verification limits in the PR.

## Keep generated files current

Edit source files rather than the generated download or preview output.

- After changing registry inputs (UI, blocks, tokens, helpers, dependency versions or the generator), run `npm run registry:build` and include `registry.json`, `registry/moru` and `public/r` output. Run `npm run registry:smoke` for changes that affect installation. It uses the real shadcn CLI against a temporary local registry, creates isolated consumer projects under `.qa`, and rewrites only registry dependency transport URLs for local validation. `--base-url https://moru-ui-lab.riius.chatgpt.site/r/v0.3.2` verifies deployed payloads unchanged.
- After changing web UI, theme, shared helpers, reusable block sources, dependencies, or starter templates, run `npm run web:starter:build` from the root. Include the updated ZIP and manifest in the PR. Packaging requires Python 3.
- If changing the inputs that generate `src/theme/default.css`, run `npm run tokens:build`, then regenerate the web starter.
- After changing native preview inputs, install the Expo app's dependencies with `npm ci` in `apps/moru-expo`, return to the root, and run `npm run mobile:build`. Include the resulting `public/native-preview` files and build information. After changing native sources, package metadata, starter templates, licenses or notices, run `npm run mobile:starter:build` from the root and include its ZIP and manifest. This packaging command requires Python 3 but does not build Expo.

Run the root checks again after regenerating artifacts. Do not commit local QA output, installed dependencies, credentials, or build caches.

- After editing `src/components/project-template`, the project starter template, the selected registry sources, dependencies or licenses, run `npm run project:starter:build`. Include the ZIP and manifest, extract the ZIP into a new directory, then run its `npm ci` and `npm run build`. Keep this template's runtime dependencies minimal.

## React Native and Expo changes

Read [the Expo app instructions](apps/moru-expo/AGENTS.md), [its README](apps/moru-expo/README.md), and [the native package guide](packages/moru-native/README.md) before changing native code. Use documentation matching the installed Expo SDK rather than assuming a web or older SDK API applies.

In `apps/moru-expo`, run `npm run typecheck` and `npm run lint` for native changes. Follow the app's verification guidance for dependency, navigation, or platform changes. Record whether a result comes from Expo Web, an iOS/Android export, a simulator, or a physical device; those checks cover different behavior.

## License

By submitting a contribution, you agree that your contribution is provided under Moru UI's [MIT license](LICENSE). Only contribute work you have the right to share, and retain the notices required by any third-party code or assets you include.

## Prepare a separate public checkout

Maintainers can run `npm run public:prepare -- /absolute/path/to/an-empty-directory` to export the reviewed source allowlist into a new directory. The command excludes local hosting configuration, nested Git histories, installed dependencies and local QA data. Review the generated manifest and files before initializing or publishing a Git repository. It refuses to overwrite an existing checkout.
