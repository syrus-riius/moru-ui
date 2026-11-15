# Moru Native Starter

Moru의 React Native 컴포넌트와 Expo 예제 앱을 함께 제공하는 소스 스타터입니다.
웹의 DOM·CSS·Base UI 컴포넌트와 분리된 구현이며, 공개 npm 패키지를 설치하는 방식이 아닙니다.

## 실행

Node.js 24 이상과 npm을 사용합니다. 압축을 푼 뒤 `apps/`와 `packages/`의 상대 위치를 유지하세요.

```sh
cd apps/moru-expo
npm ci
npm start
```

앱은 `file:../../packages/moru-native`로 재사용 패키지를 연결합니다. `.npmrc`의
`install-links=true`가 패키지를 앱에 복사하므로 패키지 소스를 수정한 뒤에는 설치본도 갱신해야 합니다.
별도의 React를 `packages/moru-native` 안에 설치하지 마세요.

기준 조합은 Expo SDK 58, React Native 0.88, React 19.3입니다. 필요한 네이티브 모듈의
Expo Go 지원 여부는 [Expo UI SDK 58 문서](https://docs.expo.dev/versions/v58.0.0/sdk/ui/)에서 확인하세요.
개발 빌드는 해당 플랫폼의 개발 환경을 준비한 뒤 아래 명령으로 실행합니다.

```sh
npm run ios
# 또는
npm run android
```

웹에서 예제 흐름만 먼저 보려면 `npm run web`을 사용하세요. 브라우저 미리보기로
OS 컨트롤의 실제 모양·터치·키보드·VoiceOver/TalkBack 동작을 검증할 수는 없습니다.

## 포함한 소스

- `apps/moru-expo/`: 지갑·작업·활동·상세·시스템 컨트롤·탭을 조합한 Expo 앱.
- `packages/moru-native/`: 코어·모바일 패턴·차트·선택적 Expo UI 연결을 제공하는 로컬 패키지.
- `docs/mobile-audit.md`: 웹·Native 구현 범위와 검증 이력.
- `moru-source.json`: 소스 체크섬과 이 ZIP에 포함한 파일 목록.
- `LICENSE`, `NOTICE.md`: Moru의 MIT 라이선스와 제3자 고지.

컴포넌트별 사용법은 `packages/moru-native/README.md`, 앱 설명은 `apps/moru-expo/README.md`를 보세요.
전체 Moru 웹 편집기, 시뮬레이터, 의존성의 `node_modules`, 기기 빌드 및 서명 파일은 포함하지 않습니다.
이 스타터만 내려받은 경우 웹 랩용 `mobile:build` 명령은 사용하지 않습니다.

## 확인

`apps/moru-expo`에서 다음을 실행합니다.

```sh
npm run typecheck
npm run lint
npm run export:native
```

화면의 데이터는 로컬 예제이며 서버 인증·저장·결제·파일 업로드는 연결하지 않았습니다.
앱에 필요한 서비스와 오류 처리는 직접 연결하세요. 실제 기기의 실행·접근성 검증은 별도로 진행해야 합니다.

## 라이선스

Moru 자체 코드는 루트 `LICENSE`의 MIT 조건으로 사용·수정·재배포할 수 있습니다.
저작권·라이선스 고지를 유지하세요. `private: true`는 npm으로의 실수 게시를 막는 설정입니다.
Expo에서 가져온 원본 고지인 `apps/moru-expo/LICENSE`는 그대로 유지하며,
제3자 라이브러리·아이콘·글꼴의 조건은 `NOTICE.md`와 각 의존성의 라이선스를 따릅니다.
