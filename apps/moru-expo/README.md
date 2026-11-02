# Moru Native Lab

Moru의 모바일 컴포넌트 31종을 실제 React Native 화면으로 조합한 Expo SDK 58 예제입니다. 지갑·작업·활동과 상세 화면, 시스템 입력 컨트롤, 네이티브 탭을 포함합니다. 예제 데이터는 메모리에만 보관합니다.

## 시작

압축을 푼 경우 `apps/moru-expo`와 `packages/moru-native`의 상대 경로를 유지하세요.

```sh
cd apps/moru-expo
npm install
npx expo start
```

Node.js 24와 npm 기준입니다. 네이티브 모듈이 포함된 개발 빌드가 필요하면 Xcode 또는 Android 개발 환경을 준비하고 다음을 실행합니다.

```sh
npm run ios
# 또는
npm run android
```

Expo Go에 포함되는 네이티브 모듈은 SDK별로 다르므로 [Expo UI SDK 58](https://docs.expo.dev/versions/v58.0.0/sdk/ui/)의 지원 범위를 확인하세요. OS 컨트롤 확인은 iOS/Android에서 진행합니다.

## 화면

- 지갑: 잔액 숨기기, 카드 스택, 빠른 동작, 작은 추이, 검색·거래 상세·추가·스와이프 행, 당겨서 새로고침
- 작업: 날짜 선택, 전체·진행·완료 필터, 체크박스, 작성 시트, 네이티브 스택 상세 수정
- 활동: 월 달력, 날짜별 기록, 진행 링, 막대·선·영역·도넛 네이티브 차트와 값 목록
- 입력 컨트롤: 실제 시스템 Picker·Slider·DatePicker·Switch와 Moru 맞춤 Stepper·Radio·ActionSheet 비교
- 시스템 탭: Expo Router NativeTabs로 OS 탭 바 확인

헤더에서 라이트·다크를 전환합니다. 맞춤 하단 탐색은 기본·플로팅·필 강조를 선택할 수 있습니다.

## 테마

웹 `#mobile` → “Expo 시작” → 네이티브 토큰 내보내기에서 JSON을 받습니다. 루트 레이아웃의 `MoruNativeProvider`에 `mode={theme.mode}`와 `tokens={theme.tokens}`를 전달하세요. schema 2의 색·간격·모서리·테두리·밀도·S/M/L·역할별 타이포그래피와 대응 요소의 공통 패딩·마진을 공유합니다. 앱의 기본 글꼴은 시스템 서체이며 사용자 글꼴은 Expo Font 등록 후 tokens.fontFamily에 등록 이름을 지정합니다. tokens.webFontFamily는 브라우저에서만 사용합니다.

## 검증

```sh
npm run typecheck
npm run lint
npx expo-doctor
npm run export:native
```

Expo 58.0.19 / React 19.3.0 / RN 0.88.0 / Expo UI 58.0.23로 타입·린트·iOS/Android Hermes 번들 생성, Expo Doctor 20/20이 통과했습니다. 실제 OS 실행·터치·키보드·VoiceOver/TalkBack 검증은 아직 별도입니다.

`@moru/native`는 npm 공개 패키지가 아니라 `file:../../packages/moru-native` 로컬 소스입니다. `.npmrc`의 `install-links=true`가 앱 내부로 복사 설치합니다. 패키지를 수정하면 설치본을 다시 갱신하세요. 루트 웹의 node_modules와 혼합하지 않습니다.

## Moru 웹 랩과 같은 소스

Moru 웹의 모바일 UI 랩은 이 앱을 Expo Web으로 내보내 iframe에서 실행합니다. `NativeLabHome`와 `@moru/native` 구현을 그대로 공유하며, 브라우저용 날짜 입력만 `BrowserDatePicker`라는 대체 구현을 명시합니다. Picker·Slider·NativeTabs는 설치된 Expo의 웹 구현을 사용합니다. OS 탭 바의 모양이나 기기 키보드·터치·권한을 브라우저에서 검증한 것으로 취급하지 않습니다.

`_layout.web.tsx`와 `web/useNativePreviewBridge.ts`는 랩에 임베드됐을 때 같은 출처의 부모 창에서만 토큰·화면 설정을 받고 상태를 돌려줍니다. 일반 앱과 독립 웹 실행에서는 로컬 상태를 사용합니다. `app.config.js`의 `/native-preview` 경로는 MORU_WEB_PREVIEW=1 내보내기에만 적용합니다.

전체 Moru 저장소에서 앱 의존성을 설치한 뒤 루트의 `npm run mobile:build`로 공개 웹 미리보기를 재생성합니다. 스타터 ZIP에는 Expo 앱과 재사용 패키지를 포함하며 Moru 웹 편집기 전체는 포함하지 않습니다.
