# Moru 모바일 UI 커버리지 검토

검토일: 2026-10-26. 첨부한 13개 이미지를 화면의 구조·입력·탐색·피드백 패턴으로 나누어 검토했습니다. 각 디자인의 브랜드·사진·장식을 복제하는 작업과 구분합니다.

## 판단

첨부 화면에 반복되는 **잔액·통계 카드, 거래 목록, 작업 목록과 편집 시트, 하단 탐색, 기간 선택, 활동 달력**은 React Native와 Expo로 구성할 수 있습니다. 현재 Moru 웹의 66개 컴포넌트는 해당 화면을 설계하는 재료가 되지만, DOM·CSS·Base UI를 사용하므로 Expo 네이티브 화면에 그대로 import할 수 없습니다.

Moru는 하나의 디자인 기준을 공유하고 실행 환경에 맞는 렌더러를 사용합니다. 일반 웹·모바일 웹은 기존 DOM·Base UI 컴포넌트를 사용하며, `packages/moru-native`의 React Native 컴포넌트는 Expo 앱과 React Native Web에서 같은 소스로 실행합니다. 공통으로 관리할 것은 역할·상태·간격·색·타이포그래피 규격이며, OS 탐색·키보드·권한·기기 기능은 플랫폼에 맞게 처리합니다.

