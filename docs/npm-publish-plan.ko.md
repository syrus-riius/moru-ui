# Moru UI npm 공개 준비 계획

작성일 2026-11-15. 조사와 계획만 담은 문서입니다. 이 문서를 쓰면서 코드, 의존성, 생성물은 바꾸지 않았습니다.

## 읽는 법

- **[확인]** 은 저장소 파일을 직접 읽었거나, 설치되어 있는 도구를 읽기 전용으로 실행해 얻은 사실입니다. 파일 경로와 줄 번호를 함께 적었습니다.
- **[추측]** 은 이 저장소에서 검증하지 못한 내용입니다. 외부 도구의 일반적인 동작에 대한 제 지식이거나, 실행해 보지 않은 예상입니다. 채택하기 전에 확인이 필요합니다.
- 줄 번호는 2026-11-15 15:48(KST) 기준입니다. 조사 도중 다른 세션이 버전을 0.4.0에서 0.4.1로 올렸고(15:32) `src/components/ui`의 일부 파일을 고쳤습니다(15:44). 이 문서는 그 뒤의 상태로 다시 확인한 것입니다. 그 세션의 작업이 이어지면 줄 번호가 한두 줄 밀릴 수 있습니다.
- `node_modules`, `dist`, `.qa`는 조사하지 않았습니다. `sites/moru-ui`는 5장의 버전 폴더 비교에만 읽었습니다.

## 결론 요약

| 질문 | 권장안 |
| --- | --- |
| 1. 패키지 경계 | 웹은 `moru-ui` 한 패키지로 내고 블록은 서브패스(`moru-ui/blocks`)로 둡니다. 네이티브는 별도 패키지로 남기되 이번 공개에서 뺍니다. `react`·`react-dom`은 peer, `@base-ui/react`·`lucide-react`는 일반 의존성, recharts 등 네 개는 선택 peer로 두고 전용 서브패스에서만 닿게 합니다. |
| 2. 빌드 | 번들러를 추가하지 않습니다. 레지스트리 생성기의 변환 단계를 공유해 패키지용 소스 트리를 만들고 `tsc`로 JS와 타입 선언을 파일 단위로 냅니다. 먼저 작은 시험 빌드로 네 가지를 확인합니다. |
| 3. CSS 배포 | 배포되는 JS에서는 CSS import를 뺍니다. CSS는 순서를 고정해 합친 `moru-ui/styles.css` 한 파일로 냅니다. 레이어는 지금처럼 씌우지 않습니다. 컴포넌트별 CSS는 수요가 확인되면 추가합니다. |
| 4. Tailwind 의존 | (a) 선언을 `ui-*` CSS로 옮깁니다. 실제로 쓰는 Tailwind 클래스는 13종, 16개 요소, 9개 파일뿐입니다. |
| 5. 레지스트리 공존 | 생성기 하나가 같은 변환 결과에서 레지스트리와 npm 패키지를 모두 만듭니다. 버전은 하나로 묶고, npm 첫 버전은 `0.5.0-beta.1`을 권합니다. |
| 6. 공개 전 점검 | Next.js 소비자 빌드를 통과 조건으로 삼고, 통과하지 못하면 "Vite 전용 베타"로 범위를 좁혀 공개합니다. 문구를 고칠 위치와 추가할 테스트는 6장에 목록으로 정리했습니다. |

과제 설명과 실제 코드가 다른 점이 세 가지 있었습니다. 계획이 이 차이에 기대고 있어 먼저 적습니다.

1. `button.css`는 없습니다. Button을 포함한 `.tsx` 25개는 CSS를 import하지 않고, 기본 컴포넌트의 스타일이 `src/components/ui/styles.css` 한 파일에 모여 있습니다(3장).
2. `lucide-react`는 선택 의존성이 아닙니다. Modal, Toast, Calendar, Alert를 포함한 UI 파일 30개가 import합니다(1장).
3. `MoruProvider`는 `src`에 소스가 없습니다. 레지스트리 생성기 안의 문자열로만 존재합니다(`scripts/build-registry.mjs:776-797`).

## 현재 배포 방식

**[확인]** 지금 배포 경로는 세 가지이고 npm은 없습니다.

- shadcn 레지스트리: `scripts/build-registry.mjs`가 `src`를 읽어 `registry/moru/**`, `registry.json`, `public/r/v<버전>/*.json`을 만듭니다(`:1045-1060`). v0.4.1 기준 90개 항목입니다.
- 소스 스타터 ZIP: `scripts/build-web-starter.mjs`가 `src/components/ui`, `src/theme`, `src/lib`과 블록 6개를 그대로 복사합니다(`:11-19`). 의존성은 루트 `package.json`에서 가져옵니다(`:156-161`).
- 루트 `package.json`은 `"private": true`(`:3`)이고 `exports`, `main`, `files`, `sideEffects`가 없습니다. `README.md:24-25`가 "not published as an npm library"라고 밝힙니다.

**[확인]** npm 공개를 향한 흔적이 하나 있습니다. `packages/moru-react/README.md`는 `package.json` 없이 README 초안만 있고, `npm install moru-ui@beta`(`:10`), `import 'moru-ui/styles.css'`(`:23`), `moru-ui/chart` 같은 서브패스(`:43-46`)를 안내합니다. 이 계획은 그 초안의 방향(패키지 이름 `moru-ui`, 스타일시트 한 번 import, 선택 의존성은 서브패스)을 따르되 두 군데를 고치자고 제안합니다(6장).

---

## 1. 패키지 경계

### 현재 상태

- **[확인]** 패키지의 루트 엔트리가 될 만한 파일은 `src/index.ts`(19줄)뿐인데, 저장소 어디에서도 import하지 않습니다. 레지스트리와 스타터도 이 파일을 쓰지 않으므로 지금은 검증되지 않는 파일입니다.
- **[확인]** 이 파일을 그대로 엔트리로 쓰면 문제가 둘 있습니다.
  - `export * from './theme'`(`src/index.ts:2`)가 `useTheme`까지 내보냅니다(`src/theme/index.ts:2`). `useTheme`은 랩 전용 상태 훅입니다. `localStorage`의 `moru-ui-theme` 키를 읽고 쓰고 `document.documentElement`를 고칩니다(`src/theme/useTheme.ts:35`, `:200-249`). 레지스트리의 `_theme/`에는 `tokens.ts`, `style-packs.ts`, `component-spacing.ts`만 들어갑니다.
  - `src/components/ui/index.ts:86-89`가 carousel, chart, data-table, resizable을 다시 내보냅니다. 루트에서 import하는 순간 선택 의존성 네 개가 모두 정적으로 연결됩니다.
