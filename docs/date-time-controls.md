# 날짜와 시간 선택

Moru 웹 컴포넌트 75종 중 날짜·시간 입력을 위한 사용 안내입니다. 날짜와 시간은 시간대 변환 없이 각각 **로컬 연·월·일**, **24시간제 `HH:mm`**로 다룹니다. 실제 예약 시각을 서버에 저장할 때는 앱이 날짜·시간·시간대를 결합해야 합니다.

## Calendar: 단일 날짜와 기간

기존 단일 날짜 호출은 그대로 사용할 수 있습니다. `mode="range"`를 지정하면 값과 콜백이 `{ start: Date | null; end: Date | null }` 형태로 바뀝니다.

```tsx
import { useState } from 'react'
import { Calendar } from './components/ui'
import type { CalendarRange } from './components/ui/calendar'

export function ProjectCalendar() {
  const [period, setPeriod] = useState<CalendarRange>({ start: null, end: null })
  return <Calendar
    mode="range"
    value={period}
    onValueChange={setPeriod}
    minDate={new Date(2026, 0, 1)}
    maxDate={new Date(2027, 11, 31)}
    aria-label="프로젝트 기간"
  />
}
```

첫 날짜는 시작점, 두 번째 날짜는 종료점입니다. 두 번째 날짜가 더 이르면 순서를 정리하며 **같은 날의 시작·종료도 허용**합니다. 완료한 뒤 다시 날짜를 누르면 새로운 범위를 시작합니다. 범위를 고르는 중에는 호버·키보드 이동으로 선택 예정 구간을 확인할 수 있습니다.

Calendar 자체는 제출용 입력이 아닙니다. HTML 폼에서 기간을 제출하려면 아래 DateRangePicker를 사용하거나 앱에서 날짜 값을 직렬화하세요.

### 네 가지 표현과 공통 표시 옵션

`variant`는 달력의 표현만 바꿉니다. 날짜 계산·년월 이동·키보드 탐색·단일/범위 선택은 같은 Calendar 구현을 사용합니다.

| `variant` | 권장 용도 |
| --- | --- |
| `default` | 입력 팝업과 일반적인 날짜 선택. 기존 기본 표현을 유지합니다. |
| `minimal` | 카드나 대시보드 안에 가볍게 넣는 달력. |
| `schedule` | 일정이 있는 날짜와 일정 수를 확인하는 월간 달력. |
| `activity` | 운동·습관·출석처럼 날짜별 활동과 완료 여부를 확인하는 달력. |

| 속성 | 값과 기본값 |
| --- | --- |
| `variant` | 위 네 값. 기본 `default`. |
| `size` | `sm` / `md` / `lg`. 기본 `sm`이며 S/M/L 공통 크기 토큰을 사용합니다. |
| `dayShape` | `rounded` / `square` / `circle`. 기본 `rounded`. |
| `weekStartsOn` | `0` 일요일 / `1` 월요일. 기본 `0`. 요일 헤더와 Home/End 이동에 함께 적용합니다. |
| `showOutsideDays` | 이전·다음 달의 날짜 표시. 기본 `true`. |
| `fixedWeeks` | 항상 6주를 표시할지 여부. 기본 `true`이며 `false`이면 해당 월에 필요한 주만 표시합니다. |
| `dayData` | 로컬 날짜 `YYYY-MM-DD`를 키로 하는 `Record<string, CalendarDayData>`. 기본은 표시 데이터 없음. |

크기는 고정 픽셀 복사본이 아니라 현재 테마의 컨트롤 높이·글자·간격 토큰에 연결됩니다. 모양과 크기를 바꿔도 날짜의 접근 가능한 이름과 포커스 표시는 유지됩니다. `locale`은 표시 언어이며 시작 요일은 `weekStartsOn`으로 명시합니다.

```tsx
import { useState } from 'react'
import { Bike } from 'lucide-react'
import { Calendar } from './components/ui'
import type { CalendarDayData } from './components/ui/calendar'

const activityData: Record<string, CalendarDayData> = {
  '2026-10-27': { label: '자전거 운동', tone: 'success', icon: <Bike />, completed: true },
  '2026-10-28': { label: '예정된 운동', tone: 'accent', count: 2 },
}

export function ActivityCalendar() {
  const [date, setDate] = useState<Date | null>(new Date(2026, 9, 27))
  return <Calendar
    variant="activity"
    size="md"
    dayShape="circle"
    weekStartsOn={1}
    showOutsideDays={false}
    fixedWeeks={false}
    dayData={activityData}
    value={date}
    onValueChange={setDate}
    aria-label="운동 기록"
  />
}
```

