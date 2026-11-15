# Moru 프로젝트·할 일 앱 템플릿

[미리보기](https://moru-ui-lab.riius.chatgpt.site/#project-template) ·
[소스 ZIP](https://moru-ui-lab.riius.chatgpt.site/downloads/moru-project-starter.zip)

검색 필터와 설정 폼을 실제 프로젝트·할 일 데이터에 연결한 작은 관리 앱입니다.
웹 랩에서는 예제 허브의 **앱 템플릿 실행**으로 열고, 상단에서 Moru UI로 돌아갈 수 있습니다.
ZIP은 Moru 편집기 없이 독립적인 Vite·React·TypeScript 앱으로 실행합니다.

## 실행

Node.js 24 이상과 npm을 사용합니다. ZIP을 풀어 `moru-project-starter` 폴더에서 실행하세요.

```sh
npm ci
npm run dev
```

배포할 정적 파일은 `npm run build`로 만들고 `npm run preview`로 확인합니다.
필요한 Moru UI 소스와 스타일, 라이선스, 최소 의존성 및 잠금 파일을 포함합니다.
차트·데이터 테이블·캐러셀과 전체 Moru 랩은 포함하지 않습니다.

## 확인할 수 있는 흐름

- 프로젝트와 할 일 생성, 상세 보기와 수정, 상태 변경·완료.
- 검색어·상태·내 담당 필터를 조합한 목록과 빈 검색 결과, 필터 초기화.
- 프로젝트와 그에 속한 할 일 연결, 삭제 후 되돌리기.
- 작업 공간 설정 저장·취소와 필드 검증, 라이트·다크 전환.
- 브라우저에 저장한 데이터의 새로고침 후 복원과 좁은 화면의 탐색.

검색은 `SearchFiltersBlock`에 앱의 실제 목록과 제어형 필터를 전달하고,
선택한 항목 ID로 상세 편집을 엽니다. 설정은 `SettingsBlock`의 저장 콜백으로 앱 상태를 갱신합니다.
갤러리용 샘플 데이터를 별도로 보여 주는 화면이 아닙니다.

## 저장과 서비스 연결

데이터와 테마는 이 브라우저의 `localStorage`에 저장합니다. 다른 기기·브라우저·사용자와
동기화하지 않습니다. 저장소를 쓸 수 없으면 화면에 알려 주며 현재 탭의 작업을 유지합니다.
서버 인증, 계정 권한, 팀 공유, 이메일 알림과 서버 동기화는 직접 연결하는 범위입니다.
설정의 공개 범위와 알림은 데이터 예제이며 실제 권한이나 이메일 발송을 실행하지 않습니다.

실제 서비스로 바꿀 때는 데이터 모델의 로드·저장 경계를 API로 교체하고,
프로젝트·할 일 및 설정 저장에 서버 검증과 권한 검사를 함께 적용하세요.
사용자 입력을 HTML로 렌더링하지 않으며 비밀번호·인증 토큰을 브라우저 저장소에 넣지 않습니다.

## 원본과 업데이트

앱 원본은 `src/components/project-template/`, 선택 설치용 UI 원본은 `src/components/ui/`와
`src/components/blocks/`입니다. `registry:build` 후 `project:starter:build`가 ZIP을 만듭니다.
`project:starter:check`는 원본 체크섬과 ZIP이 맞는지 검사합니다. 생성 ZIP은 직접 수정하지 않습니다.

Moru 코드는 [MIT](../LICENSE)이며 제3자 고지는 [NOTICE](../NOTICE.md)를 유지합니다.
블록을 기존 프로젝트에 따로 가져오려면 [레지스트리 가이드](registry.ko.md)를 참고하세요.