- **[확인]** 선택 의존성은 각각 한 파일에서만 import합니다. recharts는 `chart.tsx:28`, `@tanstack/react-table`은 `data-table.tsx:21`, `embla-carousel-react`는 `carousel.tsx:3`, `react-resizable-panels`는 `resizable.tsx:9`입니다. 블록 가운데 `DashboardBlock`만 Chart를 씁니다(`src/components/blocks/DashboardBlock.tsx:7`).
- **[확인]** `lucide-react`는 UI 파일 30개와 `DashboardBlock`이 import합니다. `modal.tsx`, `toast.tsx`, `calendar.tsx`, `alert.tsx`, `status-message.tsx`처럼 기본에 가까운 컴포넌트가 포함됩니다.
- **[확인]** `@base-ui/react`는 서브패스 31개를 import합니다. `react-dom`은 `theme-scope.tsx:11`의 `createPortal` 한 곳에서 씁니다.
- **[확인]** React 19 전용 문법을 씁니다. `<Context value>` 형식이 `time-range-picker.tsx:138`, `:163`과 `chart.tsx:51`에 있고, `useEffectEvent`가 `data-table.tsx:2`, `:98`에 있습니다. 테스트한 버전은 19.3.1 하나입니다(`package.json:37-38`, `README.md:105-108`).
- **[확인]** 설치된 의존 패키지가 요구하는 React 범위는 Moru보다 넓습니다. Base UI는 `^17 || ^18 || ^19`, lucide는 16.5.1 이상, recharts는 16.8 이상(`react-is`도 요구), TanStack Table은 18 이상, Embla는 16.8 이상, Resizable Panels는 18 이상입니다. 라이선스는 lucide가 ISC이고 나머지는 MIT입니다(각 `node_modules/<패키지>/package.json`).
- **[확인]** 글꼴 패키지 세 개(`pretendard`, `@fontsource-variable/noto-sans`, `@fontsource-variable/noto-sans-kr`)는 `src/theme/fonts.css:1-3`만 씁니다. 이 파일은 랩 엔트리가 불러오고(`src/main.tsx:6`), 레지스트리는 글꼴을 설치하지 않습니다(`scripts/build-registry.mjs:998`).
- **[확인]** `packages/moru-native/package.json`은 이름이 `@moru/native`(`:2`), 버전 0.1.0(`:3`), `private`(`:4`)입니다. `main`, `types`, `exports`가 모두 TypeScript 소스 `src/index.ts`를 가리키고(`:6-25`) 빌드 단계가 없습니다.
- **[확인]** 공개 체크아웃을 만드는 `scripts/prepare-public-repo.mjs`의 허용 목록에는 `packages/moru-native`만 있습니다(`:31`). `packages/moru-react`는 없습니다.

### 선택지

| 안 | 내용 | 장점 | 단점 |
| --- | --- | --- | --- |
| A | 웹 한 패키지 `moru-ui`. 블록과 선택 의존성 컴포넌트는 서브패스 | 버전이 하나입니다. 레지스트리가 이미 전체를 한 버전으로 묶습니다(`build-registry.mjs:868-871`). 설치 안내가 한 줄입니다 | 블록만 따로 버전을 올릴 수 없습니다 |
| B | `@moru/core`, `@moru/blocks`, `@moru/native`로 분리 | 블록의 번역과 데모 코드를 코어에서 완전히 떼어 냅니다 | 패키지 간 버전 동기화, 게시 순서, 스코프 소유가 필요합니다. 블록은 파일 6개입니다 |
| C | 컴포넌트마다 패키지 | 설치 단위가 가장 작습니다 | 81개 패키지를 관리해야 합니다. 그 용도는 레지스트리가 이미 맡고 있습니다 |

### 권장안

**A안**을 권합니다. 블록 번역은 이미 `src/lib/block-i18n.ts`로 분리되어 있어 서브패스만으로 코어와 떨어집니다. 필요한 것만 골라 설치하는 요구는 레지스트리가 맡고, npm 패키지는 "전부 설치하고 쓰는 것만 번들에 남기는" 경로로 역할을 나눕니다.

네이티브는 별도 패키지로 두되 이번 공개 범위에서 뺍니다. 의존성과 런타임이 다르고, TypeScript 소스를 그대로 배포하는 형태라 Metro 전용 검토가 따로 필요합니다.

배포용 `package.json`은 `packages/moru-react/package.json`에 새로 둡니다. 루트 `package.json`은 랩 앱이므로 `private: true`를 유지합니다(`NOTICE.md:7`이 그 이유를 적고 있습니다).

**엔트리 구성**

| 서브패스 | 내용 | 선택 의존성 |
| --- | --- | --- |
| `moru-ui` | `MoruProvider`, `ThemeScope`, 토큰, `MoruLocaleProvider`·`useI18n`, 아래 네 개를 뺀 모든 UI 컴포넌트 | 없음 |
| `moru-ui/<항목 이름>` | 컴포넌트별 엔트리. 이름은 레지스트리 항목 이름과 같습니다(`moru-ui/button`, `moru-ui/date-picker`) | 없음 |
| `moru-ui/chart` | Chart | `recharts` |
| `moru-ui/data-table` | DataTable | `@tanstack/react-table` |
| `moru-ui/carousel` | Carousel | `embla-carousel-react` |
| `moru-ui/resizable` | Resizable | `react-resizable-panels` |
| `moru-ui/blocks` | Login, Signup, OTP, SearchFilters, Settings 블록과 `useBlockI18n` | 없음 |
| `moru-ui/blocks/dashboard` | DashboardBlock | `recharts` |
| `moru-ui/styles.css` | 전체 스타일(3장) | 없음 |

`exports`는 손으로 쓰지 않고 `registryDefinitions`(`build-registry.mjs:21-591`)에서 생성합니다. `"./*"` 같은 와일드카드는 쓰지 않습니다. **[추측]** Node의 `exports` 패턴에서 `*`는 `/`를 포함한 문자열과 일치하므로 `_lib/`, `_theme/` 같은 내부 모듈까지 공개 계약이 됩니다.

**`package.json` 필드**

```jsonc
{
  "name": "moru-ui",
  "type": "module",
  "sideEffects": ["**/*.css"],
  "files": ["dist", "NOTICE.md"],
  "exports": { /* 생성: types + default 쌍 */ },
  "peerDependencies": {
    "react": "^19.3.0",
    "react-dom": "^19.3.0",
    "recharts": "^3.10.1",
    "@tanstack/react-table": "^9.3.1",
    "embla-carousel-react": "^8.6.0",
    "react-resizable-panels": "^4.14.8"
  },
  "peerDependenciesMeta": {
    "recharts": { "optional": true },
    "@tanstack/react-table": { "optional": true },
    "embla-carousel-react": { "optional": true },
    "react-resizable-panels": { "optional": true }
  },
  "dependencies": {
    "@base-ui/react": "~1.9.0",
    "lucide-react": "^1.60.0"
  }
}
```

각 선택의 근거는 다음과 같습니다.

