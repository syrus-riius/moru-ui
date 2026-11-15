import type { MessageCatalog } from '../../lib/locale'
export const simulatorMessages: MessageCatalog = {
  '기본 요소': { en: 'Basics', ja: '基本要素', 'zh-CN': '基础元素' },
  '화면 레이아웃 방식': {
    en: 'Screen layout mode',
    ja: '画面のレイアウト方式',
    'zh-CN': '屏幕布局方式',
  },
  '컨테이너 레이아웃 방식': {
    en: 'Container layout mode',
    ja: 'コンテナーのレイアウト方式',
    'zh-CN': '容器布局方式',
  },
  '화면 요소 간격': { en: 'Screen element gap', ja: '画面の要素間隔', 'zh-CN': '屏幕元素间距' },
  '컨테이너 요소 간격': {
    en: 'Container element gap',
    ja: 'コンテナーの要素間隔',
    'zh-CN': '容器元素间距',
  },
  '화면 안쪽 여백': { en: 'Screen padding', ja: '画面の内側余白', 'zh-CN': '屏幕内边距' },
  '컨테이너 안쪽 여백': {
    en: 'Container padding',
    ja: 'コンテナーの内側余白',
    'zh-CN': '容器内边距',
  },
  '{count}개 선택 · ': {
    en: '{count} selected · ',
    ja: '{count}個を選択・',
    'zh-CN': '已选择 {count} 个 · ',
  },
  '미리보기 안내': {
    en: 'Preview notice',
    ja: 'プレビューのお知らせ',
    'zh-CN': '预览提示',
  },
  '잠시 확인해 주세요.': {
    en: 'Please take a moment to review.',
    ja: '内容をご確認ください。',
    'zh-CN': '请查看以下内容。',
  },
  확인했어요: {
    en: 'Got it',
    ja: '確認しました',
    'zh-CN': '知道了',
  },
  '한 프로젝트에는 화면을 20개까지 만들 수 있어요. 화면을 정리한 뒤 다시 넣어 주세요.': {
    en: 'A project can contain up to 20 screens. Remove a screen before adding this block.',
    ja: '1つのプロジェクトに作成できる画面は20個までです。画面を整理してから追加してください。',
    'zh-CN': '每个项目最多可创建 20 个屏幕。请整理屏幕后再添加。',
  },
  '{value0} 블록을 새 화면에 넣었어요.': {
    en: 'Added the {value0} block to a new screen.',
    ja: '{value0}ブロックを新しい画面に追加しました。',
    'zh-CN': '已将 {value0} 区块添加到新屏幕。',
  },
  '각 요소를 선택해 문구와 배치를 편집하고 화면 이동을 연결하세요.': {
    en: 'Select elements to edit their content and layout, then connect screen navigation.',
    ja: '要素を選んで文言と配置を編集し、画面遷移をつなげましょう。',
    'zh-CN': '选择元素来编辑文字和布局，并连接屏幕跳转。',
  },
  '한 화면에는 100개까지 배치할 수 있어요.': {
    en: 'Each screen can contain up to 100 elements.',
    ja: '1画面に配置できる要素は100個までです。',
    'zh-CN': '每个屏幕最多可放置 100 个元素。',
  },
  '요소를 붙여넣지 못했어요. 다시 복사해 주세요.': {
    en: 'Couldn’t paste the elements. Copy them again.',
    ja: '要素を貼り付けられませんでした。もう一度コピーしてください。',
    'zh-CN': '无法粘贴元素。请重新复制。',
  },
  '{value0}개 요소를 붙여넣었어요.': {
    en: 'Pasted {value0} elements.',
    ja: '{value0}個の要素を貼り付けました。',
    'zh-CN': '已粘贴 {value0} 个元素。',
  },
  '{count}개 요소를 잘라냈어요.': {
    en: 'Cut {count} elements.',
    ja: '{count}個の要素を切り取りました。',
    'zh-CN': '已剪切 {count} 个元素。',
  },
  '{count}개 요소를 복사했어요.': {
    en: 'Copied {count} elements.',
    ja: '{count}個の要素をコピーしました。',
    'zh-CN': '已复制 {count} 个元素。',
  },
  '복사하지 못했어요. 더 적은 요소를 선택해 다시 시도해 주세요.': {
    en: 'Couldn’t copy. Select fewer elements and try again.',
    ja: 'コピーできませんでした。選択する要素を減らして再試行してください。',
    'zh-CN': '复制失败。请减少选中的元素后重试。',
  },
  '한 프로젝트에는 화면을 20개까지 만들 수 있어요.': {
    en: 'A project can contain up to 20 screens.',
    ja: '1つのプロジェクトに作成できる画面は20個までです。',
    'zh-CN': '每个项目最多可创建 20 个屏幕。',
  },
  '화면을 삭제했어요.': {
    en: 'Screen deleted.',
    ja: '画面を削除しました。',
    'zh-CN': '屏幕已删除。',
  },
  '연결된 이동 동작도 정리했습니다. 되돌리기로 복원할 수 있어요.': {
    en: 'Linked navigation actions were also removed. Use Undo to restore them.',
    ja: '関連する画面遷移も削除しました。元に戻す操作で復元できます。',
    'zh-CN': '相关跳转操作也已清理。可通过撤销恢复。',
  },
  '이동할 화면을 먼저 연결해 주세요.': {
    en: 'Connect a destination screen first.',
    ja: '先に移動先の画面を設定してください。',
    'zh-CN': '请先连接目标屏幕。',
  },
  '이전 화면이 없어요. 시작 화면에서 흐름을 실행해 보세요.': {
    en: 'There is no previous screen. Run the flow from the start screen.',
    ja: '前の画面がありません。開始画面からフローを実行してください。',
    'zh-CN': '没有上一个屏幕。请从起始屏幕运行流程。',
  },
  '동작을 확인했어요.': {
    en: 'Action confirmed.',
    ja: '動作を確認しました。',
    'zh-CN': '操作已确认。',
  },
  '기획 파일을 내보냈어요.': {
    en: 'Design file exported.',
    ja: '設計ファイルを書き出しました。',
    'zh-CN': '设计文件已导出。',
  },
  '기획 파일을 확인해 주세요.': {
    en: 'Check the design file.',
    ja: '設計ファイルを確認してください。',
    'zh-CN': '请检查设计文件。',
  },
  '1MB 이하의 기획 파일을 선택해 주세요.': {
    en: 'Choose a design file no larger than 1MB.',
    ja: '1MB以下の設計ファイルを選んでください。',
    'zh-CN': '请选择不超过 1MB 的设计文件。',
  },
  '기획 파일을 불러왔어요.': {
    en: 'Design file imported.',
    ja: '設計ファイルを読み込みました。',
    'zh-CN': '设计文件已导入。',
  },
  '이전 기획은 되돌리기로 복원할 수 있어요.': {
    en: 'Use Undo to restore the previous design.',
    ja: '元に戻す操作で以前の設計を復元できます。',
    'zh-CN': '可通过撤销恢复之前的设计。',
  },
  '기획 파일을 읽지 못했어요.': {
    en: 'Couldn’t read the design file.',
    ja: '設計ファイルを読み込めませんでした。',
    'zh-CN': '无法读取设计文件。',
  },
  '반응형 가계부 예제를 불러왔어요.': {
    en: 'Loaded the responsive budget example.',
    ja: 'レスポンシブ家計簿の例を読み込みました。',
    'zh-CN': '已加载响应式记账示例。',
  },
  '로그인부터 상세까지, 기본 예제를 불러왔어요.': {
    en: 'Loaded the starter flow from login to details.',
    ja: 'ログインから詳細画面までの基本例を読み込みました。',
    'zh-CN': '已加载从登录到详情的基础示例。',
  },
  'Moru 시뮬레이터': {
    en: 'Moru simulator',
    ja: 'Moruシミュレーター',
    'zh-CN': 'Moru 模拟器',
  },
  시뮬레이터: {
    en: 'Simulator',
    ja: 'シミュレーター',
    'zh-CN': '模拟器',
  },
  '화면 설계': {
    en: 'Screen design',
    ja: '画面設計',
    'zh-CN': '屏幕设计',
  },
  '컴포넌트를 배치하고, 화면의 흐름을 확인하세요.': {
    en: 'Arrange components and explore your screen flow.',
    ja: 'コンポーネントを配置し、画面の流れを確認しましょう。',
    'zh-CN': '放置组件，预览屏幕流程。',
  },
  '개인 브라우저에 보관': {
    en: 'Stored in your browser',
    ja: '自分のブラウザーに保存',
    'zh-CN': '保存在你的浏览器中',
  },
  '자동 저장 실패 · 파일로 내보내 주세요': {
    en: 'Autosave failed · Export your file',
    ja: '自動保存に失敗・ファイルを書き出してください',
    'zh-CN': '自动保存失败 · 请导出文件',
  },
  '내 브라우저에 저장됨': {
    en: 'Saved in your browser',
    ja: 'ブラウザーに保存済み',
    'zh-CN': '已保存到浏览器',
  },
  '변경하면 자동 저장': {
    en: 'Changes save automatically',
    ja: '変更すると自動保存',
    'zh-CN': '更改后自动保存',
  },
  '기획 파일': {
    en: 'Design file',
    ja: '設計ファイル',
    'zh-CN': '设计文件',
  },
  '반응형 예제': {
    en: 'Responsive example',
    ja: 'レスポンシブの例',
    'zh-CN': '响应式示例',
  },
  '기본 예제': {
    en: 'Starter example',
    ja: '基本の例',
    'zh-CN': '基础示例',
  },
  불러오기: {
    en: 'Import',
    ja: '読み込み',
    'zh-CN': '导入',
  },
  '시뮬레이터 기획 파일 불러오기': {
    en: 'Import simulator design file',
    ja: 'シミュレーターの設計ファイルを読み込む',
    'zh-CN': '导入模拟器设计文件',
  },
  '기획 변경 되돌리기': {
    en: 'Undo design change',
    ja: '設計の変更を元に戻す',
    'zh-CN': '撤销设计更改',
  },
  '되돌리기 ({value0}Z)': {
    en: 'Undo ({value0}Z)',
    ja: '元に戻す（{value0}Z）',
    'zh-CN': '撤销 ({value0}Z)',
  },
  '기획 변경 다시 실행': {
    en: 'Redo design change',
    ja: '設計の変更をやり直す',
    'zh-CN': '重做设计更改',
  },
  '다시 실행 ({value0}⇧Z)': {
    en: 'Redo ({value0}⇧Z)',
    ja: 'やり直す（{value0}⇧Z）',
    'zh-CN': '重做 ({value0}⇧Z)',
  },
  '선택 요소 편집': {
    en: 'Edit selection',
    ja: '選択した要素を編集',
    'zh-CN': '编辑所选元素',
  },
  '현재 화면 전체 선택': {
    en: 'Select all on the current screen',
    ja: '現在の画面ですべて選択',
    'zh-CN': '选择当前屏幕的所有元素',
  },
  '전체 선택 ({value0}A)': {
    en: 'Select all ({value0}A)',
    ja: 'すべて選択（{value0}A）',
    'zh-CN': '全选 ({value0}A)',
  },
  '선택 요소 복제': {
    en: 'Duplicate selection',
    ja: '選択した要素を複製',
    'zh-CN': '复制所选元素',
  },
  '복제 ({value0}D)': {
    en: 'Duplicate ({value0}D)',
    ja: '複製（{value0}D）',
    'zh-CN': '复制 ({value0}D)',
  },
  '선택 요소 삭제': {
    en: 'Delete selection',
    ja: '選択した要素を削除',
    'zh-CN': '删除所选元素',
  },
  '삭제 (Delete / Backspace)': {
    en: 'Delete (Delete / Backspace)',
    ja: '削除（Delete / Backspace）',
    'zh-CN': '删除 (Delete / Backspace)',
  },
  '시뮬레이터 표현 방식': {
    en: 'Simulator appearance',
    ja: 'シミュレーターの表示形式',
    'zh-CN': '模拟器显示方式',
  },
  와이어프레임: {
    en: 'Wireframe',
    ja: 'ワイヤーフレーム',
    'zh-CN': '线框图',
  },
  'Moru 스타일': {
    en: 'Moru style',
    ja: 'Moruスタイル',
    'zh-CN': 'Moru 风格',
  },
  '시뮬레이터 단축키 보기': {
    en: 'View simulator shortcuts',
    ja: 'シミュレーターのショートカットを表示',
    'zh-CN': '查看模拟器快捷键',
  },
  '단축키 (?)': {
    en: 'Shortcuts (?)',
    ja: 'ショートカット（?）',
    'zh-CN': '快捷键 (?)',
  },
  '다시 시작': {
    en: 'Restart',
    ja: '再スタート',
    'zh-CN': '重新开始',
  },
  '편집으로 돌아가기': {
    en: 'Back to editing',
    ja: '編集に戻る',
    'zh-CN': '返回编辑',
  },
  '8px 맞춤': {
    en: 'Snap to 8px',
    ja: '8pxにスナップ',
    'zh-CN': '对齐到 8px',
  },
  '흐름 실행': {
    en: 'Run flow',
    ja: 'フローを実行',
    'zh-CN': '运行流程',
  },
  '화면과 컴포넌트 목록': {
    en: 'Screens and components',
    ja: '画面とコンポーネントの一覧',
    'zh-CN': '屏幕与组件列表',
  },
  '시뮬레이터 왼쪽 패널': {
    en: 'Simulator left panel',
    ja: 'シミュレーターの左パネル',
    'zh-CN': '模拟器左侧面板',
  },
  레이어: {
    en: 'Layers',
    ja: 'レイヤー',
    'zh-CN': '图层',
  },

  '컴포넌트 찾기': {
    en: 'Find components',
    ja: 'コンポーネントを探す',
    'zh-CN': '查找组件',
  },
  '시뮬레이터 컴포넌트 검색': {
    en: 'Search simulator components',
    ja: 'シミュレーターのコンポーネントを検索',
    'zh-CN': '搜索模拟器组件',
  },
  '끌어서 놓거나 눌러 추가하세요.': {
    en: 'Drag to place or click to add.',
    ja: 'ドラッグして配置するか、クリックして追加してください。',
    'zh-CN': '拖放或点击添加。',
  },
  '{value0} 추가': {
    en: 'Add {value0}',
    ja: '{value0}を追加',
    'zh-CN': '添加{value0}',
  },
  '컨테이너를 선택한 뒤 요소를 추가하면 안에 배치됩니다.': {
    en: 'Select a container before adding elements to place them inside it.',
    ja: 'コンテナーを選んでから要素を追加すると、その中に配置されます。',
    'zh-CN': '选择容器后添加元素，元素会放入容器内部。',
  },
  '자유 배치': {
    en: 'Free layout',
    ja: '自由配置',
    'zh-CN': '自由布局',
  },
  '자동 레이아웃': {
    en: 'Auto layout',
    ja: '自動レイアウト',
    'zh-CN': '自动布局',
  },
  '화면 요소 계층': {
    en: 'Screen element hierarchy',
    ja: '画面要素の階層',
    'zh-CN': '屏幕元素层级',
  },
  '아직 배치한 요소가 없어요.': {
    en: 'No elements placed yet.',
    ja: 'まだ要素が配置されていません。',
    'zh-CN': '尚未放置元素。',
  },
  '{count}개 요소': {
    en: '{count} elements',
    ja: '{count}個の要素',
    'zh-CN': '{count} 个元素',
  },
  '시작 화면': {
    en: 'Start screen',
    ja: '開始画面',
    'zh-CN': '起始屏幕',
  },
  '새 화면': {
    en: 'New screen',
    ja: '新しい画面',
    'zh-CN': '新屏幕',
  },
  '현재 화면 복제': {
    en: 'Duplicate current screen',
    ja: '現在の画面を複製',
    'zh-CN': '复制当前屏幕',
  },
  복제: {
    en: 'Duplicate',
    ja: '複製',
    'zh-CN': '复制',
  },
  '현재 화면 삭제': {
    en: 'Delete current screen',
    ja: '現在の画面を削除',
    'zh-CN': '删除当前屏幕',
  },
  삭제: {
    en: 'Delete',
    ja: '削除',
    'zh-CN': '删除',
  },
  '연결한 흐름': {
    en: 'Connected flows',
    ja: '接続したフロー',
    'zh-CN': '已连接的流程',
  },
  '대상 선택 필요': {
    en: 'Choose a destination',
    ja: '移動先を選択',
    'zh-CN': '需要选择目标',
  },
  '버튼을 선택하고 이동할 화면을 연결하세요.': {
    en: 'Select a button and connect a destination screen.',
    ja: 'ボタンを選び、移動先の画面を設定してください。',
    'zh-CN': '选择按钮并连接目标屏幕。',
  },
  '실행 이전 화면으로': {
    en: 'Go back in preview',
    ja: '実行中の前の画面へ',
    'zh-CN': '返回预览中的上一个屏幕',
  },
  '실행 중': {
    en: 'Running',
    ja: '実行中',
    'zh-CN': '运行中',
  },
  '편집할 화면': {
    en: 'Screen to edit',
    ja: '編集する画面',
    'zh-CN': '要编辑的屏幕',
  },
  '화면 크기와 속성 편집': {
    en: 'Edit screen size and properties',
    ja: '画面のサイズとプロパティを編集',
    'zh-CN': '编辑屏幕大小与属性',
  },
  '반응형 프레임': {
    en: 'Responsive frame',
    ja: 'レスポンシブフレーム',
    'zh-CN': '响应式画框',
  },
  '{value0} 프레임': {
    en: '{value0} frame',
    ja: '{value0}フレーム',
    'zh-CN': '{value0}画框',
  },
  웹: {
    en: 'Web',
    ja: 'ウェブ',
    'zh-CN': '网页',
  },
  '캔버스 축소': {
    en: 'Zoom out',
    ja: 'キャンバスを縮小',
    'zh-CN': '缩小画布',
  },
  '캔버스 화면에 맞추기': {
    en: 'Fit canvas to screen',
    ja: 'キャンバスを画面に合わせる',
    'zh-CN': '画布适应屏幕',
  },
  '캔버스 확대': {
    en: 'Zoom in',
    ja: 'キャンバスを拡大',
    'zh-CN': '放大画布',
  },
  '{value0} 실행 화면': {
    en: '{value0} preview screen',
    ja: '{value0}の実行画面',
    'zh-CN': '{value0}运行屏幕',
  },
  '화면 동작 실행': {
    en: 'Run screen action',
    ja: '画面の動作を実行',
    'zh-CN': '执行屏幕操作',
  },
  '실행 알림 닫기': {
    en: 'Dismiss preview notice',
    ja: '実行通知を閉じる',
    'zh-CN': '关闭运行通知',
  },
  '입력과 동작은 이 미리보기 안에서만 실행됩니다.': {
    en: 'Inputs and actions run only within this preview.',
    ja: '入力と動作はこのプレビュー内でのみ実行されます。',
    'zh-CN': '输入与操作仅在此预览中执行。',
  },
  '드래그로 이동·순서 변경 · Shift+클릭으로 추가 선택': {
    en: 'Drag to move or reorder · Shift+click to add to selection',
    ja: 'ドラッグで移動・並べ替え／Shift+クリックで追加選択',
    'zh-CN': '拖动以移动或排序 · Shift+点击追加选择',
  },
  '컴포넌트를 놓거나 선택해 화면을 다듬어 보세요.': {
    en: 'Place or select components to refine your screen.',
    ja: 'コンポーネントを配置・選択して画面を整えましょう。',
    'zh-CN': '放置或选择组件来调整屏幕。',
  },
  '{value0} / {value1} 화면': {
    en: 'Screen {value0} / {value1}',
    ja: '画面 {value0} / {value1}',
    'zh-CN': '屏幕 {value0} / {value1}',
  },
  '{value0}{value1}개 요소': {
    en: '{value0}{value1} elements',
    ja: '{value0}{value1}個の要素',
    'zh-CN': '{value0}{value1} 个元素',
  },
  '사이트를 방문하는 다른 사람에게 내 기획은 보이지 않습니다. 기획 파일로 저장하고 다시 불러올 수 있어요.':
    {
      en: 'Your designs are private to your browser. Export a design file to save it and import it later.',
      ja: '設計内容は他の訪問者には見えません。設計ファイルとして保存し、後から読み込めます。',
      'zh-CN': '其他访问者看不到你的设计。可以导出设计文件保存，并在之后重新导入。',
    },
  '시뮬레이터 단축키': {
    en: 'Simulator shortcuts',
    ja: 'シミュレーターのショートカット',
    'zh-CN': '模拟器快捷键',
  },
  '현재 편집하는 화면의 컴포넌트에 적용됩니다.': {
    en: 'Applies to components on the screen you are editing.',
    ja: '現在編集中の画面のコンポーネントに適用されます。',
    'zh-CN': '适用于当前编辑屏幕中的组件。',
  },
  '전체 선택': {
    en: 'Select all',
    ja: 'すべて選択',
    'zh-CN': '全选',
  },
  복사: {
    en: 'Copy',
    ja: 'コピー',
    'zh-CN': '复制',
  },
  붙여넣기: {
    en: 'Paste',
    ja: '貼り付け',
    'zh-CN': '粘贴',
  },
  잘라내기: {
    en: 'Cut',
    ja: '切り取り',
    'zh-CN': '剪切',
  },
  되돌리기: {
    en: 'Undo',
    ja: '元に戻す',
    'zh-CN': '撤销',
  },
  '다시 실행': {
    en: 'Redo',
    ja: 'やり直す',
    'zh-CN': '重做',
  },
  '자유 배치 이동 / 자동 배치 순서': {
    en: 'Move freely / Reorder auto layout',
    ja: '自由配置の移動／自動配置の並べ替え',
    'zh-CN': '移动自由布局元素 / 调整自动布局顺序',
  },
  '8px 이동': {
    en: 'Move by 8px',
    ja: '8px移動',
    'zh-CN': '移动 8px',
  },
  '선택 추가·해제': {
    en: 'Add to / Remove from selection',
    ja: '選択に追加・解除',
    'zh-CN': '追加选择 / 取消选择',
  },
  클릭: {
    en: 'Click',
    ja: 'クリック',
    'zh-CN': '点击',
  },
  '선택 해제': {
    en: 'Deselect',
    ja: '選択解除',
    'zh-CN': '取消选择',
  },
  '여러 요소를 함께 복사·삭제할 수 있어요. 자동 배치에서는 방향키로 순서를 바꿉니다. 입력창 안에서는 글자 선택과 복사·붙여넣기가 그대로 작동합니다.':
    {
      en: 'Copy or delete multiple elements together. Arrow keys reorder items in auto layout. Text selection and clipboard shortcuts keep working normally inside inputs.',
      ja: '複数の要素をまとめてコピー・削除できます。自動配置では矢印キーで順序を変更します。入力欄内では文字の選択やコピー・貼り付けが通常どおり動作します。',
      'zh-CN':
        '可同时复制或删除多个元素。自动布局中用方向键调整顺序。输入框内的文字选择、复制和粘贴功能保持正常。',
    },
  '한 줄에 한 행을 적고, 열은 | 로 구분해요. 첫 줄은 열 제목입니다.': {
    en: 'Enter one row per line and separate columns with |. The first line contains column headers.',
    ja: '1行に1レコードを入力し、列は | で区切ります。最初の行は列見出しです。',
    'zh-CN': '每行输入一条记录，用 | 分隔列。第一行为列标题。',
  },
  '한 줄에 하나씩 적어 주세요. 다른 곳을 누르면 화면에 반영됩니다.': {
    en: 'Enter one item per line. Click elsewhere to apply your changes.',
    ja: '1行に1項目ずつ入力してください。別の場所をクリックすると反映されます。',
    'zh-CN': '每行输入一个项目。点击其他位置后应用更改。',
  },
  '차트 데이터': {
    en: 'Chart data',
    ja: 'チャートデータ',
    'zh-CN': '图表数据',
  },
  '한 줄에 항목 | 숫자를 입력하세요. 예: 월 | 120. 최대 30개 항목을 사용할 수 있어요. 도넛은 0 이상의 값으로 비중을 표시합니다.':
    {
      en: 'Enter item | number on each line, for example Mon | 120. Supports up to 30 items. Donut charts use nonnegative values to show proportions.',
      ja: '各行に「項目 | 数値」を入力してください。例：月 | 120。最大30項目です。ドーナツは0以上の値で割合を表示します。',
      'zh-CN':
        '每行输入「项目 | 数字」，例如：周一 | 120。最多支持 30 项。环形图使用非负数值显示占比。',
    },
  '{rows}번째 줄을 확인해 주세요. 올바른 항목만 차트에 표시됩니다.': {
    en: 'Check lines {rows}. Only valid entries appear in the chart.',
    ja: '{rows}行目を確認してください。有効な項目のみチャートに表示されます。',
    'zh-CN': '请检查第 {rows} 行。图表仅显示有效项目。',
  },
  '시뮬레이터 속성': {
    en: 'Simulator properties',
    ja: 'シミュレーターのプロパティ',
    'zh-CN': '模拟器属性',
  },
  '{value0}개 요소 선택': {
    en: '{value0} elements selected',
    ja: '{value0}個の要素を選択',
    'zh-CN': '已选择 {value0} 个元素',
  },
  '화면 속성': {
    en: 'Screen settings',
    ja: '画面設定',
    'zh-CN': '屏幕设置',
  },
  ' · 다중 선택': {
    en: ' · Multiple selection',
    ja: '・複数選択',
    'zh-CN': ' · 多选',
  },
  '선택한 요소': {
    en: 'Selected elements',
    ja: '選択した要素',
    'zh-CN': '所选元素',
  },
  '외 {count}개 요소가 함께 선택되어 있어요.': {
    en: '{count} more elements are selected.',
    ja: 'ほかに{count}個の要素が選択されています。',
    'zh-CN': '另外还选中了 {count} 个元素。',
  },
  'Shift+클릭으로 선택을 더하거나 빼세요. 개별 속성을 수정하려면 요소 하나만 선택하세요.': {
    en: 'Shift+click to add or remove elements. Select a single element to edit its individual properties.',
    ja: 'Shift+クリックで選択を追加・解除できます。個別のプロパティを編集するには要素を1つだけ選択してください。',
    'zh-CN': 'Shift+点击可追加或取消选择。编辑单独属性时，请只选择一个元素。',
  },
  '컨테이너로 묶기': {
    en: 'Wrap in a container',
    ja: 'コンテナーにまとめる',
    'zh-CN': '包裹到容器中',
  },
  '세로 스택': {
    en: 'Vertical stack',
    ja: '縦スタック',
    'zh-CN': '垂直堆叠',
  },
  '가로 스택': {
    en: 'Horizontal stack',
    ja: '横スタック',
    'zh-CN': '水平堆叠',
  },
  그리드: {
    en: 'Grid',
    ja: 'グリッド',
    'zh-CN': '网格',
  },
  '선택한 요소를 하나로 묶고, 간격과 반응형 규칙을 함께 조정해요.': {
    en: 'Group the selected elements and adjust spacing and responsive rules together.',
    ja: '選択した要素をまとめ、間隔とレスポンシブルールを一緒に調整します。',
    'zh-CN': '将所选元素分组，统一调整间距与响应式规则。',
  },
  '선택 영역': {
    en: 'Selection bounds',
    ja: '選択範囲',
    'zh-CN': '选区',
  },
  '선택 영역 위치와 크기': {
    en: 'Selection position and size',
    ja: '選択範囲の位置とサイズ',
    'zh-CN': '选区位置与大小',
  },
  '가로 위치 X': {
    en: 'Horizontal position X',
    ja: '横位置 X',
    'zh-CN': '水平位置 X',
  },
  '세로 위치 Y': {
    en: 'Vertical position Y',
    ja: '縦位置 Y',
    'zh-CN': '垂直位置 Y',
  },
  '전체 너비': {
    en: 'Total width',
    ja: '全体の幅',
    'zh-CN': '总宽度',
  },
  '전체 높이': {
    en: 'Total height',
    ja: '全体の高さ',
    'zh-CN': '总高度',
  },
  '드래그나 방향키로 함께 이동할 수 있어요. 복사·붙여넣기 단축키도 사용할 수 있습니다.': {
    en: 'Move elements together by dragging or using arrow keys. Copy and paste shortcuts are also available.',
    ja: 'ドラッグや矢印キーでまとめて移動できます。コピー・貼り付けのショートカットも使用できます。',
    'zh-CN': '可通过拖动或方向键整体移动，也支持复制与粘贴快捷键。',
  },
  '선택한 요소 관리': {
    en: 'Manage selection',
    ja: '選択した要素を管理',
    'zh-CN': '管理所选元素',
  },
  '선택한 요소 복제': {
    en: 'Duplicate selected elements',
    ja: '選択した要素を複製',
    'zh-CN': '复制选中的元素',
  },
  '모두 복제': {
    en: 'Duplicate all',
    ja: 'すべて複製',
    'zh-CN': '全部复制',
  },
  '선택한 요소 삭제': {
    en: 'Delete selected elements',
    ja: '選択した要素を削除',
    'zh-CN': '删除选中的元素',
  },
  '모두 삭제': {
    en: 'Delete all',
    ja: 'すべて削除',
    'zh-CN': '全部删除',
  },
  '선택한 요소 맨 앞으로': {
    en: 'Bring selected elements to front',
    ja: '選択した要素を最前面へ',
    'zh-CN': '将所选元素置于顶层',
  },
  '맨 앞으로': {
    en: 'Bring to front',
    ja: '最前面へ',
    'zh-CN': '置于顶层',
  },
  '선택한 요소 맨 뒤로': {
    en: 'Send selected elements to back',
    ja: '選択した要素を最背面へ',
    'zh-CN': '将所选元素置于底层',
  },
  '맨 뒤로': {
    en: 'Send to back',
    ja: '最背面へ',
    'zh-CN': '置于底层',
  },
  '삭제하거나 바꾼 내용은 되돌리기로 복원할 수 있어요.': {
    en: 'Use Undo to restore deleted or changed content.',
    ja: '削除や変更は元に戻す操作で復元できます。',
    'zh-CN': '可通过撤销恢复删除或修改的内容。',
  },
  내용: {
    en: 'Content',
    ja: '内容',
    'zh-CN': '内容',
  },
  '요소 이름': {
    en: 'Name',
    ja: '名前',
    'zh-CN': '名称',
  },
  '이미지 설명': {
    en: 'Image description',
    ja: '画像の説明',
    'zh-CN': '图片说明',
  },
  '이름 · 문구': {
    en: 'Name · Text',
    ja: '名前・文言',
    'zh-CN': '名称 · 文本',
  },
  '텍스트 내용': {
    en: 'Text content',
    ja: 'テキスト内容',
    'zh-CN': '文本内容',
  },
  설명: {
    en: 'Description',
    ja: '説明',
    'zh-CN': '说明',
  },
  '차트 종류': {
    en: 'Chart type',
    ja: 'チャートの種類',
    'zh-CN': '图表类型',
  },
  '막대 · 항목 비교': {
    en: 'Bar · Compare categories',
    ja: '棒・項目の比較',
    'zh-CN': '柱状图 · 比较项目',
  },
  '선 · 변화 추이': {
    en: 'Line · Trends over time',
    ja: '折れ線・変化の推移',
    'zh-CN': '折线图 · 变化趋势',
  },
  '영역 · 규모와 흐름': {
    en: 'Area · Volume and trends',
    ja: '面・規模と流れ',
    'zh-CN': '面积图 · 规模与趋势',
  },
  '도넛 · 전체 중 비중': {
    en: 'Donut · Share of total',
    ja: 'ドーナツ・全体に占める割合',
    'zh-CN': '环形图 · 整体占比',
  },
  '글자 역할': {
    en: 'Text role',
    ja: '文字の役割',
    'zh-CN': '文字角色',
  },
  제목: {
    en: 'Heading',
    ja: '見出し',
    'zh-CN': '标题',
  },
  '입력 안내 문구': {
    en: 'Placeholder',
    ja: '入力のヒント',
    'zh-CN': '输入提示',
  },
  '초기 값': {
    en: 'Initial value',
    ja: '初期値',
    'zh-CN': '初始值',
  },
  '입력 형식': {
    en: 'Input type',
    ja: '入力形式',
    'zh-CN': '输入类型',
  },
  '일반 텍스트': {
    en: 'Plain text',
    ja: '通常のテキスト',
    'zh-CN': '普通文本',
  },

  비밀번호: {
    en: 'Password',
    ja: 'パスワード',
    'zh-CN': '密码',
  },
  '비밀번호는 실행 중에만 입력하며 기획 파일에 저장하지 않습니다.': {
    en: 'Passwords are entered only during preview and are not saved in the design file.',
    ja: 'パスワードは実行中にのみ入力し、設計ファイルには保存しません。',
    'zh-CN': '密码仅在运行时输入，不会保存在设计文件中。',
  },
  '처음부터 선택됨': {
    en: 'Selected by default',
    ja: '初期状態で選択',
    'zh-CN': '默认选中',
  },
  '필수 입력': {
    en: 'Required',
    ja: '必須入力',
    'zh-CN': '必填',
  },
  '콘텐츠를 구분하는 선입니다. 위치와 크기로 길이를 조절하세요.': {
    en: 'A line that separates content. Adjust its length with position and size controls.',
    ja: '内容を区切る線です。位置とサイズで長さを調整してください。',
    'zh-CN': '用于分隔内容的线条。通过位置和大小调整长度。',
  },
  '배치 구조': {
    en: 'Layout structure',
    ja: '配置構造',
    'zh-CN': '布局结构',
  },
  '소속 컨테이너': {
    en: 'Parent container',
    ja: '親コンテナー',
    'zh-CN': '父容器',
  },
  '화면 바로 아래': {
    en: 'Directly on screen',
    ja: '画面直下',
    'zh-CN': '直接位于屏幕下',
  },
  '이름 없는 컨테이너': {
    en: 'Untitled container',
    ja: '名前のないコンテナー',
    'zh-CN': '未命名容器',
  },
  '요소 너비': {
    en: 'Element width',
    ja: '要素の幅',
    'zh-CN': '元素宽度',
  },
  '남는 너비 채우기': {
    en: 'Fill available width',
    ja: '空き幅を埋める',
    'zh-CN': '填满剩余宽度',
  },
  '고정 너비': {
    en: 'Fixed width',
    ja: '固定幅',
    'zh-CN': '固定宽度',
  },
  '위치는 소속 레이아웃이 정해요. 드래그하거나 아래 순서 버튼으로 같은 그룹 안에서 순서를 바꿀 수 있습니다.':
    {
      en: 'The parent layout determines position. Drag or use the order buttons below to reorder items within the group.',
      ja: '位置は親レイアウトで決まります。ドラッグや下の順序ボタンで同じグループ内の並び順を変えられます。',
      'zh-CN': '位置由父布局决定。可拖动或使用下方排序按钮调整组内顺序。',
    },
  '컨테이너 높이': {
    en: 'Container height',
    ja: 'コンテナーの高さ',
    'zh-CN': '容器高度',
  },
  '콘텐츠에 맞추기': {
    en: 'Fit content',
    ja: '内容に合わせる',
    'zh-CN': '适应内容',
  },
  '최소 높이 지정': {
    en: 'Set minimum height',
    ja: '最小高さを指定',
    'zh-CN': '设置最小高度',
  },
  '지정한 높이보다 작아지지 않아요. 콘텐츠가 많아지면 자동으로 더 늘어납니다.': {
    en: 'Stays at least this tall and grows automatically as content increases.',
    ja: '指定した高さより小さくなりません。内容が増えると自動で伸びます。',
    'zh-CN': '不会小于指定高度。内容增加时会自动增高。',
  },
  '안쪽 요소와 여백에 맞춰 높이를 자동으로 정해요.': {
    en: 'Height adjusts automatically to the inner elements and spacing.',
    ja: '内側の要素と余白に合わせて高さを自動調整します。',
    'zh-CN': '根据内部元素和间距自动确定高度。',
  },
  '레이아웃 순서 앞으로': {
    en: 'Move earlier in layout order',
    ja: 'レイアウト順を前へ',
    'zh-CN': '在布局中前移',
  },
  '앞 순서': {
    en: 'Move earlier',
    ja: '順序を前へ',
    'zh-CN': '前移',
  },
  '레이아웃 순서 뒤로': {
    en: 'Move later in layout order',
    ja: 'レイアウト順を後ろへ',
    'zh-CN': '在布局中后移',
  },
  '뒤 순서': {
    en: 'Move later',
    ja: '順序を後ろへ',
    'zh-CN': '后移',
  },
  '컨테이너 배경': {
    en: 'Container background',
    ja: 'コンテナーの背景',
    'zh-CN': '容器背景',
  },
  '배경 채우기': {
    en: 'Background fill',
    ja: '背景の塗り',
    'zh-CN': '背景填充',
  },
  투명: {
    en: 'Transparent',
    ja: '透明',
    'zh-CN': '透明',
  },
  '컨테이너 자동 레이아웃': {
    en: 'Container auto layout',
    ja: 'コンテナーの自動レイアウト',
    'zh-CN': '容器自动布局',
  },
  '위치와 크기': {
    en: 'Position and size',
    ja: '位置とサイズ',
    'zh-CN': '位置与大小',
  },
  너비: {
    en: 'Width',
    ja: '幅',
    'zh-CN': '宽度',
  },
  '최소 높이': {
    en: 'Minimum height',
    ja: '最小高さ',
    'zh-CN': '最小高度',
  },
  '요소의 고정 크기와 컨테이너의 최소 높이만 직접 조절해요. 채우기 너비와 콘텐츠 높이는 자동으로 계산합니다.':
    {
      en: 'Only fixed element sizes and the container’s minimum height are edited directly. Fill width and content height are calculated automatically.',
      ja: '要素の固定サイズとコンテナーの最小高さのみ直接調整します。幅の充填と内容の高さは自動計算されます。',
      'zh-CN': '仅直接调整元素固定尺寸与容器最小高度。填充宽度和内容高度会自动计算。',
    },
  '캔버스에서 방향키로 이동하고, Shift와 함께 누르면 더 크게 이동해요.': {
    en: 'Use arrow keys to move on the canvas. Hold Shift for larger steps.',
    ja: 'キャンバスでは矢印キーで移動します。Shiftと同時に押すと移動幅が大きくなります。',
    'zh-CN': '使用方向键在画布上移动，按住 Shift 可增大步幅。',
  },
  스타일: {
    en: 'Style',
    ja: 'スタイル',
    'zh-CN': '样式',
  },
  강조: {
    en: 'Primary',
    ja: '強調',
    'zh-CN': '强调',
  },
  외곽선: {
    en: 'Outline',
    ja: 'アウトライン',
    'zh-CN': '描边',
  },
  '배경 없음': {
    en: 'No background',
    ja: '背景なし',
    'zh-CN': '无背景',
  },
  '클릭했을 때': {
    en: 'On click',
    ja: 'クリック時',
    'zh-CN': '点击时',
  },
  동작: {
    en: 'Action',
    ja: '動作',
    'zh-CN': '操作',
  },
  '동작 없음': {
    en: 'No action',
    ja: '動作なし',
    'zh-CN': '无操作',
  },
  '다른 화면으로 이동': {
    en: 'Navigate to another screen',
    ja: '別の画面へ移動',
    'zh-CN': '跳转到其他屏幕',
  },
  '이전 화면으로 돌아가기': {
    en: 'Go to previous screen',
    ja: '前の画面に戻る',
    'zh-CN': '返回上一个屏幕',
  },
  '모달 열기': {
    en: 'Open modal',
    ja: 'モーダルを開く',
    'zh-CN': '打开模态框',
  },
  '알림 표시': {
    en: 'Show notification',
    ja: '通知を表示',
    'zh-CN': '显示通知',
  },
  '이동할 화면': {
    en: 'Destination screen',
    ja: '移動先の画面',
    'zh-CN': '目标屏幕',
  },
  '화면을 선택해 주세요.': {
    en: 'Choose a screen.',
    ja: '画面を選択してください。',
    'zh-CN': '请选择屏幕。',
  },
  ' (현재 화면)': {
    en: ' (current screen)',
    ja: '（現在の画面）',
    'zh-CN': '（当前屏幕）',
  },
  '연결할 화면을 선택하면 실행 중에 이동할 수 있어요.': {
    en: 'Choose a destination to navigate there during preview.',
    ja: '接続先の画面を選ぶと、実行中に移動できます。',
    'zh-CN': '选择连接的屏幕后，即可在运行时跳转。',
  },
  '필수 입력을 확인한 뒤 이동': {
    en: 'Validate required fields before navigating',
    ja: '必須入力を確認してから移動',
    'zh-CN': '验证必填项后跳转',
  },
  '모달 내용': {
    en: 'Modal content',
    ja: 'モーダルの内容',
    'zh-CN': '模态框内容',
  },
  '알림 문구': {
    en: 'Notification text',
    ja: '通知の文言',
    'zh-CN': '通知文本',
  },
  '상단의 실행 버튼을 누르면 연결한 동작을 시험할 수 있어요.': {
    en: 'Use the Run button above to try connected actions.',
    ja: '上部の実行ボタンで、設定した動作を試せます。',
    'zh-CN': '点击上方运行按钮可测试已连接的操作。',
  },
  '요소 관리': {
    en: 'Manage element',
    ja: '要素の管理',
    'zh-CN': '管理元素',
  },
  '화면 정보': {
    en: 'Screen information',
    ja: '画面情報',
    'zh-CN': '屏幕信息',
  },
  '화면 이름': {
    en: 'Screen name',
    ja: '画面名',
    'zh-CN': '屏幕名称',
  },
  '자유 배치 요소의 크기': {
    en: 'Free-layout element sizing',
    ja: '自由配置要素のサイズ',
    'zh-CN': '自由布局元素尺寸',
  },
  '가로 폭에 맞춤': {
    en: 'Adapt to width',
    ja: '幅に合わせる',
    'zh-CN': '适应宽度',
  },
  '배치 유지': {
    en: 'Keep layout',
    ja: '配置を維持',
    'zh-CN': '保持布局',
  },
  '자유 배치 요소만 가로 폭에 맞춥니다. 자동 레이아웃 안의 요소는 해당 스택·그리드 규칙을 따라요.':
    {
      en: 'Only free-layout elements adapt to the width. Auto-layout elements follow their stack or grid rules.',
      ja: '自由配置の要素のみ幅に合わせます。自動レイアウト内の要素はスタック・グリッドのルールに従います。',
      'zh-CN': '仅自由布局元素会适应宽度。自动布局内的元素遵循对应的堆叠或网格规则。',
    },
  '자유 배치 요소의 위치와 크기를 유지합니다. 자동 레이아웃 안의 요소는 계속 반응형으로 배치돼요.':
    {
      en: 'Keep the position and size of free-layout elements. Auto-layout elements remain responsive.',
      ja: '自由配置の要素の位置とサイズを維持します。自動レイアウト内の要素は引き続きレスポンシブに配置されます。',
      'zh-CN': '保持自由布局元素的位置与大小。自动布局内的元素继续响应式排列。',
    },
  '프레임 크기': {
    en: 'Frame size',
    ja: 'フレームサイズ',
    'zh-CN': '画框大小',
  },
  '화면 너비': {
    en: 'Screen width',
    ja: '画面の幅',
    'zh-CN': '屏幕宽度',
  },
  '화면 높이': {
    en: 'Screen height',
    ja: '画面の高さ',
    'zh-CN': '屏幕高度',
  },
  '모바일·태블릿은 기기 테두리와 함께 보여요. 자동 레이아웃의 열 수와 쌓기 규칙은 프레임 너비에 맞춰 바뀝니다. 프레임 변경도 되돌릴 수 있어요.':
    {
      en: 'Mobile and tablet previews include a device frame. Auto-layout columns and stacking adapt to the frame width. Frame changes can also be undone.',
      ja: 'モバイル・タブレットには端末の枠が表示されます。自動レイアウトの列数と積み重ねルールはフレーム幅に合わせて変わります。フレームの変更も元に戻せます。',
      'zh-CN':
        '手机和平板预览带有设备边框。自动布局的列数与堆叠规则随画框宽度变化。画框更改也可以撤销。',
    },
  '화면 자동 레이아웃': {
    en: 'Screen auto layout',
    ja: '画面の自動レイアウト',
    'zh-CN': '屏幕自动布局',
  },
  '화면 바로 아래 요소에 적용해요. 컨테이너 내부의 배치는 컨테이너를 선택해 따로 조정할 수 있습니다.':
    {
      en: 'Applies to direct children of the screen. Select a container to adjust its internal layout separately.',
      ja: '画面直下の要素に適用します。コンテナー内の配置は、コンテナーを選んで個別に調整できます。',
      'zh-CN': '应用于屏幕下的直接子元素。选择容器可单独调整内部布局。',
    },
  '이 화면에서 실행 시작': {
    en: 'Start preview here',
    ja: 'この画面から実行',
    'zh-CN': '从此屏幕开始运行',
  },
  '시작 화면으로 지정': {
    en: 'Set as start screen',
    ja: '開始画面に設定',
    'zh-CN': '设为起始屏幕',
  },
  '실행을 누르면 지정한 시작 화면부터 연결된 흐름을 확인합니다.': {
    en: 'Run starts the connected flow from the designated start screen.',
    ja: '実行すると、指定した開始画面から接続したフローを確認できます。',
    'zh-CN': '点击运行后，会从指定的起始屏幕预览连接的流程。',
  },
  '요소를 선택해 보세요.': {
    en: 'Select an element.',
    ja: '要素を選んでみましょう。',
    'zh-CN': '请选择一个元素。',
  },
  '문구와 크기를 다듬고, 클릭했을 때 이동할 화면을 연결할 수 있어요.': {
    en: 'Refine its text and size, then connect a screen to open on click.',
    ja: '文言やサイズを調整し、クリック時の移動先を設定できます。',
    'zh-CN': '可调整文字与大小，并连接点击时跳转的屏幕。',
  },
  '픽셀 단위': {
    en: 'Pixels',
    ja: 'ピクセル単位',
    'zh-CN': '像素单位',
  },
  '열 단위': {
    en: 'Columns',
    ja: '列単位',
    'zh-CN': '列数单位',
  },
  컨테이너: {
    en: 'Container',
    ja: 'コンテナー',
    'zh-CN': '容器',
  },
  모바일: {
    en: 'Mobile',
    ja: 'モバイル',
    'zh-CN': '手机',
  },
  태블릿: {
    en: 'Tablet',
    ja: 'タブレット',
    'zh-CN': '平板',
  },
  '{value0} 레이아웃 방식': {
    en: '{value0} layout mode',
    ja: '{value0}のレイアウト方式',
    'zh-CN': '{value0}布局方式',
  },
  '요소를 원하는 위치에 직접 놓습니다. 스택이나 그리드를 선택하면 안쪽 요소가 순서대로 자동 배치돼요.':
    {
      en: 'Place elements anywhere. Choose a stack or grid to arrange child elements automatically in order.',
      ja: '要素を好きな位置に配置します。スタックやグリッドを選ぶと、内側の要素が順番に自動配置されます。',
      'zh-CN': '将元素放在任意位置。选择堆叠或网格后，内部元素会按顺序自动排列。',
    },
  '최대 {value0}열 그리드': {
    en: 'Up to {value0} grid columns',
    ja: '最大{value0}列のグリッド',
    'zh-CN': '最多 {value0} 列网格',
  },
  '가로로 배치': {
    en: 'Arrange horizontally',
    ja: '横に配置',
    'zh-CN': '水平排列',
  },
  '세로로 배치': {
    en: 'Arrange vertically',
    ja: '縦に配置',
    'zh-CN': '垂直排列',
  },
  '{value0} 요소 간격': {
    en: '{value0} element gap',
    ja: '{value0}の要素間隔',
    'zh-CN': '{value0}元素间距',
  },
  '{value0} 안쪽 여백': {
    en: '{value0} padding',
    ja: '{value0}の内側余白',
    'zh-CN': '{value0}内边距',
  },
  '셀 안 가로 정렬': {
    en: 'Horizontal alignment in cell',
    ja: 'セル内の横揃え',
    'zh-CN': '单元格内水平对齐',
  },
  '가로 정렬': {
    en: 'Horizontal alignment',
    ja: '横揃え',
    'zh-CN': '水平对齐',
  },
  '세로 정렬': {
    en: 'Vertical alignment',
    ja: '縦揃え',
    'zh-CN': '垂直对齐',
  },
  '늘려 채우기': {
    en: 'Stretch',
    ja: '引き伸ばして埋める',
    'zh-CN': '拉伸填充',
  },
  시작: {
    en: 'Start',
    ja: '開始',
    'zh-CN': '起点',
  },
  가운데: {
    en: 'Center',
    ja: '中央',
    'zh-CN': '居中',
  },
  끝: {
    en: 'End',
    ja: '終了',
    'zh-CN': '终点',
  },
  '콘텐츠에 맞춤 컨테이너를 같은 행의 높이에 맞춰 늘려요. 고정 크기는 유지합니다.': {
    en: 'Stretch content-sized containers to match the row height. Fixed sizes stay unchanged.',
    ja: '内容に合わせたコンテナーを同じ行の高さまで伸ばします。固定サイズは維持します。',
    'zh-CN': '将适应内容的容器拉伸至同一行的高度。固定尺寸保持不变。',
  },
  '너비 채우기 요소는 가로 폭에 맞추고, 고정 너비 요소는 시작점에 맞춰요.': {
    en: 'Fill-width elements expand to the available width; fixed-width elements align to the start.',
    ja: '幅を埋める要素は横幅に合わせ、固定幅の要素は始点に揃えます。',
    'zh-CN': '填充宽度的元素会占满可用宽度，固定宽度的元素对齐起点。',
  },
  '세로 배치 정렬': {
    en: 'Vertical distribution',
    ja: '縦方向の配置',
    'zh-CN': '垂直分布',
  },
  '가로 배치 정렬': {
    en: 'Horizontal distribution',
    ja: '横方向の配置',
    'zh-CN': '水平分布',
  },
  시작부터: {
    en: 'From start',
    ja: '始点から',
    'zh-CN': '从起点开始',
  },
  '끝에 맞춤': {
    en: 'Align to end',
    ja: '終点に揃える',
    'zh-CN': '对齐终点',
  },
  '남는 간격 균등 분배': {
    en: 'Space between',
    ja: '余白を均等に分配',
    'zh-CN': '均分剩余间距',
  },
  '프레임별 열 수': {
    en: 'Columns by frame',
    ja: 'フレーム別の列数',
    'zh-CN': '各画框列数',
  },
  '모바일 열 수': {
    en: 'Mobile columns',
    ja: 'モバイルの列数',
    'zh-CN': '手机列数',
  },
  '태블릿 열 수': {
    en: 'Tablet columns',
    ja: 'タブレットの列数',
    'zh-CN': '平板列数',
  },
  '웹 열 수': {
    en: 'Web columns',
    ja: 'ウェブの列数',
    'zh-CN': '网页列数',
  },
  '모바일에서 세로로 쌓기': {
    en: 'Stack vertically on mobile',
    ja: 'モバイルでは縦に積む',
    'zh-CN': '手机端垂直堆叠',
  },
  '모바일은 600px 미만, 태블릿은 1,024px 미만, 웹은 그 이상으로 구분합니다. 프레임 너비에 맞춰 배치를 다시 계산해요.':
    {
      en: 'Mobile is below 600px, tablet below 1,024px, and web above that. Layout is recalculated for the frame width.',
      ja: '600px未満はモバイル、1,024px未満はタブレット、それ以上はウェブです。フレーム幅に合わせて配置を再計算します。',
      'zh-CN': '小于 600px 为手机，小于 1,024px 为平板，其余为网页。布局会根据画框宽度重新计算。',
    },
  '너비 채우기를 켠 요소는 프레임에 맞춰 늘어나고, 콘텐츠가 길어지면 안쪽에서 스크롤할 수 있어요.':
    {
      en: 'Elements set to fill width expand with the frame. Long content can scroll inside.',
      ja: '幅を埋める要素はフレームに合わせて伸び、長い内容は内部でスクロールできます。',
      'zh-CN': '启用填充宽度的元素会随画框伸展，较长内容可在内部滚动。',
    },
  '와이어프레임 편집 작업 공간': {
    en: 'Wireframe editing workspace',
    ja: 'ワイヤーフレーム編集エリア',
    'zh-CN': '线框图编辑工作区',
  },
  '첫 컴포넌트를 놓아보세요.': {
    en: 'Place your first component.',
    ja: '最初のコンポーネントを置いてみましょう。',
    'zh-CN': '放置第一个组件。',
  },
  '왼쪽에서 드래그하거나 항목을 눌러 추가하세요.': {
    en: 'Drag from the left or click an item to add it.',
    ja: '左からドラッグするか、項目をクリックして追加してください。',
    'zh-CN': '从左侧拖放或点击项目添加。',
  },
  '{name} {component} 선택됨': {
    en: '{name}, {component}, selected',
    ja: '{name}、{component}、選択済み',
    'zh-CN': '{name}，{component}，已选中',
  },
  '{name} {component} 선택': {
    en: 'Select {name}, {component}',
    ja: '{name}、{component}を選択',
    'zh-CN': '选择{name}，{component}',
  },
  '배치한 컴포넌트': {
    en: 'Placed component',
    ja: '配置したコンポーネント',
    'zh-CN': '已放置的组件',
  },
  ' · 자동': {
    en: ' · Auto',
    ja: '・自動',
    'zh-CN': ' · 自动',
  },
  '{value0} 크기 조절': {
    en: 'Resize {value0}',
    ja: '{value0}のサイズを変更',
    'zh-CN': '调整{value0}大小',
  },
  '{count}개 선택됨': {
    en: '{count} selected',
    ja: '{count}個を選択',
    'zh-CN': '已选择 {count} 个',
  },
  값: {
    en: 'Value',
    ja: '値',
    'zh-CN': '数值',
  },
  '새 차트': {
    en: 'New chart',
    ja: '新しいチャート',
    'zh-CN': '新图表',
  },
  '{rows}번째 줄을 확인해 주세요.': {
    en: 'Check lines {rows}.',
    ja: '{rows}行目を確認してください。',
    'zh-CN': '请检查第 {rows} 行。',
  },
  ' 도넛에는 0 이상의 값을 사용해요.': {
    en: ' Use nonnegative values for donut charts.',
    ja: 'ドーナツには0以上の値を使用してください。',
    'zh-CN': '环形图请使用非负数值。',
  },
  '이름 없는 요소': {
    en: 'Untitled element',
    ja: '名前のない要素',
    'zh-CN': '未命名元素',
  },
  '선택해 주세요.': {
    en: 'Select an option.',
    ja: '選択してください。',
    'zh-CN': '请选择。',
  },
  '{value0} 불러오는 중': {
    en: 'Loading {value0}',
    ja: '{value0}を読み込み中',
    'zh-CN': '正在加载{value0}',
  },
  '{value0} 화면의 내용': {
    en: 'Content for {value0}',
    ja: '{value0}画面の内容',
    'zh-CN': '{value0}屏幕内容',
  },
  '첫 번째 항목': {
    en: 'First item',
    ja: '1つ目の項目',
    'zh-CN': '第一个项目',
  },
  '두 번째 항목': {
    en: 'Second item',
    ja: '2つ目の項目',
    'zh-CN': '第二个项目',
  },
  '세 번째 항목': {
    en: 'Third item',
    ja: '3つ目の項目',
    'zh-CN': '第三个项目',
  },
  '항목 {value0}': {
    en: 'Item {value0}',
    ja: '項目{value0}',
    'zh-CN': '项目 {value0}',
  },
  '{value0} 열기': {
    en: 'Open {value0}',
    ja: '{value0}を開く',
    'zh-CN': '打开{value0}',
  },
  '이름 | 상태': {
    en: 'Name | Status',
    ja: '名前 | 状態',
    'zh-CN': '名称 | 状态',
  },
  '첫 번째 작업 | 진행 중': {
    en: 'First task | In progress',
    ja: '最初のタスク | 進行中',
    'zh-CN': '第一个任务 | 进行中',
  },
  '두 번째 작업 | 완료': {
    en: 'Second task | Complete',
    ja: '2つ目のタスク | 完了',
    'zh-CN': '第二个任务 | 已完成',
  },
  항목: {
    en: 'Item',
    ja: '項目',
    'zh-CN': '项目',
  },
  '{value0} 표 영역': {
    en: '{value0} table area',
    ja: '{value0}の表領域',
    'zh-CN': '{value0}表格区域',
  },
  '열 {value0}': {
    en: 'Column {value0}',
    ja: '列{value0}',
    'zh-CN': '第 {value0} 列',
  },
  데스크톱: {
    en: 'Desktop',
    ja: 'デスクトップ',
    'zh-CN': '桌面',
  },
  '스택과 반응형 그리드': {
    en: 'Stacks and responsive grids',
    ja: 'スタックとレスポンシブグリッド',
    'zh-CN': '堆叠与响应式网格',
  },
  '제목과 설명': {
    en: 'Headings and descriptions',
    ja: '見出しと説明',
    'zh-CN': '标题与说明',
  },
  '화면 이동과 동작': {
    en: 'Navigation and actions',
    ja: '画面遷移と操作',
    'zh-CN': '屏幕跳转与操作',
  },
  '이미지 자리': {
    en: 'Image placeholder',
    ja: '画像プレースホルダー',
    'zh-CN': '图片占位',
  },
  '사진과 콘텐츠 영역': {
    en: 'Photos and content areas',
    ja: '写真とコンテンツ領域',
    'zh-CN': '图片与内容区域',
  },
  '영역 사이의 구분': {
    en: 'Separate sections',
    ja: '領域の区切り',
    'zh-CN': '区分区域',
  },
  '한 줄의 입력': {
    en: 'Single-line input',
    ja: '1行の入力',
    'zh-CN': '单行输入',
  },
  입력: {
    en: 'Input',
    ja: '入力',
    'zh-CN': '输入',
  },
  인증번호: {
    en: 'Verification code',
    ja: '認証コード',
    'zh-CN': '验证码',
  },
  '6자리 일회용 코드': {
    en: 'Six-digit one-time code',
    ja: '6桁のワンタイムコード',
    'zh-CN': '六位一次性验证码',
  },
  '자세한 내용 작성': {
    en: 'Write detailed content',
    ja: '詳しい内容を入力',
    'zh-CN': '编写详细内容',
  },
  '목록에서 하나 선택': {
    en: 'Choose one from a list',
    ja: '一覧から1つ選択',
    'zh-CN': '从列表中选择一项',
  },
  '동의와 복수 선택': {
    en: 'Consent and multiple selection',
    ja: '同意と複数選択',
    'zh-CN': '同意与多选',
  },
  '설정 켜기와 끄기': {
    en: 'Turn settings on and off',
    ja: '設定のオン・オフ',
    'zh-CN': '开启与关闭设置',
  },
  '정보와 상세 화면 연결': {
    en: 'Information linked to details',
    ja: '情報と詳細画面の接続',
    'zh-CN': '信息与详情屏幕连接',
  },
  '콘텐츠 분류': {
    en: 'Organize content',
    ja: 'コンテンツの分類',
    'zh-CN': '内容分类',
  },
  '여러 항목의 모음': {
    en: 'A collection of items',
    ja: '複数項目のまとまり',
    'zh-CN': '多个项目的集合',
  },
  '행과 열로 비교': {
    en: 'Compare in rows and columns',
    ja: '行と列で比較',
    'zh-CN': '用行列比较',
  },
  '막대 · 선 · 영역 · 도넛': {
    en: 'Bar · Line · Area · Donut',
    ja: '棒・折れ線・面・ドーナツ',
    'zh-CN': '柱状图 · 折线图 · 面积图 · 环形图',
  },
  '사람과 프로필': {
    en: 'People and profiles',
    ja: '人物とプロフィール',
    'zh-CN': '人员与个人资料',
  },
  '상태와 분류': {
    en: 'Status and categories',
    ja: '状態と分類',
    'zh-CN': '状态与分类',
  },
  모달: {
    en: 'Modal',
    ja: 'モーダル',
    'zh-CN': '模态框',
  },
  '안내와 확인': {
    en: 'Information and confirmation',
    ja: '案内と確認',
    'zh-CN': '提示与确认',
  },
  자유: {
    en: 'Free',
    ja: '自由',
    'zh-CN': '自由',
  },
  열: {
    en: 'cols',
    ja: '列',
    'zh-CN': '列',
  },
  '필수 항목': {
    en: 'Required field',
    ja: '必須項目',
    'zh-CN': '必填项',
  },
  '{label} 항목을 확인해 주세요.': {
    en: 'Confirm {label}.',
    ja: '{label}を確認してください。',
    'zh-CN': '请确认{label}。',
  },
  '{label} 항목을 선택해 주세요.': {
    en: 'Select {label}.',
    ja: '{label}を選択してください。',
    'zh-CN': '请选择{label}。',
  },
  '{label} 항목을 입력해 주세요.': {
    en: 'Enter {label}.',
    ja: '{label}を入力してください。',
    'zh-CN': '请输入{label}。',
  },
  '6자리 인증번호를 입력해 주세요.': {
    en: 'Enter a six-digit verification code.',
    ja: '6桁の認証コードを入力してください。',
    'zh-CN': '请输入六位验证码。',
  },
  '올바른 이메일 주소를 입력해 주세요.': {
    en: 'Enter a valid email address.',
    ja: '有効なメールアドレスを入力してください。',
    'zh-CN': '请输入有效的电子邮箱地址。',
  },
  '저장된 기획을 읽지 못했어요. 파일을 불러오거나 변경 내용을 새로 저장할 수 있어요.': {
    en: 'Couldn’t read the saved design. You can import a file or save your changes as a new design.',
    ja: '保存した設計を読み込めませんでした。ファイルを読み込むか、変更内容を新たに保存できます。',
    'zh-CN': '无法读取已保存的设计。你可以导入文件，或重新保存更改。',
  },
  '프로젝트 파일의 형식을 확인해 주세요.': {
    en: 'Check the project file format.',
    ja: 'プロジェクトファイルの形式を確認してください。',
    'zh-CN': '请检查项目文件格式。',
  },
  '선택 항목은 30개까지 사용할 수 있어요.': {
    en: 'You can use up to 30 options.',
    ja: '選択項目は30個まで使用できます。',
    'zh-CN': '最多可使用 30 个选项。',
  },
  '그리드 열 수는 정수로 입력해 주세요.': {
    en: 'Enter a whole number of grid columns.',
    ja: 'グリッドの列数は整数で入力してください。',
    'zh-CN': '网格列数请输入整数。',
  },
  '컨테이너에만 내부 레이아웃을 지정할 수 있어요.': {
    en: 'Only containers can have an internal layout.',
    ja: '内部レイアウトを指定できるのはコンテナーだけです。',
    'zh-CN': '只有容器可以设置内部布局。',
  },
  '요소의 상위 컨테이너를 확인해 주세요.': {
    en: 'Check the element’s parent container.',
    ja: '要素の親コンテナーを確認してください。',
    'zh-CN': '请检查元素的父容器。',
  },
  '컨테이너를 자신이나 하위 컨테이너 안에 넣을 수 없어요.': {
    en: 'A container cannot be placed inside itself or its descendants.',
    ja: 'コンテナーを自身や子孫のコンテナーに入れることはできません。',
    'zh-CN': '不能将容器放入自身或其后代容器中。',
  },
  '1MB 이하의 프로젝트 파일을 선택해 주세요.': {
    en: 'Choose a project file no larger than 1MB.',
    ja: '1MB以下のプロジェクトファイルを選んでください。',
    'zh-CN': '请选择不超过 1MB 的项目文件。',
  },
  '올바른 JSON 프로젝트 파일을 선택해 주세요.': {
    en: 'Choose a valid JSON project file.',
    ja: '有効なJSONプロジェクトファイルを選んでください。',
    'zh-CN': '请选择有效的 JSON 项目文件。',
  },
  '지원하지 않는 프로젝트 버전입니다.': {
    en: 'This project version is not supported.',
    ja: 'このプロジェクトのバージョンには対応していません。',
    'zh-CN': '不支持此项目版本。',
  },
  '화면은 1개에서 20개까지 사용할 수 있어요.': {
    en: 'A project must contain 1–20 screens.',
    ja: '画面は1〜20個まで使用できます。',
    'zh-CN': '项目需包含 1–20 个屏幕。',
  },
  '화면과 요소의 ID는 중복될 수 없어요.': {
    en: 'Screen and element IDs must be unique.',
    ja: '画面と要素のIDは重複できません。',
    'zh-CN': '屏幕与元素的 ID 不能重复。',
  },
  '한 화면에는 요소를 100개까지 배치할 수 있어요.': {
    en: 'Each screen can contain up to 100 elements.',
    ja: '1画面に配置できる要素は100個までです。',
    'zh-CN': '每个屏幕最多可放置 100 个元素。',
  },
  '화면 밖에 있는 요소의 위치와 크기를 확인해 주세요.': {
    en: 'Check the position and size of elements outside the screen.',
    ja: '画面外にある要素の位置とサイズを確認してください。',
    'zh-CN': '请检查位于屏幕外的元素位置和大小。',
  },
  '시작 화면이 존재하지 않습니다.': {
    en: 'The start screen does not exist.',
    ja: '開始画面が存在しません。',
    'zh-CN': '起始屏幕不存在。',
  },
  '연결 대상 화면이 존재하지 않습니다.': {
    en: 'The destination screen does not exist.',
    ja: '接続先の画面が存在しません。',
    'zh-CN': '目标屏幕不存在。',
  },
}
