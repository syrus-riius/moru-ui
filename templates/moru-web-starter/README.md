# Moru Web Starter

React · TypeScript · Base UI · Tailwind CSS로 실행하는 소스 프로젝트입니다. Moru의 실제 웹 컴포넌트, 공통 스타일, 디자인 토큰과 예제 폼을 포함합니다. `@moru/ui`라는 배포된 npm 패키지를 설치하는 방식이 아닙니다.

## 시작하기

Node.js 24 이상이 필요합니다. ZIP을 풀고 `moru-web-starter` 폴더에서 실행하세요.

```sh
npm ci
npm run dev
```

처음 설치에는 `npm install`도 사용할 수 있습니다. 배포용 파일은 다음 명령으로 생성합니다.

```sh
npm run build
npm run preview
```

Vite가 안내하는 로컬 주소를 여세요. 서버 연결이 없는 예제이므로 비밀번호·파일·프로젝트 정보를 외부로 보내지 않습니다. 파일 업로드·서버 검증·인증·저장은 실제 앱에서 연결해야 합니다.

## 포함된 소스

- `src/App.tsx`: NumberInput, PasswordInput, MultiSelect, FileInput, Stepper, RingProgress를 조합한 예제.
- `src/components/ui/`: Moru 웹 UI 전체 소스. 필요한 파일을 직접 수정하거나 제거할 수 있습니다.
- `src/theme/`: 디자인 토큰·색상·밀도·간격 계산·역할별 타이포그래피·기본 CSS.
- `src/lib/`: UI에서 사용하는 공통 도우미.
- `src/main.tsx`: React 진입점과 필수 스타일 import.
- `moru-source.json`: 이 ZIP을 만든 Moru 소스의 체크섬과 파일 목록.

브랜드 설명 페이지, 디자인 편집기, 와이어프레임 시뮬레이터, Expo 앱은 포함하지 않습니다. 이 파일들은 독립적인 웹 앱의 출발점입니다.

## 컴포넌트 사용

```tsx
import { Field } from './components/ui/field'
import { Input } from './components/ui/input'
import { Button } from './components/ui/button'

export function ProjectName() {
  return <form>
    <Field label="프로젝트 이름" description="언제든 바꿀 수 있어요.">
      <Input name="project" required />
    </Field>
    <Button type="submit">만들기</Button>
  </form>
}
```

`Field`는 라벨·설명·오류와 입력 요소를 연결합니다. 라벨이 없는 독립 입력에는 `aria-label` 또는 `aria-labelledby`를 지정하세요. 단순히 placeholder만 넣으면 입력의 이름을 대신할 수 없습니다.

## 테마와 팝업

`ThemeScope`에 `tokens`와 `mode`를 함께 전달하면 컴포넌트와 body로 이동하는 팝업에도 같은 CSS 변수가 적용됩니다. `mode="dark"`만 바꾸면 색 토큰이 자동 변환되지는 않습니다. 어두운 토큰도 함께 만드세요.

```tsx
import { ThemeScope } from './components/ui/theme-scope'
import { applyDensity, createDarkTokens, defaultTokens } from './theme/tokens'

const light = applyDensity({ ...defaultTokens, accent: '#3d42c9' }, 'comfortable')
const dark = createDarkTokens(light)

// 기존 앱에서는 루트 또는 필요한 영역을 감싸세요.
<ThemeScope tokens={dark} mode="dark">
  <ProjectName />
</ThemeScope>
```

`src/main.tsx`의 다음 스타일 import를 유지하세요.

```tsx
import './styles.css'                 // Tailwind + 이 예제의 레이아웃
import './theme/fonts.css'            // npm에 동봉된 Pretendard, Noto Sans
import './theme/default.css'          // ThemeScope 밖의 기본 변수
import './components/ui/styles.css'   // 기본 컨트롤과 공통 컴포넌트 스타일
import './theme/readability.css'      // 읽기·텍스트 확장·터치 크기 보정
```

각 추가 컴포넌트는 필요한 개별 CSS를 직접 import합니다. 별도 앱으로 옮길 때는 상대 경로로 연결된 도우미와 CSS도 함께 가져가세요. Tailwind CSS 4와 Vite 플러그인은 유틸리티 클래스의 생성에 사용합니다.

## 폼과 접근성