- `sideEffects`는 3장의 권장안(JS에서 CSS import 제거)을 전제로 합니다. **[확인]** 라이브러리 소스에서 모듈 최상위가 `window`나 `document`를 건드리는 곳은 찾지 못했습니다. `sidebar.tsx:12-19`의 `matchMedia`는 함수 안에 있습니다. grep으로 본 결과이므로 빌드 뒤 소비자 번들에서 트리 셰이킹이 되는지 한 번 확인합니다.
- `react`와 `react-dom`의 하한은 테스트한 19.3으로 시작합니다. `useEffectEvent` 때문에 DataTable은 19.2가 실제 하한이고(`docs/registry-plan.ko.md:63`도 같은 이유를 적습니다), 19.2에서 테스트를 돌린 뒤에 범위를 넓힙니다.
- `@base-ui/react`는 peer가 아니라 일반 의존성으로 둡니다. 소비자는 Base UI를 직접 import하지 않고, Moru의 오버레이 동작이 특정 버전에 맞춰 검증되어 있기 때문입니다. 범위는 패치만 허용합니다(`~1.9.0`). **[확인]** 공개 타입이 Base UI 타입을 그대로 드러내는 곳은 `direction-provider.tsx:5` 한 곳입니다. 앞으로 Base UI 타입이나 컨텍스트를 공개 API로 더 노출하게 되면 peer로 바꿉니다.
- `lucide-react`는 일반 의존성입니다. 선택으로 둘 수 없는 이유는 위 "현재 상태"에 적었습니다.
- 글꼴 패키지는 넣지 않습니다. 기본 토큰의 글꼴은 Pretendard이므로(`src/theme/tokens.ts:222`) 패키지 README에 글꼴 설치를 선택 사항으로 안내합니다.
- `engines`는 넣지 않습니다. 루트의 `node >=24`(`package.json:56-58`)는 개발 환경 요구 사항입니다.

**결정이 필요한 것**: npm에서 `moru-ui`라는 이름을 쓸 수 있는지는 확인하지 않았습니다. 프로젝트 이름을 외부 서비스에 보내지 않으려고 조회하지 않았습니다. 아래 명령으로 직접 확인해 주세요. 404가 나오면 비어 있는 이름입니다.

```bash
npm view moru-ui name version
```

### 작업 순서

1. `MoruProvider`를 실제 소스 파일로 옮깁니다(예: `src/components/ui/provider.tsx`). 생성기의 문자열 템플릿(`build-registry.mjs:776-797`)은 이 파일을 읽도록 바꿉니다.
2. `src/index.ts`를 패키지 루트 엔트리로 다시 정의합니다. `useTheme`과 선택 의존성 컴포넌트 네 개를 빼고 `MoruProvider`를 넣습니다. 랩이 쓰는 배럴 `src/components/ui/index.ts`는 그대로 둡니다.
3. `packages/moru-react/package.json` 템플릿을 만듭니다. `exports`와 `version`은 빌드 때 채웁니다.
4. `scripts/prepare-public-repo.mjs`의 허용 목록에 `packages/moru-react`를 추가합니다.

---

## 2. 빌드

### 현재 상태

- **[확인]** `npm run build`는 생성물 검사 여섯 개를 돌린 뒤 `tsc -b && vite build`를 실행합니다(`package.json:10`). `tsconfig.app.json`은 `noEmit: true`(`:13`), `moduleResolution: bundler`(`:8`)이고, `vite.config.ts:26-32`에는 라이브러리 설정이 없습니다. TypeScript 7.0.2와 Vite 8.3.4가 설치되어 있습니다(`package.json:52-53`).
- **[확인]** `src`에는 `'use client'`가 한 건도 없습니다. 레지스트리 생성기가 출력할 때 모든 `.tsx`와 컨텍스트 파일 두 개(`field-context.ts`, `time-field-context.ts`)에 붙입니다(`build-registry.mjs:832-837`).
- **[확인]** 생성기는 Babel로 import 구문의 정확한 위치를 구하고(`:638-673`), 상대 경로를 새 배치에 맞게 고쳐 쓰며 확장자를 떼어 냅니다(`:811-821`). 소스의 상대 import는 대부분 확장자가 없고, `src/theme/tokens.ts:6-7`만 `.ts`를 붙여 씁니다.
- **[확인]** `generateRegistry()`는 디스크에 쓰지 않고 산출물을 `Map`으로 돌려줍니다(`:840-841`, `:1075-1081`). 다른 스크립트가 불러 쓸 수 있습니다.
- **[확인]** 생성된 트리 `registry/moru`는 이미 랩에서 컴파일되고 있습니다. `vite.config.ts:29`와 `tsconfig.app.json:18-20`의 별칭 `@/components/ui/moru`로 project-template이 이 트리를 소비합니다.
- **[확인]** 라이브러리 소스는 `import.meta`나 `process.env`를 쓰지 않고, 이미지나 JSON 같은 자산도 import하지 않습니다. 번들러 전용 기능에 기대는 코드가 없습니다.

### 선택지

| 안 | 방식 | 새 의존성 | `'use client'` | 불확실한 점 |
| --- | --- | --- | --- | --- |
| 가 | 생성기로 패키지용 소스 트리를 만들고 `tsc`로 파일마다 JS와 `.d.ts`를 출력 | 없음 | 생성기가 붙이고 `tsc`는 그대로 둡니다 | TypeScript 7의 선언 출력, `.js` 확장자 경로 해석 |
| 나 | Vite 8 라이브러리 모드(모듈 보존)로 JS, `tsc --emitDeclarationOnly`로 타입 | 없음 | 번들러가 지워 버릴 수 있습니다 | 지시문 보존, CSS 처리 |
| 다 | tsdown이나 tsup 같은 라이브러리 번들러 | 있음 | 도구마다 다릅니다 | TypeScript 7과 선언 생성 플러그인의 호환 |

**[추측]** Rollup 계열 번들러는 모듈 최상위 지시문을 경고와 함께 버리는 것으로 알고 있습니다. Vite 8에서 어떤지는 확인하지 못했습니다. Vite 라이브러리 모드는 기본적으로 CSS를 한 파일로 뽑으면서 JS의 CSS import를 없앱니다. 두 가지 모두 번들러 버전에 따라 달라지는 동작입니다.

### 권장안

**가안**을 권합니다.

- 레지스트리와 npm이 같은 변환기를 거치므로 두 배포물의 코드가 같습니다. 이것이 5장의 요구이기도 합니다.
- 출력이 소스와 1:1이라 컴포넌트별 엔트리가 곧 파일이고, `'use client'`는 파일마다 남습니다.
- 생성기가 import 위치를 이미 정확히 알고 있습니다. 패키지 모드에서는 확장자를 떼지 않고 `.js`를 붙이기만 하면 됩니다. **[추측]** ESM 패키지 안의 확장자 없는 상대 import는 webpack 계열에서 해석에 실패할 수 있으므로 확장자는 반드시 붙입니다.
- 저장소의 기존 방식(결정적인 `scripts/build-*.mjs`, `--check`, `node --test`)과 같은 틀입니다.

출력 형식은 ESM 하나, 타깃은 `tsconfig.app.json:3`과 같은 ES2022, JSX는 `react-jsx`로 합니다. CommonJS는 내지 않습니다. `'use client'` 규칙은 지금의 "모든 `.tsx`" 그대로 가져갑니다. 서버 컴포넌트로 쓸 수 있는 순수 표시용 컴포넌트를 가려내는 일은 공개 뒤로 미룹니다.

**시험 빌드로 먼저 확인할 것**: 컴포넌트 서너 개(Button, Select, Modal, Chart)만으로 해 봅니다.

1. TypeScript 7.0.2의 `tsc`가 `declaration: true`로 `.d.ts`를 냅니다.
2. 출력 JS의 첫 줄에 `'use client'`가 남아 있습니다.
3. 소스에서 `./button.js`로 쓴 경로가 `button.tsx`로 해석되고 출력에 그대로 남습니다.
4. 압축한 tarball을 새 Vite 프로젝트에 설치해 타입 검사와 빌드가 통과합니다.

하나라도 막히면 나안으로 넘어가되, 그때도 확인 항목은 같습니다.

