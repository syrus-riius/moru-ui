export const paletteRecommendationMessages: Record<
  string,
  { en: string; ja: string; 'zh-CN': string }
> = {
  '{role} 색상 편집': {
    en: 'Edit {role} color',
    ja: '{role}の色を編集',
    'zh-CN': '编辑{role}颜色',
  },
  '{role} 색상 선택기': {
    en: '{role} color picker',
    ja: '{role}のカラーピッカー',
    'zh-CN': '{role}颜色选择器',
  },
  '{role} HEX 편집': { en: '{role} HEX editor', ja: '{role}のHEX編集', 'zh-CN': '{role} HEX编辑' },
  '#RGB 또는 #RRGGBB 형식으로 입력해 주세요.': {
    en: 'Enter a color in #RGB or #RRGGBB format.',
    ja: '#RGB または #RRGGBB 形式で入力してください。',
    'zh-CN': '请输入 #RGB 或 #RRGGBB 格式的颜色。',
  },
  자동으로: { en: 'Use automatic', ja: '自動に戻す', 'zh-CN': '恢复自动' },
  '직접 편집': { en: 'Custom edits', ja: '手動編集', 'zh-CN': '手动编辑' },
  '개별 색상을 직접 조정한 팔레트입니다.': {
    en: 'A palette with individually edited colors.',
    ja: '各色を個別に調整したパレットです。',
    'zh-CN': '已单独调整颜色的配色方案。',
  },
  '색상을 눌러 해당 역할만 수정하세요. 잠근 색은 먼저 잠금을 해제해 주세요.': {
    en: 'Click a color to edit only that role. Unlock a color before editing it.',
    ja: '色を押すと、その役割だけを編集できます。ロックした色は先に解除してください。',
    'zh-CN': '点击颜色可单独修改该角色。编辑锁定颜色前请先解锁。',
  },
  '프라이머리 위 텍스트': {
    en: 'On-primary text',
    ja: 'プライマリ上の文字',
    'zh-CN': '主色上的文字',
  },
  흰색: { en: 'White', ja: '白', 'zh-CN': '白色' },
  검정색: { en: 'Black', ja: '黒', 'zh-CN': '黑色' },
  '본문과 별개로 프라이머리 버튼·선택 영역의 글자색을 정합니다. 자동은 배경 대비에 맞춰 선택합니다.':
    {
      en: 'Set text on primary buttons and selected areas separately from body text. Auto chooses based on background contrast.',
      ja: '本文とは別に、プライマリボタンや選択領域の文字色を設定します。自動では背景とのコントラストに合わせて選びます。',
      'zh-CN': '单独设置主色按钮及选中区域的文字颜色，不影响正文。自动模式根据背景对比度选择。',
    },

  '팔레트 추천': { en: 'Palette suggestions', ja: 'パレットの提案', 'zh-CN': '推荐配色' },
  색상환: { en: 'Color wheel', ja: '色相環', 'zh-CN': '色轮' },
  '색상환 · {name}': {
    en: 'Color wheel · {name}',
    ja: '色相環 · {name}',
    'zh-CN': '色轮 · {name}',
  },
  '편집할 색상': { en: 'Color to edit', ja: '編集する色', 'zh-CN': '编辑颜色' },
  '색상 포인트': { en: 'Color points', ja: 'カラーポイント', 'zh-CN': '颜色控制点' },
  '{role} · {color} · 색조 {hue}° · 채도 {chroma}': {
    en: '{role} · {color} · Hue {hue}° · Chroma {chroma}',
    ja: '{role} · {color} · 色相 {hue}° · 彩度 {chroma}',
    'zh-CN': '{role} · {color} · 色相 {hue}° · 色度 {chroma}',
  },
  잠김: { en: 'Locked', ja: 'ロック中', 'zh-CN': '已锁定' },
  '포인트를 드래그해 색조와 채도를 조절하세요. 잠근 색은 움직이지 않습니다.': {
    en: 'Drag a point to adjust hue and chroma. Locked colors stay unchanged.',
    ja: 'ポイントをドラッグして色相と彩度を調整します。ロックした色は変わりません。',
    'zh-CN': '拖动控制点以调整色相和色度。锁定的颜色保持不变。',
  },
  '방향키 좌우: 색조 · 위아래: 채도 · Shift: 크게 조절': {
    en: 'Left/right: hue · Up/down: chroma · Shift: larger steps',
    ja: '左右キー: 色相 · 上下キー: 彩度 · Shift: 大きく調整',
    'zh-CN': '左右方向键：色相 · 上下方向键：色度 · Shift：大幅调整',
  },
  '겹친 포인트는 색상 목록에서 선택하세요.': {
    en: 'Choose overlapping points from the color list.',
    ja: '重なったポイントは色のリストから選択できます。',
    'zh-CN': '重叠的控制点可从颜色列表中选择。',
  },
  '선택한 색은 잠겨 있습니다. 잠금을 해제하면 조절할 수 있어요.': {
    en: 'This color is locked. Unlock it to make changes.',
    ja: '選択した色はロックされています。解除すると調整できます。',
    'zh-CN': '所选颜色已锁定。解锁后即可调整。',
  },
  '색상환을 움직이면 {name} 규칙으로 조정합니다. 아래에서 다른 배색을 선택할 수 있어요.': {
    en: 'The wheel uses {name}. Choose another harmony below to change the rule.',
    ja: '色相環では「{name}」のルールで調整します。下で別の配色を選べます。',
    'zh-CN': '色轮按「{name}」规则调整。可在下方选择其他配色规则。',
  },
  '배색 규칙과 잠금 조건으로 팔레트를 만듭니다. 선택하면 저장 전에 미리 볼 수 있어요.': {
    en: 'Create palettes with a harmony rule and your locked colors. Select one to preview before saving.',
    ja: '配色ルールとロック条件からパレットをつくります。選択して保存前にプレビューできます。',
    'zh-CN': '根据配色规则和锁定条件生成配色。选择一种，在保存前预览。',
  },
  '배색 규칙': { en: 'Color harmony', ja: '配色ルール', 'zh-CN': '配色规则' },
  '전체 추천': { en: 'All harmonies', ja: 'すべての配色', 'zh-CN': '全部配色' },
  '다섯 가지 배색을 비교하거나, 원하는 규칙만 선택해 추천받으세요.': {
    en: 'Compare five harmonies, or select one rule for your suggestions.',
    ja: '5つの配色を比較するか、好みのルールを選んで提案を受けられます。',
    'zh-CN': '比较五种配色，或选择一种规则获取推荐。',
  },
  '배색 규칙을 바꿨습니다. 색상환을 움직이거나 후보·랜덤 추천으로 미리 보세요.': {
    en: 'Harmony changed. Move a wheel point, choose a candidate, or use Random palette to preview.',
    ja: '配色ルールを変更しました。色相環のポイントを動かすか、候補・ランダム提案でプレビューしてください。',
    'zh-CN': '配色规则已更改。移动色轮控制点、选择候选配色或随机推荐即可预览。',
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
  '잠금 모두 해제': {
    en: 'Unlock all',
    ja: 'すべて解除',
    'zh-CN': '全部解锁',
  },
  '{role} 잠금': {
    en: 'Lock {role}',
    ja: '{role}をロック',
    'zh-CN': '锁定{role}',
  },
  '{role} 잠금 해제': {
    en: 'Unlock {role}',
    ja: '{role}のロックを解除',
    'zh-CN': '解锁{role}',
  },
  '모든 색이 잠겨 있습니다. 한 가지 이상 잠금을 해제하면 다시 추천할 수 있어요.': {
    en: 'All colors are locked. Unlock at least one to generate suggestions.',
    ja: 'すべての色がロックされています。1つ以上解除すると再提案できます。',
    'zh-CN': '所有颜色均已锁定。至少解锁一种颜色后即可重新推荐。',
  },
  '잠근 색은 유지하고 나머지만 추천합니다. 랜덤 추천은 잠기지 않은 기준색도 바꾸며 바로 미리 보여줍니다.':
    {
      en: 'Locked colors stay unchanged. Random varies unlocked colors, including the seed, and previews immediately.',
      ja: 'ロックした色は維持して残りを提案します。ランダム提案は未ロックの基準色も変え、すぐにプレビューします。',
      'zh-CN': '保留锁定颜色，仅推荐其余颜色。随机推荐也会更改未锁定的基准色，并立即预览。',
    },
  '잠근 색끼리의 조합은 유지됩니다. 조화와 대비는 별도로 확인하세요.': {
    en: 'Relationships between locked colors stay unchanged. Check their harmony and contrast separately.',
    ja: 'ロックした色同士の組み合わせは維持されます。調和とコントラストは別途確認してください。',
    'zh-CN': '锁定颜色之间的搭配保持不变。请另行检查其协调性与对比度。',
  },
  '{name} 규칙으로 잠기지 않은 색을 조정합니다.': {
    en: 'Uses the {name} recipe to adjust unlocked colors.',
    ja: '「{name}」のルールで未ロックの色を調整します。',
    'zh-CN': '按「{name}」规则调整未锁定的颜色。',
  },
  '되돌리면 저장된 색으로 복원되고, 역할별 잠금은 유지됩니다.': {
    en: 'Revert restores saved colors and keeps the same roles locked.',
    ja: '元に戻すと保存済みの色に復元され、役割ごとのロックは維持されます。',
    'zh-CN': '还原会恢复已保存的颜色，并保留各角色的锁定状态。',
  },
  '미리보기 {number} · {name} · {color} · 아직 저장하지 않았습니다.': {
    en: 'Preview {number} · {name} · {color} · Not saved yet.',
    ja: 'プレビュー {number} · {name} · {color} · 未保存です。',
    'zh-CN': '预览 {number} · {name} · {color} · 尚未保存。',
  },
  '잠근 색을 유지하면 일부 텍스트 대비가 부족합니다. 해당 색의 잠금을 풀고 다시 추천하거나 직접 조정하세요.':
    {
      en: 'Some text contrast checks fail with these locks. Unlock the relevant colors and regenerate, or adjust them manually.',
      ja: 'ロックした色を維持すると一部の文字のコントラストが不足します。該当する色のロックを解除して再提案するか、手動で調整してください。',
      'zh-CN': '保留这些锁定颜色时，部分文字对比度不足。请解锁相关颜色后重新推荐，或手动调整。',
    },
  '일부 텍스트 대비가 부족합니다. 색을 조정한 뒤 다시 확인하세요.': {
    en: 'Some text contrast checks fail. Adjust the colors and check again.',
    ja: '一部の文字のコントラストが不足しています。色を調整して再確認してください。',
    'zh-CN': '部分文字对比度不足。请调整颜色后重新检查。',
  },
  '랜덤 추천은 기준색도 바꾸고 결과를 바로 미리 보여줍니다. 저장 전에는 언제든 되돌릴 수 있어요.': {
    en: 'Random changes the seed color and previews a palette immediately. Revert any time before saving.',
    ja: 'ランダム提案は基準色も変えて、結果をすぐにプレビューします。保存前ならいつでも元に戻せます。',
    'zh-CN': '随机推荐会更改基准色并立即预览结果。保存前可随时还原。',
  },
  '추천 팔레트 {count}개': {
    en: 'Suggested palettes: {count}',
    ja: '{count}件のおすすめパレット',
    'zh-CN': '{count} 种推荐配色',
  },
  '{name} 팔레트 미리보기': {
    en: 'Preview {name} palette',
    ja: '「{name}」パレットをプレビュー',
    'zh-CN': '预览「{name}」配色',
  },
  '팔레트 {count}개를 추천했습니다. 후보를 눌러 미리 보세요.': {
    en: 'Palettes ready: {count}. Select one to preview.',
    ja: '{count}件のパレットを提案しました。選択してプレビューしてください。',
    'zh-CN': '已推荐 {count} 种配色。选择一种即可预览。',
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
  '기준색 양옆의 색을 액센트와 중립색에 나누어 적용합니다.': {
    en: 'Use neighboring hues for the accent and tinted neutrals.',
    ja: '基準色の両側の色をアクセントとニュートラルカラーに分けて適用します。',
    'zh-CN': '将基准色两侧的颜色分别用于强调色和带色调的中性色。',
  },
  '맞은편 색을 액센트로, 기준색을 중립색으로 사용합니다.': {
    en: 'Use the opposite hue for the accent and the seed hue for tinted neutrals.',
    ja: '反対色をアクセントに、基準色の色相をニュートラルカラーに使用します。',
    'zh-CN': '使用互补色相作为强调色，基准色相作为带色调的中性色。',
  },
  '150°·210°의 두 색을 액센트와 중립색에 나누어 적용합니다.': {
    en: 'Use hues at 150° and 210° for the accent and tinted neutrals.',
    ja: '150°と210°の2色をアクセントとニュートラルカラーに分けて適用します。',
    'zh-CN': '将 150° 和 210° 的两种颜色分别用于强调色和带色调的中性色。',
  },
  '120° 간격의 세 색을 프라이머리·액센트·중립색에 적용합니다.': {
    en: 'Use three hues 120° apart for primary, accent, and tinted neutrals.',
    ja: '120°間隔の3色をプライマリー・アクセント・ニュートラルカラーに適用します。',
    'zh-CN': '将相隔 120° 的三种颜色用于主色、强调色和带色调的中性色。',
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