`dayData` 항목은 다음 값을 가집니다.

| 필드 | 용도 |
| --- | --- |
| `label` | 필수 문자열. 날짜와 함께 읽어 줄 “팀 회의”, “자전거 운동” 같은 의미. |
| `tone` | `neutral` / `accent` / `success` / `warning` / `danger` / `info` 중 의미 색상. 기본 `neutral`. |
| `icon` | 활동 완료 시 표시할 장식용 ReactNode. 생략하면 체크 아이콘을 사용합니다. |
| `count` | 일정 수. 기본은 점 1개이며 `0`이면 점을 표시하지 않습니다. |
| `completed` | 활동 완료 여부. 활동형에서 `true`이면 날짜 숫자 대신 아이콘을 표시합니다. |

색만으로 의미를 전달하지 마세요. 양의 유한한 `count`는 정수로 사용합니다. 활동형 이외의 표현에서는 1–3개를 해당 수의 점으로 표시하고, 4개 이상은 점 하나와 숫자로 요약합니다. 큰 수는 화면에서 `99+`로 줄여도 원래 수는 접근 가능한 설명에 남습니다. 활동형은 마커 대신 완료 아이콘을 사용하며 `count`가 있으면 활동 수를 접근 가능한 설명에 포함합니다. `completed`는 기록의 완료 상태이고 **선택된 날짜와는 별개의 데이터**입니다. 날짜를 눌러도 완료 상태가 자동으로 바뀌지 않습니다. 완료 처리는 앱이 데이터를 변경해야 합니다.

제공한 `icon`은 장식으로 표시합니다. 날짜 버튼 안에 들어가므로 아이콘에 버튼·링크·입력 같은 조작 요소를 넣지 마세요. `icon`은 ReactNode이므로 테마·시뮬레이터 JSON에 그대로 저장할 수 없습니다. 저장이 필요하면 앱이 아이콘 이름을 저장한 뒤 렌더링 시 React 아이콘으로 연결하세요. 날짜 키에는 UTC 변환한 ISO 문자열 대신 로컬 연·월·일을 사용하세요.

같은 `dayData`와 `value`를 여러 표현에 전달하면 선택 날짜를 공유하며 비교할 수 있습니다. 기간은 같은 표시 옵션에 `mode="range"`와 `CalendarRange` 값을 전달해 재사용합니다. 활동·일정의 마커와 완료 여부는 단일/범위 선택을 바꾸지 않습니다.

### DatePicker·DateRangePicker에서 같은 표현 사용

두 입력의 `calendarOptions`는 `variant`, `size`, `dayShape`, `weekStartsOn`, `showOutsideDays`, `fixedWeeks`, `dayData` **일곱 표시 옵션만** 받습니다. 날짜 값·콜백·`mode`·`minDate`·`maxDate`·`disabled`·`locale`은 바깥 입력이 관리하므로 `calendarOptions`로 덮어쓸 수 없습니다.

```tsx
import { DatePicker, DateRangePicker, Field } from './components/ui'

<Field label="회의 날짜">
  <DatePicker
    name="meeting-date"
    calendarOptions={{
      variant: 'schedule',
      size: 'md',
      weekStartsOn: 1,
      dayData: { '2026-10-27': { label: '팀 회의', count: 3 } },
    }}
  />
</Field>

<Field label="작업 기간">
  <DateRangePicker
    name="period"
    size="md"
    calendarOptions={{ variant: 'minimal', dayShape: 'square', fixedWeeks: false }}
  />
</Field>
```

DatePicker의 팝업 Calendar는 별도 크기를 지정하지 않으면 `sm`입니다. DateRangePicker는 `calendarOptions.size`를 우선하고, 없으면 입력의 `size`를 사용합니다. 예를 들어 입력을 `size="md"`로 유지하면서 팝업만 `calendarOptions={{ size: 'lg' }}`로 크게 할 수 있습니다.

Calendar와 두 날짜 입력은 가장 가까운 `ThemeScope`의 색상·타이포그래피·크기·밀도 토큰을 상속합니다. 팝업도 같은 범위의 테마를 유지합니다. 다크 모드에서는 `ThemeScope`에 다크 토큰을 함께 전달하세요. `mode="dark"`만으로 새로운 색상표가 생성되지는 않습니다. 이 가이드는 웹 React 컴포넌트 기준이며 Expo의 네이티브 Calendar API와 구분합니다.

### 갤러리에서 비교하고 코드 가져오기