### 작업 순서

1. 위 시험 빌드를 `.qa` 아래에서 손으로 해 봅니다. 저장소 파일은 바꾸지 않습니다.
2. `build-registry.mjs`의 변환 단계(그래프 수집, 경로 재작성, CSS 스코프)를 함수로 분리합니다. 출력이 한 바이트도 달라지지 않는지 `npm run registry:check`로 확인합니다.
3. `scripts/build-package.mjs`를 추가합니다. 패키지 모드의 차이는 5장의 표와 같습니다.
4. `tsconfig.package.json`을 추가합니다(`noEmit` 해제, `declaration`, `outDir`).
5. `package.json`에 `package:build`를 추가합니다. `dist`는 `.gitignore:2`가 이미 제외합니다.

---

## 3. CSS 배포

### 현재 상태

- **[확인]** CSS가 들어오는 길이 둘입니다.
  - `.tsx` 25개(`button`, `input`, `textarea`, `checkbox`, `select`, `field`, `card`, `tabs`, `menu`, `badge`, `alert`, `switch`, `slider` 등)는 CSS를 import하지 않습니다. 이 기본 컴포넌트들의 스타일은 `src/components/ui/styles.css`(1089줄)에 있고, 이 파일이 `form-controls.css`와 `feedback.css`를 불러옵니다(`:1-2`). 앱 엔트리가 전역으로 import합니다(`src/main.tsx:8`).
  - 나머지 `.tsx` 60개는 자기 CSS와 `*-shared.css`를 직접 import합니다. 예를 들어 `accordion.tsx:4`, `combobox.tsx:8-9`, `multi-select.tsx:10-13`입니다. `theme-scope.tsx:16`은 `style-packs.css`를 불러옵니다.
- **[확인]** `src/components/ui/*.css` 72개와 `src/theme/readability.css`를 합치면 271,495바이트이고 gzip으로 33,920바이트입니다.
- **[확인]** `src` 전체에 `@layer`가 없습니다. 레지스트리 산출물에서는 `_styles/utilities.css`만 `@layer base` 안에 있습니다(`registry/moru/_styles/utilities.css:4`, 생성기 `:757`).
- **[확인]** 레지스트리용 CSS는 변환을 거칩니다. 모든 규칙 앞에 `:where([data-moru-registry])`가 붙고(`build-registry.mjs:732`), `:root`·`html`·`body` 선택자는 거부되며(`:729-731`), keyframes 이름에 `moru-registry-` 접두가 붙습니다(`:721-724`). `ThemeScope`에는 `data-moru-registry` 속성이 추가됩니다(`:829`).
- **[확인]** 토큰은 CSS 파일이 아니라 `ThemeScope`가 인라인 스타일로 넣습니다(`theme-scope.tsx:42-46`, `:76`). `:root`에 변수를 선언하는 `src/theme/default.css`는 랩 전용이고 레지스트리 core에 없습니다(`build-registry.mjs:593-613`).
- **[추측]** CSS 파일 사이의 순서가 정해져 있지 않습니다. 랩에서는 `main.tsx:3`의 `import App`이 CSS import(`:5-10`)보다 앞에 있어 컴포넌트 CSS가 기본 `styles.css`보다 먼저 들어갈 것입니다. 레지스트리 소비자는 `styles.css`를 엔트리 맨 위에서 불러오면 반대 순서가 됩니다. 두 환경 모두 동작하고 있으니 규칙들이 순서에 크게 기대지는 않는 것으로 보이지만, 자동으로 검증된 적은 없습니다.

### 선택지

| 안 | 내용 | 평가 |
| --- | --- | --- |
| 1 | JS의 CSS import를 그대로 둡니다 | 소비자가 설정할 것이 없습니다. 대신 번들러를 거치지 않는 실행 경로에서 깨질 수 있습니다 |
| 2 | JS에서 CSS import를 빼고 전체 CSS 한 파일을 냅니다 | 어느 번들러와 테스트 러너에서도 JS가 CSS에 기대지 않습니다. 소비자는 한 줄을 import합니다. 쓰지 않는 컴포넌트의 CSS도 실립니다(전체 gzip 약 34KB) |
| 3 | 2에 더해 컴포넌트별 CSS 파일도 냅니다 | CSS를 줄일 수 있습니다. 대신 공통 CSS와 컴포넌트 CSS의 의존 순서를 공개 계약으로 문서화하고 유지해야 합니다 |

**[추측]** 1안이 위험한 이유는 두 가지입니다. Vitest나 Jest는 `node_modules` 패키지를 변환하지 않고 Node로 바로 실행하는 것이 기본이라 `.css` import에서 실패합니다. Next.js는 `node_modules` 안 패키지가 전역 CSS를 import하는 것을 제한해 온 이력이 있습니다. 둘 다 이 저장소에서 재현해 보지는 않았습니다.

### 권장안

**2안**으로 시작합니다. 컴포넌트별 CSS는 나중에 추가해도 기존 사용자를 깨지 않지만, 한번 공개한 것을 빼면 깨집니다. 그러니 첫 공개는 작은 계약으로 하고, 3안은 수요가 확인되면 추가합니다.

- **파일**: `moru-ui/styles.css` 하나입니다. README 초안(`packages/moru-react/README.md:23`)과 같습니다.
- **합치는 순서**: 리셋(현재 `utilities.css`에 남는 두 규칙), `styles.css`(`form-controls`, `feedback` 포함), `style-packs.css`, `*-shared.css`와 `enhanced-input.css`, 컴포넌트 CSS(이름순), `readability.css` 순서입니다. `readability.css`는 랩(`main.tsx:10`)과 레지스트리(`registry/moru/styles.css:4`) 모두에서 마지막입니다. 이 순서로 합친 결과를 랩 갤러리와 화면으로 비교해 확정합니다.
- **스코프**: 레지스트리와 같은 `:where([data-moru-registry])` 스코프와 keyframes 접두를 유지합니다. 명시도를 올리지 않으면서 소비자의 `.ui-*` 클래스나 keyframes 이름과 겹치지 않게 합니다. 토큰이 `ThemeScope` 안에서만 주어지므로 `MoruProvider` 밖의 컴포넌트는 어차피 제대로 그려지지 않습니다. 따라서 스코프 때문에 새로 생기는 제약은 없습니다.
- **레이어**: 씌우지 않습니다. 지금의 랩, 레지스트리와 같은 캐스케이드 위치입니다. Tailwind 사용자가 유틸리티로 Moru 스타일을 덮어쓰고 싶으면 자기 CSS에서 레이어를 지정해 불러오는 방법을 안내합니다.

  ```css
  @import 'tailwindcss';
  @import 'moru-ui/styles.css' layer(components);
  ```

  **[추측]** Tailwind 4가 `@import ... layer()`를 처리하는지, 이 순서에서 preflight(`base`)보다 Moru가 뒤에 오고 `utilities`보다 앞에 오는지는 소비자 시험 프로젝트에서 확인해야 합니다. Moru를 `base`보다 앞선 레이어에 넣으면 preflight의 `button`·`*` 규칙이 Moru 스타일을 이기게 되므로 레이어 이름과 순서가 중요합니다. 확인되기 전에는 README에 넣지 않습니다.

### 작업 순서

