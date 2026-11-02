import { Platform, ScrollView, Text } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ListRow, ListSection, MetricCard, NativeButton, NavigationBar, useMoruNativeTheme } from '@moru/native'
export function SystemTabScreen({ history = false }: { history?: boolean }) {
  const { colors } = useMoruNativeTheme()
  const insets = useSafeAreaInsets()
  return <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20, paddingTop: Platform.OS === 'android' ? insets.top + 20 : 20, gap: 20 }}>
    <NavigationBar title={history ? '시스템 탭 · 기록' : '시스템 탭 · 요약'} onBack={() => router.back()} />
    <Text style={{ color: colors.muted, fontSize: 16, lineHeight: 25 }}>{Platform.OS === 'web' ? 'Expo Router NativeTabs의 웹 구현입니다. iOS·Android의 실제 OS 탭 바 외형과 제스처는 기기에서 확인하세요.' : '이 화면 하단은 Expo Router Native Tabs가 운영체제의 실제 탭 바로 표시합니다. Moru의 커스텀 하단 탐색과 비교할 수 있습니다.'}</Text>
    {history ? <ListSection title="활동 기록"><ListRow title="첫 모바일 화면 완성" subtitle="오늘 · 09:41" /><ListRow title="형태와 리듬 조절" subtitle="어제 · 18:20" /></ListSection> : <MetricCard label="이번 달 완료한 작업" value="24개" caption="하나씩 쌓아 가는 작은 차이" />}
    <NativeButton variant="secondary" onPress={() => router.replace('/')}>Moru 예제로 돌아가기</NativeButton>
  </ScrollView>
}
