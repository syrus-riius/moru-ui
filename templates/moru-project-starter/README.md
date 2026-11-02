# Moru Project Starter

검색 필터·설정 블록과 실제 Moru 컴포넌트를 조합한 독립 React 프로젝트 관리 앱입니다.
Moru 랩의 시연 화면과 같은 앱·데이터 모델 소스를 사용합니다.

## 실행

Node.js 24 이상에서 ZIP을 풀고 `moru-project-starter` 폴더로 이동하세요.

```sh
npm ci
npm run dev
```

Vite가 안내하는 로컬 주소를 엽니다. 배포용 정적 파일은 다음 명령으로 만듭니다.

```sh
npm run build
npm run preview
```

`dist/`를 정적 호스팅에 배포할 수 있습니다. Moru 랩 편집기나 별도 설치 서버는 필요하지 않습니다.
이 프로젝트는 React·TypeScript·Vite를 사용하며 npm에 게시된 Moru 패키지는 아닙니다.

## 수정할 파일

- `src/components/project-template/ProjectTasksApp.tsx`: 실제 화면과 컴포넌트 조합.
- `src/components/project-template/project-model.ts`: 프로젝트·작업·설정의 로컬 상태 모델.
- `src/components/project-template/project-template.css`: 앱 레이아웃·반응형 스타일.
- `src/components/ui/moru/`: 이 앱이 사용하는 Moru 레지스트리 소스와 공통 스타일.
- `moru-source.json`: 원본·레지스트리 버전과 체크섬, ZIP에 포함한 파일 목록.

`@/`는 `src/`를 가리킵니다. Vite와 TypeScript 설정에 같은 별칭이 지정돼 있습니다.
Moru 스타일 import와 `MoruProvider` 연결은 앱 소스에서 한 번 처리합니다.
라이트·다크 모드를 앱에서 조절하며 호스트의 `:root` 테마 토큰을 수정하지 않습니다.

## 서비스 연결

이 앱은 샘플 데이터를 사용하는 로컬 프로토타입입니다. 인증·팀 서버·실제 동기화는 포함하지 않습니다.
사용자의 영구 데이터는 앱의 상태·저장 로직을 확인한 뒤 백엔드에 연결하세요.
UI 블록의 변경·저장 핸들러에서 실제 서비스 요청을 연결할 수 있습니다.
브라우저 데이터 초기화 시 로컬 데이터가 사라질 수 있으므로 운영 데이터 저장소로 사용하지 마세요.

## 의존성과 지원 범위

실행 의존성은 React·React DOM·Base UI·Lucide 네 종류입니다.
개발 의존성은 Vite·Vite React 플러그인·TypeScript와 React·React DOM·Node 타입 여섯 종류입니다.
차트·표·캐러셀·웹폰트 패키지는 포함하지 않습니다. 필요한 컴포넌트 소스와 그 의존성만 가져옵니다.
공통 Moru CSS에는 여러 컴포넌트의 규칙이 함께 들어 있습니다.
기본 레이아웃 보완 CSS를 포함하므로 이 스타터는 Tailwind 설치가 필수가 아닙니다.

Vite 기반 웹 앱을 대상으로 합니다. Next.js SSR과 React Native·Expo 지원을 약속하지 않습니다.
설치된 컴포넌트 파일을 직접 수정할 수 있으며, 업데이트 시 변경 내용을 비교해서 반영하세요.

## 라이선스와 출처

Moru 원본 소스는 MIT 라이선스입니다. 재배포할 때 루트 `LICENSE`와 `NOTICE.md`,
`src/components/ui/moru/_licenses/`의 고지를 유지하세요. 제3자 패키지는 각 패키지의 고유 조건을 따릅니다.

- 프로젝트: https://github.com/syrus-riius/moru-ui
- Moru UI: https://moru-ui-lab.riius.chatgpt.site/
- 선택 설치 안내: https://github.com/syrus-riius/moru-ui/blob/main/docs/registry.ko.md
