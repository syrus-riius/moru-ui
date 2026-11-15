# @moru/native

Moru 자체 소스는 동봉된 `LICENSE`의 MIT 라이선스를 따릅니다. 제3자 패키지는 각 패키지의 고지를 유지하세요.

Moru의 색·간격·상태 원칙을 Expo에서 사용할 수 있게 만든 React Native용 초기 패키지입니다. 웹의 DOM·CSS·Base UI 컴포넌트와 분리되어 있으며, 이 저장소 안에서 **로컬 패키지**로 사용합니다. npm에 공개 배포된 패키지가 아닙니다.

현재 코어 15종, 모바일 패턴 11종, 차트 2종, OS 컨트롤 3종으로 총 31종을 제공합니다. 실제 시스템 Picker·Slider·DatePicker 연결은 `@moru/native/expo` 엔트리로 분리합니다. SwiftUI 전체를 대체하거나 모든 기기의 런타임을 검증한 상태는 아닙니다.

## 설치와 실행

기준 예제는 `apps/moru-expo`입니다. Expo SDK 58, React Native 0.88, React 19.3 조합을 사용합니다. 기존 Expo 앱에서는 그 앱의 SDK에 맞는 의존성을 먼저 설치하세요.

```sh
npx expo install react-native-safe-area-context react-native-svg @expo/ui
```

그 다음 해당 앱의 `package.json`에 이 로컬 디렉터리를 추가합니다. 경로는 앱 위치에 맞게 정합니다.

```json
{
  "dependencies": {
    "@moru/native": "file:../../packages/moru-native"
  }
}
```

예제 앱의 `.npmrc`는 `install-links=true`를 사용해 로컬 패키지를 앱의 `node_modules`로 복사하도록 구성합니다. 앱에서 `npm install`로 잠금 파일을 반영하고 `npx expo start`로 실행합니다. 복사 설치 후 패키지 소스를 수정했다면 설치본도 갱신해야 합니다. 패키지 디렉터리에 별도의 React를 설치하지 마세요.