1. 패키지 모드 변환에서 `.css` import 구문을 제거합니다. 생성기가 구문 위치를 이미 알고 있습니다.
2. CSS 합치기를 `build-package.mjs`에 넣습니다. 순서는 위 목록을 상수로 고정하고 테스트로 잠급니다.
3. 합친 CSS만 불러온 시험 페이지와 랩 갤러리를 라이트·다크, 스타일 팩 세 가지로 비교합니다.
4. 다른 점이 나오면 순서를 바꾸기보다 해당 규칙을 순서에 기대지 않게 고칩니다.

---

## 4. Tailwind 의존

### 조사 방법

**[확인]** `src/components/ui`, `src/components/blocks`, `src/lib`, `src/theme`의 테스트가 아닌 `.ts`·`.tsx` 127개를 Babel로 파싱해 클래스 이름이 들어가는 자리의 문자열을 모았습니다. 대상은 `className` 속성, `cn()` 인자, 이름이 `class`로 끝나는 변수와 속성입니다. 각 토큰을 설치된 Tailwind 4.3.3의 `candidatesToCss`에 넣어 실제로 CSS가 생성되는지 판정했습니다. 테마 설정은 `src/styles.css`를 그대로 썼습니다.

- 클래스 자리의 토큰은 640개, 중복을 빼면 516종입니다.
- `ui-`로 시작하는 Moru 클래스가 467종입니다.
- Tailwind가 CSS를 만드는 클래스가 13종입니다.
- 나머지 36종은 랩 페이지 `BlocksPage.tsx`의 자체 클래스(`blocks-*` 등)와 `calendar.tsx:512`의 비교 문자열 `'days'`입니다.

### Tailwind 클래스 전체 목록

**[확인]** 13종이고 모두 `src/components/ui`에 있습니다. `src/components/blocks`의 블록 6개에는 한 건도 없습니다. 블록은 레이아웃을 인라인 `style`로 줍니다(예: `SignupBlock.tsx:176`의 `display: 'inline-grid'`).

| 클래스 | 생성되는 선언 | 횟수 | 위치 |
| --- | --- | ---: | --- |
| `flex` | `display: flex` | 6 | checkbox:101, field:25, menu:102, modal:104, select:102, select:139 |
| `inline-flex` | `display: inline-flex` | 6 | button:41, checkbox:55, checkbox:64, menu:109, modal:90, tabs:50 |
| `flex-col` | `flex-direction: column` | 2 | checkbox:101, field:25 |
| `items-center` | `align-items: center` | 9 | button:41, checkbox:64, menu:102, menu:109, modal:90, modal:104, select:102, select:139, tabs:50 |
| `items-start` | `align-items: flex-start` | 1 | checkbox:55 |
| `justify-center` | `justify-content: center` | 3 | button:41, checkbox:64, modal:90 |
| `justify-between` | `justify-content: space-between` | 1 | select:102 |
| `justify-end` | `justify-content: flex-end` | 1 | modal:104 |
| `gap-2` | `gap: calc(var(--spacing) * 2)` | 5 | button:41, menu:102, modal:104, select:102, select:139 |
| `w-full` | `width: 100%` | 3 | input:45, select:102, textarea:48 |
| `min-w-0` | `min-width: 0px` | 4 | checkbox:101, input:45, select:102, textarea:48 |
| `ml-auto` | `margin-left: auto` | 1 | select:144 |
| `shrink-0` | `flex-shrink: 0` | 2 | checkbox:64, select:113 |

위치는 `src/components/ui/<이름>.tsx:<줄>`입니다. 이 13종은 레지스트리 생성기가 손으로 관리하는 폴백 목록(`build-registry.mjs:758-770`)과 정확히 일치합니다.

**[확인]** 요소로 세면 16개, 파일로는 9개이고, 모든 요소에 `ui-*` 클래스가 함께 붙어 있습니다. 선언을 옮길 자리가 이미 있다는 뜻입니다.

| 위치 | `ui-*` 클래스 | Tailwind 클래스 | 이미 CSS에 있는 선언 |
| --- | --- | --- | --- |
| button.tsx:41 | `ui-button` | `inline-flex items-center justify-center gap-2` | 전부 있습니다(`styles.css:167`, `:205`). 네 개 모두 지우기만 하면 됩니다 |
| checkbox.tsx:55 | `ui-checkbox-label` | `inline-flex items-start` | gap만 있습니다 |
| checkbox.tsx:64 | `ui-checkbox` | `inline-flex shrink-0 items-center justify-center` | width만 있습니다 |
| checkbox.tsx:101 | `ui-checkbox-copy` | `flex min-w-0 flex-col` | gap만 있습니다 |
| field.tsx:25 | `ui-field` | `flex flex-col` | min-width, gap이 있습니다 |
| menu.tsx:102 | `ui-menu-item` | `flex items-center gap-2` | gap이 있습니다(`styles.css:167`) |
| menu.tsx:109 | `ui-menu-icon` | `inline-flex items-center` | 없습니다 |
| modal.tsx:90 | `ui-dialog-close` | `inline-flex items-center justify-center` | width만 있습니다 |
| modal.tsx:104 | `ui-dialog-footer` | `flex items-center justify-end gap-2` | gap이 있습니다(`styles.css:579`) |
| select.tsx:102 | `ui-select` | `flex w-full min-w-0 items-center justify-between gap-2` | gap이 있습니다(`styles.css:167`) |
| select.tsx:113 | `ui-select-icon` | `shrink-0` | display, 정렬이 있습니다(`styles.css:377`) |
| select.tsx:139 | `ui-select-item` | `flex items-center gap-2` | gap이 있습니다(`styles.css:167`) |
| select.tsx:144 | `ui-select-item-indicator` | `ml-auto` | 없습니다 |
| tabs.tsx:50 | `ui-tabs-list` | `inline-flex items-center` | gap이 있습니다(`styles.css:614`) |
| input.tsx:45 | `ui-input` | `w-full min-w-0` | 없습니다 |
| textarea.tsx:48 | `ui-textarea` | `w-full min-w-0` | 없습니다 |

`gap-2`는 다섯 곳 모두에서 이미 효과가 없습니다. 같은 요소의 `.ui-*` 규칙이 레이어 밖에서 `gap`을 정하므로 레이어 안에 있는 Tailwind 유틸리티가 집니다. 옮길 필요 없이 지우면 됩니다.

**[확인]** 랩 쪽도 같이 봤습니다. `src/components/ui` 밖의 `.tsx` 85개(랩 페이지와 템플릿)에서 JSX `className`에 쓰인 Tailwind 클래스는 `sr-only` 8번과 `container` 1번이 전부입니다. Moru 기본 컴포넌트(Button, Input, Select, Field 등)에 Tailwind 클래스를 넘기는 곳은 없습니다.

**[확인]** 클래스가 아닌 자리에서 Tailwind 후보와 우연히 같은 문자열이 16종 있습니다. `grid`, `table`, `fixed`, `outline`, `ring`, `border`, `shadow` 등입니다. `role="grid"`나 `display: 'grid'` 같은 값입니다.

### (a)와 (b) 비교

