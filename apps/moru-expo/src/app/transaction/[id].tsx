import { router, useLocalSearchParams } from 'expo-router'
import { Text } from 'react-native'
import { Amount, AppScreen, ListSection, ListRow, NativeButton, NavigationBar, useMoruNativeTheme } from '@moru/native'
import { useLabState } from '../../state'
export default function TransactionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { transactions } = useLabState()
  const item = transactions.find((entry) => entry.id === id)
  const { colors } = useMoruNativeTheme()
  return <AppScreen><NavigationBar title="예제 내역" onBack={() => router.back()} />{item ? <><Amount value={Math.abs(item.amount)} currency="USD" /><ListSection title="내역 정보"><ListRow title={item.title} subtitle={item.subtitle} /><ListRow title="유형" trailing={<Text style={{ color: colors.text }}>{item.amount < 0 ? '지출' : '입금'}</Text>} /></ListSection><Text style={{ color: colors.muted }}>화면 조합을 위한 예제 데이터입니다.</Text></> : <Text style={{ color: colors.text }}>숨기거나 삭제한 내역입니다.</Text>}<NativeButton variant="secondary" onPress={() => router.back()}>목록으로 돌아가기</NativeButton></AppScreen>
}
