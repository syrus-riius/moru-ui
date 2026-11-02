# Moru UI

Moru 자체 소스는 저장소 루트의 [MIT 라이선스](../LICENSE)를 따릅니다. 외부 패키지·글꼴·브랜드 자산의 고지는 [NOTICE](../NOTICE.md)를 확인하세요. 현재 배포 방식은 소스 스타터이며 npm 패키지와 선택 설치 레지스트리는 아직 제공하지 않습니다.

React + TypeScript + Base UI + Tailwind CSS로 만든 UI 라이브러리 시작점입니다. 75개 컴포넌트 갤러리, 상태 메시지, 역할별 타이포그래피, 공통 크기·밀도 규칙, 상태 비교 화면, 디자인 토큰 편집기와 예제 화면을 포함합니다. 소스를 직접 가져와 수정하는 구조이며 npm에 게시된 패키지는 아닙니다.

2026년 10월 25일 확인한 [shadcn/ui 일반 컴포넌트 목록](https://ui.shadcn.com/docs/components)의 66개 항목을 기반으로 실무 입력과 날짜·시간 컴포넌트를 확장했습니다. 현재 갤러리는 75종이며 최근 추가 필터에서는 42종을 보여 줍니다. 공식 AI Elements의 별도 목록 확장은 이번 범위에 포함하지 않습니다. 각 컴포넌트는 Moru의 공개 API와 토큰을 기준으로 구현했습니다.

## 브랜드

**단단한 기본, 당신만의 UI.**  
A solid foundation. Made yours.

모루는 만드는 사람의 손을 받쳐 주는 기반입니다. Moru UI는 컴포넌트와 디자인 토큰을 단단하게 준비하고, 마지막 모습은 만드는 사람이 결정하도록 합니다. 기본은 단단하게, 선택은 자유롭게, 오래 쓰도록 만드는 것이 세 가지 원칙입니다.

미리보기의 **Moru 이야기**(`#brand`)는 브랜드 소개, 채택한 **선으로 쓴 M(Monogram)**의 의미, 밝고 어두운 배경의 공식 로고 순서로 보여 줍니다. 심벌은 모루의 작업면을 나타내는 수평선 아래에 Moru의 M을 일정한 굵기의 선과 둥근 끝으로 표현합니다. 워드마크는 Pretendard SemiBold의 채워진 글리프로 만든 `Moru`와 작은 `UI`입니다. 둥근 외곽선 대신 단정한 글자 끝을 사용하며, SVG 경로이므로 선택한 UI 글꼴에 영향을 받지 않습니다. 폰트 고지는 `public/brand/Pretendard-LICENSE.txt`에 포함했습니다.

밝은 배경용 로고·심벌과 어두운 배경용 흰색 로고·심벌을 각각 SVG로 다운로드할 수 있습니다.

- `public/brand/moru-logo.svg`: 심벌과 워드마크
- `public/brand/moru-symbol.svg`: 심벌
- 두 파일의 `-white.svg` 버전: 어두운 배경용 흰색 로고
- `public/favicon.svg`: 시스템 라이트·다크 모드에 대응하는 파비콘

React에서는 아래처럼 가져옵니다. 색상은 `currentColor`를 따르고, `MoruLogo`의 전체 높이는 `fontSize`, `MoruMark`의 크기는 `width`·`height`로 조절합니다. 브랜드를 적용한 데모 외곽과 로고는 편집 중인 컴포넌트 토큰에 영향을 받지 않으며, 예제 커버의 심벌은 커버의 대비 글자색을 따릅니다.

```tsx
import { MoruLogo, MoruMark } from './src/components/brand'

<MoruLogo style={{ fontSize: 40, color: '#181818' }} />
<MoruMark width={24} height={24} />
```

`MoruLogo`는 기본적으로 “Moru UI”라는 접근 가능한 이름을 제공합니다. 이름이 있는 버튼 안에서는 `aria-hidden="true"`로 중복 읽기를 막으세요. `MoruMark`는 기본 장식 요소이며, 단독으로 의미를 전달할 때는 `aria-hidden={false}`, `role="img"`, `aria-label`을 함께 지정하세요.

선정 전 로고 시안과 비교 화면은 현재 앱과 공개 소스·자산 배포 범위에서 제외합니다.

## 실행

Node.js 24와 npm을 사용합니다.

```sh
npm install
npm run dev
```

터미널에 표시되는 로컬 주소를 브라우저에서 엽니다. 기본 주소는 `http://127.0.0.1:5173`이며 사용 중인 포트에 따라 달라질 수 있습니다.

```sh
npm test              # 토큰·컴포넌트·검색·팀원 상태 테스트
npm run build         # TypeScript 검사와 프로덕션 빌드
npm run preview       # 빌드 결과 로컬 확인
npm run tokens:build  # tokens.ts를 기준으로 theme/default.css 재생성
```

## 화면에서 다듬기

기본 디자인은 **Graphite**입니다. 흰 패널과 밝은 스톤 회색 작업 영역, 흑백 주요 버튼, 회색 채움형 입력창, 10px 카드와 작은 모서리의 컨트롤을 사용합니다. `primary`는 주요 동작, `accent`는 절제된 코럴 포인트로 분리하며 미드나이트 블루·검붉은 레드 프리셋도 같은 흑백 구조를 유지합니다. [Axiom 레퍼런스](https://www.behance.net/gallery/244449727/Axiom-Real-Estate-Agent-Platform)의 정보 위계와 작업 공간 구성을 참고했고 Moru의 로고와 기능은 유지합니다.

웹과 Native의 기본 `borderWidth`는 `0`입니다. 화면의 패널·카드·입력창·목록은 명도와 여백으로 구분하며, 포커스·오류·선택·드롭 표시와 차트 그래픽·기기 목업은 필요한 표현을 유지합니다. 기존 브라우저 테마는 v9로 복원할 때 테두리만 한 번 제거하고, 이후 수동으로 지정한 테두리와 명시적으로 가져온 테마는 그대로 사용합니다.

페이지 제목은 30·27px, 설명은 12px을 기준으로 정리했습니다. 갤러리는 요약 카드·분류 도구·컴포넌트 카드로 구성하며, 표본 안의 타이포그래피와 밀도는 편집한 디자인 토큰을 따릅니다.

탐색은 192px 사이드바와 56px 상단바로 구성합니다. 선택한 메뉴는 흑백 반전으로 표시하며, 모바일에서는 탐색과 디자인 편집을 별도 패널로 엽니다. 내보내기·테마 전환·빠른 실행은 상단에서 사용할 수 있고 키보드 탐색과 포커스를 유지합니다.

- **컴포넌트**: 75종을 조작하고 사용 코드를 복사합니다. 최근 추가한 42종을 따로 모아 보고, 폼·입력, 버튼·동작, 오버레이, 탐색, 레이아웃, 상태·피드백, 데이터, 대화·콘텐츠의 8개 카테고리로 탐색하거나 한글·영문으로 검색합니다. 한 카테고리의 예제는 한 페이지에 모두 표시합니다. Input OTP·Drawer·Navigation Menu·Data Table·Chart·Carousel과 대화·첨부·질문·실행 기록 표본까지 포함합니다. 기존 Menu는 **Dropdown Menu**라는 갤러리 이름으로 표시합니다. 제목·컴포넌트 이름·설명을 구분하고 카드 간격과 안쪽 여백을 공통 규칙으로 맞췄습니다. 화면 폭에 따라 한 열 또는 두 열로 표시하며 모바일에서도 검색할 수 있습니다. 버튼 텍스트·크기와 공통 비활성 상태를 바꾸고, 컴포넌트별 선택·검색·날짜·실패·로딩 상태를 실제로 조작할 수 있습니다. 갤러리 안내 글자는 Pretendard를 사용하고, 표본 안의 글꼴·타이포그래피·밀도는 편집한 디자인 토큰을 따릅니다.
- **예제 화면**: 하나의 작업 공간에서 **프로젝트 시작·프로젝트 운영·일정 계획·팀 대화·릴리스 준비·공간 설정**을 오갑니다. 프로젝트 시작에서는 NumberInput·PasswordInput·MultiSelect·FileInput을 Stepper·RingProgress와 조합해 프로젝트를 만듭니다. 일정 계획에서는 날짜 범위·진행 시간 범위·알림 시간을 선택하고 예제 일정 목록에 추가합니다. Sidebar와 Breadcrumb이 현재 위치를 안내하며 새 컴포넌트를 실제 작업 흐름으로 조합합니다. 프로젝트 운영은 DataTable의 검색·정렬·선택·상태 변경, Chart의 현황, Carousel의 카드 보기를 같은 프로젝트 데이터에 연결합니다. Drawer에서 이름·담당자·우선순위·진행률을 수정하고, 메뉴에서 복제·완료를 사용할 수 있습니다. 넓은 화면에서는 현황 패널의 너비도 조절합니다. 팀 대화에서는 메시지 작성·좋아요·고정, 파일 첨부·제거, 공유 파일 목록과 원본 메시지 이동을 제공합니다. 위쪽 대화를 읽는 동안 새 메시지가 추가되어도 읽던 위치를 유지하며 최신 메시지로 이동할 수 있습니다. `Cmd/Ctrl+Enter`로 전송하고, 공유한 코드와 팀 가이드를 펼쳐 복사하며 읽기 방향을 바꿀 수 있습니다. 릴리스 준비에서는 질문에 답해 만든 프로젝트를 운영 목록과 점검 대상으로 함께 추가합니다. 버전·채널·릴리스 노트, 화면에 공개한 예제 코드 `123456`, 준비 목록을 확인하면 Trace에 단계별 결과와 기록을 표시합니다. 통과한 프로젝트는 검토 상태로 바뀌며, 입력이나 대상 프로젝트가 달라지면 지난 결과를 지워 다시 확인합니다. 공간 설정에는 기존 일반 설정·팀원·프로젝트 일정·화면 설정 탭이 있습니다. 준비 체크리스트·공개 범위·알림·카드 간격을 조절하고, 팀원 검색·필터·상세 수정·제거·실행 취소와 담당자·날짜 선택·달력 연동을 확인합니다. 팀원 이름을 수정하면 프로젝트 담당자와 기존 대화의 작성자에도 반영됩니다. 프로젝트·대화·작성 중인 메시지·첨부 목록·릴리스 입력·공간 설정은 화면을 이동해도 유지되고 새로고침하면 초기화됩니다. 첨부 파일은 이름·크기 등의 정보만 보관합니다. 모든 생성·전송·초대·코드 확인·점검은 브라우저 안의 예제이며 실제 서버 저장·파일 업로드·이메일 발송·본인 인증·배포는 실행하지 않습니다.
- **디자인 토큰**: 기본 색상 7개와 의미 색상 4개, 모서리·간격·타이포그래피 표본과 현재 CSS를 확인합니다. 색상 카드를 누르면 해당 편집 항목으로 이동합니다. 섹션 제목 15px·라벨과 설명 12px·수치와 코드 11~12px, 카드 간격 24px을 기준으로 정리했습니다. 색상, 모서리, 글꼴, 역할별 타이포그래피, 밀도, 테두리, 그림자, 모션 속도를 실시간으로 조절합니다. 프리셋과 라이트·다크 모드도 제공합니다. 편집 패널은 검정 선택 상태와 회색 입력 필드, 사각형 프리셋 타일을 사용하며, 글자 미리보기에는 편집한 값이 그대로 반영됩니다.
- **비교 화면**: Pretendard·Noto Sans × 촘촘하게·기본·여유롭게 × 라이트·다크의 12가지 조합에서 같은 폼을 비교합니다. 비교 화면의 테마는 각각 독립적으로 적용됩니다. 갤러리와 같은 제목·설명 위계를 사용하고, 필터 라벨 12px·조작 높이 36px, 그룹 제목 15px·보조 정보 11px과 카드 간격 24px을 공유합니다. 콘텐츠 폭이 좁아지면 비교 카드를 한 열로 배치하며 표본 안의 글자 역할과 밀도 차이는 그대로 유지합니다.
- **상태 표현**: 버튼·입력창·선택창·체크박스·여러 줄 입력의 기본·호버·누름·포커스·비활성·오류·로딩을 나란히 비교합니다. 성공·경고·정보·오류의 의미 색상과 직접 조작 예제도 확인합니다. 디자인 비교와 같은 안내·필터 기준으로 표시하며, 상태 표는 화면 안에서 좌우로 스크롤할 수 있습니다. 주소의 `#states`로 바로 열 수 있습니다.
- **시작 가이드**: 디자인 편집, 컴포넌트 사용, 토큰 내보내기, 예제 확인을 네 단계로 안내합니다. 단계별 여백 32px과 본문 13px, 코드 12px을 사용하고 좁은 화면에서도 코드 영역 안에서만 스크롤합니다.
- **Moru 이야기**: 브랜드 소개와 채택한 모노그램의 의미를 읽고, 밝고 어두운 배경에 맞는 로고·심벌 SVG를 받습니다. 본문 13px, 섹션 제목 20px, 원칙 제목 15px, 카드 간격 24px을 사용하며 좁은 화면에서는 소개·원칙·자산을 한 열로 배치합니다. 주소의 `#brand`로 바로 열 수 있습니다.
- **내보내기**: CSS 또는 JSON을 복사·다운로드하고 JSON을 다시 불러옵니다.

코드 표본과 상태 표는 키보드로 초점을 옮겨 좌우로 스크롤할 수 있습니다. `Cmd/Ctrl+K`는 열려 있는 탐색·편집 패널을 닫고 컴포넌트 검색으로 이동합니다. `Cmd/Ctrl+Shift+K` 또는 상단의 빠른 실행 버튼은 전역 Command를 열어 화면·컴포넌트·작업을 검색하고 실행합니다. 패널을 닫으면 열었던 버튼이나 색상 카드로 초점이 돌아갑니다.

토큰·현재 모드·프리셋은 같은 브라우저의 `localStorage`에 자동 저장됩니다(`moru-ui-theme`). 브라우저 데이터를 지우면 초기화되며 계정이나 다른 기기와 동기화되지 않습니다. 초기화 버튼으로 기본 토큰을 복원할 수 있습니다.

**포인트 색상 `accent`의 편집과 크기·간격·밀도·글꼴·타이포그래피·그림자·모션 값은 두 모드에 함께 적용**합니다. 기본 프리셋은 다크 모드에 읽기 좋은 코럴을 따로 사용합니다. 주요 동작 `primary`는 라이트에서 검정, 다크에서 밝은 회색이며 배경·표면·본문·보조 문구·테두리·의미 색상과 함께 모드별로 저장합니다. 컬러 프리셋은 두 모드의 색상을 바꾸고 조정한 타이포그래피와 밀도는 유지합니다.

CSS 내보내기는 **현재 모드 한 개**의 CSS 변수와 `:root[data-theme="light"]` 또는 `:root[data-theme="dark"]` 선택자를 포함합니다. 사용할 앱의 `<html>`에 해당 `data-theme` 값을 설정하세요. 두 모드가 필요하면 각각 내보내 전역 스타일에 추가합니다. JSON 내보내기는 두 모드와 현재 편집 상태를 포함하며 다시 불러와 편집을 이어갈 수 있습니다. 일반 토큰 객체 JSON을 불러오면 라이트 테마를 만들고 다크 테마를 자동 생성합니다. CSS 파일 불러오기는 지원하지 않습니다.

타이포그래피에서 **Noto Sans**와 **Pretendard**를 선택할 수 있습니다. Noto Sans의 한글은 Noto Sans KR로 표시하며, 두 글꼴 모두 프로젝트에 포함된 웹폰트를 사용합니다. 다른 앱에서 사용하려면 `@fontsource-variable/noto-sans`, `@fontsource-variable/noto-sans-kr`, `pretendard`를 설치하고 `theme/fonts.css`도 가져오세요.

시뮬레이터(`#simulator`)와 예제(`#examples`)는 라이브러리 사이드바·상단바·기본 편집 패널 없이 전체 창을 사용합니다. 상단 **이전 · Moru UI**로 열기 전 라이브러리 화면에 돌아가며, 직접 주소로 들어왔다면 컴포넌트 화면으로 돌아갑니다. 브라우저 뒤로·앞으로와 새로고침에서도 현재 화면을 유지합니다. 예제의 디자인 편집은 필요할 때 별도 패널로 엽니다.

## Moru 시뮬레이터

편집 중에는 **⌘/Ctrl+A** 전체 선택, **⌘/Ctrl+C·X·V** 복사·잘라내기·붙여넣기, **⌘/Ctrl+D** 복제, **Delete/Backspace** 삭제, **⌘/Ctrl+Z** 되돌리기, **⌘/Ctrl+Shift+Z**(또는 Ctrl+Y) 다시 실행을 사용할 수 있습니다. Shift·⌘·Ctrl+클릭으로 여러 요소를 선택하고, 방향키는 1px·Shift+방향키는 8px 이동합니다. 선택 그룹은 드래그·복제·삭제를 한 번의 변경으로 기록하며 상대 배치를 유지합니다. Esc로 선택을 해제하고 도구 모음의 키보드 버튼이나 `?`로 단축키 안내를 엽니다. 입력 필드·텍스트 편집·모달·실행 화면에서는 편집용 단축키를 가로채지 않습니다.

복사한 요소는 브라우저의 클립보드를 사용하므로 다른 화면이나 다른 Moru 창에도 붙여넣을 수 있습니다. 붙여넣을 때 새 ID를 만들고 선택하며, 같은 내용을 반복하면 16px씩 위치를 옮깁니다. 화면 경계·100개 요소 한도·1MB 복사 데이터 제한을 적용하고, 대상 프로젝트에 없는 화면 연결은 해제합니다. 비밀번호 초기값은 복사하지 않습니다.

사이드바의 **시뮬레이터** 또는 주소의 `#simulator`에서 앱의 와이어프레임을 만들고 화면 흐름을 실행합니다. 처음에는 **로그인 → 프로젝트 목록 → 프로젝트 상세** 예제가 열립니다. **흐름 실행**에서 예제 이메일과 비밀번호를 입력하고 목록의 카드를 눌러 상세 화면까지 이동할 수 있습니다.

- 왼쪽의 17가지 컴포넌트를 프레임에 **드래그하거나 눌러 추가**합니다. 요소를 끌어 이동하고 오른쪽 아래 모서리로 크기를 조절합니다. **8px 맞춤**과 확대·축소를 제공하며 방향키로 1px, Shift+방향키로 8px 이동합니다. **차트**는 막대·선·영역·도넛을 고르고 제목·설명·`항목 | 숫자` 형식의 데이터를 최대 30개까지 수정합니다. 잘못된 줄은 오류 위치를 안내하고 차트에서 제외합니다. 도넛은 음수를 허용하지 않으며 합계가 0이면 비중을 표시할 수 없다는 안내를 보여줍니다. 차트의 데이터·종류는 기존 기획 파일과 같은 형식으로 자동 저장·내보내기·복사됩니다.
- 오른쪽 속성 패널에서 문구·입력 안내·목록 항목·크기·표현·상태를 수정합니다. 버튼·카드·목록·이미지·다이얼로그에는 **화면 이동·뒤로 가기·안내 창·알림**을 연결하고, 이동 전에 필수 입력 항목을 확인하도록 설정할 수 있습니다.
- **화면** 패널에서 새 화면을 추가하거나 복제·삭제하고 시작 화면을 정합니다. 연결 목록에서 각 이동 동작을 다시 선택할 수 있습니다. 프레임은 모바일·태블릿·데스크톱 크기를 선택하거나 직접 조절합니다. 모바일(너비 600px 이하)·태블릿(601~1023px)은 편집과 실행 모두 기기 목업 테두리로 표시하며 기기 외곽까지 작업 공간에 맞춥니다. 화면 좌표와 크기는 테두리를 제외한 콘텐츠 영역 기준입니다.
- **화면 크기와 속성 편집 → 프레임을 바꿀 때**에서 기본 **가로 폭에 맞춤** 또는 **배치 유지**를 고릅니다. 가로 맞춤은 넓은 요소의 좌우 여백과 작은 요소의 정렬·너비를 유지하며 프레임에 맞춰 좌표와 너비를 갱신합니다. 글자·높이·세로 위치는 화면 경계를 벗어나지 않는 한 유지합니다. 배치 유지는 기존 좌표·크기를 유지하고 화면 밖 요소만 보정합니다. 자유 배치의 간단한 가로 대응이며, 여러 열을 한 열로 쌓는 자동 재배치는 지원하지 않습니다. 변경은 한 번에 되돌릴 수 있고, 화면마다 적용합니다. 모드 선택은 현재 편집 세션에만 적용되고 변경한 배치는 기획 파일에 저장됩니다.
- **와이어프레임 / Moru 스타일**은 같은 구성을 서로 다른 모습으로 보여줍니다. **편집 / 실행**은 별도로 동작합니다. 실행 중 입력·선택은 임시 상태이며, 편집으로 돌아가거나 다시 시작하면 초기화됩니다. 실행용 안내 창은 해당 프레임 안에서 열립니다.
- 기획 문서는 **개인 브라우저에 자동 저장**되고 **JSON 내보내기·불러오기**로 옮길 수 있습니다. 복제·삭제·속성 변경과 파일 불러오기는 되돌리기·다시 실행으로 복원합니다. 입력 중인 비밀번호는 기획 문서에 저장하지 않습니다.

로그인은 화면 흐름을 설명하기 위한 예제입니다. 실제 인증·서버 저장·외부 전송은 연결하지 않으며, 공개 사이트를 방문하는 다른 사람에게 내 브라우저의 기획이 공유되지 않습니다.

## 카테고리별 컴포넌트 페이지

라이브러리 홈(`#components`, 기존 루트 URL도 지원)은 8개 카테고리를 표시합니다. 폼·입력, 버튼·동작, 오버레이, 탐색, 레이아웃, 상태·피드백, 데이터, 대화·콘텐츠로 구성하며 기존 컴포넌트 ID와 검색 별칭은 유지합니다. 카테고리 페이지(예: `#components/forms`)에서는 해당 카테고리의 **실제 컴포넌트 예제를 한 페이지에 모두 표시**합니다. 12개씩 나누던 페이지 이동은 제거했으며, 폼·입력 25종도 같은 화면에서 차례로 조작할 수 있습니다. 홈 검색은 전체에서, 카테고리 검색은 해당 그룹에서 찾고 새 컴포넌트 필터와 함께 사용할 수 있습니다. 검색·필터 결과도 모두 표시합니다.

카테고리의 **미리보기·코드**를 한 번에 전환하고, 각 예제에서 코드를 복사하거나 오른쪽 세부 조정을 열 수 있습니다. 왼쪽 메뉴는 카테고리별로 접고 펼치며, 개별 컴포넌트 이름을 선택하면 같은 카테고리 페이지 안의 해당 예제로 이동합니다. 넓은 화면에서는 예제를 두 열로 배치하고, 좁은 화면이나 넓은 작업 영역이 필요한 예제는 한 열로 표시합니다.

기존 개별 주소(예: `#components/forms/input`, `#components/actions/button`)를 열면 해당 카테고리의 예제 전체가 표시되고 요청한 항목 위치로 이동합니다. `#component-input`, `#components/input` 형식도 지원합니다. 브라우저 뒤로·앞으로 이동과 시뮬레이터·예제의 ‘이전’으로 출발한 위치를 다시 확인할 수 있습니다. `⌘K`/`Ctrl+K`는 전체 검색을 엽니다. 원래 catalog의 4분류는 API와 필터 호환을 위해 유지하고, 페이지 탐색용 8개 그룹은 `component-pages.ts`에서 별도로 관리합니다. 디자인 토큰과 시뮬레이터 기획 문서는 변경하지 않습니다.

## v0.2 타이포그래피와 밀도

타이포그래피는 `display`(큰 제목), `heading`(제목), `body`(본문), `label`(라벨), `caption`(설명), `code`(코드)의 여섯 역할로 관리합니다. 각 역할은 `size`(px), `lineHeight`(배수), `weight`, `letterSpacing`(em)를 가지며 편집기에서 개별 조절할 수 있습니다. Pretendard와 Noto Sans는 줄높이·자간의 기본 프로필이 다르며 글꼴을 전환해도 수동 조정분은 유지합니다. 코드 역할은 별도의 고정폭 글꼴을 사용합니다.

밀도는 `compact`, `standard`, `comfortable` 세 가지입니다. 밀도를 바꾸면 컨트롤 높이, 내부 여백, 아이콘 비례, 폼의 라벨·설명·항목 간격을 함께 조절합니다. 컴포넌트의 `sm`·`md`·`lg` 크기는 선택한 밀도 안에서 상대적인 크기를 나타냅니다. **크기** 탭에서 S/M/L 중 어느 값이든 직접 입력하면 해당 그룹의 기존 비율로 함께 조절됩니다. 예를 들어 기본 밀도의 높이 M을 40에서 44로 바꾸면 S/M/L은 35.2/44/52.8px가 됩니다. 컨트롤 높이·좌우 패딩·아이콘 크기는 그룹별로 연동하고, 폼 간격·카드 여백 등의 값은 독립적으로 수정합니다.

수동 값은 `densityOverrides`에 밀도별로 보관합니다. 각 그룹은 M 기준값만 저장하고 `resolveDensity(tokens, density?)`로 S/M/L을 계산해 0.1px 단위로 반올림합니다. 밀도를 오가도 각 밀도의 수동 설정이 남고, 해당 밀도의 기본값 복원은 다른 밀도와 색상·글꼴을 바꾸지 않습니다. 수동 설정은 라이트·다크에서 공유하며 CSS·JSON 내보내기에도 반영됩니다. 디자인 비교와 디자인 토큰 화면의 수치도 계산된 값으로 표시합니다.

기존 v1 JSON과 브라우저 저장값도 불러올 수 있습니다. 이전 `fontSize`는 본문 역할로 옮기고 `fontFamily`와 색상은 유지합니다. 자유롭게 조정하던 `controlHeight`는 34px 이하면 촘촘하게, 46px 이상이면 여유롭게, 그 사이는 기본 밀도로 옮깁니다. 기존 간격·높이는 선택된 밀도의 공통 규격으로 맞추므로 이전 화면과 조금 달라질 수 있습니다. 기본 높이는 38px에서 40px로 바뀌었습니다.

현재 JSON의 `schemaVersion`은 `8`이며 `accent`와 역할별 설정·밀도·의미 색상·`densityOverrides`·`componentSpacing`과 모드별 `colorSchemes` 생성 설정을 포함합니다. 기존 v1~v4 브라우저 저장 테마는 Graphite 디자인으로 한 번 갱신하고 화면 모드는 유지합니다. v5·v6·v7 사용자 편집은 보존한 채 v8로 이전하고, 없는 수동 설정은 기본 스타일을 사용합니다. 명시적으로 가져오는 v1~v7 JSON은 파일의 색상·형태를 보존하고 없는 토큰만 기본값으로 보충합니다. 시뮬레이터 기획 문서는 테마와 별도로 보관하므로 이 이전에 영향을 받지 않습니다. `fontSize`·`spacing`·`controlHeight`는 호환용 별칭으로 계속 내보내지만 `typography`와 계산된 밀도값이 우선합니다. 가져온 숫자는 허용 범위로 제한하며 누락되거나 잘못된 역할 값은 정상 기본값으로 복원합니다.

오른쪽 디자인 토큰 편집기는 **테마·컬러·타이포·크기·간격·효과** 탭으로 묶었습니다. 컬러는 기본/의미 색상을 나눠 한 번에 필요한 항목만 표시합니다. 탭은 방향키·Home·End로 이동할 수 있고, 토큰 화면의 색상을 누르면 해당 탭을 열고 입력란에 포커스합니다. 컴포넌트 세부 조정은 접어서 보관하며 표본의 세부 조정 버튼으로 바로 펼칠 수 있습니다.

**간격** 탭은 컴포넌트 종류별 공통 패딩·마진을 편집합니다. 종류를 검색해 선택하고 위·오른쪽·아래·왼쪽 값을 따로 지정하거나 네 방향을 연동합니다. 빈 값은 기존 스타일을 사용하고, `0`은 간격을 없애는 명시적인 설정입니다. **시스템 간격**은 현재 밀도의 기본 간격(`--ui-space`)을 곱해 일관된 배수로 적용하고, **px**는 고정 수치로 적용합니다. 한 종류의 복원은 다른 종류의 설정을 보존합니다. 공통 설정은 라이트·다크에서 공유하고 CSS 변수·적용 규칙과 JSON에 함께 내보냅니다. 팝업 종류는 실제 팝업의 내용 면에 적용하며, DOM 요소를 만들지 않는 Direction 컨텍스트는 간격 편집 대상이 아닙니다. 이 패널은 공통 기본값용이며 시뮬레이터 개별 요소의 문서나 배치 좌표를 수정하지 않습니다.

디자인 토큰 메인 화면은 **컬러 스키마·형태와 리듬·가독성 · 품질·내보내기** 작업 탭으로 구성합니다. 형태에서는 모서리·테두리·그림자, 간격·밀도에서는 기존 S/M/L 비율을 유지하는 수동 값, 타이포·모션에서는 기본 글꼴·본문 크기·굵기·줄높이·자간·전환 시간을 직접 조절합니다. 즉시 전체 토큰에 반영하며 옆의 카드·입력·버튼·모션 표본으로 확인합니다. 다른 역할의 세부 타이포와 컴포넌트별 공통 패딩·마진은 오른쪽 편집기에서 계속 조절합니다.

컬러 스키마는 OKLCH에서 기준색의 명도·색상각·선명도를 나눠 조절하고, 단색·유사색(±30°)·보색(180°)·분할 보색(150°/210°)·삼각 배색(120°/240°)을 비교합니다. sRGB 범위를 벗어나면 명도와 색상각을 유지한 채 선명도를 줄여 HEX로 변환합니다. 중립색 온도와 모노톤 주요 동작을 별도로 정하고 50~950 명도 팔레트를 확인할 수 있습니다. 생성은 미리보기만 바꾸며 **기본 색상 적용·의미 색상 적용** 또는 **기본·의미 함께 적용**을 눌러 현재 모드에 적용합니다. 의미 색상은 성공의 초록·경고의 호박색·정보의 파랑·오류의 빨강 계열을 유지하고, 의미 색상만 적용할 때는 기존 실제 표면·배경을 기준으로 대비를 맞춥니다. 배색 선택은 가능한 조합을 제안하는 기준이며, 모든 조합색이 필수 UI 역할로 자동 배정되지는 않습니다.

모드별 적용된 색과 생성 설정은 브라우저 및 JSON에 저장합니다. 컬러 스키마 적용은 다른 모드의 팔레트와 형태·간격·타이포를 보존하며, 직접 편집한 단일 포인트 색상은 기존처럼 모드 간 공유됩니다. **명도 대비 확인**에서 현재 값과 적용 예정 값의 실제 색상 쌍을 비교합니다. 일반 텍스트 기준 4.5:1 충족 여부를 최종 HEX로 계산하고, 포인트를 작은 글자로 쓸 때의 대비도 별도로 검사합니다. 개별 색상 쌍의 결과이며 전체 UI의 접근성 인증을 의미하지 않습니다. 기준: [CSS Color 4 OKLCH](https://www.w3.org/TR/css-color-4/#ok-lab), [WCAG 텍스트 대비](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

## 상태와 의미 색상

**상태 표현 → 상태 비교**에서는 같은 크기의 Button·Input·Select·Checkbox·Textarea를 일곱 상태로 비교합니다. `previewState="hover"`, `"pressed"`, `"focus"`는 실제 포인터·키보드 상태와 같은 시각 규칙을 강제로 보여 주는 미리보기입니다. 문서의 실제 포커스를 이동하거나 토글 버튼의 `aria-pressed`를 만들지는 않습니다. 고정된 비교 표본의 입력·선택은 읽기 전용으로 유지하며, 실제 조작은 **직접 조작** 탭에서 포인터와 Tab·Space·Enter 키로 확인하세요.

`disabled`와 `loading`은 실제 조작을 차단합니다. 로딩 중에는 진행 표시와 `aria-busy`를 제공하고 입력값 변경·선택 변경·버튼의 반복 실행을 막습니다. Input·Textarea는 로딩 전후에도 같은 입력 요소와 `ref`를 유지하므로 사용자가 입력한 비제어 값이 사라지지 않습니다. `previewState="disabled"`와 `previewState="loading"`도 같은 동작을 합니다. Input·Textarea·Select·Checkbox의 오류에는 `Field error`로 설명을 연결할 수 있으며, Button의 오류 미리보기는 위험 버튼 표현을 사용합니다.

**의미 색상**에서는 `success`, `warning`, `info`, `danger`를 연한 배경과 테두리형 메시지로 비교합니다. 편집기의 의미 색상을 바꾸면 라이트·다크에서 해당 모드의 값을 저장하며, 메시지는 아이콘과 문구를 함께 제공해 색상만으로 상태를 구분하지 않습니다.

토큰 엔진은 의미별 `--ui-{tone}-soft`, `--ui-{tone}-text`, `--ui-{tone}-surface-text`, `--ui-{tone}-border`, `--ui-{tone}-foreground`를 생성합니다. 연한 배경의 메시지는 `text`를, 표면에 직접 놓는 테두리형 메시지와 폼 오류는 `surface-text`를 사용하며 각각 자신의 배경에 최소 4.5:1 대비를 확보하도록 보정합니다. 브랜드 색상도 `--ui-primary-soft-text`와 `--ui-primary-surface-text`를 구분하므로 중간 회색처럼 글자색이 바뀌는 경계에서도 맥락에 맞는 대비를 유지합니다.

브랜드·위험 버튼은 기본·호버·누름 배경마다 글자색을 따로 계산하며, 포커스·오류 링과 비활성·로딩 색상도 CSS·JSON에 함께 내보냅니다. 포커스 링은 배경과 표면에 대해 3:1 대비를 목표로 보정하지만 서로 크게 다른 임의의 배경 조합에서는 단일 색으로 두 조건을 모두 만족할 수 없으므로 실제 화면에서 확인하세요.

```tsx
import { Button, Field, Input, StatusMessage } from './src/index'

export function SaveState({ saving, error }: { saving: boolean; error?: string }) {
  return (
    <>
      <Field label="프로젝트 이름" error={error}>
        <Input loading={saving} defaultValue="새로운 아이디어" />
      </Field>
      <Button loading={saving}>저장하기</Button>
      <StatusMessage tone="info" title="자동 저장 안내">
        변경한 설정은 현재 브라우저에 저장됩니다.
      </StatusMessage>
    </>
  )
}
```

## 컴포넌트 사용

공개 진입점은 `src/index.ts`입니다. 다른 앱으로 가져갈 때 `src/components/ui`, `src/lib`, 필요한 `src/theme` 소스를 함께 복사하고 React, React DOM, `@base-ui/react`, `lucide-react`를 설치하세요. Tailwind CSS 4가 설정되어 있어야 하며 복사한 컴포넌트 경로가 Tailwind의 소스 탐색 범위에 포함되어야 합니다.

데이터·패널 컴포넌트에는 다음 패키지를 사용합니다. 아래 버전으로 구현과 검증을 진행했으며, 필요한 컴포넌트만 복사할 때는 해당 패키지도 설치하세요. 공개 진입점 전체를 복사하면 이 내보내기들이 참조하는 패키지도 모두 필요합니다.

| 컴포넌트 | 패키지·검증 버전 | 담당 기능 |
| --- | --- | --- |
| `DataTable` | `@tanstack/react-table` 9.3.1 | 검색·정렬·열 표시·행 선택·페이지 계산 |
| `Chart` | `recharts` 3.10.1 | 막대·선·영역·도넛 차트·반응형 SVG·키보드 탐색 |
| `Carousel` | `embla-carousel-react` 8.6.0 | 드래그·스와이프·슬라이드 위치·경계 계산 |
| `ResizablePanelGroup` | `react-resizable-panels` 4.14.8 | 패널 크기 제약·드래그·키보드 크기 조절 |

```sh
npm install @tanstack/react-table@9.3.1 recharts@3.10.1 embla-carousel-react@8.6.0 react-resizable-panels@4.14.8
```

`DataTable`의 열 정의는 TanStack Table v9의 API를 사용합니다. 패널은 `react-resizable-panels` v4의 `orientation`과 퍼센트 문자열(`"35%"`) 규칙을 사용하므로 이전 주요 버전의 예제를 그대로 섞지 마세요. 폼·팝업·메뉴는 기존 Base UI 기반을 유지합니다. 확장 컴포넌트의 CSS는 각 TSX 파일에서 자동으로 가져옵니다.

앱의 전역 CSS에서 Tailwind를 불러오고 기본 토큰과 컴포넌트 스타일을 한 번씩 가져옵니다. 아래 경로는 프로젝트 루트의 파일에서 가져오는 예시이므로 파일 위치에 맞게 조정하세요.

```css
/* 앱의 전역 CSS */
@import "tailwindcss";
```

```tsx
import { Button, Card, Field, Input } from './src/index'
import './src/theme/default.css'
import './src/theme/fonts.css'
import './src/components/ui/styles.css'

export function ProjectForm() {
  return (
    <Card>
      <Field label="프로젝트 이름" description="팀에 표시할 이름입니다.">
        <Input placeholder="새로운 아이디어" />
      </Field>
      <Button type="submit">프로젝트 만들기</Button>
    </Card>
  )
}
```

기본 스타일은 `src/theme/default.css`에서 제공하며 `<html data-theme="dark">`로 다크 모드를 선택할 수 있습니다. `src/theme/tokens.ts`를 수정한 뒤에는 `npm run tokens:build`로 기본 CSS를 갱신하세요. 편집기를 통합하려면 공개 진입점의 `useTheme`를 사용합니다. 이 훅은 문서 전체의 CSS 변수와 `data-theme`를 갱신합니다.

| 컴포넌트 | 용도·주요 속성 |
| --- | --- |
| `Button` | `variant`: `primary`, `secondary`, `ghost`, `danger` / `size`: `sm`, `md`, `lg` / `loading`, `previewState`, 네이티브 버튼 속성 |
| `Field` | `label`, `description`, `error`, `children`으로 입력의 라벨·설명·오류 연결 |
| `Input` | `size`: `sm`, `md`, `lg` / `loading`, `previewState`, 네이티브 입력 속성과 `ref`, `onChange` 지원 |
| `Textarea` | `size`: `sm`, `md`, `lg` / `loading`, `previewState`, 네이티브 여러 줄 입력 속성과 `ref`, `rows`, `onChange` 지원 |
| `Checkbox` | `size`: `sm`, `md`, `lg` / `label`, `description`, `checked`, `defaultChecked`, `onCheckedChange`, `disabled`, `loading`, `previewState` |
| `Select` | `size`: `sm`, `md`, `lg` / `items: { value, label }[]`, `value`, `defaultValue`, `onValueChange`, `placeholder`, `disabled`, `readOnly`, `loading`, `previewState` |
| `Dialog` | `trigger`, `title`, `description`, `children`, `footer`, `open`, `onOpenChange` |
| `Menu` / `DropdownMenu` | 같은 구현과 API의 두 이름 / `size`: `sm`, `md`, `lg`(메뉴 항목 크기) / `trigger`, `items: { label, onClick?, icon?, destructive?, disabled? }[]` |
| `Tabs` | `size`: `sm`, `md`, `lg` / `items: { value, label, content }[]`, `value`, `defaultValue`, `onValueChange` |
| `Card` | 네이티브 `div` 속성과 `ref`, `children` 지원 |
| `Switch` | `label`, `description`, `checked/defaultChecked`, `onCheckedChange`, `size`, `disabled`, `name` |
| `RadioGroup` | `items: { value, label, description?, disabled? }[]`, `value/defaultValue`, `onValueChange`, `size`, `disabled`, `name` |
| `Slider` | 단일 가로 슬라이더 / 숫자 `value/defaultValue`, `min/max/step`, `label`, `showValue`, `onValueChange`, `size`, `disabled` |
| `Accordion` | `items: { value, title, content, disabled? }[]`, `value/defaultValue: string[]`, `onValueChange`, `multiple`, `disabled` |
| `Popover` | `trigger`, `title`, `description`, `children`, `open/defaultOpen`, `onOpenChange`, `side`, `align` |
| `Tooltip` | `trigger`, `children`, `side`, `align`, `delay` / `TooltipProvider`로 지연 시간 공유 |
| `Badge` | `variant`: `primary`, `secondary`, `outline` / `tone`: 네 가지 의미 색상 |
| `Alert` | `title`, `children`, `tone`, `icon`, `role` / 오류는 기본 `alert`, 나머지는 `status` |
| `Avatar` | `src`, `alt`, `fallback`, `size` / 이미지 로딩·실패 시 대체 이름 |
| `Progress` | `value`, `max`, `label`, `showValue` / `null`이면 완료 시점을 모르는 작업 |
| `Separator` | `orientation`: `horizontal`, `vertical` / `decorative`(기본 true) |
| `Skeleton` | 네이티브 `div` 속성 / 크기·형태는 `className` 또는 `style`로 지정 |
| `Toast` | `ToastProvider` 안의 `useToast()`로 `toast`·`dismiss` 사용 / `title`, `description`, `tone`, `duration`, `action` |
| `Combobox` | `items: { value, label, description?, disabled? }[]`, `value/defaultValue: string \| null`, `onValueChange`, `placeholder`, `clearable`, `size`, `disabled`, `readOnly`, `name` / 검색·선택·지우기 |
| `AlertDialog` | `trigger`, `title`, `description`, `onConfirm`, `confirmLabel`, `cancelLabel`, `destructive`, `loading`, `open`, `onOpenChange` / 비동기 확인 중 중복 실행 방지·실패 후 재시도 |
| `Sheet` | `trigger`, `title`, `description`, `children`, `footer`, `open/defaultOpen`, `onOpenChange`, `side`: `left`, `right`, `bottom` / `initialFocus`, `finalFocus` |
| `Empty` | `title`, `description`, `icon`, `children` / 빈 상태의 설명과 다음 행동 |
| `Table` | 네이티브 table 속성·ref와 compound API / `scrollLabel`, `wrapperClassName`으로 스크롤 영역 설명·스타일 지정 |
| `Pagination` | 숫자 `page`, `pageCount`, `onPageChange`, `siblingCount`, `disabled` / 1부터 시작하는 페이지·범위 보정·생략·현재 위치 안내 |
| `Calendar` | 기본 단일 날짜 `Date \| null`, `mode="range"`이면 `{ start: Date \| null; end: Date \| null }` / 년·월 빠른 선택·날짜 범위·키보드 이동 |
| `DatePicker` | `value/defaultValue: Date \| null`, `onValueChange`, `name`, `form`, `required`, `readOnly`, `minDate`, `maxDate`, `locale`, `disabled` / Field·네이티브 폼 연동 |
| `DateRangePicker` | `{ start: Date \| null; end: Date \| null }`, `name`, `startName/endName`, `form`, `required`, `minDate/maxDate`, `size` / 시작·종료를 `YYYY-MM-DD`로 제출 |
| `TimePicker` | `HH:mm \| null`, `name`, `form`, `required`, `min/max`, **분 단위** `step`, `size` / 입력과 시·분 그리드 선택 |
| `TimeRangePicker` | `{ start: string \| null; end: string \| null }`, `name`, `required`, `step`, `allowOvernight` / 같은 날 종료>시작, 명시적 다음 날 범위 |
| `Command` | `items: { id, label, description?, keywords?: string[], group?, disabled?, onSelect }[]`, `trigger`, `open`, `onOpenChange`, `title`, `placeholder` / 검색·그룹·방향키·Enter·Escape |
| `ToggleGroup` | `items: { value, label, icon?, disabled? }[]`, `type`: `single` 또는 `multiple`, `value/defaultValue: string[]`, `onValueChange`, `preventEmpty`, `size`, `disabled` |
| `Typography` | `variant`: 여섯 타이포그래피 역할 / `as`: 의미에 맞는 HTML 요소 선택 |
| `ThemeScope` | `tokens`, `mode` / 문서 전체 테마와 독립적인 영역별 테마 |
| `StatusMessage` | `tone`: `success`, `warning`, `info`, `danger` / `title`, `children` / `variant`: `soft`, `outline` / `role` |

`DropdownMenu`와 `DropdownMenuProps`는 기존 `Menu`와 `MenuProps`의 별칭입니다. 기존 import와 호출 코드를 그대로 사용할 수 있으며 갤러리 수에는 한 항목으로 계산합니다.

### 새로 구현한 32개

| 공개 API | 주요 용도와 조합 |
| --- | --- |
| `AspectRatio` | `ratio`로 이미지·영상·콘텐츠 비율 유지 |
| `ButtonGroup` | `orientation`과 이름이 있는 버튼 묶음 / `ButtonGroupText`로 값 표시 |
| `DirectionProvider` | Base UI의 `direction: "ltr" \| "rtl"` / DOM 경계의 `dir`과 함께 사용 |
| `InputGroup` | `InputGroupInput`·`InputGroupTextarea`·`InputGroupAddon`·`InputGroupButton`으로 아이콘·접두·접미·동작 조합 |
| `InputOTP` | 숫자 인증 번호 / `length`, `value/defaultValue`, `onValueChange`, `onComplete`, `size` |
| `Item` | `ItemMedia`·`ItemContent`·`ItemTitle`·`ItemDescription`·`ItemActions` / 그룹과 구분선 제공 |
| `Kbd` | `KbdGroup`과 함께 단축키 표시 / 실제 단축키 처리는 사용하는 화면에서 연결 |
| `Label` | `htmlFor`로 입력과 연결 / Field 안에서는 컨트롤 ID 사용 |
| `NativeSelect` | 네이티브 `<select>` / `items` 또는 `<option>`·`<optgroup>`, `onValueChange`, `size` |
| `Spinner` | `label`로 작업 설명, `size`로 크기 지정 / 이름이 있는 로딩 상태 |
| `Toggle` | `pressed/defaultPressed`, `onPressedChange`, `variant`, `size` / 단일 옵션의 누름 상태 |
| `Breadcrumb` | `items`로 상위 경로와 현재 위치 표시 |
| `Collapsible` | `title`, `open/defaultOpen`, `onOpenChange` / 펼치고 접는 구획 |
| `ContextMenu` | 우클릭·키보드 메뉴 / `items`와 하위 `children` 메뉴 |
| `Drawer` | 아래에서 여는 모달 패널 / 제목·설명·폼·푸터와 끌어 닫기 |
| `HoverCard` | `trigger`, `title`, `description`, `children` / 마우스·포커스 미리보기 |
| `Menubar` | `menus`로 연결된 메뉴와 하위 작업 구성 |
| `NavigationMenu` | `items`의 링크 또는 하위 링크 목록 / 주요 탐색과 현재 위치 |
| `Sidebar` | `items`, `value`, `onValueChange`, `title`, `footer` / 접기·반응형 탐색 |
| `Attachment` | 파일명·크기·상태·진행률 / `onRemove`·`onRetry`와 compound API |
| `Bubble` | `variant`, `align` / `BubbleContent`·`BubbleFooter`·`BubbleReactions` |
| `CodeBlock` | 코드 값·파일명·줄번호·줄 강조·복사·줄바꿈 |
| `Marker` | 상태·날짜·구분 / `MarkerContent`와 문맥에 맞는 `role` |
| `Message` | 아바타·헤더·본문·푸터와 메시지 정렬 |
| `MessageScroller` | `MessageScrollerItem`으로 메시지 식별 / 대화 스크롤과 최신 위치 이동 |
| `Questionnaire` | `questions`의 단계·필수 답변 검증 / `onComplete`로 답변 전달 |
| `Trace` | `items`의 실행 상태·소요 시간·펼치는 상세 |
| `Carousel` | `items`, `loop`, `orientation`, `direction`, `onValueChange` / 드래그·키보드 슬라이드 |
| `Chart` | `data`, `config`, `xKey`, `title`, `type` / 계열 표시 전환·데이터 표 |
| `DataTable` | `columns`, `data`, `getRowId`, `caption`, `pageSize`, `onSelectionChange` |
| `ResizablePanelGroup` | `ResizablePanel`·`ResizableHandle` / 가로·세로 크기 조절 |
| `ScrollArea` | 이름이 있는 스크롤 영역 / `orientation`, `viewportClassName`, 제한 높이와 스크롤 막대 |

갤러리의 **Direction**은 공개 API `DirectionProvider`에, **Resizable**은 세 패널 API에 대응합니다. 기존 `Typography`는 새 구현 수에 포함하지 않으며 이번에 역할을 전환하는 갤러리 표본을 추가했습니다.

`previewState`에는 `default`, `hover`, `pressed`, `focus`, `disabled`, `error`, `loading`을 지정합니다. 공개 `UIState` 타입과 `uiStateOptions`에서 같은 상태 목록을 사용할 수 있습니다. `StatusMessage`의 기본 `role`은 `status`이며 정적인 비교 표본에서는 `role="group"`처럼 목적에 맞게 변경할 수 있습니다.

컨트롤의 기본 크기는 `md`입니다. `Button`·`Input`·`Select`·`Tabs`는 같은 크기와 밀도에서 높이를 공유하고, 글자 크기가 커지면 글자가 잘리지 않도록 함께 늘어납니다. `Textarea`의 크기는 내부 여백과 최소 높이에 적용됩니다. `Menu`의 트리거 크기는 전달한 버튼에서 지정합니다.

```tsx
import { Button, Input, ThemeScope, Typography, createComparisonTokens, createDarkTokens, defaultTokens } from './src/index'

const darkTokens = createDarkTokens(createComparisonTokens(defaultTokens, 'noto-sans', 'comfortable'))

export function ThemePreview() {
  return (
    <ThemeScope tokens={darkTokens} mode="dark">
      <Typography variant="heading">프로젝트 설정</Typography>
      <Input size="md" aria-label="프로젝트 이름" />
      <Button size="md">저장하기</Button>
    </ThemeScope>
  )
}
```

`ThemeScope`의 `mode`는 색상표를 자동 생성하지 않습니다. 다크 영역에는 예제처럼 `createDarkTokens`로 만든 토큰이나 저장된 다크 토큰을 전달하세요. `Select`·`Menu`·`Dialog`·`Popover`·`Tooltip`·`Combobox`·`AlertDialog`·`Sheet`·`Command`·`DatePicker`·`ContextMenu`·`Drawer`·`HoverCard`·`Menubar`·`NavigationMenu`의 팝업과 Toast 알림도 가장 가까운 `ThemeScope`의 글꼴·밀도·색상을 유지합니다. 팝업은 미리보기 카드에 잘리지 않도록 문서 본문에 별도 포털로 표시됩니다. 영역 밖에서는 문서 전체 테마를 사용합니다.

대부분의 컴포넌트는 `className`으로 확장할 수 있습니다. `Dialog`·`Menu`·`Popover`·`Tooltip`·`AlertDialog`·`Sheet`·`Command`의 `trigger`에는 `<Button>` 같은 React 요소를 전달합니다. 폼 컨트롤에는 `Field`나 접근 가능한 라벨을 제공하고, 아이콘만 있는 버튼에는 `aria-label`을 지정하세요. 팝업·선택·토글의 기본 동작에는 Base UI를 사용하며, Calendar와 Command의 목록에는 날짜·검색에 맞춘 키보드 탐색을 제공합니다. 포커스 표시와 모션 감소 설정도 포함합니다. 완전한 접근성 준수를 보증하는 것은 아니므로 실제 서비스의 문구·색상·화면 구성에서 추가 검증이 필요합니다.

### 폼과 피드백 사용 예시

```tsx
import { Accordion, Alert, Progress, RadioGroup, Slider, Switch } from './src/index'

<Switch label="새 댓글 알림" defaultChecked name="comments" />
<RadioGroup aria-label="공유 범위" name="access" defaultValue="team" items={[
  { value: 'private', label: '나만 보기' },
  { value: 'team', label: '팀과 공유' },
]} />
<Slider label="배율" defaultValue={60} min={0} max={100} step={5} showValue />
<Alert title="설정을 저장했어요." tone="success">팀원에게도 적용됩니다.</Alert>
<Progress label="프로젝트 준비" value={60} showValue />
<Accordion items={[{ value: 'source', title: '소스를 수정해도 되나요?', content: '필요한 부분을 직접 다듬으세요.' }]} />
```

`Skeleton`은 장식 요소입니다. 로딩 안내는 이를 감싸는 영역의 `role="status"`, `aria-label`과 `aria-busy`로 제공합니다. `RadioGroup`에는 그룹 이름을, `Slider`에는 `label`이나 `aria-label`을 제공하세요. `Accordion`은 Tab으로 이동하고 Enter·Space로 펼칩니다. 슬라이더는 방향키·Home·End로, 라디오는 방향키로 조작할 수 있습니다.

### Toast 알림과 실행 취소

`useToast`를 호출하는 컴포넌트는 반드시 `ToastProvider`의 자식이어야 합니다. 아래처럼 훅을 사용하는 내부 컴포넌트와 Provider를 나누세요. 화면을 이동해도 알림을 유지하려면 Provider를 화면 전환 영역 바깥에 한 번 배치합니다. 독립된 테마를 사용할 때는 `ThemeScope` 안에 Provider를 놓습니다.

```tsx
import { useState } from 'react'
import { Button, ToastProvider, useToast } from './src/index'

function SaveProjectAction() {
  const [saved, setSaved] = useState(false)
  const { toast } = useToast()

  function save() {
    setSaved(true)
    toast({
      title: '프로젝트 설정을 적용했어요.',
      description: '현재 브라우저의 예제 상태에 반영했습니다.',
      tone: 'success',
      duration: 8000,
      action: { label: '실행 취소', onClick: () => setSaved(false) },
    })
  }

  return (
    <>
      <Button onClick={save}>설정 적용</Button>
      <p>{saved ? '적용한 상태' : '적용 전 상태'}</p>
    </>
  )
}

export function ToastExample() {
  return <ToastProvider><SaveProjectAction /></ToastProvider>
}
```

기본 표시 시간은 5초이고 최대 3개를 표시합니다. `duration: 0`이면 직접 닫을 때까지 유지합니다. `toast(options)`가 반환한 알림 ID를 `dismiss(id)`에 전달해 닫을 수 있으며, 알림 안의 작업 버튼을 실행해도 해당 알림이 닫힙니다. `ToastProvider` 없이 `useToast`를 호출하면 오류로 알려 줍니다.

`AlertDialog`의 `onConfirm`은 동기 함수나 Promise를 받습니다. 비동기 확인 중에는 반복 실행·취소를 막고, 성공하면 닫으며, 예외가 발생하면 오류 문구를 표시한 채 다시 시도할 수 있습니다. `Sheet`는 상세 폼을 담는 모달 패널이고 `side`로 열리는 방향을 정합니다. 두 컴포넌트는 화면 동작만 제공하므로 실제 저장·삭제 요청은 호출하는 앱에서 연결합니다.

### 날짜 선택과 달력 동기화

`DatePicker`와 `Calendar`는 시간대가 없는 일정에 맞춰 브라우저의 **로컬 연·월·일**을 사용합니다. 입력한 `Date`의 시간 부분은 날짜 계산에서 제외합니다. `Calendar`의 기본 단일 선택은 날짜를 고르면 `Date`를 전달하고, `mode="range"`는 `{ start, end }`를 전달합니다. `DatePicker`는 선택을 지울 때 `null`을 포함한 `Date | null`을 전달합니다. 같은 상태를 전달하면 두 화면이 동기화됩니다.

```tsx
import { useState } from 'react'
import { Calendar, DatePicker, Field } from './src/index'

function localDateKey(date: Date | null) {
  if (!date) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function ProjectSchedule() {
  const [dueDate, setDueDate] = useState<Date | null>(null)

  return (
    <>
      <Field label="프로젝트 마감일" description="날짜 선택기와 달력이 같은 날짜를 공유합니다.">
        <DatePicker value={dueDate} onValueChange={setDueDate} clearable />
      </Field>
      <Calendar value={dueDate} onValueChange={setDueDate} aria-label="프로젝트 마감일 달력" />
      <p>{dueDate ? `선택한 날짜: ${localDateKey(dueDate)}` : '마감일 미정'}</p>
    </>
  )
}
```

날짜만 저장할 때는 예시처럼 로컬 날짜 필드로 문자열을 만드세요. `toISOString().slice(0, 10)`은 UTC로 바꾸는 과정에서 선택한 날짜가 달라질 수 있습니다. `minDate`·`maxDate`는 경계를 포함하며, Calendar는 방향키로 날짜를, Home·End로 주의 양 끝을, PageUp·PageDown으로 월을 이동합니다. Shift+PageUp·PageDown은 연 단위로 이동합니다.

### 표·페이지·검색 조합

`Table`은 네이티브 표 요소를 조합하는 API입니다. `TableHeader`·`TableBody`·`TableFooter`·`TableRow`·`TableHead`·`TableCell`·`TableCaption`을 필요한 만큼 사용합니다. 표의 `ref`와 네이티브 속성은 실제 `<table>`에 전달하고, 바깥에는 이름이 있는 키보드 스크롤 영역을 만듭니다. `TableHead`의 기본 `scope`는 `col`이며 행 머리글에는 `scope="row"`를 지정합니다.

```tsx
import {
  Table, TableHeader, TableBody, TableFooter, TableRow,
  TableHead, TableCell, TableCaption,
} from './src/index'

export function TeamTable() {
  return (
    <Table aria-label="팀원 목록" scrollLabel="팀원 표 가로 스크롤">
      <TableCaption>함께하는 사람과 역할</TableCaption>
      <TableHeader>
        <TableRow><TableHead>이름</TableHead><TableHead>역할</TableHead></TableRow>
      </TableHeader>
      <TableBody>
        <TableRow><TableHead scope="row">민지</TableHead><TableCell>관리자</TableCell></TableRow>
        <TableRow><TableHead scope="row">수현</TableHead><TableCell>멤버</TableCell></TableRow>
      </TableBody>
      <TableFooter>
        <TableRow><TableCell colSpan={2}>전체 2명</TableCell></TableRow>
      </TableFooter>
    </Table>
  )
}
```

검색·정렬·필터·페이지별 데이터 계산은 사용하는 화면이 담당합니다. `Pagination`은 1부터 시작하는 `page`·전체 `pageCount`·`onPageChange`를 받아 탐색 버튼을 표시하며, `pageCount={0}`이면 두 방향을 비활성화하고 빈 상태를 안내합니다. 검색이나 필터를 바꿀 때는 화면의 페이지 상태도 1로 돌려주세요. 결과가 없으면 `Empty`의 `children`에 필터 초기화·새 항목 추가 같은 행동을 배치할 수 있습니다.

`Combobox`는 항목의 라벨과 설명을 함께 검색하고 선택한 문자열 `value` 또는 `null`을 전달합니다. `Field`와 함께 쓰면 입력의 라벨·설명·오류가 연결됩니다. `ToggleGroup`은 단일 선택도 `value: string[]`로 다루며, `preventEmpty`를 설정하면 선택한 마지막 항목을 해제하지 못하게 합니다.

`Command`는 라벨·설명·`keywords`를 검색하고 `group`별로 결과를 표시합니다. 방향키로 활성 항목을 이동하고 Enter로 `onSelect`를 실행하며 Escape로 닫습니다. 컴포넌트 자체에는 전역 단축키가 없습니다. Moru 데모 앱이 `Cmd/Ctrl+Shift+K`와 상단 버튼을 연결하며, 다른 앱에서는 `trigger`나 `open/onOpenChange`로 필요한 진입점을 구성하세요.

### 인증 번호 입력

`InputOTP`는 하나의 실제 입력을 여러 칸으로 표시합니다. 네이티브 선택·Backspace·방향키 편집을 유지하며 숫자만 남기고, 공백이나 하이픈이 섞인 코드를 붙여넣을 수 있습니다. 기본 길이는 6자리이며 1~12자리로 제한합니다. 선행 0은 유지하고 완료 시 `onComplete`를 호출합니다. `autoComplete="one-time-code"`와 숫자 입력 모드를 제공하며 SMS 요청이나 실제 인증은 사용하는 앱에서 연결합니다.

```tsx
import { useState } from 'react'
import { Field, InputOTP } from './src/index'

export function VerificationCode() {
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  return (
    <>
      <Field label="인증 번호" description="숫자 6자리를 입력하세요.">
        <InputOTP
          name="verificationCode"
          value={code}
          onValueChange={(next) => { setCode(next); setMessage('') }}
          onComplete={() => setMessage('6자리 입력을 완료했어요.')}
          required
        />
      </Field>
      <p role="status">{message}</p>
    </>
  )
}
```

### 검색·정렬·선택이 있는 Data Table

`Table`의 표 요소 조합에 검색·정렬·열 표시·행 선택·페이지 계산을 연결한 컴포넌트입니다. 열은 `DataTableColumn<T>` 또는 TanStack v9의 `createColumnHelper<DataTableFeatures, T>()`로 정의합니다. `getRowId`에는 데이터가 정렬되거나 페이지를 옮겨도 유지되는 고유 ID를 전달하세요. `onSelectionChange`는 선택한 행 ID 목록을 전달하며 `selectable={false}`로 선택 기능을 끌 수 있습니다. `data`는 브라우저에서 전체 검색·정렬하는 배열이며 서버 페이지 요청은 앱에서 별도로 구성합니다.

```tsx
import { useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTable, type DataTableFeatures } from './src/index'

interface Project { id: string; name: string; progress: number }
const projects: Project[] = [
  { id: 'tokens', name: '디자인 토큰', progress: 100 },
  { id: 'library', name: '컴포넌트', progress: 80 },
  { id: 'docs', name: '사용 가이드', progress: 45 },
]
const helper = createColumnHelper<DataTableFeatures, Project>()
const columns = helper.columns([
  helper.accessor('name', { header: '프로젝트', sortFn: 'text' }),
  helper.accessor('progress', {
    header: '진행률', sortFn: 'basic',
    cell: ({ getValue }) => `${getValue()}%`,
  }),
])

export function Projects() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  return (
    <>
      <DataTable
        caption="프로젝트 목록"
        columns={columns}
        data={projects}
        getRowId={(project) => project.id}
        pageSize={5}
        onSelectionChange={setSelectedIds}
      />
      <p>{selectedIds.length}개 선택</p>
    </>
  )
}
```

### Recharts 기반 차트

`Chart`는 `bar`·`line`·`area`·`donut`을 지원합니다. `config`는 데이터 키별 이름과 색상을 정하며 토큰 CSS 변수를 색상으로 사용할 수 있습니다. 막대·선·영역은 범례 버튼으로 계열을 전환하고, 도넛은 `xKey`로 항목을 나눠 하나의 숫자 계열을 비중으로 표시합니다. 도넛의 숫자 계열이 여러 개면 하나를 골라 확인합니다. 같은 데이터를 표로 펼쳐 읽을 수 있으며, `showLegend`·`showDataTable`로 표시를 조절합니다. `description`은 설명, `chartHeight`는 그래프 높이(px), `style`은 전체 figure 스타일입니다. 직접 차트를 조합할 때는 `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`와 Recharts의 기본 요소를 함께 사용합니다.

컴포넌트 화면의 Chart에서 네 가지 축소 표본과 용도를 비교하고 큰 차트로 전환할 수 있습니다. 도넛 표본은 유입 경로의 비중, 나머지는 주간 방문 추이를 보여줍니다. 기본 표본은 모노톤과 포인트 컬러를 사용하고 라이트·다크 토큰에 맞춰 표시합니다.

```tsx
import { Chart } from './src/index'

export function WeeklyActivity() {
  return (
    <Chart
      title="이번 주의 활동"
      type="line"
      xKey="day"
      data={[
        { day: '월', design: 12, develop: 8 },
        { day: '화', design: 18, develop: 14 },
        { day: '수', design: 15, develop: 20 },
      ]}
      config={{
        design: { label: '디자인', color: 'var(--ui-primary)' },
        develop: { label: '개발', color: 'var(--ui-accent)' },
      }}
    />
  )
}
```

### 크기를 조절하는 패널

`ResizablePanelGroup`의 `orientation`으로 가로·세로를 고르고 `ResizablePanel`의 `defaultSize`·`minSize`·`maxSize`로 제약을 정합니다. v4의 퍼센트 값은 `"35%"`처럼 문자열로 지정합니다. `ResizableHandle`은 포인터 드래그와 방향키 크기 조절을 제공하며 `withHandle={false}`로 장식 손잡이를 숨길 수 있습니다. 그룹을 감싸는 부모에 높이를 지정해야 세로 배치에서도 크기를 나눌 수 있습니다. 그룹 자체는 부모 높이의 100%를 채웁니다.

```tsx
import {
  ResizableHandle, ResizablePanel, ResizablePanelGroup,
} from './src/index'

export function EditorPanels() {
  return (
    <div style={{ height: 240 }}>
    <ResizablePanelGroup orientation="horizontal">
      <ResizablePanel defaultSize="35%" minSize="20%" maxSize="65%">
        <nav aria-label="프로젝트 파일">파일 목록</nav>
      </ResizablePanel>
      <ResizableHandle aria-label="파일 목록과 편집기 너비 조절" />
      <ResizablePanel minSize="35%">편집 공간</ResizablePanel>
    </ResizablePanelGroup>
    </div>
  )
}
```

이번 확장은 [shadcn/ui 공식 컴포넌트 목록](https://ui.shadcn.com/docs/components)의 구성과 사용 패턴을 참고했습니다. 폼·팝업·메뉴는 Base UI를 사용하고, 차트·표·캐러셀·패널은 해당 기능에 맞는 라이브러리와 조합하며 Moru의 토큰·타이포그래피·밀도를 공유합니다. Attachment·Message·Questionnaire·Trace는 표시와 사용자 조작을 위한 컴포넌트이며 파일 서버·실시간 메시지·AI 실행 서비스를 포함하지 않습니다.

## 파일 구성

```text
src/
  index.ts                  공개 컴포넌트·토큰 API
  App.tsx                   갤러리, 예제, 비교, 상태, 내보내기 화면
  styles.css                데모 앱의 레이아웃
  components/
    brand/                  채택한 모노그램 로고·심벌과 브랜드 스타일
    BrandStory.tsx          브랜드 소개·모노그램의 의미·공식 SVG 다운로드
    studio-content.css      전체 화면의 소개 위계·푸터·공통 포커스
    component-gallery.css   갤러리 카드·검색·코드 보기와 여백
    component-catalog.ts    75개 항목·확장 구분·한글 검색어·사용 코드 통합
    ExtendedComponentDemo.tsx 1차 확장 12개의 실제 조작 예제
    extended-component-demo.css 1차 확장 표본·필터·로딩 예제 배치
    AdvancedComponentDemo.tsx 이전 확장 11개의 조합·실패·선택 예제
    advanced-component-demo.css 해당 컴포넌트의 반응형 표본 배치
    completion-controls-catalog.ts 입력·보조 컴포넌트 11개 메타데이터·사용 코드
    CompletionControlsDemo.tsx OTP·RTL·입력 조합·단축키 등 실제 조작
    completion-navigation-catalog.ts 탐색·오버레이 8개 메타데이터·사용 코드
    CompletionNavigationDemo.tsx 메뉴·드로어·탐색·사이드바 조작
    completion-content-catalog.ts 대화·파일·질문·실행 기록 8개 메타데이터·사용 코드
    CompletionContentDemo.tsx 첨부·메시지·코드·설문·실행 흐름 조작
    completion-data-catalog.ts 데이터·패널 5개와 기존 Typography 메타데이터·사용 코드
    CompletionDataDemo.tsx 차트·표·캐러셀·크기 조절·스크롤·글자 역할 조작
    CompletionComponentDemo.tsx 최근 갤러리 42개를 담당 예제로 연결
    reference-workspace.css 토큰·가이드의 공통 화면 여백
    DesignTokensPage.tsx    기본색·의미색·규격 표본·현재 CSS
    design-tokens-page.css  토큰 카드·수치·코드의 반응형 배치
    GettingStartedGuide.tsx 네 단계 시작 가이드와 화면 이동
    getting-started-guide.css 가이드 본문·단계·코드 스타일
    comparison-workspace.css 비교·상태의 안내·필터·탭 공통 스타일
    FoundationComparison.tsx 글꼴·밀도·모드·타이포그래피·크기 비교
    foundation-comparison.css 디자인 비교 카드와 반응형 배치
    StateComparison.tsx     상태·의미 색상·직접 조작 비교
    state-comparison.css    상태 표·의미 색상·실제 조작 폼의 여백
    studio-navigation.css   사이드바의 타이포그래피·여백·포커스
    studio-topbar.css       상단바의 글자 위계와 반응형 도구 배치
    WorkspaceExample.tsx    폼·알림·공개 범위·도움말 조합 예제
    WorkspaceReadiness.tsx  체크리스트·배지·진행률 연동
    WorkspaceTeamPreview.tsx 팀원 검색·필터·페이지·상세 수정·제거·실행 취소
    WorkspaceMembersContext.tsx 팀원 예제 상태와 화면 간 공유
    workspace-members-state.ts 초기 5명·수정·제거·복구 reducer
    workspace-members-state.test.ts 중복·소유자·실행 취소·상태 독립성 검증
    WorkspaceProjectPlan.tsx 담당자·마감일·요약·달력의 일정 연동
    workspace-project-plan.css 프로젝트 입력·일정 미리보기 배치
    WorkspaceAppearancePreview.tsx Slider로 간격을 조절하는 카드
    workspace-example-settings.ts 예제 설정의 초기값과 타입
    workspace-example.css   예제의 폼 구획·여백과 반응형 배치
    brand-story.css         브랜드 소개 화면 스타일
    TokenEditor.tsx         디자인 토큰 편집기
    token-editor.css        편집기 스타일
    inspector-layout.css    상세 설정·모바일 편집 패널의 위계와 여백
    ui/                     75개 갤러리 대응 컴포넌트와 공개 내보내기
      styles.css            공통 외관·폼·피드백 스타일 진입점
      form-controls.css     Switch·RadioGroup·Slider
      feedback.css          Badge·Alert·Avatar·Progress·Separator·Skeleton
      overlays.css          Accordion·Popover·Tooltip(TSX에서 자동 포함)
      toast.tsx             ToastProvider·useToast·전역 알림 영역
      alert-dialog.tsx      위험 작업 확인·비동기 로딩·실패 복구
      sheet.tsx             화면 가장자리의 상세·편집 패널
      advanced-overlays.css Toast·AlertDialog·Sheet(TSX에서 자동 포함)
      combobox.tsx          검색·선택·지우기와 Field 연결
      command.tsx           검색 가능한 작업 목록·그룹·키보드 실행
      table.tsx             네이티브 표 compound API와 스크롤 영역
      pagination.tsx        범위·현재 위치·페이지 이동
      pagination-utils.ts   페이지 범위 보정·생략 계산
      empty.tsx             빈 상태의 안내·아이콘·행동
      toggle-group.tsx      단일·다중 선택 토글
      advanced-controls.css 선택·목록·검색·빈 상태(TSX에서 자동 포함)
      calendar.tsx          단일 날짜·월 이동·그리드 키보드 탐색
      date-picker.tsx       Calendar 팝업·Field 연결·선택 지우기
      calendar-utils.ts     로컬 날짜 계산·범위·월 그리드
      calendar.css          Calendar·DatePicker(TSX에서 자동 포함)
      controls-completion.css OTP·입력 조합·네이티브 선택·보조 컴포넌트 스타일
      input-otp-utils.ts    숫자 정규화·선택 구간 붙여넣기 계산
      navigation-completion.css 탐색·메뉴·드로어·사이드바 스타일
      navigation-menu-items.tsx 중첩 메뉴 항목의 공유 동작
      content-completion.css 첨부·대화·코드·질문·실행 기록 스타일
      data-completion.css   차트·표·캐러셀·패널·스크롤 스타일
      data-table.tsx        TanStack Table v9 기반 데이터 표
      chart.tsx             Recharts 기반 Chart·조합 API·데이터 표
      carousel.tsx          Embla 기반 슬라이드와 키보드 이동
      resizable.tsx         패널·손잡이 공개 API
      scroll-area.tsx       Base UI 기반 스크롤 영역
      typography.tsx        역할별 글자 표현
      theme-scope.tsx       영역별 테마와 팝업 테마 유지
      state.ts              일곱 상태 타입과 이름
      status-message.tsx    아이콘·문구를 포함한 의미 상태 메시지
  theme/
    tokens.ts               기본값, 프리셋, 검증·CSS 변환
    default.css             기본 토큰에서 생성한 스타일
    useTheme.ts             모드·편집·저장·가져오기·내보내기
    tokens.test.ts          토큰 엔진 테스트
    foundations.test.ts     역할·밀도·폰트 조합 및 이관 테스트
    states.test.ts          상태 대비·의미 색상 검증·내보내기 테스트
  lib/cn.ts                 선택적 클래스 결합
```

워크스페이스 설정·초대는 브라우저에서 동작하는 예제입니다. 실제 계정, 서버 저장, 이메일 발송은 연결되어 있지 않으며 예제 폼 값은 새로고침하면 초기화됩니다. 웹 미리보기는 [Moru UI](https://moru-ui-lab.riius.chatgpt.site/)에 공개되어 있습니다. 시뮬레이터는 [#simulator](https://moru-ui-lab.riius.chatgpt.site/#simulator)에서 열 수 있으며 기획은 방문자별 브라우저에 저장됩니다. npm 패키지로는 게시하지 않았습니다.

## 모바일 UI와 Expo

`#mobile`의 **모바일 UI 랩**은 Expo 앱과 동일한 `NativeLabHome`와 `@moru/native`를 React Native Web으로 실행합니다. 전용 HTML로 화면을 다시 그리던 방식은 제거했습니다. 폰 테두리와 상태 바만 랩의 목업이며, 폰 안의 버튼·입력·카드·시트·달력·차트는 실제 네이티브 패키지 소스입니다. `public/native-preview`에 Expo 웹 내보내기를 포함하고 같은 출처의 iframe으로 분리해 웹 React와 앱 React 런타임이 섞이지 않도록 합니다.

지갑·작업·활동, 상세 화면, 실제 Picker·Slider의 웹 구현, 브라우저 대체 날짜 선택, 시스템 탭의 웹 렌더러를 조작할 수 있습니다. 부모의 화면·탐색 설정과 iframe 상태가 동기화되며, 현재 화면이 사용하는 컴포넌트 이름과 소스 경로를 표시합니다. 미리보기·편집기 사이 메시지는 같은 출처와 지정한 부모/자식 창만 받습니다.

공유 테마 JSON `schemaVersion: 2`는 색상·모서리·테두리·간격·밀도와 S/M/L 규격, 역할별 타이포그래피, 대응 컴포넌트의 공통 패딩·마진을 숫자로 연결합니다. 모바일 조작 영역은 최소 48을 유지합니다. Pretendard·Noto Sans 웹폰트는 iframe에도 직접 등록하며, 실제 앱에서 사용자 글꼴을 쓰려면 폰트 파일 등록이 필요합니다. 그림자·모션·모든 OS 내부 여백까지 같은 값으로 적용한다는 의미는 아닙니다.

실제 React Native 구현은 `packages/moru-native`, 실행 앱은 `apps/moru-expo`에 둡니다. 코어 15종·모바일 패턴 11종·차트 2종·OS 컨트롤 3종으로 **총 31종**입니다. 기존 Base UI 웹 라이브러리 75종은 유지하며 네이티브 코드와 디자인 기준을 공유합니다. SwiftUI 전체 API를 대체하는 범위는 아닙니다.

```sh
cd apps/moru-expo
npm install
npx expo start
# 실제 네이티브 개발 빌드
npm run ios
# 또는 npm run android
```

웹 미리보기를 다시 만들 때는 앱 의존성이 설치된 상태에서 루트에서 실행합니다.

```sh
npm run mobile:build  # 실제 Expo 웹 내보내기와 폰트/경로 복사
npm run mobile:check  # 생성물과 현재 네이티브 소스의 체크섬 확인
npm run build         # 체크섬 확인 후 Moru 웹 빌드
```

생성물을 소스와 함께 보관하므로 Moru 웹만 빌드할 때 앱의 네이티브 의존성을 다시 설치할 필요가 없습니다. 네이티브 소스를 바꾸고 생성물을 갱신하지 않으면 빌드가 중단됩니다. iframe 경로 `/native-preview/`와 알려진 예제 상세 경로의 정적 HTML을 함께 내보냅니다.

**플랫폼 지원** 탭은 13개 기능 영역을 공통 패턴·시스템 컨트롤·기기 API로 나눕니다. 사진·문서·공유·햅틱을 무조건 모바일 전용으로 취급하지 않고 브라우저 조건을 표시합니다. 실제 OS 탭 바·뒤로가기 제스처·기기 생체 인증은 웹 대체와 구분합니다. OS 메뉴·카메라·공유·알림·지도 등의 미연결 항목도 명시합니다.

Expo SDK 58.0.19 / RN 0.88.0 / React 19.3.0 기준이며 루트 웹과 별도 의존성·잠금 파일을 사용합니다. 앱의 `.npmrc`는 로컬 소스 패키지를 복사 설치하므로 패키지 수정 후 설치본을 갱신해야 합니다(`mobile:build`에서 자동 동기화). 타입·린트·iOS/Android 번들·웹 내보내기와 브라우저 조작을 확인했으며, OS 런타임·VoiceOver/TalkBack·기기 키보드/제스처 검증은 남아 있습니다.

첨부 화면별 판단과 플랫폼별 범위는 [모바일 커버리지 검토](docs/mobile-audit.md), API는 [네이티브 패키지 안내](packages/moru-native/README.md), 앱 실행은 [Expo 앱 안내](apps/moru-expo/README.md)를 참조하세요. 원본 참고 JPG는 공개 자산에 포함하지 않습니다.


## 2026-10-27 실무 입력과 디자인 품질 개선

웹 컴포넌트는 72종입니다. Number Input, Password Input, Multi Select, File Input, Stepper, Ring Progress를 추가하고 DatePicker의 네이티브 폼 제출·필수값·초기화를 보완했습니다. 예제 화면의 “프로젝트 시작”에서 새 입력과 단계 진행을 조합해 사용할 수 있습니다.

디자인 토큰의 “가독성 · 품질”에서 라이브 색 대비, 글자 200% 확대, 320px 너비와 사용자 행간·자간 변경을 확인합니다. 기본 본문 14px·라벨 13px, 본문·라벨 기본 자간 0, 입력 경계 대비, 긴 버튼의 줄바꿈과 터치 영역을 다듬었습니다. 기존 저장값은 보존하고 권장 타이포그래피는 명시적으로 적용합니다.

`npm run web:starter:build`는 실제 UI/theme 소스와 runnable 예제를 `public/downloads/moru-web-starter.zip`으로 묶습니다. `npm run web:starter:check`는 오래된 소스나 ZIP 불일치를 검사합니다. 소스와 의존성이 바뀌면 다운로드를 다시 생성하세요. [비교 점검과 남은 우선순위](docs/moru-component-audit.md), [디자인 근거](docs/design-foundations-audit.md)를 참고하세요.


## 날짜 범위와 시간 선택

현재 웹 갤러리는 75종입니다. Calendar는 기본·미니멀·일정·활동 네 표현에서 단일 날짜·기간 선택과 상단 년·월 이동을 공유합니다. S/M/L 크기, 날짜 모양, 주 시작 요일, 외부 날짜, 고정 주 수와 날짜별 아이콘·마커·완료 상태를 설정하며, DatePicker·DateRangePicker에도 `calendarOptions`로 같은 표시 옵션을 전달할 수 있습니다. 갤러리의 네 탭에서 설정을 펼쳐 비교하고 현재 코드를 복사하세요. DateRangePicker·TimePicker·TimeRangePicker는 폼 입력으로 사용할 수 있습니다. 시간 `step`은 분 단위이고, 시간 범위는 기본적으로 같은 날의 종료가 시작보다 늦어야 합니다. 자정을 지나는 일정은 `allowOvernight`로 명시합니다. 제출값·초기화·제어 상태와 코드 예시는 [날짜·시간 사용 안내](docs/date-time-controls.md)를 참고하세요.