Expo UI 또는 다른 네이티브 의존성이 Expo Go에 포함되어 있지 않은 조합이라면 해당 모듈이 들어 있는 개발 빌드가 필요합니다. SDK별 설치·지원 범위는 [Expo SDK 58 문서](https://docs.expo.dev/versions/v58.0.0/sdk/ui/)를 확인하세요.

## 앱 최상위

`SafeAreaProvider`는 앱 최상위에서 한 번 제공합니다. Expo Router를 사용할 때는 루트 레이아웃에서 구성합니다.

```tsx
import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { MoruNativeProvider } from '@moru/native'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <MoruNativeProvider accent="#7a223a">
        <Stack screenOptions={{ headerShown: false }} />
      </MoruNativeProvider>
    </SafeAreaProvider>
  )
}
```

`mode`를 생략하면 시스템 라이트·다크 설정을 따릅니다. `mode="light"` 또는 `mode="dark"`로 고정할 수도 있습니다. `accent`와 `tokens.colors`에는 Moru 내보내기 토큰과 같은 `#RRGGBB` HEX 값을 권장합니다.

`colors.border`는 카드·목록 구분선에, 선택 속성인 `colors.controlBorder`는 빈 TextField와 선택하지 않은 Checkbox·Radio, 꺼진 Switch의 경계에 사용합니다. Moru 웹 토큰을 내보내면 대비를 계산한 경계색이 전달됩니다. Native 기본 테마도 별도의 중성 경계색을 제공하며, 이 속성이 없는 기존 색상 객체는 `border`로 대체해 처리할 수 있습니다. 색상 변경은 48pt/dp 최소 터치 영역에 영향을 주지 않습니다.

```tsx
<MoruNativeProvider
  mode="dark"
  accent="#3d42c9"
  tokens={{ radius: 10, space: 4, colors: { background: '#0b0b0b' } }}
>
  {children}
</MoruNativeProvider>
```

## 화면과 입력

```tsx
import { useState } from 'react'
import { router } from 'expo-router'
import {
  AppScreen, NavigationBar, NativeButton, NativeCheckbox,
  NativeRadioGroup, NativeSwitch, TextField,
} from '@moru/native'

export default function NewTask() {
  const [title, setTitle] = useState('')
  const [notify, setNotify] = useState(true)
  const [agree, setAgree] = useState(false)
  const [priority, setPriority] = useState('normal')

  return (
    <AppScreen>
      <NavigationBar title="새 작업" onBack={() => router.back()} />
      <TextField label="작업 이름" value={title} onChangeText={setTitle} placeholder="무엇을 만들까요?" />
      <NativeRadioGroup label="우선순위" value={priority} onValueChange={setPriority}
        items={[{ value: 'normal', label: '보통' }, { value: 'high', label: '높음' }]} />
      <NativeSwitch label="마감 알림" value={notify} onValueChange={setNotify} />
      <NativeCheckbox label="팀에 공유" value={agree} onValueChange={setAgree} />
      <NativeButton disabled={!title.trim()} onPress={() => router.back()}>작업 만들기</NativeButton>
    </AppScreen>
  )
}
```

`AppScreen`은 safe area와 키보드 회피, 스크롤, 고정 하단 영역을 제공합니다. 네이티브 헤더나 탭이 이미 해당 inset을 처리한다면 `edges`를 지정해 중복 여백을 피하세요. 대량 목록을 넣을 때는 `scroll={false}`를 사용하고 자식에 `FlatList`/`SectionList`를 넣습니다. 수직 `ScrollView` 안에 같은 방향의 가상화 목록을 중첩하지 않습니다.

새로고침은 `onRefresh`와 `refreshing`을 함께 제어합니다. 모듈은 실제 요청을 보내지 않으며 비동기 데이터 상태는 앱이 소유합니다.

## 카드와 목록

```tsx
import { useState } from 'react'
import { Amount, AppScreen, ListRow, ListSection, MetricCard } from '@moru/native'

export default function Overview() {
  const [hidden, setHidden] = useState(false)
  return (
    <AppScreen>
      <Amount value={6590} currency="USD" hidden={hidden}
        onToggleVisibility={() => setHidden((current) => !current)} />
      <MetricCard label="이번 달 지출" value="$2,420" caption="예제 데이터" />
      <ListSection title="최근 활동">
        <ListRow title="프로젝트 구독" subtitle="오늘 · 결제 완료" trailing="$15.49" />
        <ListRow title="인터넷 요금" subtitle="어제" trailing="$55.00" showSeparator={false} />
      </ListSection>
    </AppScreen>
  )
}
```

`Amount`의 `hidden`은 화면과 접근성 이름에서 금액을 숨깁니다. 금액 마스킹은 인증·저장소 암호화 기능이 아닙니다. 실제 결제·송금·구독 시스템은 이 UI 패키지에 포함되지 않습니다.

## 내보내는 컴포넌트

| 묶음 | 이름 |
| --- | --- |
| 화면·탐색 | `AppScreen`, `NavigationBar`, `BottomTabBar` |
| 동작·입력 | `NativeButton`, `IconButton`, `TextField`, `SegmentedControl`, `NativeSwitch`, `NativeStepper`, `NativeCheckbox`, `NativeRadioGroup` |
| 목록·수치 | `ListSection`, `ListRow`, `MetricCard`, `Amount` |
| 모바일 패턴 | `BottomSheet`, `SwipeableRow`, `DateStrip`, `ActivityCalendar`, `ProgressRing`, `CardStack`, `AvatarGroup`, `ActionGrid`, `PageControl`, `MobileSearchField`, `NativeActionSheet` |
| 네이티브 차트 | `NativeChart` — 막대·선·영역·도넛, `NativeSparkline` |
| Expo 연결 엔트리 | `NativePicker`, `NativeSlider`, `NativeDatePicker` — `@moru/native/expo` |

컴포넌트의 `*Props` 타입도 함께 내보냅니다. `useMoruNativeTheme()`은 현재 `mode`, `colors`, `space`, `radius`, `minTouchSize`를 제공합니다.

`BottomTabBar`는 `standard`, `floating`, `pill` 변형과 `onCreate` 중앙 동작을 지원합니다. `items`의 `icon`은 앱이 제공하는 React Native 노드이므로, 선택 상태에 맞는 아이콘 색도 앱에서 지정합니다. 화면별 전환·히스토리·뒤로가기 제스처는 Expo Router가 담당하도록 연결하세요.

`ActivityCalendar`의 `month`는 **1~12**입니다. `activities`는 `YYYY-MM-DD` → 횟수 형태이고, `DateStrip`은 명시적인 날짜 목록을 받습니다. `ProgressRing`에는 `value`와 `max`를 전달합니다. `NativeActionSheet`는 현재 맞춤 `BottomSheet` 기반이며 iOS의 시스템 확인 대화상자와 동일한 구현은 아닙니다.

## 운영 기준과 검증

- 기본 조작 영역은 48pt/dp이며, 시스템 글꼴과 텍스트 확대를 사용합니다. 큰 글씨·스크린 리더·제스처 충돌은 기기 검증이 필요합니다.
- 웹 CSS 변수·웹폰트 이름·unitless 줄높이를 그대로 넘길 수 없습니다. 네이티브 숫자·HEX·등록된 폰트 이름으로 매핑해야 합니다.
- React Native SVG가 `ProgressRing`, `NativeChart`, `NativeSparkline`을 그립니다. `NativeChart`의 `data`는 `{ id, label, value }[]`이며, 도넛은 양수 값만 비중으로 표시합니다. 각 값은 펼쳐 읽는 목록으로도 제공합니다. `NativeSparkline`은 `values: number[]`와 `label`을 받고 시작·마지막 값의 접근성 요약을 제공합니다. 웹 Recharts를 네이티브 차트 구현으로 취급하지 않습니다.
- 코어는 RN 0.88 실제 타입을 사용한 strict TypeScript 검사를 통과했습니다. Expo 전체 타입·iOS/Android 번들과 실제 실행 결과는 예제 앱의 검증 기록에서 별도로 확인합니다.

전체 참고 이미지 분석과 남은 범위는 [모바일 커버리지 검토](../../docs/mobile-audit.md)에 정리했습니다. 네이티브 컨트롤의 플랫폼 경계는 [Expo UI Universal](https://docs.expo.dev/versions/v58.0.0/sdk/ui/universal/)과 [Host](https://docs.expo.dev/versions/v58.0.0/sdk/ui/universal/host/) 문서를 기준으로 합니다.

## 웹·네이티브 공통 토큰 계약

웹의 네이티브 토큰 내보내기는 `schemaVersion: 2`입니다. 기존 `mode`, `tokens.space`, `tokens.radius`, `tokens.colors` 사용법을 유지하며 다음 규격을 함께 전달합니다.

- `tokens.density`와 `tokens.metrics`: 세 가지 밀도와 S/M/L 컨트롤 높이·좌우 여백·아이콘 크기, 필드·폼·섹션 간격, 카드 안쪽 여백
- `tokens.typography`: `display`, `heading`, `body`, `label`, `caption`, `code` 역할의 `fontSize`, `lineHeight`, `fontWeight`, `letterSpacing`
- `tokens.borderWidth`: 공통 테두리 굵기
- `tokens.componentSpacing`: 패딩·마진의 네 방향 숫자값. 웹의 `space` 단위는 현재 밀도의 기본 간격으로 환산합니다. `0`은 유지하고 생략한 방향은 컴포넌트 기본값을 따릅니다.

줄높이는 네이티브가 사용하는 실제 숫자값으로, 자간은 em에서 숫자값으로 변환합니다. 네이티브 지원에 맞춰 굵기는 가장 가까운 100단위로 정리합니다. 작은 밀도나 S 크기를 선택하더라도 조작 영역은 최소 48pt/dp를 유지합니다. `NativeButton`과 `TextField`는 선택적인 `size="sm" | "md" | "lg"`를 받습니다.

| 공통 간격 편집 대상 | 네이티브 대응 |
| --- | --- |
| Button | NativeButton |
| Field / Input / Textarea | TextField 바깥 영역 / 입력 영역 / 여러 줄 입력 |
| Item | ListRow |
| Card | MetricCard·CardStack |
| Switch / Checkbox / Radio Group | NativeSwitch·NativeCheckbox·NativeRadioGroup |
| Toggle Group / Tabs | SegmentedControl·BottomTabBar |
| Calendar | ActivityCalendar |
| Sheet | BottomSheet의 본문 영역 |
| Chart | NativeChart |
| Date Picker | NativeDatePicker의 바깥 입력 영역 |

OS 선택기의 내부 행 높이·바퀴·시스템 날짜 UI는 해당 OS가 담당합니다. 웹과 기기의 외형을 모두 같은 숫자로 강제하지 않습니다. 그림자·모션 및 웹 전용 컴포넌트의 간격은 이 공통 계약에 포함하지 않습니다.

`tokens.webFontFamily`는 브라우저에서만 사용합니다. 해당 브라우저 문서에도 폰트 파일이 로드되어야 합니다. iOS·Android는 기본 시스템 서체를 사용하며, 앱에서 Expo Font 등으로 폰트를 등록한 뒤 `tokens.fontFamily`에 등록 이름을 전달해야 사용자 서체가 적용됩니다. 웹의 CSS 폰트 스택을 기기에 등록된 서체로 취급하지 않습니다.

React Native Web을 통한 브라우저 렌더와 Expo 앱은 같은 코어·패턴·차트 소스를 사용합니다. 안전 영역, 키보드, 스와이프, 시트 드래그의 실제 터치 동작과 화면 읽기는 각각의 OS에서도 확인해야 합니다.
