# Moru 디자인 기반 점검

검토일: 2026-10-27. 이 문서는 디자인 결정과 검증 범위를 기록한다. 사이트 전체의 WCAG 준수 인증을 의미하지 않는다.

## 근거와 적용

| 영역 | 확인한 기준 | Moru에 적용한 결정 |
| --- | --- | --- |
| 본문 크기 | Carbon은 생산성 UI와 읽기 중심 화면의 기준 크기를 구분한다. | 제품 본문 기본값을 13px에서 14px로 높였다. 긴 설명은 `.ui-prose`로 16px 이상을 사용한다. 14px·16px은 Moru의 시작점이며 WCAG가 강제하는 최소 글자 크기는 아니다. |
| 행간 | 단위 없는 행간은 글자 크기 변경에 함께 반응한다. | Pretendard 본문 1.6, Noto Sans 본문 1.7을 유지한다. 라벨은 1.5/1.55로 유지하며 제목과 본문의 리듬을 구분한다. |
| 자간 | 서체·언어·크기에 맞춰 판단해야 한다. 본문 전체의 음수 자간은 필수 조건이 아니다. | 본문과 라벨의 기본 자간을 0으로 바꿨다. 큰 제목의 제한적인 음수 자간은 브랜드 위계에 사용한다. 수동 편집값은 계속 지원한다. |
| 문장 폭 | WCAG의 시각 표현 설명은 긴 줄과 양쪽 정렬이 읽기를 방해할 수 있다고 설명한다. | 긴 글 유틸리티는 65ch와 40ic 중 작은 폭으로 제한하고 시작 방향으로 정렬한다. 한글·영문과 실제 서체의 폭 차이를 고려한다. 이는 읽기 가이드이며 AA 전체 충족 판정이 아니다. |
| 간격 | Carbon은 가까운 요소의 관계와 넓은 그룹 간격의 위계를 설명한다. | 기본 fieldGap 8 / formGap 24 / sectionGap 32 규칙을 유지한다. 작은 내부 간격과 큰 그룹 간격을 분리하며, 기존 S/M/L 및 수동 조정 규칙을 보존한다. |
| 입력 경계 | 빈 입력창처럼 조작 영역을 식별하는 시각 정보는 인접 색과 3:1 대비가 필요할 수 있다. | 조용한 카드 구분선과 실제 컨트롤 경계를 분리했다. `--ui-control-border`는 surface/background/input 배경을 기준으로 유도하며 hover/pressed도 보완한다. |
| 사용자 글자 간격 | WCAG 1.4.12는 지정 값을 기본 디자인으로 쓰라는 뜻이 아니라, 사용자가 간격을 늘렸을 때 내용·기능을 잃지 않도록 요구한다. | Button/Select/Tabs가 고정 높이와 한 줄 제한에 갇히지 않도록 자동 높이·줄바꿈을 적용했다. 입력창의 문자열은 한 줄 입력 특성에 따라 수평 이동한다. |
| 터치 영역 | WCAG AA 최소 대상은 예외를 포함한 24 CSS px이며, 더 넓은 대상이 조작에 유리하다. | 기본 밀도는 보존하면서 coarse pointer 환경의 주요 입력·버튼·탭과 선택 레이블에 44px 최소 영역을 적용한다. Native의 48px 기준과는 별도의 웹 정책이다. |

## 변경 범위

