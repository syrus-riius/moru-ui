export const registryRelease = '0.4.0'
export const registryCliVersion = '4.23.0'
export const registryBaseUrl = `https://moru-ui-lab.riius.chatgpt.site/r/v${registryRelease}`

// Installation metadata stays self-contained so it can also ship in the web starter.
export const registryInstallGroups = [
  {
    "id": "foundation",
    "label": "공통 기반",
    "items": [
      {
        "name": "core",
        "label": "공통 기반",
        "keywords": "토큰 테마 스타일 provider foundation core"
      }
    ]
  },
  {
    "id": "blocks",
    "label": "블록 · 패턴",
    "items": [
      {
        "name": "login",
        "label": "로그인",
        "keywords": "로그인 인증 login authentication"
      },
      {
        "name": "otp",
        "label": "OTP",
        "keywords": "인증 일회용 비밀번호 otp verification"
      },
      {
        "name": "search-filters",
        "label": "검색 필터",
        "keywords": "검색 필터 search filters"
      },
      {
        "name": "settings",
        "label": "설정 폼",
        "keywords": "설정 폼 settings workspace"
      }
    ]
  },
  {
    "id": "forms",
    "label": "폼 · 입력",
    "items": [
      {
        "name": "field",
        "label": "Field",
        "keywords": "폼 · 입력 라벨·도움말·오류 필드 라벨 폼"
      },
      {
        "name": "input",
        "label": "Input",
        "keywords": "폼 · 입력 한 줄 입력 인풋 입력 검색"
      },
      {
        "name": "number-input",
        "label": "Number Input",
        "keywords": "폼 · 입력 숫자·소수·단위와 범위 조절 숫자 수량 금액 넘버 인풋 스테퍼 소수 정밀도"
      },
      {
        "name": "password-input",
        "label": "Password Input",
        "keywords": "폼 · 입력 안전한 입력과 비밀번호 표시 비밀번호 패스워드 보안 표시 숨기기"
      },
      {
        "name": "textarea",
        "label": "Textarea",
        "keywords": "폼 · 입력 여러 줄 입력 텍스트에어리어 텍스트 영역"
      },
      {
        "name": "checkbox",
        "label": "Checkbox",
        "keywords": "폼 · 입력 다중 선택 체크박스 체크 박스"
      },
      {
        "name": "select",
        "label": "Select",
        "keywords": "폼 · 입력 선택 목록 셀렉트 드롭다운"
      },
      {
        "name": "multi-select",
        "label": "Multi Select",
        "keywords": "폼 · 입력 검색하고 여러 항목 선택 다중 선택 멀티 셀렉트 태그 칩 검색 여러 선택"
      },
      {
        "name": "switch",
        "label": "Switch",
        "keywords": "폼 · 입력 설정 켜고 끄기 스위치 토글"
      },
      {
        "name": "radio-group",
        "label": "Radio Group",
        "keywords": "폼 · 입력 하나의 옵션 선택 라디오 라디오그룹 라디오 그룹"
      },
      {
        "name": "slider",
        "label": "Slider",
        "keywords": "폼 · 입력 범위 안의 값 조절 슬라이더"
      },
      {
        "name": "combobox",
        "label": "Combobox",
        "keywords": "폼 · 입력 검색해서 고르는 목록 콤보박스 검색 선택"
      },
      {
        "name": "calendar",
        "label": "Calendar",
        "keywords": "폼 · 입력 기본·미니멀·일정·활동 달력 캘린더 달력 일정"
      },
      {
        "name": "date-picker",
        "label": "Date Picker",
        "keywords": "폼 · 입력 필드에서 날짜 선택 데이트피커 날짜 선택"
      },
      {
        "name": "date-range-picker",
        "label": "Date Range Picker",
        "keywords": "폼 · 입력 시작일과 종료일을 한 번에 선택 날짜 범위 기간 시작일 종료일 캘린더 date range picker"
      },
      {
        "name": "time-picker",
        "label": "Time Picker",
        "keywords": "폼 · 입력 시간 입력과 시·분 빠른 선택 시간 타임 피커 시 분 스케줄 24시간"
      },
      {
        "name": "time-range-picker",
        "label": "Time Range Picker",
        "keywords": "폼 · 입력 시작·종료와 다음 날 시간 범위 시간 범위 타임 레인지 시작 종료 기간 다음날 자정"
      },
      {
        "name": "toggle-group",
        "label": "Toggle Group",
        "keywords": "폼 · 입력 보기와 옵션 전환 토글 그룹 전환"
      },
      {
        "name": "input-group",
        "label": "Input Group",
        "keywords": "폼 · 입력 아이콘과 버튼을 품은 입력 입력그룹 인풋그룹 접두사 접미사 검색"
      },
      {
        "name": "input-otp",
        "label": "Input OTP",
        "keywords": "폼 · 입력 인증 번호 입력과 붙여넣기 인증번호 일회용 비밀번호 오티피 otp"
      },
      {
        "name": "label",
        "label": "Label",
        "keywords": "폼 · 입력 입력과 연결된 이름 라벨 레이블 이름"
      },
      {
        "name": "native-select",
        "label": "Native Select",
        "keywords": "폼 · 입력 기기의 기본 선택 목록 네이티브 셀렉트 기본 선택 목록"
      },
      {
        "name": "file-input",
        "label": "File Input",
        "keywords": "폼 · 입력 실제 파일 선택과 형식·크기 검증 파일 인풋 업로드 첨부 선택 형식 크기 검증"
      },
      {
        "name": "attachment",
        "label": "Attachment",
        "keywords": "폼 · 입력 파일 정보와 첨부 상태 첨부 파일 이미지 업로드 다운로드"
      },
      {
        "name": "questionnaire",
        "label": "Questionnaire",
        "keywords": "폼 · 입력 단계별 질문과 답변 검증 질문 설문 답변 단계 폼 검증"
      }
    ]
  },
  {
    "id": "actions",
    "label": "버튼 · 동작",
    "items": [
      {
        "name": "button",
        "label": "Button",
        "keywords": "버튼 · 동작 동작과 우선순위 버튼"
      },
      {
        "name": "command",
        "label": "Command",
        "keywords": "버튼 · 동작 빠르게 찾고 실행하기 커맨드 명령 검색 팔레트"
      },
      {
        "name": "button-group",
        "label": "Button Group",
        "keywords": "버튼 · 동작 연결된 동작을 한 묶음으로 버튼그룹 버튼 그룹"
      },
      {
        "name": "kbd",
        "label": "Kbd",
        "keywords": "버튼 · 동작 키보드 단축키의 표시 키보드 단축키 키"
      },
      {
        "name": "toggle",
        "label": "Toggle",
        "keywords": "버튼 · 동작 하나의 옵션을 켜고 끄기 토글 켜기 끄기"
      }
    ]
  },
  {
    "id": "overlays",
    "label": "오버레이",
    "items": [
      {
        "name": "dialog",
        "label": "Dialog",
        "keywords": "오버레이 집중된 대화 다이얼로그 모달"
      },
      {
        "name": "menu",
        "label": "Dropdown Menu",
        "keywords": "오버레이 관련 동작 메뉴 드롭다운 dropdown menu"
      },
      {
        "name": "popover",
        "label": "Popover",
        "keywords": "오버레이 맥락 안에서 빠른 설정 팝오버"
      },
      {
        "name": "tooltip",
        "label": "Tooltip",
        "keywords": "오버레이 짧은 보충 설명 툴팁 도움말"
      },
      {
        "name": "alert-dialog",
        "label": "Alert Dialog",
        "keywords": "오버레이 중요한 동작 전 확인 알림대화상자 삭제 확인"
      },
      {
        "name": "sheet",
        "label": "Sheet",
        "keywords": "오버레이 맥락을 유지하는 편집 패널 시트 드로어 패널"
      },
      {
        "name": "context-menu",
        "label": "Context Menu",
        "keywords": "오버레이 우클릭과 길게 누르는 메뉴 컨텍스트 우클릭 맥락 메뉴"
      },
      {
        "name": "drawer",
        "label": "Drawer",
        "keywords": "오버레이 아래에서 끌어 여닫는 패널 드로어 아래 패널 끌기"
      },
      {
        "name": "hover-card",
        "label": "Hover Card",
        "keywords": "오버레이 마우스와 포커스로 보는 미리보기 호버카드 미리보기 프로필"
      }
    ]
  },
  {
    "id": "navigation",
    "label": "탐색",
    "items": [
      {
        "name": "tabs",
        "label": "Tabs",
        "keywords": "탐색 콘텐츠 전환 탭"
      },
      {
        "name": "pagination",
        "label": "Pagination",
        "keywords": "탐색 긴 목록의 페이지 이동 페이지네이션 페이지 이동"
      },
      {
        "name": "breadcrumb",
        "label": "Breadcrumb",
        "keywords": "탐색 현재 위치와 상위 단계 브레드크럼 경로 현재위치"
      },
      {
        "name": "menubar",
        "label": "Menubar",
        "keywords": "탐색 연결된 애플리케이션 메뉴 메뉴바 메뉴 모음"
      },
      {
        "name": "navigation-menu",
        "label": "Navigation Menu",
        "keywords": "탐색 주요 화면과 하위 탐색 내비게이션 네비게이션 탐색 메뉴"
      },
      {
        "name": "sidebar",
        "label": "Sidebar",
        "keywords": "탐색 접을 수 있는 반응형 탐색 사이드바 측면 탐색 반응형"
      },
      {
        "name": "stepper",
        "label": "Stepper",
        "keywords": "탐색 검증하며 이어가는 단계별 흐름 스테퍼 단계 단계별 폼 마법사 온보딩 wizard step"
      }
    ]
  },
  {
    "id": "layout",
    "label": "레이아웃",
    "items": [
      {
        "name": "card",
        "label": "Card",
        "keywords": "레이아웃 콘텐츠 묶음 카드"
      },
      {
        "name": "accordion",
        "label": "Accordion",
        "keywords": "레이아웃 차례로 펼치는 정보 아코디언 접기 펼치기"
      },
      {
        "name": "avatar",
        "label": "Avatar",
        "keywords": "레이아웃 사람과 팀의 표시 아바타 프로필"
      },
      {
        "name": "separator",
        "label": "Separator",
        "keywords": "레이아웃 콘텐츠 사이의 구분 구분선 세퍼레이터"
      },
      {
        "name": "aspect-ratio",
        "label": "Aspect Ratio",
        "keywords": "레이아웃 콘텐츠의 비율을 일정하게 종횡비 비율 이미지"
      },
      {
        "name": "direction",
        "label": "Direction",
        "keywords": "레이아웃 읽기 방향과 키보드 이동 디렉션 방향 rtl ltr 국제화"
      },
      {
        "name": "item",
        "label": "Item",
        "keywords": "레이아웃 정보와 동작을 담은 목록 항목 아이템 항목 목록"
      },
      {
        "name": "collapsible",
        "label": "Collapsible",
        "keywords": "레이아웃 필요할 때 펼치는 내용 콜랩시블 접기 펼치기"
      },
      {
        "name": "carousel",
        "label": "Carousel",
        "keywords": "레이아웃 넘기며 살펴보는 콘텐츠 캐러셀 슬라이드"
      },
      {
        "name": "resizable",
        "label": "Resizable",
        "keywords": "레이아웃 직접 조절하는 작업 공간 리사이저블 크기 조절 패널"
      },
      {
        "name": "scroll-area",
        "label": "Scroll Area",
        "keywords": "레이아웃 콘텐츠 안에서 이어지는 탐색 스크롤 영역"
      },
      {
        "name": "typography",
        "label": "Typography",
        "keywords": "레이아웃 역할이 분명한 글자 타이포그래피 글꼴 글자"
      }
    ]
  },
  {
    "id": "feedback",
    "label": "상태 · 피드백",
    "items": [
      {
        "name": "badge",
        "label": "Badge",
        "keywords": "상태 · 피드백 작은 상태와 분류 배지 뱃지"
      },
      {
        "name": "alert",
        "label": "Alert",
        "keywords": "상태 · 피드백 놓치지 않아야 할 안내 알림 경고 안내"
      },
      {
        "name": "progress",
        "label": "Progress",
        "keywords": "상태 · 피드백 작업의 진행 상황 진행률 프로그레스"
      },
      {
        "name": "ring-progress",
        "label": "Ring Progress",
        "keywords": "상태 · 피드백 목표와 구성비를 읽는 원형 진행률 링 프로그레스 원형 진행률 목표 구성비 저장공간 circle ring"
      },
      {
        "name": "skeleton",
        "label": "Skeleton",
        "keywords": "상태 · 피드백 기다리는 동안의 윤곽 스켈레톤 로딩"
      },
      {
        "name": "toast",
        "label": "Toast",
        "keywords": "상태 · 피드백 결과 알림과 실행 취소 토스트 알림 실행취소"
      },
      {
        "name": "empty",
        "label": "Empty",
        "keywords": "상태 · 피드백 빈 화면의 다음 행동 빈 상태 없음"
      },
      {
        "name": "spinner",
        "label": "Spinner",
        "keywords": "상태 · 피드백 진행 중인 작업의 표시 스피너 로딩 대기"
      },
      {
        "name": "marker",
        "label": "Marker",
        "keywords": "상태 · 피드백 대화 속 상태와 구분 마커 대화 상태 구분선 시스템 노트"
      },
      {
        "name": "status-message",
        "label": "Status Message",
        "keywords": "상태 메시지 성공 오류 정보 status message"
      }
    ]
  },
  {
    "id": "data",
    "label": "데이터",
    "items": [
      {
        "name": "table",
        "label": "Table",
        "keywords": "데이터 비교하고 관리하는 데이터 테이블 표"
      },
      {
        "name": "chart",
        "label": "Chart",
        "keywords": "데이터 막대·선·영역·도넛의 기본 차트 그래프 데이터 막대 선 영역 도넛 bar line area donut"
      },
      {
        "name": "data-table",
        "label": "Data Table",
        "keywords": "데이터 검색·정렬·선택을 한곳에 데이터 테이블 정렬 필터 검색"
      }
    ]
  },
  {
    "id": "conversation",
    "label": "대화 · 콘텐츠",
    "items": [
      {
        "name": "bubble",
        "label": "Bubble",
        "keywords": "대화 · 콘텐츠 대화의 표면과 반응 버블 말풍선 대화 반응"
      },
      {
        "name": "code-block",
        "label": "Code Block",
        "keywords": "대화 · 콘텐츠 복사와 줄번호가 있는 코드 코드 블록 복사 줄번호 터미널"
      },
      {
        "name": "message",
        "label": "Message",
        "keywords": "대화 · 콘텐츠 사람과 내용을 묶는 메시지 메시지 메세지 채팅 대화"
      },
      {
        "name": "message-scroller",
        "label": "Message Scroller",
        "keywords": "대화 · 콘텐츠 읽던 위치를 지키는 대화 메시지 스크롤 채팅 최신 대화"
      },
      {
        "name": "trace",
        "label": "Trace",
        "keywords": "대화 · 콘텐츠 단계별 실행 상태와 상세 트레이스 작업 단계 실행 추적 로그"
      }
    ]
  }
] as const

export type RegistryInstallGroupId = typeof registryInstallGroups[number]['id']
export type RegistryInstallOption = typeof registryInstallGroups[number]['items'][number]
export type RegistryInstallItem = RegistryInstallOption['name']

export const registryInstallItems: readonly RegistryInstallOption[] = registryInstallGroups.flatMap<RegistryInstallOption>((group) => [...group.items])

export function registryInstallCommand(item: RegistryInstallItem) {
  return `npx shadcn@${registryCliVersion} add ${registryBaseUrl}/${item}.json`
}
