export const motionFeedbackMessages: Record<string, { en: string; ja: string; 'zh-CN': string }> = {
  '모션 재개': {
    en: 'Resume motion',
    ja: 'アニメーションを再開',
    'zh-CN': '继续动画',
  },
  '모션 일시정지': {
    en: 'Pause motion',
    ja: 'アニメーションを一時停止',
    'zh-CN': '暂停动画',
  },
  '완료한 양, 미리 받은 양, 아직 알 수 없는 작업을 구분해 표시해요.': {
    en: 'Distinguish completed work, buffered data, and progress that is not yet known.',
    ja: '完了した量、先読みした量、進捗がまだ分からない処理を区別して表示します。',
    'zh-CN': '分别显示已完成的量、已缓冲的量，以及尚不确定进度的任务。',
  },
  '기본 진행률': {
    en: 'Determinate progress',
    ja: '確定した進捗',
    'zh-CN': '确定进度',
  },
  '파일 업로드': {
    en: 'File upload',
    ja: 'ファイルのアップロード',
    'zh-CN': '文件上传',
  },
  '버퍼 진행률': {
    en: 'Buffered progress',
    ja: 'バッファ付き進捗',
    'zh-CN': '缓冲进度',
  },
  '동영상 처리': {
    en: 'Video processing',
    ja: '動画の処理',
    'zh-CN': '视频处理',
  },
  '옅은 영역은 미리 받은 양이며 완료율에 포함하지 않아요.': {
    en: 'The lighter area shows buffered data and does not count toward completion.',
    ja: '薄い色の領域は先読みした量を示し、完了率には含めません。',
    'zh-CN': '浅色区域表示已缓冲的数据，不计入完成进度。',
  },
  '움직이는 스트라이프': {
    en: 'Animated stripes',
    ja: '動くストライプ',
    'zh-CN': '动态条纹',
  },
  '데이터 가져오기': {
    en: 'Importing data',
    ja: 'データの取り込み',
    'zh-CN': '导入数据',
  },
  '완료 시점 미정': {
    en: 'Indeterminate progress',
    ja: '完了時点が未定の処理',
    'zh-CN': '不确定进度',
  },
  '서버 응답 대기': {
    en: 'Waiting for server response',
    ja: 'サーバーの応答を待機中',
    'zh-CN': '等待服务器响应',
  },
  '완료 상태': {
    en: 'Completed state',
    ja: '完了状態',
    'zh-CN': '完成状态',
  },
  '업로드 완료': {
    en: 'Upload complete',
    ja: 'アップロード完了',
    'zh-CN': '上传完成',
  },
  '오류 상태': {
    en: 'Error state',
    ja: 'エラー状態',
    'zh-CN': '错误状态',
  },
  '연결 끊김 · 다시 시도 필요': {
    en: 'Connection lost · Retry needed',
    ja: '接続が切れました · 再試行が必要です',
    'zh-CN': '连接已断开 · 需要重试',
  },
  '진행 일시정지': {
    en: 'Pause progress',
    ja: '進捗を一時停止',
    'zh-CN': '暂停进度',
  },
  '진행 데모 시작': {
    en: 'Start progress demo',
    ja: '進捗デモを開始',
    'zh-CN': '开始进度演示',
  },
  '데모 작업을 완료했어요.': {
    en: 'The demo task is complete.',
    ja: 'デモの処理が完了しました。',
    'zh-CN': '演示任务已完成。',
  },
  '예제 진행률을 재생하고 있어요.': {
    en: 'The progress demo is running.',
    ja: '進捗デモを再生しています。',
    'zh-CN': '进度演示正在运行。',
  },
  '실제 네트워크 작업 없이 진행 과정을 비교하는 데모입니다.': {
    en: 'Compare progress patterns in this demo. No network operation is performed.',
    ja: '進捗の表現を比較するデモです。実際のネットワーク処理は行いません。',
    'zh-CN': '此演示用于比较进度效果，不执行实际网络操作。',
  },
  '소요 시간을 알 수 없는 짧은 대기에 사용해요. 상태 문구와 함께 배치하세요.': {
    en: 'Use for short waits of unknown duration. Pair the loader with status text.',
    ja: '所要時間が分からない短い待ち時間に使います。状態を示す文言と組み合わせてください。',
    'zh-CN': '适用于时长未知的短暂等待，请搭配状态文字使用。',
  },
  '회전 링': {
    en: 'Spinning ring',
    ja: '回転リング',
    'zh-CN': '旋转圆环',
  },
  '점 로더': {
    en: 'Dots loader',
    ja: 'ドットローダー',
    'zh-CN': '圆点加载器',
  },
  '막대 로더': {
    en: 'Bars loader',
    ja: 'バーローダー',
    'zh-CN': '条形加载器',
  },
  '움직임 줄이기 설정에서는 회전과 반복 모션을 멈추고 상태를 유지해요.': {
    en: 'Reduced motion stops rotation and repeating animation while keeping the status visible.',
    ja: '動きを減らす設定では回転や繰り返しのアニメーションを止め、状態の表示は維持します。',
    'zh-CN': '启用减少动态效果后，会停止旋转和循环动画，同时保留状态显示。',
  },
  '콘텐츠가 들어올 자리를 먼저 확보해 화면이 갑자기 밀리지 않게 해요.': {
    en: 'Reserve space for incoming content to prevent sudden layout shifts.',
    ja: 'コンテンツの表示領域を先に確保し、レイアウトの急なずれを防ぎます。',
    'zh-CN': '预先为内容保留空间，避免页面布局突然跳动。',
  },
  펄스: {
    en: 'Pulse',
    ja: 'パルス',
    'zh-CN': '脉冲',
  },
  쉬머: {
    en: 'Shimmer',
    ja: 'シマー',
    'zh-CN': '流光',
  },
  '정적 윤곽': {
    en: 'Static placeholder',
    ja: '静的プレースホルダー',
    'zh-CN': '静态占位',
  },
  '팀과 함께 만드는 디자인 시스템': {
    en: 'A design system built with your team',
    ja: 'チームで作るデザインシステム',
    'zh-CN': '与团队共同打造的设计系统',
  },
  '콘텐츠 자리 표시 중': {
    en: 'Showing content placeholders',
    ja: 'コンテンツのプレースホルダーを表示中',
    'zh-CN': '正在显示内容占位',
  },
  '설정 저장 중': {
    en: 'Saving settings',
    ja: '設定を保存中',
    'zh-CN': '正在保存设置',
  },
  '입력값을 유지한 채 이 영역만 잠가요.': {
    en: 'Only this area is locked; your input is preserved.',
    ja: '入力内容を保持したまま、この領域だけをロックします。',
    'zh-CN': '仅锁定此区域，并保留已输入的内容。',
  },
  '저장 데모 시작': {
    en: 'Start save demo',
    ja: '保存デモを開始',
    'zh-CN': '开始保存演示',
  },
  '완료 처리': {
    en: 'Mark complete',
    ja: '完了にする',
    'zh-CN': '标记完成',
  },
  '설정을 저장한 상태예요. 입력값은 그대로 유지됩니다.': {
    en: 'The demo shows saved settings. Your input is preserved.',
    ja: '設定を保存した状態のデモです。入力内容はそのまま保持されます。',
    'zh-CN': '演示已切换为设置保存后的状态，输入内容保持不变。',
  },
  '완료·취소는 잠긴 영역 밖에서 조작할 수 있어요. 실제 저장은 하지 않습니다.': {
    en: 'Complete or cancel outside the locked area. Nothing is actually saved.',
    ja: 'ロックした領域の外で完了・キャンセルを操作できます。実際の保存は行いません。',
    'zh-CN': '可在锁定区域外完成或取消操作，不会实际保存。',
  },
  '저장을 취소했어요. 입력값은 유지됩니다.': {
    en: 'Saving canceled. Your input is preserved.',
    ja: '保存をキャンセルしました。入力内容は保持されます。',
    'zh-CN': '已取消保存，输入内容保持不变。',
  },
  연결됨: {
    en: 'Connected',
    ja: '接続済み',
    'zh-CN': '已连接',
  },
  '다시 연결 중': {
    en: 'Reconnecting',
    ja: '再接続中',
    'zh-CN': '正在重新连接',
  },
  오프라인: {
    en: 'Offline',
    ja: 'オフライン',
    'zh-CN': '离线',
  },
  '연결 오류': {
    en: 'Connection error',
    ja: '接続エラー',
    'zh-CN': '连接错误',
  },
  '동기화 중': {
    en: 'Syncing',
    ja: '同期中',
    'zh-CN': '正在同步',
  },
  '변경 사항 저장됨': {
    en: 'Changes saved',
    ja: '変更を保存しました',
    'zh-CN': '更改已保存',
  },
  '동기화 완료': {
    en: 'Finish syncing',
    ja: '同期を完了',
    'zh-CN': '完成同步',
  },
  '동기화 데모 시작': {
    en: 'Start sync demo',
    ja: '同期デモを開始',
    'zh-CN': '开始同步演示',
  },
  '색상만으로 상태를 전달하지 않고, 읽을 수 있는 문구를 함께 제공해요.': {
    en: 'Readable text conveys the status alongside color.',
    ja: '色だけに頼らず、状態を読める文言でも伝えます。',
    'zh-CN': '通过可读文字配合颜色传达状态。',
  },
  '영역 로딩과 안전한 상호작용 잠금': {
    en: 'Local loading with interaction locking',
    ja: '領域の読み込みと操作ロック',
    'zh-CN': '区域加载与交互锁定',
  },
  '연결·동기화 상태를 읽는 작은 신호': {
    en: 'Compact connection and sync status',
    ja: '接続・同期状態を示す小さなサイン',
    'zh-CN': '简洁的连接与同步状态提示',
  },
  '진행률·버퍼·대기 상태': {
    en: 'Progress, buffering, and waiting states',
    ja: '進捗・バッファ・待機状態',
    'zh-CN': '进度、缓冲与等待状态',
  },
  '링·점·막대 로더': {
    en: 'Ring, dots, and bars loaders',
    ja: 'リング・ドット・バーローダー',
    'zh-CN': '圆环、圆点与条形加载器',
  },
  '펄스·쉬머·정적 윤곽': {
    en: 'Pulse, shimmer, and static placeholders',
    ja: 'パルス・シマー・静的プレースホルダー',
    'zh-CN': '脉冲、流光与静态占位',
  },
}
