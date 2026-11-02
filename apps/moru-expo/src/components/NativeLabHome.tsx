import { useMemo, useState } from 'react'
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import {
  ActionGrid, ActivityCalendar, Amount, AppScreen, AvatarGroup, BottomSheet, BottomTabBar, CardStack,
  DateStrip, IconButton, ListRow, MetricCard, MobileSearchField, NativeButton, NativeChart, NativeCheckbox, NativeSparkline,
  NavigationBar, PageControl, ProgressRing, SegmentedControl, SwipeableRow, TextField, useMoruNativeTheme,
} from '@moru/native'
import { useLabState } from '../state'

const dates = Array.from({ length: 7 }, (_, index) => ({ value: index === 6 ? '2026-11-01' : `2026-10-${26 + index}`, label: String(index === 6 ? 1 : 26 + index), weekday: ['월', '화', '수', '목', '금', '토', '일'][index] }))
const accounts = [{ id: 'daily', title: 'Moru Studio', subtitle: 'Daily account · 7216', value: '$12,788.56', color: '#242424' }, { id: 'travel', title: 'Travel fund', subtitle: 'One idea at a time · 4364', value: '$3,280.00', color: '#7a223a' }, { id: 'reserve', title: 'Reserve', subtitle: 'For your next step · 9048', value: '$6,590.00', color: '#3d42c9' }]
const chartData = [{ id: 'mon', label: '월', value: 18 }, { id: 'tue', label: '화', value: 32 }, { id: 'wed', label: '수', value: 24 }, { id: 'thu', label: '목', value: 41 }, { id: 'fri', label: '금', value: 36 }, { id: 'sat', label: '토', value: 56 }, { id: 'sun', label: '일', value: 48 }]
const activities = Object.fromEntries(Array.from({ length: 31 }, (_, index) => [`2026-10-${String(index + 1).padStart(2, '0')}`, [3, 7, 11, 15, 21, 28].includes(index + 1) ? 0 : (index + 1) % 4 === 0 ? 2 : 1]))
export function NativeLabHome() {
  const { colors, metrics, typography, space, radius, borderWidth } = useMoruNativeTheme()
  const styles = useMemo(() => StyleSheet.create({
    header: { paddingHorizontal: metrics.controlPaddingX.md, paddingBottom: space * 3, gap: space * 3 },
    content: { padding: metrics.cardPadding, paddingBottom: metrics.sectionGap, gap: metrics.formGap },
    stack: { gap: metrics.formGap, paddingBottom: space * 3 },
    row: { flexDirection: 'row', alignItems: 'center' },
    metrics: { flexDirection: 'row', gap: metrics.controlGap }, metric: { flex: 1 },
    eyebrow: { ...typography.caption, letterSpacing: 1 }, bigTitle: { ...typography.display },
    sectionTitle: { ...typography.heading }, body: { ...typography.body }, caption: { ...typography.caption },
    sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: metrics.formGap },
    task: { borderWidth, padding: metrics.cardPadding / 2, borderRadius: radius + 4 },
  }), [metrics, typography, space, radius, borderWidth])
  const { embedded, screen: tab, setScreen: setTab, tabStyle, setTabStyle, centerAction, mode, setMode, tasks, setTasks, transactions, setTransactions } = useLabState()
  const [hidden, setHidden] = useState(false)
  const [account, setAccount] = useState('daily')
  const [date, setDate] = useState('2026-10-26')
  const [selectedDate, setSelectedDate] = useState('2026-10-26')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [receiveOpen, setReceiveOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'donut'>('bar')
  function begin() { setDraft(''); setAmount(''); setError(''); setSheetOpen(true) }
  function save() {
    if (!draft.trim()) { setError('이름을 입력해 주세요.'); return }
    if (tab === 'wallet') {
      const value = Number(amount)
      if (!Number.isFinite(value) || value <= 0 || value > 1000000) { setError('0보다 큰 금액을 입력해 주세요.'); return }
      setTransactions((previous) => [{ id: String(Date.now()), title: draft.trim(), subtitle: '방금 · 예제 내역', amount: -value }, ...previous])
    } else {
      setTasks((previous) => [...previous, { id: String(Date.now()), title: draft.trim(), date, done: false }])
      setTab('tasks')
    }
    setSheetOpen(false)
  }
  function toggleMode() {
    const next = mode === 'light' ? 'dark' : 'light'
    if (embedded && typeof window !== 'undefined' && window.parent !== window) window.parent.postMessage({ type: 'moru-native:mode', version: 1, payload: { mode: next } }, window.location.origin)
    else setMode(next)
  }
  function refresh() { setRefreshing(true); setTimeout(() => setRefreshing(false), 450) }
  const tabItems = [{ value: 'wallet', label: '지갑', symbol: '◈' }, { value: 'tasks', label: '작업', symbol: '☷' }, { value: 'activity', label: '활동', symbol: '◴' }].map((item) => ({ ...item, icon: <Text style={{ color: tab === item.value && tabStyle === 'pill' ? colors.primaryForeground : tab === item.value ? colors.accent : colors.muted, fontSize: 22 }}>{item.symbol}</Text>, badge: item.value === 'tasks' ? tasks.filter((task) => !task.done).length : undefined }))
  const header = <View style={styles.header}><NavigationBar title="Moru Notes" subtitle="직접 다듬는 모바일 기본" trailing={<View style={styles.row}><IconButton accessibilityLabel={mode === 'light' ? '다크 모드' : '라이트 모드'} onPress={toggleMode}><Text style={{ color: colors.text, fontSize: 22 }}>{mode === 'light' ? '☾' : '☀'}</Text></IconButton><IconButton accessibilityLabel="시스템 컨트롤 열기" onPress={() => router.push('/controls')}><Text style={{ color: colors.text, fontSize: 24 }}>⋯</Text></IconButton></View>} /><SegmentedControl items={[{ value: 'standard', label: '기본 탭' }, { value: 'floating', label: '플로팅' }, { value: 'pill', label: '필 강조' }]} value={tabStyle} onValueChange={(next) => setTabStyle(next as typeof tabStyle)} /></View>
  const cards = accounts.map((item) => ({ ...item, value: hidden ? '••••••' : item.value }))
  const walletHeader = <View style={styles.stack}><Text style={[styles.eyebrow, { color: colors.muted }]}>AVAILABLE BALANCE</Text><Amount value={12788.56} currency="USD" hidden={hidden} onToggleVisibility={() => setHidden(!hidden)} /><CardStack cards={cards} activeId={account} onSelect={setAccount} /><PageControl count={cards.length} index={cards.findIndex((item) => item.id === account)} onIndexChange={(index) => setAccount(cards[index].id)} /><ActionGrid items={[{ id: 'send', label: '보내기 예제', icon: <Text style={{ color: colors.text, fontSize: 25 }}>↗</Text>, onPress: begin }, { id: 'receive', label: '받기 안내', icon: <Text style={{ color: colors.text, fontSize: 25 }}>↙</Text>, onPress: () => setReceiveOpen(true) }, { id: 'add', label: '내역 추가', icon: <Text style={{ color: colors.text, fontSize: 25 }}>＋</Text>, onPress: begin }]} /><View style={styles.metrics}><View style={styles.metric}><MetricCard label="이번 달 저축" value="$3,280" caption="목표까지 64%" /></View><View style={styles.metric}><MetricCard label="구독" value="14개" caption="월 지출 $242" /></View></View><NativeSparkline values={[32, 28, 41, 36, 48, 46, 59]} label="주간 저축 추이" /><MobileSearchField value={search} onChangeText={setSearch} placeholder="예제 내역 검색" /><Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.text }]}>최근 내역</Text></View>
  const shownTasks = tasks.filter((task) => task.date === date && (filter === 'all' || (filter === 'done' ? task.done : !task.done)))
  return <>
    <AppScreen scroll={false} contentContainerStyle={{ padding: 0, gap: 0 }} footer={<BottomTabBar items={tabItems} value={tab} onValueChange={(value) => setTab(value as typeof tab)} variant={tabStyle} onCreate={centerAction ? begin : undefined} />}>
      {header}
      {tab === 'wallet' ? <FlatList data={transactions.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()))} keyExtractor={(item) => item.id} contentContainerStyle={styles.content} refreshing={refreshing} onRefresh={refresh} ListHeaderComponent={walletHeader} ItemSeparatorComponent={() => <View style={{ height: 8 }} />} renderItem={({ item }) => <SwipeableRow accessibilityLabel={item.title} actions={[{ label: '내역 숨기기', destructive: true, onPress: () => setTransactions((previous) => previous.filter((entry) => entry.id !== item.id)) }]}><ListRow title={item.title} subtitle={item.subtitle} leading={<Text style={{ color: colors.text, fontSize: 23 }}>◉</Text>} trailing={<Text style={[typography.label, { color: colors.text, fontWeight: '600' }]}>{hidden ? '•••' : `${item.amount < 0 ? '−' : '+'}$${Math.abs(item.amount).toFixed(2)}`}</Text>} onPress={() => router.push({ pathname: '/transaction/[id]', params: { id: item.id } })} /></SwipeableRow>} ListEmptyComponent={<Text style={[styles.body, { color: colors.muted }]}>검색 결과가 없습니다.</Text>} /> : tab === 'tasks' ? <FlatList data={shownTasks} keyExtractor={(item) => item.id} contentContainerStyle={styles.content} refreshing={refreshing} onRefresh={refresh} ListHeaderComponent={<View style={styles.stack}><View style={styles.sectionRow}><Text accessibilityRole="header" style={[styles.bigTitle, { color: colors.text }]}>오늘의 작업</Text><NativeButton onPress={begin}>＋ 새 작업</NativeButton></View><DateStrip dates={dates} value={date} onValueChange={setDate} /><SegmentedControl items={[{ value: 'all', label: '전체' }, { value: 'open', label: '진행 중' }, { value: 'done', label: '완료' }]} value={filter} onValueChange={setFilter} /><AvatarGroup items={[{ id: 'm', label: '민지' }, { id: 's', label: '수현' }, { id: 'j', label: '지우' }]} /></View>} ItemSeparatorComponent={() => <View style={{ height: 12 }} />} renderItem={({ item }) => <View style={[styles.task, { backgroundColor: colors.surface, borderColor: colors.border }]}><NativeCheckbox label={item.title} value={item.done} onValueChange={(done) => setTasks((previous) => previous.map((task) => task.id === item.id ? { ...task, done } : task))} /><ListRow title="자세히 보기" subtitle={item.date} onPress={() => router.push({ pathname: '/task/[id]', params: { id: item.id } })} /></View>} ListEmptyComponent={<Text style={[styles.body, { color: colors.muted }]}>선택한 날짜에 작업이 없습니다.</Text>} /> : <ScrollView contentContainerStyle={styles.content}><View style={styles.stack}><Text accessibilityRole="header" style={[styles.bigTitle, { color: colors.text }]}>쌓여 가는 하루</Text><View style={styles.sectionRow}><ProgressRing value={78} label="이번 달 목표" /><View style={styles.metric}><MetricCard label="연속 활동" value="52주" caption="꾸준함의 기록" /></View></View><SegmentedControl items={[{ value: '2026-10-26', label: '이번 달' }, { value: '2026-10-19', label: '지난 기록' }]} value={selectedDate} onValueChange={setSelectedDate} /><ActivityCalendar year={2026} month={10} activities={activities} selectedDate={selectedDate} onSelectDate={setSelectedDate} /><MetricCard label={selectedDate} value={`${activities[selectedDate] ?? 0}개 활동`} caption="날짜를 선택해 기록을 확인하세요." /><SegmentedControl items={[{ value: 'bar', label: '막대' }, { value: 'line', label: '선' }, { value: 'area', label: '영역' }, { value: 'donut', label: '도넛' }]} value={chartType} onValueChange={(value) => setChartType(value as typeof chartType)} /><NativeChart type={chartType} data={chartData} title="주간 활동" showValues={false} /><NativeButton variant="secondary" onPress={() => router.push('/controls')}>시스템 입력 컨트롤 확인</NativeButton></View></ScrollView>}
    </AppScreen>
    <BottomSheet open={receiveOpen} onOpenChange={setReceiveOpen} title="받기 예제"><View style={styles.stack}><Text style={[styles.body, { color: colors.muted }]}>실제 송금 기능 없이 모바일 UI 동작만 확인합니다.</Text><NativeButton onPress={() => setReceiveOpen(false)}>확인</NativeButton></View></BottomSheet>
    <BottomSheet open={sheetOpen} onOpenChange={setSheetOpen} title={tab === 'wallet' ? '예제 내역 추가' : '새 작업'} detents={[.48, .85]}><View style={styles.stack}><TextField label={tab === 'wallet' ? '메모' : '작업 이름'} value={draft} onChangeText={setDraft} placeholder="어떤 아이디어인가요?" error={error || undefined} />{tab === 'wallet' ? <TextField label="금액 · USD" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" /> : <Text style={[styles.caption, { color: colors.muted }]}>선택한 날짜 · {date}</Text>}<NativeButton onPress={save}>추가하기</NativeButton><NativeButton variant="ghost" onPress={() => setSheetOpen(false)}>취소</NativeButton></View></BottomSheet>
  </>
}