| 기준 | (a) `ui-*` CSS로 이동 | (b) 소비자에게 `@source` 요구 |
| --- | --- | --- |
| 소비자 설정 | 없습니다 | Tailwind 4를 쓰고 CSS에 `@source "../node_modules/moru-ui"`를 넣어야 합니다 |
| Tailwind를 안 쓰는 소비자 | 지원합니다 | 지원하지 못합니다 |
| 설정을 빠뜨렸을 때 | 해당 없습니다 | 오류 없이 레이아웃만 깨집니다(Field가 세로로 쌓이지 않고 Input 폭이 줄어듭니다) |
| 경로 | 해당 없습니다 | pnpm이나 모노레포에서는 `node_modules` 위치가 달라집니다 |
| 불필요한 CSS | 없습니다 | 위의 우연히 같은 문자열 16종에도 유틸리티가 생성됩니다 |
| 값의 안정성 | Moru가 정합니다 | `gap-2`는 소비자의 `--spacing` 값에 따라 달라집니다 |
| 작업량 | 9개 파일 16개 요소의 `className` 정리와 선언 36개 이동 | 코드 변경은 없고 문서와 지원 부담이 남습니다 |
| 레지스트리 | 폴백 목록(`:758-770`)과 그 테스트(`scripts/build-registry.test.mjs:412-425`)가 필요 없어집니다 | 목록과 소스를 계속 손으로 맞춰야 합니다 |

### 권장안

**(a)** 를 권합니다. 옮길 양이 작고, npm뿐 아니라 레지스트리의 중복 관리도 없어집니다.

옮길 때는 선언을 **지금과 같은 우선순위 자리에** 둡니다. 현재 이 선언들은 레지스트리에서 `@layer base`에 있어서 소비자의 Tailwind 유틸리티가 이깁니다. 예를 들어 `<Input className="w-48">`이 통합니다. 레이어 밖 `.ui-input { width: 100% }`로 옮기면 그 유틸리티가 지게 되어 기존 사용자가 깨집니다. 그러므로 새 소스 파일(예: `src/components/ui/layout-defaults.css`)에 아래처럼 쓰고 `styles.css`에서 불러옵니다.

```css
@layer base {
  .ui-field { display: flex; flex-direction: column; }
  .ui-input, .ui-textarea { width: 100%; min-width: 0; }
  /* ...16개 요소 */
}
```

이렇게 하면 캐스케이드 위치는 그대로이고 선택자 이름만 Tailwind 이름에서 Moru 이름으로 바뀝니다. 레지스트리의 `utilities.css`에는 리셋 두 줄(`box-sizing`, `font: inherit`; `build-registry.mjs:771-772`)만 남습니다.

**남는 Tailwind 의존: preflight.** **[확인]** 랩(`src/styles.css:1`)과 레지스트리 설치 검사용 소비자(`scripts/test-registry-install.mjs:313`)는 둘 다 `@import 'tailwindcss'` 아래에서 그려집니다. Tailwind의 기본 리셋이 깔린 상태에서만 본 것입니다. **[추측]** Tailwind가 없는 소비자에서는 제목의 기본 여백이나 버튼·목록의 브라우저 기본 스타일 때문에 차이가 날 수 있습니다. 클래스 13종을 옮기는 것만으로는 "Tailwind 없이 동작한다"고 말할 수 없으므로, Tailwind 없는 시험 프로젝트에서 갤러리를 비교해 필요한 리셋을 `.ui-*` 규칙에 보탭니다.

### 작업 순서

1. `layout-defaults.css`를 만들고 위 표의 "이미 있는 선언"을 뺀 나머지를 옮깁니다.
2. 9개 파일의 `className`에서 Tailwind 클래스를 지웁니다.
3. 생성기의 `utilities` 문자열에서 13줄을 지우고 관련 테스트를 고칩니다.
4. 이 장의 조사를 테스트로 넣습니다. 클래스 자리의 토큰 가운데 `ui-`로 시작하지 않는 것이 Tailwind 후보로 CSS를 만들면 실패하게 합니다.
5. 랩에서 Button, Checkbox, Field, Menu, Modal, Select, Tabs, Input, Textarea를 변경 전후로 비교합니다.
6. 레지스트리, 웹 스타터, 프로젝트 스타터, AI 문서를 다시 생성합니다(`CONTRIBUTING.md:50-52`, `:58`).
7. Tailwind 없는 시험 프로젝트에서 preflight 의존을 확인합니다.

---

## 5. 레지스트리와의 공존

### 현재 상태

- **[확인]** 소스 한 벌에서 생성기 하나가 레지스트리 산출물을 모두 만듭니다. `--check`로 디스크의 산출물이 최신인지 비교하고(`build-registry.mjs:1137-1169`), CI가 이를 돌립니다(`.github/workflows/ci.yml:57-60`).
- **[확인]** 버전은 `registryVersion`(`:11`)과 루트 `package.json`의 `version`(`:4`)이 같아야 하며 다르면 빌드가 실패합니다(`:868-871`). 지금은 둘 다 0.4.1입니다.
- **[확인]** 빌드는 현재 버전 폴더만 지우고 다시 씁니다(`:1174-1176`). `public/r`에는 v0.3.1, v0.3.2, v0.3.3, v0.3.4, v0.4.0, v0.4.1이 있습니다. 항목 사이의 의존은 버전이 들어간 URL로 고정되고(`:1003-1005`), npm 의존성은 정확한 버전만 허용됩니다(`:988-993`).
- **[확인]** 과거 버전을 바이트 단위로 잠그는 테스트는 v0.3.1(`scripts/build-registry.test.mjs:518-533`)과 v0.4.0(`:535-551`) 두 개입니다. v0.3.2, v0.3.3, v0.3.4에는 없습니다.
- **[확인]** 확인이 필요한 점이 하나 있습니다. 로컬 `public/r/v0.4.0`의 JSON 90개가 배포용 체크아웃 `sites/moru-ui/public/r/v0.4.0`과 전부 다릅니다. 40개 항목은 설치되는 파일 내용까지 다르고(`core`, `checkbox`, `input`, `field`, `menu` 등), 나머지는 `meta.sourceHash`만 다릅니다. 어느 쪽이 실제로 배포되어 있는지는 확인하지 않았습니다. v0.4.0 잠금 해시(`:549`)는 지금의 로컬 폴더와 일치합니다(직접 계산해 확인했습니다). 로컬이 배포본과 다르다면 이 테스트는 배포되지 않은 내용을 잠그고 있는 것입니다.

### 선택지

| 안 | 방식 | 평가 |
| --- | --- | --- |
| A | 생성기의 변환 단계를 공유하고, 레지스트리 포장과 패키지 포장을 각각 얹습니다 | 두 배포물이 같은 변환을 거칩니다. 차이는 아래 표의 옵션으로만 생깁니다 |
| B | 디스크의 `registry/moru`를 입력으로 패키지를 만듭니다 | 구현이 가장 작습니다. 대신 확장자와 CSS import를 생성된 코드 위에서 다시 고쳐야 합니다 |
| C | 번들러가 `src`를 직접 빌드합니다 | 레지스트리와 무관한 두 번째 파이프라인이 생기고, 두 배포물이 달라져도 알 수 없습니다 |

### 권장안

**A안**입니다. 두 포장의 차이는 다음으로 한정합니다.

