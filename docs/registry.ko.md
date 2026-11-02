# Moru 선택 설치

Moru v0.4.0은 shadcn CLI를 통해 컴포넌트 소스를 프로젝트에 설치합니다.
선택한 파일을 직접 수정할 수 있으며 Moru npm 라이브러리에 종속되지 않습니다.
공통 기반 1개·UI 항목 76개·재사용 블록 4개로 총 81개 설치 항목을 제공합니다.
8개 분야의 갤러리 75종과 StatusMessage를 모두 포함하며 이전 버전에서 남았던 UI 54종을 추가했습니다.
항목 수는 설치 단위의 수이며 파일 수나 React export 수와는 다릅니다.

## 준비

지원 기준은 Node.js 24+, React 19.3, TypeScript, Vite, Tailwind CSS 4입니다.
프로젝트의 Tailwind 설정과 `components.json`이 먼저 준비되어 있어야 합니다.
새 앱을 만들 때는 [shadcn의 Vite 설치 가이드](https://ui.shadcn.com/docs/installation/vite)를
따라 기본 설정을 완료하고, 아래 명령을 앱 폴더에서 실행하세요.
CLI 버전은 이전 릴리스에서 사용한 `4.23.0`으로 고정합니다.

## 필요한 항목 설치

```sh
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/button.json
```

항목 이름만 바꿔 Input·Field와 블록을 설치할 수 있습니다.

```sh
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/input.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/field.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/login.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/otp.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/search-filters.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/settings.json
```

공통 기반만 필요하면 `core.json`을 설치합니다. 다른 항목은 core를 의존성으로 가져옵니다.
로그인·OTP 블록에는 Card·Checkbox·PasswordInput·InputOTP 등 실제로 필요한 보조 항목이
함께 설치됩니다. 각 항목은 자신의 의존성만 가져오며 Button만 설치할 때 차트·표·캐러셀 패키지를 함께 설치하지 않습니다.

## 8개 분야의 전체 UI 항목

아래 이름을 `/r/v0.4.0/<이름>.json`에 넣어 설치하세요. 공통 `core`와 블록
`login`·`otp`·`search-filters`·`settings` 네 항목은 이 표와 별도입니다.

| 분야 | UI 항목 수 | 설치 이름 |
| --- | ---: | --- |
| 폼·입력 | 25 | `field`, `input`, `number-input`, `password-input`, `textarea`, `checkbox`, `select`, `multi-select`, `switch`, `radio-group`, `slider`, `combobox`, `calendar`, `date-picker`, `date-range-picker`, `time-picker`, `time-range-picker`, `toggle-group`, `input-group`, `input-otp`, `label`, `native-select`, `file-input`, `attachment`, `questionnaire` |
| 버튼·동작 | 5 | `button`, `command`, `button-group`, `kbd`, `toggle` |
| 오버레이 | 9 | `dialog`, `menu`, `popover`, `tooltip`, `alert-dialog`, `sheet`, `context-menu`, `drawer`, `hover-card` |
| 탐색 | 7 | `tabs`, `pagination`, `breadcrumb`, `menubar`, `navigation-menu`, `sidebar`, `stepper` |
| 레이아웃 | 12 | `card`, `accordion`, `avatar`, `separator`, `aspect-ratio`, `direction`, `item`, `collapsible`, `carousel`, `resizable`, `scroll-area`, `typography` |
| 상태·피드백 | 10 | `badge`, `alert`, `progress`, `ring-progress`, `skeleton`, `toast`, `empty`, `spinner`, `marker`, `status-message` |
| 데이터 | 3 | `table`, `chart`, `data-table` |
| 대화·콘텐츠 | 5 | `bubble`, `code-block`, `message`, `message-scroller`, `trace` |

분야별 선택 설치 예시입니다. 전체 레지스트리를 한꺼번에 설치하는 명령은 아닙니다.

```sh
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/number-input.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/command.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/context-menu.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/navigation-menu.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/carousel.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/toast.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/data-table.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/code-block.json
```

대부분 설치 이름과 import 파일명이 같습니다. `direction`은 `direction-provider.tsx`에
`DirectionProvider`를, `toast`는 `ToastProvider`·`useToast`를 제공합니다.
`resizable`의 export는 `ResizablePanelGroup`·`ResizablePanel`·`ResizableHandle`입니다.
드롭다운 메뉴의 설치 이름은 `menu`, export 이름은 `Menu`입니다.

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
개별 컴포넌트는 전용 CSS를 함께 가져옵니다. 복합 컴포넌트를 설치하면 실제로 import하는
다른 Moru 항목도 설치됩니다. Chart의 Recharts, DataTable의 TanStack Table,
Carousel의 Embla, Resizable의 React Resizable Panels는 해당 의존성이 필요할 때 설치합니다.
일부 공유 CSS는 선택 항목과 관계없이 core와 함께 다운로드되며, 각 컴포넌트의 원본 import가 로드 시점을 결정합니다.

커스텀 `tokens`를 전달할 때는 모드에 맞는 완성된 토큰 객체를 전달합니다. 세부 설정에는
설치된 `_theme/tokens.ts`의 `defaultTokens`, `createDarkTokens`, `applyDensity`와 기존
`ThemeScope` API를 사용할 수 있습니다. 시스템 모드 선택과 사용자 설정 저장은 앱에서 연결하세요.

## Provider와 실제 데이터 연결

`MoruProvider`는 테마와 portal을 연결합니다. 알림을 사용하려면 `toast`를 설치하고
그 안에 `ToastProvider`를 배치한 뒤 자식 컴포넌트에서 `useToast`를 호출하세요.
아래 예시는 별도 설치한 Button을 함께 사용합니다.

```tsx
import { MoruProvider } from '@/components/ui/moru/provider'
import { Button } from '@/components/ui/moru/button'
import { ToastProvider, useToast } from '@/components/ui/moru/toast'

function SaveAction() {
  const { toast } = useToast()
  return <Button onClick={() => toast({ title: '저장했어요', tone: 'success' })}>알림 보기</Button>
}

export function Notifications() {
  return <MoruProvider><ToastProvider><SaveAction /></ToastProvider></MoruProvider>
}
```

toast의 `tone`은 `success`·`warning`·`info`·`danger`입니다. 반환된 ID는 `dismiss(id)`에 전달하며,
자동으로 닫지 않으려면 toast 옵션에 `duration: 0`을 지정합니다.
Tooltip은 Provider가 없으면 자동으로 감싸며, 여러 Tooltip의 지연 시간을 공유할 때는
같은 파일의 `TooltipProvider`를 사용합니다. 오른쪽에서 왼쪽으로 읽는 영역은
`DirectionProvider`와 실제 DOM의 `dir="rtl"`을 함께 지정하세요.

DataTable은 클라이언트에서 데이터를 검색·정렬·선택하는 조합입니다.
`data`, Moru의 `DataTableColumn<T>[]`, 고유하고 안정적인 `getRowId`, `caption`을 전달합니다.
`onSelectionChange`는 행 순번이 아닌 ID 목록을 반환합니다. 다른 메이저 버전의
TanStack 열 타입을 그대로 가져오지 말고 Moru가 export한 타입을 사용하세요.
DataTable은 React의 `useEffectEvent`를 사용하므로 위의 React 지원 기준을 유지합니다.

```tsx
import { useState } from 'react'
import { DataTable, type DataTableColumn } from '@/components/ui/moru/data-table'
import { Chart } from '@/components/ui/moru/chart'

type Project = { id: string; name: string; tasks: number }
const projects: Project[] = [{ id: 'project-one', name: '출시 준비', tasks: 12 }]
const columns: DataTableColumn<Project>[] = [
  { accessorKey: 'name', header: '프로젝트' },
  { accessorKey: 'tasks', header: '할 일' },
]

export function ProjectData() {
  const [selected, setSelected] = useState<string[]>([])
  return <>
    <DataTable data={projects} columns={columns} getRowId={(row) => row.id}
      caption="프로젝트 목록" onSelectionChange={setSelected} />
    <p role="status">{selected.length}개 선택</p>
    <Chart title="완료한 할 일" type="line" xKey="month" chartHeight={240}
      config={{ completed: { label: '완료', color: 'var(--ui-accent)' } }}
      data={[{ month: '11월', completed: 12 }, { month: '12월', completed: 18 }]} />
  </>
}
```

예시는 `data-table`·`chart`를 설치한 뒤 `MoruProvider` 안에서 사용합니다.
Chart의 필수 값은 `data`, `config`, `xKey`, `title`이며 형태는 `bar`·`line`·`area`·`donut`입니다.
0보다 큰 `chartHeight`를 지정하고 데이터 표 대체 표현도 유지하세요.
사용자 정의 Recharts 조합에는 같은 파일의 `ChartContainer`도 사용할 수 있습니다.
Carousel은 `aria-label`과 항목별 고유 ID를 받으며, Resizable은 설치된 패널 라이브러리의
Group·Panel·Separator API를 위의 세 export로 감쌉니다.

NumberInput의 빈 값 `null`은 `0`과 구분됩니다. MultiSelect는 문자열 값 목록과 같은 이름의
폼 항목 여러 개를 사용하므로 `FormData.getAll`로 읽습니다. FileInput은 실제 파일 선택과
클라이언트 검사를 제공하며 업로드·서버 검증은 앱에 연결합니다.
Questionnaire·Trace·대화 컴포넌트는 UI와 콜백을 제공하며 서비스 실행·AI 연결은 앱의 역할입니다.
CodeBlock 복사는 브라우저 클립보드를 사용하고 접근할 수 없을 때 `onCopyError`로 알려 줍니다.

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
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/tabs.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/menu.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/popover.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/drawer.json
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

## 캘린더·날짜·시간 선택

```sh
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/calendar.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/date-picker.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/date-range-picker.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/time-picker.json
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/time-range-picker.json
```

필요한 캘린더·팝업·스타일·도우미도 함께 설치합니다.
공통 스타일을 한 번 import하고 기존 `MoruProvider` 안에서 사용하세요.

```tsx
import { useState } from 'react'
import { Calendar, type CalendarRange } from '@/components/ui/moru/calendar'
import { DatePicker } from '@/components/ui/moru/date-picker'
import { DateRangePicker } from '@/components/ui/moru/date-range-picker'
import { TimePicker } from '@/components/ui/moru/time-picker'
import { TimeRangePicker, type TimeRangeValue } from '@/components/ui/moru/time-range-picker'

export function PlanningControls() {
  const [day, setDay] = useState<Date | null>(null)
  const [dates, setDates] = useState<CalendarRange>({ start: null, end: null })
  const [time, setTime] = useState<string | null>(null)
  const [times, setTimes] = useState<TimeRangeValue>({ start: '09:00', end: '10:00' })
  return <div style={{ display: 'grid', gap: 24 }}>
    <Calendar aria-label="일정 달력" value={day} onValueChange={setDay}
      variant="minimal" dayShape="circle" weekStartsOn={1} />
    <DatePicker label="마감일" name="dueDate" value={day}
      onValueChange={setDay} calendarOptions={{ variant: 'schedule', dayShape: 'rounded' }} />
    <DateRangePicker label="프로젝트 기간" name="period" value={dates}
      onValueChange={setDates} required />
    <TimePicker label="알림 시간" name="reminder" value={time}
      onValueChange={setTime} min="08:00" max="20:00" step={15} />
    <TimeRangePicker label="진행 시간" name="session" value={times}
      onValueChange={setTimes} step={15} required />
  </div>
}
```

Calendar는 단일 날짜 선택과 `mode="range"` 범위 선택을 지원합니다.
상단 년·월을 누르면 다른 년·월로 빠르게 이동합니다. `variant`는
`default`·`minimal`·`schedule`·`activity`이며, `dayShape`, `size`, `weekStartsOn`,
`showOutsideDays`, `fixedWeeks`, 날짜 키별 `dayData`로 표시를 바꿀 수 있습니다.
DatePicker·DateRangePicker에는 이 표시 옵션을 `calendarOptions`로 전달합니다.
값·날짜 제한·필드 검증은 각 picker가 관리합니다.

날짜는 로컬 달력의 `Date`를 사용합니다. 고정 날짜는 `new Date(년, 월인덱스, 일)`로 만드세요.
Calendar 자체는 폼 전송 필드를 만들지 않습니다. DatePicker의 `name` 값은 `YYYY-MM-DD`로,
DateRangePicker는 `name.start`·`name.end` 두 항목으로 전송됩니다.
날짜 범위 값은 `{ start: Date | null, end: Date | null }`입니다.
TimePicker는 `HH:mm | null`, TimeRangePicker는
`{ start: string | null, end: string | null }`을 사용하고 범위 이름도 `name.start`·`name.end`로 나뉩니다.
`step={15}`의 단위는 분이며 `min`이 있으면 그 값을 간격의 기준으로 삼습니다.
시간은 시간대 변환 없는 시·분 값입니다. 시간 범위는 기본적으로 같은 날 종료가 시작보다 늦어야 하며,
자정을 넘는 일정에만 `allowOvernight`를 켭니다. 시작·종료가 같은 범위는 허용하지 않습니다.
picker는 `disabled`, `loading`, `readOnly`, `required`도 받습니다.
비제어 picker는 폼 초기화 시 `defaultValue`로 돌아가며, 제어형은 폼의 `onReset`에서 값을 갱신합니다.

## 버전과 업데이트

HTTP 항목과 의존성은 `/r/v0.4.0/` 버전 경로를 사용합니다. 기존 버전의 파일을 바꾸는 대신
다음 릴리스에는 새 버전 경로를 발행합니다. 사용자의 소스를 자동으로 갱신하지는 않습니다.
새 버전을 설치하기 전에 현재 파일을 커밋하고 CLI의 diff·덮어쓰기 안내를 확인하세요.
이미 발행한 `/r/v0.3.1/`·`/r/v0.3.2/`·`/r/v0.3.3/`·`/r/v0.3.4/` 폴더와 설치 URL은 그대로 유지합니다.
Tabs·Menu·Popover·Drawer는 v0.3.3부터, 날짜·시간 다섯 항목은 v0.3.4부터 제공하며 이전 버전에 추가하지 않습니다.

GitHub의 `registry.json`도 같은 항목을 제공합니다. GitHub 주소 형식은
`syrus-riius/moru-ui/button#v0.4.0`이며, 릴리스 태그와 각 의존성의 버전을 함께 고정합니다.
HTTP 주소가 기본 설치 안내입니다. Moru의 npm 패키지는 게시하지 않았습니다.

## 지원 범위

이 릴리스는 웹 React·Vite·TypeScript·Tailwind CSS 4를 대상으로 합니다.
클라이언트 컴포넌트 경계는 생성 파일에 표시하지만 Next.js SSR·hydration은 별도 검증 범위입니다.
React Native·Expo는 별도 구현이므로 이 웹 레지스트리로 설치하지 않습니다.
v0.4.0은 산출물 생성과 프로덕션 빌드만 수행하며, 추가 항목의 자동 테스트·설치 스모크·브라우저 점검·CI 실행은 생략합니다.

원본은 `src/components/ui`, `src/components/blocks`, `src/theme`입니다.
`npm run registry:build`가 설치용 파일을 생성하고 `npm run registry:check`가 오래된 산출물을 검사합니다.
Moru 자체 코드는 [MIT](../LICENSE), 제3자 소스·폰트 고지는 [NOTICE](../NOTICE.md)를 따릅니다.

공식 규격: [레지스트리 항목](https://ui.shadcn.com/docs/registry/registry-item-json),
[GitHub 레지스트리](https://ui.shadcn.com/docs/registry/github).