컴포넌트 화면의 Calendar에서 **기본 / 미니멀 / 일정 / 활동** 네 탭을 전환해 표현을 비교하세요. **날짜 / 날짜 범위**로 선택 방식을 바꾸고, **세부 설정**을 펼치면 크기(S·M·L), 날짜 모양(둥근 사각형·사각형·원형), 주 시작, 이전·다음 달 날짜, 항상 6주 표시를 조정할 수 있습니다. **설정 + 데이터 예시**를 펼쳐 코드 복사 버튼을 누르면 현재 옵션과 선택 상태를 담은 `CalendarExample` 함수를 가져올 수 있습니다. 일정·활동 데이터는 최대 두 날짜의 예시를 포함하므로 앱의 전체 데이터로 확장하세요.

일정 탭은 선택한 날짜의 일정 목록을 보여 줍니다. 활동 탭의 **완료로 표시 / 완료 취소**는 예시 데이터를 변경해 달력과 오늘까지의 연속 기록·최근 28일 완료·누적 분 요약을 함께 갱신합니다. 날짜 선택과 완료 처리가 별개의 조작임을 확인할 수 있습니다. 이 화면의 일정과 활동은 예시 데이터이며 실제 일정 저장 서비스를 포함하지 않습니다.

### 빠른 년·월 이동과 키보드

- 상단 **년**을 누르면 12개 연도 그리드가 열립니다. 연도를 고른 뒤 월을 선택하면 날짜 화면으로 돌아갑니다.
- 상단 **월**을 누르면 해당 연도의 12개월을 바로 선택할 수 있습니다. `minDate`·`maxDate` 밖의 년·월은 선택할 수 없습니다.
- 날짜 화면: 방향키는 일·주, Home/End는 주의 양 끝, PageUp/PageDown은 월, Shift+PageUp/PageDown은 연 단위로 이동합니다.
- 년·월 그리드: 방향키·Home·End·PageUp·PageDown으로 이동하고 Enter/Space로 선택합니다. Escape는 날짜 화면으로 복귀합니다. DatePicker 팝업 안에서는 그다음 Escape로 팝업을 닫을 수 있습니다.

표시·선택 가능한 연도는 1–9999년입니다. `locale`은 표시 언어와 날짜 형식에 사용하고, `disabled`는 이동과 선택을 모두 막습니다.

## DateRangePicker: 기간 폼 입력

```tsx
import { Button, DateRangePicker, Field } from './components/ui'

export function PeriodForm() {
  return <form onSubmit={(event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    // 예: "2026-10-27", "2026-11-03"
    const start = data.get('period.start')
    const end = data.get('period.end')
    // start와 end를 앱의 저장 동작에 전달하세요.
    console.log({ start, end })
  }}>
    <Field label="프로젝트 기간" description="시작일과 종료일을 함께 선택하세요.">
      <DateRangePicker name="period" required size="md" />
    </Field>
    <Button type="submit">기간 확인</Button>
    <Button type="reset" variant="secondary">초기화</Button>
  </form>
}
```

`name="period"`는 `period.start`와 `period.end` 두 항목을 `YYYY-MM-DD`로 제출합니다. 기존 서버 필드에 맞추려면 `startName="from" endName="to"`로 바꿀 수 있습니다. `form`으로 외부 폼 ID에 연결할 수도 있습니다.

시작일만 고르면 팝업이 유지되고, 종료일까지 고르면 닫힙니다. `required`는 양쪽 날짜를 요구합니다. 선택 사항일 때 둘 다 비우는 것은 유효하지만 **한쪽만 입력한 불완전한 기간은 제출할 수 없습니다**. `minDate`·`maxDate`는 양 끝을 포함합니다. 외부에서 전달한 역순 값은 임의 교환하지 않고 오류로 표시합니다.

값은 `CalendarRange`이며 `value={null}`도 명시적인 빈 값으로 사용할 수 있습니다. `size="sm" | "md" | "lg"`, `clearable`, `readOnly`, `disabled`, `locale`을 지원합니다. 읽기 전용은 편집을 막고 값을 제출하며, 비활성 입력은 폼 제출에서 빠집니다.

날짜만 저장할 때 `toISOString().slice(0, 10)`을 사용하면 UTC 변환으로 날짜가 달라질 수 있습니다. 컴포넌트의 제출값이나 `calendarDateKey`처럼 로컬 날짜 필드를 사용하는 방식을 유지하세요.

## TimePicker: 시간 입력과 시·분 선택

```tsx
const [time, setTime] = useState<string | null>('09:00')

<Field label="회의 시작 시간">
  <TimePicker
    name="meeting-time"
    value={time}
    onValueChange={setTime}
    min="09:00"
    max="18:00"
    step={15}
    required
  />
</Field>
```

