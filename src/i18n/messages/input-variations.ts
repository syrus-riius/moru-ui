export const inputVariationMessages: Record<string, { en: string; ja: string; 'zh-CN': string }> = {
  카드번호: {
    en: 'Card number',
    ja: 'カード番号',
    'zh-CN': '卡号',
  },
  '카드 유형에 맞춰 숫자를 묶고, 번호의 체크섬을 확인해요.': {
    en: 'Group digits for the card type and check the number’s checksum.',
    ja: 'カードの種類に合わせて数字を区切り、番号のチェックサムを確認します。',
    'zh-CN': '按卡片类型分组数字，并检查卡号校验和。',
  },
  '카드 유효기간': {
    en: 'Card expiry date',
    ja: 'カードの有効期限',
    'zh-CN': '卡片有效期',
  },
  '월과 연도를 나누고, 이미 지난 유효기간을 확인해요.': {
    en: 'Separate the month and year and check for expired dates.',
    ja: '月と年を区切り、有効期限が過ぎていないか確認します。',
    'zh-CN': '分隔月份和年份，并检查是否已过期。',
  },
  '카드 보안코드': {
    en: 'Card security code',
    ja: 'カードのセキュリティコード',
    'zh-CN': '卡片安全码',
  },
  '카드에 표시된 3~4자리 숫자를 입력해요.': {
    en: 'Enter the 3 or 4 digits shown on the card.',
    ja: 'カードに記載された3〜4桁の数字を入力します。',
    'zh-CN': '输入卡片上标注的 3–4 位数字。',
  },
  전화번호: {
    en: 'Phone number',
    ja: '電話番号',
    'zh-CN': '电话号码',
  },
  '한국 전화번호를 구분해 표시해요. 국제번호는 +로 시작하세요.': {
    en: 'Format Korean phone numbers with separators. Start international numbers with +.',
    ja: '韓国の電話番号を区切って表示します。国際番号は+で始めてください。',
    'zh-CN': '为韩国电话号码添加分隔符。国际号码请以 + 开头。',
  },
  '이메일 주소': {
    en: 'Email address',
    ja: 'メールアドレス',
    'zh-CN': '电子邮件地址',
  },
  '+가 포함된 주소와 대소문자를 유지하며 형식을 확인해요.': {
    en: 'Check the format while preserving + addresses and letter case.',
    ja: '+を含むアドレスや大文字・小文字を保ったまま、形式を確認します。',
    'zh-CN': '保留地址中的 + 和字母大小写，同时检查格式。',
  },
  '웹사이트 주소': {
    en: 'Website URL',
    ja: 'ウェブサイトのURL',
    'zh-CN': '网站地址',
  },
  'https:// 또는 http://로 시작하는 웹 주소를 입력해요.': {
    en: 'Enter a web address starting with https:// or http://.',
    ja: 'https://またはhttp://で始まるウェブアドレスを入力します。',
    'zh-CN': '输入以 https:// 或 http:// 开头的网址。',
  },
  'IPv4 주소': {
    en: 'IPv4 address',
    ja: 'IPv4アドレス',
    'zh-CN': 'IPv4 地址',
  },
  '점으로 구분한 네 숫자가 각각 0~255인지 확인해요.': {
    en: 'Check that each of the four dot-separated numbers is between 0 and 255.',
    ja: 'ドットで区切られた4つの数字が、それぞれ0〜255の範囲か確認します。',
    'zh-CN': '检查以点分隔的四个数字是否均在 0–255 范围内。',
  },
  'IPv6 주소': {
    en: 'IPv6 address',
    ja: 'IPv6アドレス',
    'zh-CN': 'IPv6 地址',
  },
  '콜론으로 구분한 주소와 ::로 줄인 주소를 입력해요.': {
    en: 'Enter a colon-separated address, including addresses compressed with ::.',
    ja: 'コロンで区切ったアドレスや、::で省略したアドレスを入力できます。',
    'zh-CN': '输入以冒号分隔的地址，也支持使用 :: 压缩的地址。',
  },
  우편번호: {
    en: 'Postal code',
    ja: '郵便番号',
    'zh-CN': '邮政编码',
  },
  '한국의 5자리 우편번호예요. 앞자리 0도 그대로 유지해요.': {
    en: 'A 5-digit South Korean postal code. Leading zeros are preserved.',
    ja: '韓国の5桁の郵便番号です。先頭の0もそのまま保持します。',
    'zh-CN': '韩国的 5 位邮政编码，保留开头的 0。',
  },
  '8자 이상 입력해 주세요.': {
    en: 'Enter at least 8 characters.',
    ja: '8文字以上入力してください。',
    'zh-CN': '请输入至少 8 个字符。',
  },
  '예시를 채웠어요. 값을 수정하고 입력 보조를 확인해 보세요.': {
    en: 'Examples filled in. Edit the values to try the input assistance.',
    ja: 'サンプルを入力しました。値を編集して入力サポートを試してください。',
    'zh-CN': '已填入示例。修改数值，体验输入辅助功能。',
  },
  '입력 예시를 초기화했어요.': {
    en: 'Input examples reset.',
    ja: '入力サンプルをリセットしました。',
    'zh-CN': '已重置输入示例。',
  },
  '형식을 다시 확인할 항목이 {count}개 있어요.': {
    en: 'Check the format of {count} fields.',
    ja: '{count}項目の形式を確認してください。',
    'zh-CN': '有 {count} 个字段需要重新检查格式。',
  },
  '입력한 {count}개 항목의 형식을 확인했어요.': {
    en: 'Format checked for {count} completed fields.',
    ja: '入力された{count}項目の形式を確認しました。',
    'zh-CN': '已检查 {count} 个已填写字段的格式。',
  },
  '예시를 채우거나 값을 입력해 보세요.': {
    en: 'Fill in the examples or enter your own values.',
    ja: 'サンプルを入力するか、値を直接入力してください。',
    'zh-CN': '请填入示例或自行输入内容。',
  },
  '입력 유형 미리보기': {
    en: 'Input type preview',
    ja: '入力タイプのプレビュー',
    'zh-CN': '输入类型预览',
  },
  '입력 목적에 맞는 디테일': {
    en: 'Details tailored to each input',
    ja: '入力の目的に合った細やかな設計',
    'zh-CN': '为各类输入设计的细节',
  },
  '붙여넣기부터 형식 확인까지, 실제로 입력하며 비교해 보세요.': {
    en: 'Try typing and pasting to compare formatting and validation.',
    ja: '貼り付けから形式チェックまで、実際に入力して比較してください。',
    'zh-CN': '从粘贴到格式检查，亲自输入并比较交互体验。',
  },
  '입력 예시 조작': {
    en: 'Input example controls',
    ja: '入力サンプルの操作',
    'zh-CN': '输入示例操作',
  },
  '예시 채우기': {
    en: 'Fill examples',
    ja: 'サンプルを入力',
    'zh-CN': '填入示例',
  },
  '입력 확인': {
    en: 'Validate inputs',
    ja: '入力をチェック',
    'zh-CN': '验证输入',
  },
  '형식 확인됨': {
    en: 'Format checked',
    ja: '形式を確認済み',
    'zh-CN': '格式已确认',
  },
  '입력한 단어로 아래 예제 목록을 바로 좁혀요.': {
    en: 'Filter the example list below as you type.',
    ja: '入力した言葉で、下のサンプル一覧をすぐに絞り込みます。',
    'zh-CN': '输入关键词，即时筛选下方示例列表。',
  },
  '문서 이름 검색': {
    en: 'Search document names',
    ja: 'ドキュメント名を検索',
    'zh-CN': '搜索文档名称',
  },
  '검색 결과가 없어요.': {
    en: 'No results found.',
    ja: '検索結果がありません。',
    'zh-CN': '未找到结果。',
  },
  '브랜드 가이드': {
    en: 'Brand guidelines',
    ja: 'ブランドガイド',
    'zh-CN': '品牌指南',
  },
  '모바일 디자인': {
    en: 'Mobile design',
    ja: 'モバイルデザイン',
    'zh-CN': '移动端设计',
  },
  '프로젝트 체크리스트': {
    en: 'Project checklist',
    ja: 'プロジェクトのチェックリスト',
    'zh-CN': '项目检查清单',
  },
  금액: {
    en: 'Amount',
    ja: '金額',
    'zh-CN': '金额',
  },
  '숫자를 입력하면 원화 기호와 천 단위 구분을 적용해요.': {
    en: 'Format numbers with the Korean won symbol and thousands separators.',
    ja: '数字を入力すると、韓国ウォンの記号と桁区切りを付けます。',
    'zh-CN': '输入数字后，添加韩元符号和千位分隔符。',
  },
  '표시 버튼으로 입력값을 확인해요. 예제는 8자 이상을 사용해요.': {
    en: 'Use the visibility button to check your input. This example requires at least 8 characters.',
    ja: '表示ボタンで入力内容を確認できます。この例では8文字以上を使用します。',
    'zh-CN': '使用显示按钮查看输入内容。本示例要求至少 8 个字符。',
  },
  '카드번호 검사는 형식 확인용이며 결제 승인이나 카드 존재 여부를 확인하지 않아요.': {
    en: 'The card number check validates format only; it does not authorize a payment or confirm that the card exists.',
    ja: 'カード番号のチェックは形式の確認のみです。決済の承認やカードの存在確認は行いません。',
    'zh-CN': '卡号检查仅验证格式，不进行支付授权，也不确认卡片是否存在。',
  },
  '카드번호의 자릿수와 숫자를 확인해 주세요.': {
    en: 'Check the card number and its length.',
    ja: 'カード番号の数字と桁数を確認してください。',
    'zh-CN': '请检查卡号的数字和位数。',
  },
  '유효기간을 MM/YY 형식으로 입력해 주세요.': {
    en: 'Enter the expiry date as MM/YY.',
    ja: '有効期限をMM/YY形式で入力してください。',
    'zh-CN': '请以 MM/YY 格式输入有效期。',
  },
  '이미 지난 유효기간이에요.': {
    en: 'This expiry date has passed.',
    ja: '有効期限が過ぎています。',
    'zh-CN': '该有效期已过。',
  },
  '보안코드는 3자리 또는 4자리 숫자예요.': {
    en: 'The security code must contain 3 or 4 digits.',
    ja: 'セキュリティコードは3桁または4桁の数字です。',
    'zh-CN': '安全码应为 3 位或 4 位数字。',
  },
  '한국 우편번호는 5자리 숫자예요.': {
    en: 'A South Korean postal code contains 5 digits.',
    ja: '韓国の郵便番号は5桁の数字です。',
    'zh-CN': '韩国邮政编码为 5 位数字。',
  },
  '한국 전화번호 또는 +국가번호 형식을 확인해 주세요.': {
    en: 'Check the Korean phone number or international +country-code format.',
    ja: '韓国の電話番号、または「+国番号」で始まる国際形式を確認してください。',
    'zh-CN': '请检查韩国电话号码格式，或以“+国家代码”开头的国际号码格式。',
  },
  '이메일 주소 형식을 확인해 주세요.': {
    en: 'Check the email address format.',
    ja: 'メールアドレスの形式を確認してください。',
    'zh-CN': '请检查电子邮件地址格式。',
  },
  'http:// 또는 https://로 시작하는 주소를 입력해 주세요.': {
    en: 'Enter an address starting with http:// or https://.',
    ja: 'http://またはhttps://で始まるアドレスを入力してください。',
    'zh-CN': '请输入以 http:// 或 https:// 开头的地址。',
  },
  'IPv4 주소는 0~255 숫자 네 개를 점으로 구분해요.': {
    en: 'An IPv4 address has four numbers from 0 to 255, separated by dots.',
    ja: 'IPv4アドレスは、0〜255の4つの数字をドットで区切ります。',
    'zh-CN': 'IPv4 地址由 4 个 0–255 的数字组成，以点分隔。',
  },
  'IPv6 주소의 그룹과 콜론 구분을 확인해 주세요.': {
    en: 'Check the IPv6 address groups and colon separators.',
    ja: 'IPv6アドレスのグループとコロンの区切りを確認してください。',
    'zh-CN': '请检查 IPv6 地址的分组和冒号分隔。',
  },
  '입력 베리에이션': {
    en: 'Input variations',
    ja: '入力のバリエーション',
    'zh-CN': '输入框变体',
  },
  '결제·연락처·네트워크 등 12가지 입력': {
    en: '12 input types for payments, contacts, networks, and more',
    ja: '決済・連絡先・ネットワークなど12種類の入力',
    'zh-CN': '支付、联系方式、网络等 12 种输入类型',
  },
  '한 줄 입력부터 결제·연락처·네트워크 정보까지, 목적에 맞는 입력 경험을 구성합니다.': {
    en: 'Build input experiences for each purpose, from simple text to payment, contact, and network details.',
    ja: 'シンプルなテキストから決済・連絡先・ネットワーク情報まで、目的に合った入力体験を構成できます。',
    'zh-CN': '从简单文本到支付、联系方式和网络信息，构建适合各类用途的输入体验。',
  },
  '12가지 입력을 직접 편집하고, 예시 채우기와 입력 확인으로 동작을 비교하세요.': {
    en: 'Try all 12 input types. Fill in examples and validate them to compare how they work.',
    ja: '12種類の入力を編集し、サンプルの入力とチェックで動作を比較できます。',
    'zh-CN': '亲自编辑 12 种输入，填入示例并验证内容，比较它们的交互方式。',
  },
  '자동 서식이 필요한 입력에는 FormattedInput을 추가로 설치하세요.': {
    en: 'Install FormattedInput for inputs that need automatic formatting.',
    ja: '自動整形が必要な入力には、FormattedInputを追加でインストールしてください。',
    'zh-CN': '需要自动格式化时，请额外安装 FormattedInput。',
  },
  '자동 서식과 선택적 검증': {
    en: 'Automatic formatting and optional validation',
    ja: '自動整形と任意の検証',
    'zh-CN': '自动格式化与可选验证',
  },
  '서식이 적용된 값은 onValueChange로 받으세요. onChange는 브라우저의 기본 입력 이벤트만 전달하므로 구분자 삭제 같은 서식 동작에는 호출되지 않을 수 있습니다.':
    {
      en: 'Use onValueChange to receive the formatted value. onChange only forwards native browser input events, so formatting actions such as deleting a separator may not trigger it.',
      ja: '整形後の値はonValueChangeで受け取ってください。onChangeはブラウザー標準の入力イベントのみを渡すため、区切り文字の削除などの整形操作では呼び出されない場合があります。',
      'zh-CN':
        '请通过 onValueChange 获取格式化后的值。onChange 仅转发浏览器原生输入事件，因此删除分隔符等格式化操作可能不会触发它。',
    },
  '기존 Input의 사용법은 유지됩니다. FormattedInput의 value와 onValueChange, 폼 제출값은 화면에 표시된 문자열입니다.':
    {
      en: 'The existing Input API stays the same. FormattedInput uses the displayed string for value, onValueChange, and form submission.',
      ja: '既存のInputの使い方は変わりません。FormattedInputのvalue、onValueChange、フォーム送信値には、画面に表示された文字列を使います。',
      'zh-CN':
        '现有 Input 的用法保持不变。FormattedInput 的 value、onValueChange 和表单提交值均为界面上显示的字符串。',
    },
  'format으로 입력 목적을 지정하고, validateFormattedInput으로 필요한 시점에 형식을 확인하세요. 빈 값의 필수 여부는 required 또는 폼에서 별도로 처리합니다.':
    {
      en: 'Choose the input purpose with format, then use validateFormattedInput when validation is needed. Handle required values separately with required or your form logic.',
      ja: 'formatで入力の用途を指定し、必要なタイミングでvalidateFormattedInputによる形式チェックを行います。必須入力のチェックは、required属性またはフォーム側で別途処理してください。',
      'zh-CN':
        '通过 format 指定输入用途，在需要时使用 validateFormattedInput 检查格式。是否必填应通过 required 或表单逻辑单独处理。',
    },
  '형식 검사는 실제 카드 승인, 연락처 소유권 또는 주소의 연결 가능 여부를 확인하지 않습니다.': {
    en: 'Format validation does not authorize a card, verify contact ownership, or check whether an address is reachable.',
    ja: '形式チェックは、カードの決済承認、連絡先の所有確認、アドレスへの接続確認を行うものではありません。',
    'zh-CN': '格式验证不会进行银行卡授权、确认联系方式归属或检查地址是否可访问。',
  },
}