- `NumberInput`의 빈 값은 `null`이며 `0`과 구분됩니다. `name`으로 제출되는 값에는 표시용 단위가 붙지 않습니다.
- `MultiSelect`는 문자열 배열을 사용하고, 같은 `name`의 폼 항목 여러 개로 제출됩니다. `FormData.getAll('areas')`로 읽으세요.
- `PasswordInput`의 표시 버튼은 입력 값을 바꾸거나 제출하지 않습니다. 비밀번호 관리자를 위해 용도에 맞는 `autoComplete`를 지정하세요.
- `FileInput`의 크기·확장자 검사는 사용자에게 빠른 피드백을 주는 클라이언트 검사입니다. 서버에서도 실제 파일을 검증해야 합니다.
- `Stepper`는 단계 표시와 이동을 제공합니다. 입력 검증과 다음 단계 허용은 앱이 결정합니다.
- `Calendar`는 `variant="default" | "minimal" | "schedule" | "activity"`에서 단일 날짜와 `mode="range"` 범위 선택·년월 이동을 공유합니다. `size`·`dayShape`·`weekStartsOn`·`showOutsideDays`·`fixedWeeks`와 날짜 키(`YYYY-MM-DD`)별 `dayData`의 라벨·색상 의미·아이콘·마커 수·완료 상태를 설정할 수 있습니다. 완료 상태는 날짜 선택과 별개이며, `icon`은 조작 요소가 없는 장식용 ReactNode입니다. `DatePicker`·`DateRangePicker`의 `calendarOptions`로도 이 일곱 표시 옵션만 전달합니다. 기존 날짜 값·폼 제출·선택 동작은 입력이 관리합니다.
- `DateRangePicker`는 `{ start: Date | null, end: Date | null }`을 사용합니다. `name="period"`이면 `period.start`와 `period.end`를 `YYYY-MM-DD` 형식으로 제출합니다. 범위를 완성하기 전에는 제출을 막고, `required`이면 빈 범위도 검사합니다.
- `TimePicker`는 시간대 변환 없이 `HH:mm | null`을 사용합니다. `step={15}`는 **15분 간격**이며 `min`, `max`와 함께 사용할 수 있습니다.
- `TimeRangePicker`는 `{ start: string | null, end: string | null }`을 사용하고, `name="session"`이면 `session.start`와 `session.end`를 제출합니다. 기본은 같은 날 종료 > 시작이며, `allowOvernight`를 켰을 때만 자정을 넘는 범위를 허용합니다. 시작과 종료가 같은 범위는 허용하지 않습니다.
- 기본 컨트롤은 Base UI의 키보드·포커스 처리를 사용합니다. 최종 앱에서도 키보드, 화면 확대, 스크린리더, 모바일 환경을 확인하세요.

```tsx
import { DateRangePicker } from './components/ui/date-range-picker'
import { TimePicker } from './components/ui/time-picker'
import { TimeRangePicker } from './components/ui/time-range-picker'

<Field label="진행 기간"><DateRangePicker name="period" required /></Field>
<Field label="진행 시간"><TimeRangePicker name="session" step={15} required /></Field>
<Field label="알림 시간"><TimePicker name="reminder" step={15} min="08:00" max="20:00" /></Field>
```

날짜·시간 입력은 비제어 상태에서 네이티브 폼 초기화 시 `defaultValue`로 돌아갑니다. 제어 상태에서는 `value`가 기준이므로 앱의 `onReset`에서 원하는 상태를 지정하세요. 시간은 시·분 팝업과 직접 입력을 모두 지원하며, 브라우저 표시 언어에 따라 오전·오후가 보이더라도 제출 값은 `HH:mm`입니다.

## 의존성과 권리 고지

의존성 버전과 lockfile은 Moru 원본 프로젝트의 버전에서 생성했습니다. 전체 UI 소스를 제공하므로 예제에서 사용하지 않는 표·차트·캐러셀 등의 의존성도 포함합니다. 필요한 소스만 남긴 뒤 의존성을 줄일 수 있습니다.

Moru 자체 소스는 동봉된 `LICENSE`의 MIT 라이선스로 사용할 수 있습니다. 복사·수정·재배포할 때 저작권·라이선스 고지를 유지하세요. `private: true`는 이 스타터의 실수로 인한 npm 게시를 막는 설정입니다. 제3자 라이브러리·아이콘·글꼴의 권리 고지는 `NOTICE.md`와 설치된 각 패키지의 LICENSE를 확인하세요.

## Reusable blocks

Four self-contained Moru blocks are included in `src/components/blocks`: `LoginBlock`, `OTPBlock`, `SearchFiltersBlock`, and `SettingsBlock`. Import a block into your page and render it inside the existing theme. The forms demonstrate local validation and feedback; connect authentication and persistence through your own application services. Login never stores its password, and the OTP demo uses `123456`.
