import { componentVariationMessages } from './component-variations'

export const componentDocMessages: Record<string, { en: string; ja: string; 'zh-CN': string }> = {
  ...componentVariationMessages,
  베리에이션: { en: 'Variations', ja: 'バリエーション', 'zh-CN': '变体' },
  '베리에이션을 불러오는 중': {
    en: 'Loading variations',
    ja: 'バリエーションを読み込み中',
    'zh-CN': '正在加载变体',
  },
  '크기 비교': { en: 'Size comparison', ja: 'サイズの比較', 'zh-CN': '尺寸比较' },
  '상태 비교': { en: 'State comparison', ja: '状態の比較', 'zh-CN': '状态比较' },
  '형태 비교': { en: 'Variant comparison', ja: '表示形式の比較', 'zh-CN': '样式比较' },
  '트리거 비활성': { en: 'Disabled trigger', ja: 'トリガー無効', 'zh-CN': '禁用触发器' },
  '같은 디자인 토큰에서 크기와 상태를 비교하세요. 각 예제는 컴포넌트가 지원하는 실제 옵션을 사용합니다.':
    {
      en: 'Compare sizes and states with the same design tokens. Each example uses options the component actually supports.',
      ja: '同じデザイントークンでサイズと状態を比較できます。各サンプルは、コンポーネントが対応しているオプションを使用しています。',
      'zh-CN': '在相同设计令牌下比较尺寸与状态。每个示例都使用组件实际支持的选项。',
    },
  '보조 타입 속성': {
    en: 'Supporting type properties',
    ja: '補助型のプロパティ',
    'zh-CN': '辅助类型属性',
  },
  '명시된 기본값': {
    en: 'Declared defaults',
    ja: '宣言されたデフォルト値',
    'zh-CN': '声明的默认值',
  },
  '다른 컴포넌트 문서': {
    en: 'Other component docs',
    ja: '他のコンポーネントのドキュメント',
    'zh-CN': '其他组件文档',
  },
  '이전 컴포넌트': { en: 'Previous component', ja: '前のコンポーネント', 'zh-CN': '上一个组件' },
  '다음 컴포넌트': { en: 'Next component', ja: '次のコンポーネント', 'zh-CN': '下一个组件' },
  '스타일은 앱에서 한 번 불러오고, 컴포넌트를 MoruProvider로 감싸 주세요.': {
    en: 'Import the stylesheet once in your app and wrap your components in MoruProvider.',
    ja: 'アプリでスタイルを一度読み込み、コンポーネントをMoruProviderで囲んでください。',
    'zh-CN': '在应用中导入一次样式，并用 MoruProvider 包裹组件。',
  },
  'Provider 연결 코드': {
    en: 'Provider setup code',
    ja: 'Providerの設定コード',
    'zh-CN': 'Provider 配置代码',
  },
  'Next.js에서는 컴포넌트를 사용하는 파일에 use client를 선언하세요.': {
    en: "In Next.js, add 'use client' to the file using these components.",
    ja: "Next.jsでは、コンポーネントを使用するファイルに'use client'を宣言してください。",
    'zh-CN': "在 Next.js 中，在使用这些组件的文件顶部声明 'use client'。",
  },
  '설치부터 내 디자인 적용까지': {
    en: 'Installation and custom theme guide',
    ja: 'インストールからデザインの適用まで',
    'zh-CN': '安装与自定义主题指南',
  },
  '문서를 불러오지 못했어요. 미리보기는 계속 사용할 수 있습니다.': {
    en: 'The documentation could not be loaded. You can still use the preview.',
    ja: 'ドキュメントを読み込めませんでした。プレビューは引き続き使用できます。',
    'zh-CN': '无法加载文档。你仍可使用预览。',
  },
  '사용법과 속성을 불러오는 중': {
    en: 'Loading usage and props',
    ja: '使い方とプロパティを読み込み中',
    'zh-CN': '正在加载用法和属性',
  },
  '{name} 예제 보기': {
    en: '{name} example view',
    ja: '{name}のサンプル表示',
    'zh-CN': '{name} 示例视图',
  },
  '미리보기에서 동작과 상태를 살펴보고, 사용법에서 기본 예제 코드를 복사하세요.': {
    en: 'Explore behavior and states in the preview, then copy the basic example under Usage.',
    ja: 'プレビューで動作と状態を確認し、使い方から基本サンプルをコピーできます。',
    'zh-CN': '在预览中体验交互和状态，然后在用法部分复制基础示例代码。',
  },
  '소스에 선언된 속성입니다. 상속한 속성과 보조 타입은 전체 타입 정의와 원본 소스에서 확인하세요.':
    {
      en: 'Properties declared in the source. Refer to the full type definitions and source for inherited properties and supporting types.',
      ja: 'ソースで宣言されたプロパティです。継承するプロパティや補助型は、全体の型定義と元のソースで確認できます。',
      'zh-CN': '这些属性来自源代码声明。继承的属性和辅助类型可在完整类型定义与源代码中查看。',
    },
  '{name} 속성': { en: '{name} props', ja: '{name}のプロパティ', 'zh-CN': '{name} 属性' },
  필수: { en: 'Required', ja: '必須', 'zh-CN': '必填' },
  '이 컴포넌트의 전체 API는 아래 타입 정의에서 확인할 수 있습니다.': {
    en: 'See the type definitions below for the complete API of this component.',
    ja: 'このコンポーネントのAPIは、以下の型定義で確認できます。',
    'zh-CN': '在下面的类型定义中查看此组件的完整 API。',
  },
  '전체 타입 정의': { en: 'Full type definitions', ja: 'すべての型定義', 'zh-CN': '完整类型定义' },
  '원본 소스 보기': { en: 'View source', ja: 'ソースを見る', 'zh-CN': '查看源代码' },
}