기존 모바일 UI 랩의 폰 안쪽은 별도로 작성한 HTML/CSS 데모였고, Moru Native 소스를 직접 실행하지 않았습니다. 이번 연결은 실제 Expo 예제 앱을 웹으로 빌드해 랩 안에서 실행하는 방식입니다. 폰 테두리는 표현용 목업이며, 안쪽의 버튼·입력·카드·차트 등은 앱에서 import하는 Moru Native 소스입니다. 같은 출처의 메시지 통신으로 편집한 테마를 전달하며, 웹에서 실행된다는 사실은 OS 런타임·접근성·제스처 검증 완료를 의미하지 않습니다. [Expo 웹과 코드 공유](https://docs.expo.dev/workflow/web/), [React Native Web](https://necolas.github.io/react-native-web/docs/)

## 이미지별 패턴

파일명은 첨부 순서입니다. 원본 JPG는 공개 사이트 자산으로 복사하지 않으며, 아래 표는 화면에서 보이는 패턴의 분석입니다.

| 참고 파일 | 반복되는 구성 | Moru Native에서 구성할 재료 | 남는 특수 요소 |
| --- | --- | --- | --- |
| `31a00358cdee197ec47a293508408beb.jpg` | 활동 달력, 주간 기록, 연속 달성 표시 | `ActivityCalendar`, `MetricCard`, `ProgressRing`, `ListSection` | 종목별 아이콘·불꽃 형태와 활동 데이터 모델 |
| `a4ff93aeae185bc94438da51c048a010.jpg` | 지갑 요약, 교환 입력, 목표 진행, 하단 탐색 | `Amount`, `CardStack`, `TextField`, `ActionGrid`, `BottomTabBar` | 교환·송금 서비스 연결, 실시간 가격·시간 상태 |
| `410f200df21746e910050302829dafec.jpg` | 표준·플로팅·필·중앙 동작 형태의 탭 바 | `BottomTabBar`의 `standard`·`floating`·`pill`, 중앙 생성 동작 | 실제 유리 효과·복잡한 곡면·플랫폼 기본 탭 바의 차이 |
| `792065f9dea86f9ece9dee9a40766c4f.jpg` | 브랜드 탭 바, 선택 강조, 알림 점 | `BottomTabBar`, `IconButton`, 배지와 선택 상태 | 로고 자산·곡선 경로·정교한 모핑 애니메이션 |
| `bc22ca4238e328c23ff4bf5207bdb84a.jpg` | 날짜 스트립, 작업 카드, 참여자, 작업 작성 시트 | `DateStrip`, `MetricCard`, `AvatarGroup`, `TextField`, `BottomSheet` | 작업 도메인 모델·첨부 파일 선택·협업 저장 |
| `2c329db412d61673efa8175a40ea68a1.jpg` | 대형 요약 표면, 동작 격자, 목표별 진행, 지출 차트 | `Amount`, `ActionGrid`, `MetricCard`, `ProgressRing`, `NativeChart`, `ListSection` | 그라디언트·재무 집계 모델 |
| `90bab2845435a90b2ddbfc899d83ec47.jpg` | 잔액 숨기기, 자산 카드 스택, 거래 목록, 플로팅 탐색 | `Amount`, `CardStack`, `ListRow`, `BottomTabBar` | 네트워크·거래·가격 데이터, 자산별 아이콘 |
| `b5678bd7c67a5b230535fc225cf18ca2-1.jpg` | 헤더, 내려받기·올리기 통계, 기간 선택, 이력 | `NavigationBar`, `MetricCard`, `SegmentedControl`, `ListRow` | 구체 아이콘·사용량 시계열·헤더 장식 |
| `5477f2eb8377667dbca62b9f4434ed54.jpg` | 라이트·다크 대응, 중첩 카드, 빠른 동작, 지출 목록 | `MoruNativeProvider`, `CardStack`, `ActionGrid`, `ListSection`, `BottomTabBar` | 카드의 맞물리는 외곽선·브랜드별 결제 정보 |
| `07e2504db2c98ed56d9b9d06b602feb3.jpg` | 지출 구성·잔액·거래·카드 선택을 조합한 화면들 | `MetricCard`, `ListRow`, `CardStack`, `SegmentedControl`, `PageControl`, `NativeChart` | 다중 계열 차트·3D 장식·뉴모피즘 깊이 |
| `2d9a770d9582fffd86a5d174d166fb5e.jpg` | 큰 지표, 비대칭 통계 격자, 상태 태그 | `MetricCard`, React Native `View`의 Flex 레이아웃 | 데이터별 격자 조합·서체 크기와 장식의 개별 아트 디렉션 |
| `d98ae0d2207f211773e6e69e3e852d02.jpg` | 잔액 히어로, 빠른 동작, 자산 행, 작은 추이 그래프 | `Amount`, `ActionGrid`, `ListSection`, `ListRow`, `BottomTabBar`, `NativeSparkline` | 가격 데이터·맞춤 상단 곡면 |
| `8676f958b71d8ec17b007cd0ebb0e61b.jpg` | 잔액·요약 수치, 안내 카드, 가로 목록, 활동 행 | `Amount`, `MetricCard`, `ListRow`, `PageControl`, 네이티브 `ScrollView` | 구독·갱신 일정 모델·앱 아이콘·푸시 권한 |

장식의 모양이 달라도 대부분 같은 구조를 재사용합니다. 화면 전체를 특수 컴포넌트 하나로 만들기보다, 카드·행·동작·탐색을 조합하는 편이 다른 앱에도 재사용하기 좋습니다.

## 이번 네이티브 구현 범위

`@moru/native`의 첫 구현 묶음은 **코어 15종, 모바일 패턴 11종, 차트 2종, 시스템 컨트롤 3종으로 총 31종**입니다. 이는 SwiftUI 전체 API의 완전한 대체를 뜻하지 않습니다.

| 층 | 구현 |
| --- | --- |
| 화면·탐색 | `AppScreen`, `NavigationBar`, `BottomTabBar` |
| 기본 동작·입력 | `NativeButton`, `IconButton`, `TextField`, `SegmentedControl`, `NativeSwitch`, `NativeStepper`, `NativeCheckbox`, `NativeRadioGroup` |
| 목록·수치 | `ListSection`, `ListRow`, `MetricCard`, `Amount` |
| 모바일 패턴 | `BottomSheet`, `SwipeableRow`, `DateStrip`, `ActivityCalendar`, `ProgressRing`, `CardStack`, `AvatarGroup`, `ActionGrid`, `PageControl`, `MobileSearchField`, `NativeActionSheet` |

차트는 `NativeChart`의 막대·선·영역·도넛 4개 변형과 `NativeSparkline`을 제공합니다. `NativeChart`는 네이티브 SVG와 전체 값을 펼쳐 읽는 목록을 함께 제공합니다. `NativeSparkline`은 작은 추이와 시작·마지막 값의 접근성 요약을 제공합니다.

날짜·휠/메뉴 선택·슬라이더는 별도 `@moru/native/expo` 엔트리의 `NativeDatePicker`·`NativePicker`·`NativeSlider`로 연결합니다. 현재 설치본의 Universal Picker·Slider에는 웹 렌더러도 있으며 같은 API를 공유합니다. DatePicker의 community 웹 구현은 날짜 패널을 렌더링하지 않아 명시적인 브라우저 대체가 필요합니다. 웹의 선택기는 iOS·Android OS 패널과 동일한 외형·상호작용을 보장하지 않습니다. Expo UI Universal은 Android·iOS·웹을 지원하고 SwiftUI 전용 API는 Apple 플랫폼 전용입니다. [Expo UI SDK 58](https://docs.expo.dev/versions/v58.0.0/sdk/ui/), [Universal API](https://docs.expo.dev/versions/v58.0.0/sdk/ui/universal/)

## SwiftUI 개념과 대응

| SwiftUI 개념 | Expo / Moru 대응 | 구분 |
| --- | --- | --- |
| `NavigationStack`, 화면 push/pop | Expo Router `Stack`, 화면별 `NavigationBar` | 네이티브 스택 동작은 라우터가 소유 |
| `TabView` | Moru `BottomTabBar`, 또는 Expo Router `NativeTabs` | 맞춤 탭과 OS 탭을 구분. NativeTabs의 웹 렌더러는 기기 OS 탭 바의 실물 검증이 아님 |
| `Form`, `Section`, `List` | `ListSection`, `ListRow`, 입력 컴포넌트 | 대량 목록은 `FlatList`/`SectionList`로 가상화 |
| `Button`, `Toggle`, `TextField`, `SecureField`, `Stepper` | 해당 `Native*`, `TextField`의 `secureTextEntry` | DOM 입력이 아닌 React Native 뷰·컨트롤 |
| `Picker`, `Slider`, `DatePicker` | `@moru/native/expo` 어댑터 | 실제 OS 선택기를 노출하는 층 |
| `.sheet`, presentation detents | `BottomSheet` | 높이 단계·닫기·드래그를 구현한 맞춤 시트 |
| `.swipeActions` | `SwipeableRow` | 가로 제스처와 명시적인 작업 열기 버튼 |
| confirmation dialog | `NativeActionSheet` | 현재는 맞춤 시트 기반이며 OS 확인 대화상자와 동일 구현이 아님 |
| Swift Charts의 기본 차트 | `NativeChart`, `NativeSparkline` | 단일 계열 4종·작은 추이와 데이터 목록, Swift Charts 전체 API 대체 아님 |
| `Gauge`, 원형 `ProgressView` | `ProgressRing` | SVG로 진행 수치와 접근성 값을 함께 제공 |
| `LazyVStack`, 큰 스크롤 목록 | `FlatList`/`SectionList` | 일반 `ScrollView`와 역할을 구분 |
| safe area, keyboard avoidance | `AppScreen`, `SafeAreaProvider`, `KeyboardAvoidingView` | Expo Router 웹의 inset hook은 0을 반환. 기기 노치·홈 인디케이터·키보드는 별도 확인 |
| `.refreshable` | `AppScreen`의 `onRefresh`/`refreshing`, `FlatList`의 RefreshControl | 로딩 상태는 호출 앱이 관리 |

Expo Router의 스택·탭은 [레이아웃 문서](https://docs.expo.dev/router/basics/navigation-layouts/)를, 네이티브 탭의 SDK별 차이는 [Native tabs 문서](https://docs.expo.dev/router/advanced/native-tabs/)를 기준으로 확인합니다. 긴 목록은 [React Native FlatList](https://reactnative.dev/docs/flatlist) 가상화와 페이지 로딩을 앱에 맞게 구성해야 합니다.

## 모바일 전용과 플랫폼 차이

기기 기능을 모두 “모바일 전용 컴포넌트”로 묶으면 실제 지원 범위를 오해하기 쉽습니다. 아래는 **플랫폼 API의 지원 범위**와 **Moru에 현재 연결된 구현**을 분리한 검토입니다. “구현 있음”도 실기기 품질 검증 통과를 뜻하지 않습니다. UI 데이터는 `src/components/mobile/mobile-coverage.ts`의 `nativePlatformCapabilities`에서 관리합니다.

| 기능 | 브라우저 | iOS·Android | Moru 현재 상태 |
| --- | --- | --- | --- |
| 버튼·입력·목록·카드·차트 | 같은 Moru Native 소스를 RN Web으로 실행 | React Native 뷰·컨트롤 | 공통 구현 있음 |
| 스와이프 행·하단 시트 | 같은 소스와 작업 버튼, 드래그를 확인 | 터치·시트 높이·목록 제스처 | 구현 있음, 제스처 충돌은 기기 확인 |
| OS 탭 바·뒤로 제스처 | NativeTabs의 웹 렌더러·브라우저 탐색 | 실제 OS 탭 바·스택 뒤로가기 | 구현 있음, OS 동작은 기기 확인 |
| 안전 영역·키보드 회피 | CSS·브라우저 환경 차이, 폰 외곽은 목업 | 노치·홈 인디케이터·소프트 키보드 | AppScreen·BottomSheet 구현 있음, 기기 확인 |
| Picker·Slider·날짜 | Universal 웹 렌더러·날짜 대체 | SwiftUI·Compose 계열 시스템 컨트롤 | 구현 있음, 실제 OS 패널은 기기 확인 |
| OS 메뉴·컨텍스트 메뉴 | 웹 메뉴 구성 가능 | 플랫폼 메뉴·길게 누르기 메뉴 | 모바일 공통 어댑터 미연결 |
| 사진 선택·카메라 | 지원 브라우저에서 사용자 동작·권한·보안 환경 필요 | 시스템 사진·카메라 UI와 권한 | 기기 API 미연결 |
| 문서 선택 | 브라우저 파일 선택 | 시스템 문서 선택기 | 실제 파일 선택·보관 미연결 |
| 공유 시트 | Web Share 지원 여부·HTTPS·파일 URI 제한 | 다른 앱으로 시스템 공유 | 미연결 |
| 햅틱·진동 | 지원 브라우저·진동 하드웨어에서 조건부 가능 | Taptic Engine·Android 진동 효과 | 미연결 |
| 로컬·푸시 알림 | 별도 웹 알림·웹 푸시 설계 | Expo Notifications·권한·채널·토큰 | OS 알림 미연결 |
| 지도·위치 화면 | 웹 지도 SDK·브라우저 위치 권한 | Expo Maps의 플랫폼 지도 | 미연결 |
| 생체 인증 | Expo LocalAuthentication 미지원, 웹 인증은 별도 설계 | OS 생체 인증 결과 사용 | 미연결 |

공식 기준: [Native tabs](https://docs.expo.dev/router/advanced/native-tabs/), [안전 영역](https://docs.expo.dev/versions/v58.0.0/sdk/safe-area-context/), [ImagePicker](https://docs.expo.dev/versions/v58.0.0/sdk/imagepicker/), [Camera](https://docs.expo.dev/versions/v58.0.0/sdk/camera/), [DocumentPicker](https://docs.expo.dev/versions/v58.0.0/sdk/document-picker/), [Sharing](https://docs.expo.dev/versions/v58.0.0/sdk/sharing/), [Haptics](https://docs.expo.dev/versions/v58.0.0/sdk/haptics/), [Notifications](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/), [Maps](https://docs.expo.dev/versions/v58.0.0/sdk/maps/), [LocalAuthentication](https://docs.expo.dev/versions/v58.0.0/sdk/local-authentication/).

## 실제 예제와 소스 대응

`nativeComponentSources`는 31개 공개 컴포넌트의 소스 위치·예제 사용 위치·브라우저 구현 종류를 연결합니다. 컴포넌트 수와 한 예제에서 실행하는 컴포넌트 수는 다릅니다. Expo UI Picker·Slider는 같은 Universal API의 웹 구현을 사용하고, 날짜 선택은 브라우저용 대체를 명시합니다.

| 예제 | 주요 실제 컴포넌트 | 소스 |
| --- | --- | --- |
| 지갑 | Amount, CardStack, ActionGrid, ListRow, SwipeableRow, MobileSearchField, NativeSparkline, BottomSheet | `apps/moru-expo/src/components/NativeLabHome.tsx` |
| 작업 | DateStrip, SegmentedControl, NativeCheckbox, AvatarGroup, ListRow, TextField, BottomSheet | 같은 NativeLabHome와 `src/app/task/[id].tsx` |
| 활동 | ProgressRing, ActivityCalendar, MetricCard, NativeChart | 같은 NativeLabHome |
| 시스템 입력 비교 | NativePicker, NativeSlider, NativeDatePicker, NativeSwitch, NativeStepper, NativeRadioGroup, NativeActionSheet | `apps/moru-expo/src/app/controls.tsx` 및 웹 대체 구현 |
| OS 탭 비교 | Expo Router NativeTabs, ListSection, ListRow | `apps/moru-expo/src/app/system-tabs/_layout.tsx`, `src/components/SystemTabScreen.tsx` |

브라우저와 앱은 일반 컴포넌트 소스를 공유하지만 OS가 그리는 화면까지 같은 픽셀로 재현하지는 않습니다. 각 플랫폼의 차이는 랩의 지원 범위 표와 기기 검증 항목에서 확인합니다.

## 계속 보완할 부분

1. **시스템 연결:** 지도, 사진·카메라·문서 선택, 공유, 권한, 알림, 햅틱은 각각 Expo/플랫폼 모듈로 연결해야 합니다. 현재 UI의 가상 데이터나 버튼은 금융·송금·구독 서비스를 실행하지 않습니다.
2. **플랫폼 외형:** Liquid Glass/블러, 시스템 컨텍스트 메뉴, 네이티브 툴바, 고급 날짜·시간 선택의 지역별 동작은 OS별 어댑터와 대체 표현이 필요합니다. CSS 블러를 그대로 옮기는 방식으로 처리하지 않습니다.
3. **고급 데이터 표현:** 웹 Recharts·DOM 표를 React Native에서 재사용할 수 없습니다. 이번에는 단일 계열 막대·선·영역·도넛·스파크라인을 네이티브 SVG와 값 목록으로 보완했습니다. 다중 계열·확대·팬·드릴다운 등 고급 분석 상호작용은 추가 구현이 필요합니다.
4. **서체·토큰 연결:** 웹의 CSS 변수·폰트 스택·unitless 줄높이를 그대로 주입할 수 없습니다. 네이티브는 숫자·HEX·등록된 폰트 이름을 사용하며, 모바일 UI 랩의 “네이티브 토큰 내보내기”는 현재 색상·간격·모서리를 숫자·HEX JSON으로 매핑합니다. 네이티브 서체는 시스템 서체를 사용합니다. Pretendard/Noto Sans를 쓰려면 Expo Font 등록과 역할별 타이포 매핑이 추가로 필요합니다.
5. **기기 품질:** 큰 글씨, VoiceOver/TalkBack, 외부 키보드, RTL, 줄바꿈, 키보드와 시트의 동시 사용, Android 뒤로가기, 제스처 충돌은 실제 기기에서 확인해야 합니다. 기본 조작 영역은 48pt/dp를 목표로 두되 모든 상황의 사용성을 인증한 것은 아닙니다.

## 검증 범위

기준 설치 조합은 Expo `58.0.19`, React Native `0.88.0`, React `19.3.0`, Expo UI `58.0.23`입니다. 웹 라이브러리의 React 버전과 별도의 Expo 앱 의존성으로 관리합니다.

| 검증 | 현재 기록 | 확인하는 것 |
| --- | --- | --- |
| 코어 15종 TypeScript | 실제 RN 0.88 타입을 연결한 strict 검사 통과 | props·스타일·접근성 속성의 타입 연결 |
| 달력·진행·시트·차트 계산 | 순수 함수 테스트 23개 통과 | 날짜 경계·수치 제한·높이 단계 계산 |
| Expo 전체 타입·린트 | `npm run typecheck`, `npm run lint` 통과 | 실제 RN·Expo API와 상태·스타일 타입 연결 |
| Expo 환경 검사 | `npx expo-doctor` 20/20 통과 | 설치 버전·설정·의존성 정합성 |
| iOS/Android 플랫폼 번들 | 공유 토큰·화면 통합 후 `npm run export:native` 통과 | 실제 설치된 패키지와 Metro 의존성 연결 |
| Expo 웹·공유 소스 실행 | Expo 웹 내보내기·체크섬 검사, 작업 추가·Picker·Slider·차트·테마 동기화 확인 | 실제 Expo 소스의 웹 렌더링·토큰 전달·입력·시트·탐색 |
| iOS/Android 실행·접근성·제스처 | 별도 기기 검증 필요 | 화면 렌더·키보드·OS 컨트롤·터치·스크린 리더 |

TypeScript와 JavaScript 번들 성공은 OS 런타임 검증을 대신하지 않습니다. 검증 단계가 늘어날 때 실제 실행 명령과 플랫폼 결과를 이 기록에 추가합니다.

## 확인과 시작

웹의 `#mobile`에서 실제 Expo 소스를 웹으로 실행한 지갑·작업·활동 조합, 사용한 컴포넌트와 플랫폼 지원 범위를 확인합니다. “Expo 시작”에서 전체 스타터 소스 ZIP과 현재 네이티브 테마 JSON을 내려받습니다. ZIP을 풀어 폴더 구조를 유지하고 `apps/moru-expo`에서 `npm install` 후 `npx expo start`를 실행합니다. 개발 빌드는 같은 폴더에서 `npm run ios` 또는 `npm run android`를 사용합니다.

예제 앱은 Expo Router의 네이티브 Stack과 시스템 NativeTabs를 모두 포함합니다. 거래·작업은 예제용 메모리 데이터이며 종료 시 초기화됩니다. 서비스 연결이나 금융 거래를 수행하지 않습니다.
