# Moru 선택 설치

Moru v0.3.2은 shadcn CLI를 통해 컴포넌트 소스를 프로젝트에 설치합니다.
선택한 파일을 직접 수정할 수 있으며 Moru npm 라이브러리에 종속되지 않습니다.
공통 기반과 Button·Input·Field, 로그인·OTP·검색 필터·설정 폼 블록을 제공합니다.

## 준비

Node.js 24+, React 19, TypeScript, Vite, Tailwind CSS 4를 기준으로 검증합니다.
프로젝트의 Tailwind 설정과 `components.json`이 먼저 준비되어 있어야 합니다.
새 앱을 만들 때는 [shadcn의 Vite 설치 가이드](https://ui.shadcn.com/docs/installation/vite)를
따라 기본 설정을 완료하고, 아래 명령을 앱 폴더에서 실행하세요.
CLI 버전은 실제 검증한 `4.23.0`으로 고정합니다.

## 필요한 항목 설치

```sh
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.2/button.json
```

항목 이름만 바꿔 Input·Field와 블록을 설치할 수 있습니다.

```sh
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.2/input.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.2/field.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.2/login.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.2/otp.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.2/search-filters.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.2/settings.json
```

공통 기반만 필요하면 `core.json`을 설치합니다. 다른 항목은 core를 의존성으로 가져옵니다.
로그인·OTP 블록에는 Card·Checkbox·PasswordInput·InputOTP 등 실제로 필요한 보조 항목이
함께 설치됩니다. 차트·표·캐러셀 등의 파일과 패키지는 이 범위에 포함하지 않습니다.

사용자의 `components.json`에서 지정한 UI 경로 아래 `moru/`에 설치합니다.
예를 들어 UI 경로가 `@/components/ui`라면 아래와 같습니다.

```text
src/components/ui/
  button.tsx                 # 기존 프로젝트의 컴포넌트 유지
  moru/
    provider.tsx
    styles.css
    button.tsx
    input.tsx
    field.tsx
    _theme/
    _lib/
    blocks/LoginBlock.tsx
    blocks/OTPBlock.tsx
```

경로는 프로젝트 설정에 따라 달라집니다. 아래 예시의 `@/components/ui`도 해당 설정에 맞추세요.
수정한 파일이 있다면 CLI의 덮어쓰기 질문에서 변경 내용을 확인하고 유지하세요.
`--overwrite`는 설치된 소스를 덮어쓰므로 업데이트에 무조건 붙이지 않습니다.

## 스타일과 테마 연결

앱 진입점 또는 전역 스타일을 가져오는 곳에서 Moru 스타일을 한 번 import합니다.

```tsx
import '@/components/ui/moru/styles.css'
```

사용할 영역을 `MoruProvider`로 감싸세요. 기본은 라이트 모드이며 `mode="dark"`로 바꾸면
Moru의 다크 기본 토큰을 적용합니다. 웹폰트는 필수가 아니며 시스템 서체로도 동작합니다.

```tsx
import { MoruProvider } from '@/components/ui/moru/provider'
import { Button } from '@/components/ui/moru/button'
import { Field } from '@/components/ui/moru/field'
import { Input } from '@/components/ui/moru/input'

export function ProjectForm() {
  return <MoruProvider mode="light">
    <form onSubmit={(event) => event.preventDefault()}>
      <Field label="프로젝트 이름" description="언제든 바꿀 수 있어요.">
        <Input name="projectName" placeholder="새로운 아이디어" required />
      </Field>
      <Button type="submit">시작하기</Button>
    </form>
  </MoruProvider>
}
```

core는 공통 CSS를 함께 설치합니다. 첫 버전은 컴포넌트별 CSS를 완전히 분리하지 않습니다.
CSS는 Moru 표시가 있는 영역과 테마 portal로 범위를 제한하며, 호스트의 `:root` 토큰을
설정하는 `default.css`는 설치하지 않습니다. Tailwind CSS 4는 레이아웃 utility에 필요합니다.

커스텀 `tokens`를 전달할 때는 모드에 맞는 완성된 토큰 객체를 전달합니다. 세부 설정에는
설치된 `_theme/tokens.ts`의 `defaultTokens`, `createDarkTokens`, `applyDensity`와 기존
`ThemeScope` API를 사용할 수 있습니다. 시스템 모드 선택과 사용자 설정 저장은 앱에서 연결하세요.

## 로그인·OTP 블록

```tsx
import { MoruProvider } from '@/components/ui/moru/provider'
import { LoginBlock } from '@/components/ui/moru/blocks/LoginBlock'
import { OTPBlock } from '@/components/ui/moru/blocks/OTPBlock'

export function AuthenticationExamples() {
  return <MoruProvider>
    <LoginBlock />
    <OTPBlock />
  </MoruProvider>
}
```

로그인은 이메일·8자 이상 비밀번호, 오류·로딩·완료 상태를 보여 주는 로컬 예제입니다.
비밀번호를 서버에 보내거나 저장하지 않습니다. OTP 예제 코드는 `123456`입니다.
프로젝트에 맞게 설치된 블록의 submit·resend 함수를 실제 인증 서비스에 연결하세요.

## 검색 필터·설정 폼을 앱 데이터에 연결하기

`SearchFiltersBlock`은 외부 `items`와 `filters`·`onFiltersChange`를 받습니다.
항목은 `id`, `name`, `summary`, `status`, `owner`를 가지며 선택 시 `onSelect`에 실제 ID를 전달합니다.
`statusOptions`, `currentOwner`, 제목과 라벨을 프로젝트에 맞게 바꿀 수 있습니다.
`SettingsBlock`은 `defaultValue` 또는 제어형 `value`·`onValueChange`, 비동기 `onSave`를 받습니다.
설정 값은 `name`, `email`, `visibility`, `updates`, `digest`입니다.
저장이 성공한 값이 취소 기준이 되며, 저장 콜백이 오류를 던지면 작성 값을 유지하고 오류를 표시합니다.

```tsx
<SearchFiltersBlock items={projects} filters={filters}
  onFiltersChange={setFilters} onSelect={openProject} />
<SettingsBlock defaultValue={workspace} onSave={saveWorkspace} />
```

전체 흐름은 [프로젝트·할 일 앱 템플릿](project-template.ko.md)을 참고하세요.
무 props로 사용하면 기존 갤러리의 데모 데이터와 로컬 저장 동작을 확인할 수 있습니다.

## 버전과 업데이트

HTTP 항목과 의존성은 `/r/v0.3.2/` 버전 경로를 사용합니다. 기존 버전의 파일을 바꾸는 대신
다음 릴리스에는 새 버전 경로를 발행합니다. 사용자의 소스를 자동으로 갱신하지는 않습니다.
새 버전을 설치하기 전에 현재 파일을 커밋하고 CLI의 diff·덮어쓰기 안내를 확인하세요.

GitHub의 `registry.json`도 같은 항목을 제공합니다. GitHub 주소 형식은
`syrus-riius/moru-ui/button#v0.3.2`이며, 릴리스 태그와 각 의존성의 버전을 함께 고정합니다.
HTTP 주소가 기본 설치 안내입니다. Moru의 npm 패키지는 게시하지 않았습니다.

## 지원 범위

이 릴리스는 웹 React·Vite·TypeScript·Tailwind CSS 4를 대상으로 합니다.
클라이언트 컴포넌트 경계는 생성 파일에 표시하지만 Next.js SSR·hydration은 별도 검증 범위입니다.
React Native·Expo는 별도 구현이므로 이 웹 레지스트리로 설치하지 않습니다.

원본은 `src/components/ui`, `src/components/blocks`, `src/theme`입니다.
`npm run registry:build`가 설치용 파일을 생성하고 `npm run registry:check`가 오래된 산출물을 검사합니다.
Moru 자체 코드는 [MIT](../LICENSE), 제3자 소스·폰트 고지는 [NOTICE](../NOTICE.md)를 따릅니다.

공식 규격: [레지스트리 항목](https://ui.shadcn.com/docs/registry/registry-item-json),
[GitHub 레지스트리](https://ui.shadcn.com/docs/registry/github).
