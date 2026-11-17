export const paletteRecommendationMessages: Record<
  string,
  { en: string; ja: string; 'zh-CN': string }
> = {
  '팔레트 추천': { en: 'Palette suggestions', ja: 'パレットの提案', 'zh-CN': '推荐配色' },
  '기준색을 유지한 세 가지 조합입니다. 선택하면 저장 전에 미리 볼 수 있어요.': {
    en: 'Three combinations that keep your seed color. Select one to preview before saving.',
    ja: '基準色を保った3つの組み合わせです。選択して保存前にプレビューできます。',
    'zh-CN': '三种保留基准色的配色。选择一种，在保存前预览。',
  },
  '팔레트 기준색': { en: 'Seed color', ja: 'パレットの基準色', 'zh-CN': '配色基准色' },
  '팔레트 기준색 선택': {
    en: 'Choose a seed color',
    ja: 'パレットの基準色を選択',
    'zh-CN': '选择配色基准色',
  },
  '기준색으로 추천': {
    en: 'Use seed color',
    ja: '基準色から提案',
    'zh-CN': '根据基准色推荐',
  },
  '랜덤 추천': {
    en: 'Random palette',
    ja: 'ランダム提案',
    'zh-CN': '随机推荐',
  },
  '랜덤 추천은 기준색도 바꾸고 결과를 바로 미리 보여줍니다. 저장 전에는 언제든 되돌릴 수 있어요.': {
    en: 'Random changes the seed color and previews a palette immediately. Revert any time before saving.',
    ja: 'ランダム提案は基準色も変えて、結果をすぐにプレビューします。保存前ならいつでも元に戻せます。',
    'zh-CN': '随机推荐会更改基准色并立即预览结果。保存前可随时还原。',
  },
  '추천 팔레트 3개': {
    en: 'Three suggested palettes',
    ja: '3つのおすすめパレット',
    'zh-CN': '三种推荐配色',
  },
  '{name} 팔레트 미리보기': {
    en: 'Preview {name} palette',
    ja: '「{name}」パレットをプレビュー',
    'zh-CN': '预览「{name}」配色',
  },
  '팔레트 3개를 추천했습니다. 후보를 눌러 미리 보세요.': {
    en: 'Three palettes are ready. Select one to preview.',
    ja: '3つのパレットを提案しました。選択してプレビューしてください。',
    'zh-CN': '已推荐三种配色。选择一种即可预览。',
  },
  '기준색을 바꿨습니다. 팔레트를 다시 추천해 주세요.': {
    en: 'The seed color changed. Generate new suggestions.',
    ja: '基準色が変わりました。パレットを再提案してください。',
    'zh-CN': '基准色已更改，请重新生成推荐配色。',
  },
  '{name} · {color} · 미리보기 중, 아직 저장하지 않았습니다.': {
    en: '{name} · {color} · Previewing, not saved yet.',
    ja: '{name} · {color} · プレビュー中。まだ保存されていません。',
    'zh-CN': '{name} · {color} · 正在预览，尚未保存。',
  },
  '후보를 선택하면 실제 컴포넌트에 미리 적용됩니다.': {
    en: 'Select a palette to preview it on real components.',
    ja: 'パレットを選択すると実際のコンポーネントでプレビューできます。',
    'zh-CN': '选择配色，即可在真实组件上预览。',
  },
  '이 팔레트 저장': { en: 'Save palette', ja: 'このパレットを保存', 'zh-CN': '保存此配色' },
  되돌리기: { en: 'Revert', ja: '元に戻す', 'zh-CN': '还原' },
  '팔레트를 현재 모드에 저장했습니다.': {
    en: 'Palette saved to the current mode.',
    ja: '現在のモードにパレットを保存しました。',
    'zh-CN': '配色已保存到当前模式。',
  },
  '저장된 컬러로 되돌렸습니다.': {
    en: 'Restored your saved colors.',
    ja: '保存済みのカラーに戻しました。',
    'zh-CN': '已还原为保存的颜色。',
  },
  '{mode} 모드의 베이스 컬러만 저장합니다. 시맨틱 컬러와 다른 설정은 유지됩니다.': {
    en: 'Saves base colors for {mode} mode only. Semantic colors and other settings stay unchanged.',
    ja: '{mode}モードのベースカラーのみ保存します。セマンティックカラーと他の設定は維持されます。',
    'zh-CN': '仅保存{mode}模式的基础颜色。语义颜色和其他设置保持不变。',
  },
  '색상 역할': { en: 'Color roles', ja: 'カラーの役割', 'zh-CN': '颜色角色' },
  '텍스트 대비 확인': {
    en: 'Text contrast checks',
    ja: 'テキストのコントラスト',
    'zh-CN': '文字对比度检查',
  },
  충족: { en: 'Pass', ja: '適合', 'zh-CN': '达标' },
  '조정 필요': { en: 'Needs adjustment', ja: '要調整', 'zh-CN': '需调整' },
  '불투명 배경에서 위 텍스트 조합만 검사합니다. Glass의 반투명 표면과 전체 화면의 접근성은 별도로 확인하세요.':
    {
      en: 'Only these text pairs on opaque backgrounds are checked. Check translucent Glass surfaces and overall accessibility separately.',
      ja: '不透明な背景で上記のテキストの組み合わせのみを検査します。Glassの半透明な表面と画面全体のアクセシビリティは別途確認してください。',
      'zh-CN': '仅检查不透明背景上的上述文字组合。Glass 半透明表面和整体无障碍性需另行检查。',
    },
  '팔레트 미리보기는 아직 저장되지 않았습니다.': {
    en: 'The palette preview has not been saved.',
    ja: 'プレビュー中のパレットはまだ保存されていません。',
    'zh-CN': '预览中的配色尚未保存。',
  },
  '팔레트 미리보기 · 아직 저장되지 않았어요.': {
    en: 'Palette preview · Not saved yet.',
    ja: 'パレットのプレビュー · 未保存です。',
    'zh-CN': '配色预览 · 尚未保存。',
  },
  '팔레트를 저장하거나 되돌린 뒤 내보내세요.': {
    en: 'Save or revert the palette before exporting.',
    ja: 'パレットを保存するか元に戻してから書き出してください。',
    'zh-CN': '请先保存或还原配色，再进行导出。',
  },
  '톤 온 톤': { en: 'Tone on tone', ja: 'トーン・オン・トーン', 'zh-CN': '同色调搭配' },
  '유사색 조합': { en: 'Analogous', ja: '類似色', 'zh-CN': '邻近色搭配' },
  '보색 조합': { en: 'Complementary', ja: '補色', 'zh-CN': '互补色搭配' },
  '같은 색의 명도 차이로 차분한 위계를 만듭니다.': {
    en: 'Lightness variations of one hue create a calm hierarchy.',
    ja: '同じ色の明度差で落ち着いた階層をつくります。',
    'zh-CN': '用同一色相的明度变化，形成沉稳的层次。',
  },
  '가까운 색의 액센트와 따뜻한 중립색을 조합합니다.': {
    en: 'A neighboring accent hue paired with warm neutrals.',
    ja: '近い色相のアクセントと暖かいニュートラルカラーを組み合わせます。',
    'zh-CN': '将相邻色相的强调色与暖中性色搭配。',
  },
  '맞은편 색의 액센트와 차가운 중립색을 조합합니다.': {
    en: 'An opposite accent hue paired with cool neutrals.',
    ja: '反対の色相のアクセントと涼しいニュートラルカラーを組み合わせます。',
    'zh-CN': '将互补色相的强调色与冷中性色搭配。',
  },
  '버튼 글자 / 프라이머리': {
    en: 'Button text / Primary',
    ja: 'ボタン文字 / プライマリー',
    'zh-CN': '按钮文字 / 主色',
  },
  '액센트 글자 / 서피스': {
    en: 'Accent text / Surface',
    ja: 'アクセント文字 / サーフェス',
    'zh-CN': '强调文字 / 表面',
  },
}
