# Moru 선택 설치

Moru v0.3.3은 shadcn CLI를 통해 컴포넌트 소스를 프로젝트에 설치합니다.
선택한 파일을 직접 수정할 수 있으며 Moru npm 라이브러리에 종속되지 않습니다.
공통 기반 1개·UI 컴포넌트 17개·재사용 블록 4개로 총 22개 항목을 제공합니다.
이번 버전에는 Tabs·Menu·Popover·Drawer가 추가됩니다.

## 준비

지원 기준은 Node.js 24+, React 19, TypeScript, Vite, Tailwind CSS 4입니다.
프로젝트의 Tailwind 설정과 `components.json`이 먼저 준비되어 있어야 합니다.
새 앱을 만들 때는 [shadcn의 Vite 설치 가이드](https://ui.shadcn.com/docs/installation/vite)를
따라 기본 설정을 완료하고, 아래 명령을 앱 폴더에서 실행하세요.
CLI 버전은 이전 릴리스에서 사용한 `4.23.0`으로 고정합니다.

## 필요한 항목 설치

```sh
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/button.json
```

항목 이름만 바꿔 Input·Field와 블록을 설치할 수 있습니다.

```sh
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/input.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/field.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/login.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/otp.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/search-filters.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/settings.json
```

공통 기반만 필요하면 `core.json`을 설치합니다. 다른 항목은 core를 의존성으로 가져옵니다.
로그인·OTP 블록에는 Card·Checkbox·PasswordInput·InputOTP 등 실제로 필요한 보조 항목이
함께 설치됩니다. 차트·표·캐러셀 등의 파일과 패키지는 이 범위에 포함하지 않습니다.

설치 대상 선언은 `@ui/moru/`이며 사용자의 `components.json`에서 지정한 UI 경로를 따릅니다.
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

## 탭·메뉴·팝오버·드로어

```sh
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/tabs.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/menu.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/popover.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.3.3/drawer.json
```

앞에서 연결한 `MoruProvider` 안에서 사용하세요. 아래 트리거 예시는 별도 설치한 Button을 사용합니다.

```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/moru/button'
import { Tabs } from '@/components/ui/moru/tabs'
import { Menu } from '@/components/ui/moru/menu'
import { Popover } from '@/components/ui/moru/popover'
import { Drawer } from '@/components/ui/moru/drawer'

export function WorkspaceNavigation() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  return <>
    <Tabs aria-label="작업 공간 보기" defaultValue="projects" items={[
      { value: 'projects', label: '프로젝트', content: <p>프로젝트 목록</p> },
      { value: 'activity', label: '활동', content: <p>최근 활동</p> },
    ]} />
    <Menu trigger={<Button variant="secondary">작업 메뉴</Button>} items={[
      { label: '프로젝트 만들기', onClick: () => setMessage('만들기를 선택했어요.') },
      { label: '보관하기', disabled: true },
    ]} />
    <Popover trigger={<Button variant="secondary">자세히 보기</Button>}
      title="작업 공간 정보" side="bottom" align="start">
      <p>현재 화면에 필요한 보조 정보를 넣으세요.</p>
    </Popover>
    <Drawer trigger={<Button>편집 열기</Button>} title="프로젝트 편집"
      open={open} onOpenChange={setOpen}
      footer={<Button onClick={() => setOpen(false)}>완료</Button>}>
      <p>프로젝트 편집 폼을 넣으세요.</p>
    </Drawer>
    <p role="status">{message}</p>
  </>
}
```

Tabs는 `value`·`onValueChange` 제어형 선택, 비활성 항목과 세로 배치를 지원합니다.
기본은 방향키로 초점을 옮기고 Enter·Space로 선택합니다. 방향키 이동과 동시에 선택하려면
`activateOnFocus`를 켜세요. Menu 항목에는 `onClick`, `disabled`, `destructive`, 아이콘을 지정합니다.
Popover는 `open`·`defaultOpen`과 위치를, Drawer는 하단 모달의 열림 상태·트리거·푸터를 설정합니다.
Popover·Drawer는 `initialFocus`·`finalFocus`, Menu는 `finalFocus`를 받습니다.
화면 밖 portal로 이동한 팝업도 같은 Moru 테마를 따릅니다.

## 버전과 업데이트

HTTP 항목과 의존성은 `/r/v0.3.3/` 버전 경로를 사용합니다. 기존 버전의 파일을 바꾸는 대신
다음 릴리스에는 새 버전 경로를 발행합니다. 사용자의 소스를 자동으로 갱신하지는 않습니다.
새 버전을 설치하기 전에 현재 파일을 커밋하고 CLI의 diff·덮어쓰기 안내를 확인하세요.
이미 발행한 `/r/v0.3.1/`·`/r/v0.3.2/` 폴더와 설치 URL은 그대로 유지합니다.
이번 네 항목의 선택 설치는 v0.3.3부터 제공하며 이전 버전에 추가하지 않습니다.

GitHub의 `registry.json`도 같은 항목을 제공합니다. GitHub 주소 형식은
`syrus-riius/moru-ui/button#v0.3.3`이며, 릴리스 태그와 각 의존성의 버전을 함께 고정합니다.
HTTP 주소가 기본 설치 안내입니다. Moru의 npm 패키지는 게시하지 않았습니다.

## 지원 범위

이 릴리스는 웹 React·Vite·TypeScript·Tailwind CSS 4를 대상으로 합니다.
클라이언트 컴포넌트 경계는 생성 파일에 표시하지만 Next.js SSR·hydration은 별도 검증 범위입니다.
React Native·Expo는 별도 구현이므로 이 웹 레지스트리로 설치하지 않습니다.
v0.3.3은 산출물 생성과 프로덕션 빌드만 수행하며, 추가 항목의 자동 테스트·설치 스모크·브라우저 점검은 생략합니다.

원본은 `src/components/ui`, `src/components/blocks`, `src/theme`입니다.
`npm run registry:build`가 설치용 파일을 생성하고 `npm run registry:check`가 오래된 산출물을 검사합니다.
Moru 자체 코드는 [MIT](../LICENSE), 제3자 소스·폰트 고지는 [NOTICE](../NOTICE.md)를 따릅니다.

공식 규격: [레지스트리 항목](https://ui.shadcn.com/docs/registry/registry-item-json),
[GitHub 레지스트리](https://ui.shadcn.com/docs/registry/github).