| 항목 | 레지스트리 | npm 패키지 |
| --- | --- | --- |
| 상대 import 경로 | 확장자 없음(`:819`) | `.js` 확장자 |
| JS의 CSS import | 유지 | 제거 |
| CSS | 파일별로 설치하고 `styles.css`가 core를 묶음 | 순서를 고정해 한 파일로 합침 |
| `'use client'`, 배너, 스코프, keyframes 접두 | 지금 그대로 | 같음 |
| `MoruProvider` | `provider.tsx` | 같은 파일. 루트 엔트리가 다시 내보냄 |
| 출력 | TSX 소스와 JSON 매니페스트 | `tsc`가 낸 JS, `.d.ts`, `package.json` |
| 의존성 버전 | 정확한 버전(`:988-993`) | 범위(1장) |

**버전 정책**

- 버전은 하나입니다. npm 버전, 루트 `package.json` 버전, `registryVersion`, `/r/v<버전>/` 경로가 같습니다. 지금의 일치 검사(`:868`)를 배포용 `package.json`까지 넓힙니다.
- 불변 규칙도 같습니다. npm은 같은 버전을 다시 게시할 수 없고, 레지스트리 URL도 게시 뒤에는 바꾸지 않습니다. 현재 버전 폴더는 게시 전까지만 다시 생성합니다.
- 게시된 레지스트리 버전은 모두 잠급니다. 버전마다 테스트를 하나씩 손으로 추가하는 대신 `public/r` 아래 버전 폴더의 해시를 한 파일에 적어 두고 한 테스트가 전부 검사하게 합니다.
- npm 첫 버전은 `0.5.0-beta.1`을 권합니다. README 초안(`packages/moru-react/README.md:16`)은 `0.4.0-beta.1`이지만 버전은 이미 0.4.1이고, 4장의 변경과 `MoruProvider` 소스화가 레지스트리 산출물도 바꿉니다. 이 변경들을 0.5.0으로 묶어 레지스트리 v0.5.0과 npm 0.5.0을 함께 냅니다. 베타는 npm의 `beta` 태그로만 내고 레지스트리에는 베타 경로를 만들지 않습니다.
- 0.x 동안의 규칙을 README에 적습니다. minor는 호환이 깨질 수 있고 patch는 호환됩니다. 공개 계약에 포함할 것(서브패스, props, `--ui-*` 변수, `.ui-*` 클래스 이름, `data-*` 속성)을 정해 두어야 무엇이 "깨지는 변경"인지 판단할 수 있습니다. **결정이 필요한 것**: `.ui-*` 클래스 이름을 공개 계약에 넣을지입니다. 넣으면 소비자가 CSS로 꾸밀 수 있지만 이름을 바꿀 때마다 minor를 올려야 합니다.

### 작업 순서

1. 로컬 `public/r/v0.4.0`을 실제 배포본과 비교합니다. 다르면 배포본으로 되돌리고 잠금 해시(`build-registry.test.mjs:549`)를 다시 계산합니다. 배포된 한 파일은 아래 명령으로 받아 비교할 수 있습니다.

   ```bash
   curl -s https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/button.json | shasum -a 256
   ```

2. 버전 폴더 잠금을 한 파일과 한 테스트로 바꿉니다.
3. 2장의 순서대로 변환 단계를 분리하고 `build-package.mjs`를 추가합니다.
4. `npm run build`에 패키지 빌드 검사를 넣습니다.
5. 릴리스 절차를 `CONTRIBUTING.md`에 적습니다. 버전 올림, 생성물 재생성, 테스트, 레지스트리 배포, npm 게시 순서입니다.

---

## 6. 공개 전 점검 항목

### 라이선스와 고지

- **[확인]** `LICENSE`는 MIT이고 저작권자는 "SYRUS RIIUS and Moru UI contributors"입니다(`:3`). 레지스트리는 core 항목에 `_licenses/Moru-LICENSE`와 축약한 NOTICE를 넣습니다(`build-registry.mjs:963-967`). 생성 파일마다 SPDX 배너가 붙습니다(`:18-19`).
- **[확인]** `NOTICE.md:6-8`은 "not published npm packages"와 "`private: true` prevents accidental npm publication"이라고 적고 있어 공개 뒤에는 사실과 달라집니다.
- 할 일: tarball에 `LICENSE`와 패키지용 `NOTICE.md`를 넣습니다. 패키지용 NOTICE는 레지스트리 것처럼 짧게 만듭니다. 글꼴과 브랜드 자산은 패키지에 없으므로 `NOTICE.md:27-37`의 글꼴 고지는 옮기지 않습니다. 직접 의존성 두 개(Base UI는 MIT, lucide는 ISC)와 선택 의존성 네 개(모두 MIT)를 적습니다.

### 문구 수정 범위

**[확인]** "npm으로 공개하지 않았다"는 문장이 있는 곳입니다.

| 파일:줄 | 조치 |
| --- | --- |
| `README.md:24-25` | 수정. 설치 방법 세 가지(npm, 레지스트리, 스타터)를 안내 |
| `README.md:103-108` | 수정. 지원 기준에 npm 패키지의 검증 범위 추가 |
| `README.md:198` | 수정. 한국어 요약의 "현재는 소스를 가져와 수정하는 방식이며" |
| `NOTICE.md:6-8` | 수정 |
| `docs/registry.md:9`, `docs/registry.ko.md:402` | 수정 |
| `docs/lab-guide.ko.md:3`, `:5`, `:667` | 수정 |
| `scripts/build-registry.mjs:998` | 검토. 항목마다 들어가는 안내문의 "Next.js SSR ... not verified"는 검증 결과에 맞춰 수정 |
| `packages/moru-react/README.md:3`, `:16`, `:38` | 수정. 대상 범위, 버전, 블록 import 경로(`moru-ui/blocks`) |
| `templates/moru-web-starter/README.md:3`, `NOTICE.md:3` | 수정. 존재하지 않는 이름 `@moru/ui`를 언급 |
| `templates/moru-project-starter/README.md:23` | 유지. 스타터에 관한 사실이라 여전히 맞음 |
| `docs/registry.ko.md:4`, `docs/moru-component-audit.md:43` | 유지 |
| `packages/moru-native/README.md:5`, `templates/moru-native-starter/README.md:4` | 유지. 네이티브는 이번에 공개하지 않음 |

템플릿 README를 고치면 스타터 ZIP을, 생성기 안내문을 고치면 레지스트리와 AI 문서(`public/llms.txt`, `public/ai`)를 다시 생성해야 합니다(`CONTRIBUTING.md:50-52`).

### SSR과 Next.js

- **[확인]** 테스트 파일 81개 가운데 41개가 `react-dom/server`의 `renderToStaticMarkup`이나 `renderToString`으로 렌더링합니다. jsdom, happy-dom, Testing Library는 쓰지 않습니다. 테스트가 덮는 컴포넌트는 서버 렌더링에서 예외 없이 그려진다는 점이 간접적으로 확인됩니다. 하이드레이션과 브라우저 상호작용에 대한 자동 테스트는 없습니다.
- **[확인]** 서버를 고려한 코드가 일부 있습니다. `theme-scope.tsx:81`은 `document`가 있을 때만 포털 호스트를 만들고, `sidebar.tsx:121`은 `useSyncExternalStore`에 서버 스냅샷(`:20-22`)을 넘깁니다.
- **[확인]** 문서는 지금 검증하지 않았다고 밝힙니다(`README.md:106-108`, `build-registry.mjs:998`).
- **[추측]** 걱정되는 곳은 `ThemeScope`의 포털 호스트입니다. 서버에서는 만들지 않고 클라이언트 첫 렌더에서 만들기 때문에, 하이드레이션 경고가 나는지와 호스트의 ref가 채워지기 전에 열린 오버레이가 어디에 붙는지 확인해야 합니다.