- `src/theme/tokens.ts`: 새 초기 타이포그래피와 대비가 확보된 컨트롤 경계 토큰.
- `src/theme/default.css`: 같은 토큰 함수로 생성한 라이트·다크 기본 스타일.
- `src/components/ui/styles.css`: 입력창과 호버 경계에 새 토큰 사용. 카드·장식 구분선은 기존 토큰 유지.
- `src/theme/readability.css`: 긴 라벨의 줄바꿈과 자동 높이, 긴 글 유틸리티, 터치 정책, forced-colors 경계.
- `src/theme/tokens.test.ts`: 라이트·다크 프리셋의 기본·호버·누름 경계 대비 및 사용자 색상 보존 검사.
- `src/theme/native-theme.ts`, `packages/moru-native/src/theme.tsx`와 `core.tsx`: 같은 계산 결과를 선택 속성 `colors.controlBorder`로 전달한다. Native TextField·선택하지 않은 Checkbox/Radio·꺼진 Switch에 적용하며, 기존 `border` 색상과 48pt/dp 최소 터치 영역은 유지한다.

기존에 저장하거나 가져온 테마는 덮어쓰지 않는다. 기본값 개선은 새 세션이나 초기화한 기본 테마에 적용된다. 사용자 설정으로 대비·간격이 불리하게 바뀔 수 있으므로 현재 토큰을 기준으로 확인해야 한다. borderWidth를 0으로 지정하면 경계도 사라질 수 있으며, 모든 임의 색상 조합에서 하나의 경계색이 모든 배경과 3:1을 만족할 수 있는 것은 아니다.

## 자동 검증과 실제 화면 검증 구분

자동 검증에서는 3개 기본 프리셋 × 라이트·다크, 기본/호버/누름의 경계 대비를 독립적인 명도 계산으로 검사했다. 원본 팔레트를 변경하지 않고 파생색만 계산하는 것도 확인했다. 기본 그래파이트 경계는 밝은 surface에서 약 3.50:1, 어두운 surface에서 약 3.68:1이다. 테마 관련 181개 테스트를 통과했다.

Native 추가 검증에서는 웹과 Native 내보내기의 경계색 일치, 장식 경계색 보존, 이전 색상 객체의 fallback, 48pt/dp 유지에 관한 11개 테스트 및 React Native 0.88 원본 타입 검사를 통과했다. Expo 브리지는 색상 객체를 포함한 유한·유계 데이터와 동일 출처/부모 창을 검사하므로 선택 색상 추가에 프로토콜 변경은 필요하지 않다. OS Switch의 실제 렌더링과 보조기기 동작은 기기에서 별도로 확인해야 한다.

실제 화면에서는 320 CSS px reflow, 200% 글자 확대, 행간 1.5·문단 뒤 간격 2em·자간 0.12em·단어 간격 0.16em을 함께 적용한 상태, 긴 한글/영문 라벨, 키보드 포커스, 라이트·다크 모드를 별도로 확인해야 한다. 이 문서의 자동 테스트만으로 클리핑·겹침이나 보조기기 동작이 검증되지는 않는다. 데이터 표와 시뮬레이터 캔버스처럼 본질적으로 2차원인 영역은 문서 전체의 가로 넘침과 구분한다.

## 출처

- [Carbon Typography — type sets](https://www.carbondesignsystem.com/building-blocks/foundations/typography/type-sets): 생산성·표현형 본문과 역할별 크기.
- [Carbon Spacing](https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview): 2·4·8 계열 간격, 관계와 위계, 부모 레이아웃이 간격을 관리하는 방식.
- [WCAG 1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html): 사용자 간격 조정 시 내용·기능 보존.
- [WCAG 1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html): 320 CSS px에서의 재배치와 2차원 콘텐츠 예외.
- [WCAG 1.4.8 Visual Presentation](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html): 긴 글의 줄 길이·정렬·행간에 관한 AAA 설명.
- [WCAG 1.4.3 Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): 일반 텍스트 4.5:1, 큰 텍스트 3:1.
- [WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html): 의미 있는 컨트롤 경계·상태의 대비와 경계가 필수적이지 않은 버튼의 구분.
- [WCAG 2.5.8 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): 24 CSS px 최소 대상과 간격·인라인 등의 예외.
- [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/), [React Native Switch](https://reactnative.dev/docs/switch): 현재 앱 SDK와 OS별 track/ios_backgroundColor 동작.