값과 콜백은 항상 **`HH:mm` 또는 `null`**입니다. 입력은 브라우저의 기본 시간 편집을 지원하고, 시계 버튼으로 시·분 그리드를 열어 선택한 뒤 **시간 적용**으로 확정할 수 있습니다. 그리드는 24시간제로 표시하며, 브라우저 기본 입력의 겉모습은 운영체제·언어 설정에 따라 달라질 수 있습니다.

**Moru의 `step` 단위는 분입니다.** 기본값은 1분이고 1–60의 정수로 보정합니다. `step={15}`는 15분 간격이며 내부 HTML 입력에는 900초로 전달합니다. 간격의 기준점은 유효한 `min` 값, 없으면 자정입니다. 예를 들어 `min="09:10" step={15}`이면 09:10·09:25·09:40 등이 가능합니다. `min`·`max`는 경계를 포함합니다.

`min="22:00" max="02:00"`처럼 역순 경계는 자정을 지나는 **허용 시간대**를 뜻합니다. 이는 아래 시간 범위의 `allowOvernight` 설정과 별개입니다. `name`, `form`, `required`, `readOnly`, `disabled`, `size`, `clearable`, `error`와 일반 input 속성을 지원합니다. 초·날짜·시간대는 값에 포함하지 않습니다.

## TimeRangePicker: 시작·종료 시간

```tsx
import { TimeRangePicker, type TimeRangeValue } from './components/ui'

const [hours, setHours] = useState<TimeRangeValue>({ start: '09:00', end: '10:30' })

<TimeRangePicker
  label="회의 시간"
  name="meeting"
  value={hours}
  onValueChange={setHours}
  step={15}
  required
/>

<TimeRangePicker
  label="야간 작업"
  name="night"
  allowOvernight
  defaultValue={{ start: '22:00', end: '02:00' }}
/>
```

기본값은 **같은 날의 `종료 > 시작`**입니다. 반대 순서를 자동 교환하지 않으며, 시작·종료가 같은 시간도 허용하지 않습니다. 자정을 지나는 일정은 `allowOvernight`를 명시해야 합니다. 위 야간 예제는 다음 날 02:00 종료, 총 4시간으로 표시됩니다. 같은 시각을 24시간짜리 일정으로 해석하지는 않으므로, 하루 이상 걸리는 일정은 앱에서 날짜까지 함께 모델링하세요.

값은 `{ start: string | null; end: string | null }`입니다. 양쪽을 선택하는 중에는 콜백에 부분 값이 전달될 수 있습니다. `required` 또는 한쪽 값이 있는 상태에서는 나머지 입력도 필요합니다. `name="meeting"`은 `meeting.start`·`meeting.end`를 `HH:mm`로 제출하며, `startName`·`endName`으로 개별 이름을 지정할 수 있습니다. `startLabel`·`endLabel`, `min`·`max`·분 단위 `step`, `form`, `size`, `clearable`, `readOnly`, `disabled`, `error`를 지원합니다.

## 제어 상태와 초기화

`defaultValue`만 사용한 입력은 네이티브 폼 초기화 시 기본값으로 돌아갑니다. `value`를 전달한 입력은 앱이 상태를 소유하므로 값이 유지됩니다. 제어형 입력을 지우려면 폼의 `onReset`에서 해당 상태를 명시적으로 바꾸세요.

```tsx
<form onReset={() => {
  setPeriod({ start: null, end: null })
  setTime(null)
  setHours({ start: null, end: null })
}}>
  {/* 제어형 날짜·시간 입력과 type="reset" 버튼 */}
</form>
```

컴포넌트 내부의 초기화 처리는 `preventDefault()`로 취소한 폼 초기화를 존중합니다. 실제 제출 검증은 네이티브 날짜·시간 입력을 사용하며, 오류 메시지와 보이는 조작 요소의 초점을 연결합니다. 폼 컨트롤에는 Field·label 또는 접근 가능한 이름을 제공하세요.

## 참고 자료

Moru의 API와 정책은 위 구현 기준입니다. 비교·검토에는 [Mantine Calendar의 날짜별 표시 확장](https://mantine.dev/dates/calendar/), [Mantine DatePicker](https://mantine.dev/dates/date-picker/), [WAI APG의 날짜 그리드 키보드와 접근성 원칙](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/), [Mantine TimePicker](https://mantine.dev/dates/time-picker/), [HTML 시간 입력과 분·초 간격 규칙](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/time)을 참고했습니다.