**권장**: Next.js App Router 소비자 빌드를 공개의 통과 조건으로 둡니다. tarball을 새 Next 프로젝트에 설치하고, 서버 컴포넌트 페이지에서 Button·Select·Modal·DatePicker를 그린 뒤 `next build`가 통과하고 브라우저 콘솔에 하이드레이션 경고가 없어야 합니다. 통과하지 못하면 문제를 고치거나, 초안 README(`packages/moru-react/README.md:3`)처럼 "Vite 앱 대상 베타"로 범위를 좁혀 공개합니다. 어느 쪽이든 검증한 범위만 README에 적습니다.

### 테스트와 CI에 추가할 것

**[확인]** 지금 CI는 포맷 검사, 테스트, 빌드(`.github/workflows/ci.yml:32-39`)와 레지스트리 설치 검사(`:57-75`)를 돌립니다.

| 추가 항목 | 확인하는 것 |
| --- | --- |
| 패키지 내용 검사 | `npm pack --dry-run --json`의 파일 목록에 테스트 파일과 `src`가 없고 `LICENSE`·`NOTICE.md`가 있는지, `exports`의 모든 경로가 실제 파일인지 |
| 출력 규칙 검사 | `dist`의 JS에 `.css` import가 없는지, 컴포넌트 파일 첫 줄이 `'use client'`인지 |
| Tailwind 클래스 검사 | 4장의 조사를 테스트로 넣어 다시 생기지 않게 함 |
| CSS 순서 잠금 | 합친 `styles.css`의 파일 순서가 정한 목록과 같은지 |
| 소비자 설치 검사 | `scripts/test-registry-install.mjs`와 같은 방식으로 tarball을 `.qa`의 새 프로젝트에 설치해 타입 검사와 빌드. 대상은 Tailwind 없는 Vite, Tailwind 4가 있는 Vite, Next.js 세 가지 |
| 선택 의존성 검사 | recharts 등을 설치하지 않은 프로젝트에서 `moru-ui` 루트 import가 빌드되는지, `moru-ui/chart`는 설치 뒤에만 되는지 |
| 레지스트리 버전 잠금 | 게시된 모든 버전 폴더(5장) |
| CI 작업 | `package` 작업을 추가해 위 검사를 실행 |

**[추측]** `publint`와 `@arethetypeswrong/cli`는 `exports`와 타입 경로의 흔한 실수를 잡아 주는 도구로 알고 있습니다. 의존성으로 추가하지 않고 CI에서 `npx`로만 돌릴 수 있는지 확인한 뒤 넣습니다.

### 그 밖에 정할 것

- **[확인]** `docs` 폴더 전체가 공개 체크아웃의 허용 목록에 있습니다(`scripts/prepare-public-repo.mjs:27`). 이 계획 문서도 공개 저장소에 들어갑니다. 원하지 않으면 공개 전에 빼야 합니다.
- **[확인]** 작업 폴더에 `.git`이 없습니다. 태그로 릴리스를 표시하려면 공개 체크아웃 쪽에서 해야 합니다.
- 첫 게시는 손으로 합니다. npm 계정의 2단계 인증, `publishConfig.access: "public"`, 저장소 정보의 `directory` 필드를 준비합니다. 자동 게시는 베타를 몇 번 낸 뒤에 정합니다.
- `CHANGELOG.md`를 새로 만들어 0.5.0부터 적습니다.
- **[확인]** UI 번역 전체(`src/lib/ui-messages.ts`, 1075줄, 네 언어)가 `i18n.tsx:10`에서 한꺼번에 import됩니다. `useI18n`을 쓰는 컴포넌트 하나만 써도 모든 언어의 번역이 번들에 들어갑니다. 공개를 막는 문제는 아니고, 공개 뒤 번들 크기를 볼 때 다룰 후속 과제입니다.

---

## 전체 작업 순서

각 단계는 그 자체로 끝나고 검증할 수 있게 나눴습니다. 1단계와 2단계는 npm과 무관하게 레지스트리와 랩에도 이득이라 먼저 해도 됩니다.

| 단계 | 내용 | 끝났다는 기준 |
| --- | --- | --- |
| 0 | 결정: 패키지 이름 확인, 첫 버전, `.ui-*` 클래스를 공개 계약에 넣을지, 이 문서를 공개 저장소에 둘지 | 네 가지에 답이 있음 |
| 1 | v0.4.0 폴더를 배포본과 대조하고 버전 잠금을 정리(5장) | 게시된 모든 버전이 한 테스트로 잠김 |
| 2 | Tailwind 클래스 제거(4장), `MoruProvider` 소스화, 루트 엔트리 정리(1장), 생성물 재생성 | `npm test`와 `npm run build` 통과, 랩 화면이 전과 같음, 버전 0.5.0 |
| 3 | 시험 빌드로 2장의 네 가지 확인 | 네 가지 결과가 기록됨. 빌드 방식 확정 |
| 4 | 생성기 변환 단계 분리, `build-package.mjs`, 배포용 `package.json` | `registry:check`의 출력이 전과 같고 `dist`가 생성됨 |
| 5 | CSS 한 파일 합치기와 화면 비교(3장) | 합친 CSS만으로 갤러리가 랩과 같음 |
| 6 | 소비자 설치 검사 세 가지, 패키지 내용 검사, CI 작업(6장) | 로컬과 CI에서 통과. Next.js 결과에 따라 지원 범위 확정 |
| 7 | 문구와 고지 수정, 패키지 README 확정, CHANGELOG | 6장 표의 "수정" 항목이 모두 처리됨 |
| 8 | `0.5.0-beta.1`을 `beta` 태그로 게시하고 자신의 프로덕트에 설치해 사용 | 실제 사용에서 나온 문제 목록 |
| 9 | 문제를 고친 뒤 `0.5.0` 게시, 레지스트리 v0.5.0 배포 | npm과 레지스트리가 같은 버전 |

## 부록: 조사에 쓴 방법

- Tailwind 클래스 목록은 Babel 파서(`@babel/parser` 7.29.12)와 Tailwind 4.3.3의 `__unstable__loadDesignSystem(...).candidatesToCss()`로 뽑았습니다. 둘 다 이미 설치된 devDependency이고 읽기만 했습니다. 스크립트는 저장소에 넣지 않았습니다. 4장 작업 순서 4번에서 테스트로 옮기는 것을 제안합니다.
- `.ui-*` 규칙에 이미 있는 선언은 설치된 PostCSS로 `src/components/ui/*.css`를 파싱해 선택자별로 확인했습니다.
- CSS 크기는 `src/components/ui/*.css`와 `src/theme/readability.css`를 이어 붙여 잰 값입니다. 스코프 접두와 배너가 붙은 배포용 파일은 이보다 조금 큽니다.
- v0.4.0 비교는 로컬과 `sites/moru-ui`의 같은 경로 JSON을 필드별로 대조한 결과입니다.
