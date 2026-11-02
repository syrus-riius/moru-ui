import { useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { Text, View } from 'react-native'
import { AppScreen, NativeButton, NativeCheckbox, NavigationBar, TextField, useMoruNativeTheme } from '@moru/native'
import { useLabState } from '../../state'
export default function TaskDetail() {
  const params = useLocalSearchParams<{ id: string }>()
  const { tasks, setTasks } = useLabState()
  const task = tasks.find((item) => item.id === params.id)
  const [title, setTitle] = useState(task?.title ?? '')
  const [error, setError] = useState('')
  const { colors } = useMoruNativeTheme()
  if (!task) return <AppScreen><NavigationBar title="작업을 찾을 수 없어요" onBack={() => router.back()} /><NativeButton onPress={() => router.replace('/')}>첫 화면으로</NativeButton></AppScreen>
  function save() { if (!title.trim()) { setError('작업 이름을 입력해 주세요.'); return }; setTasks((previous) => previous.map((item) => item.id === params.id ? { ...item, title: title.trim() } : item)); router.back() }
  return <AppScreen><NavigationBar title="작업 상세" subtitle={task.date} onBack={() => router.back()} /><TextField label="작업 이름" value={title} onChangeText={setTitle} error={error || undefined} /><NativeCheckbox label="완료한 작업" value={task.done} onValueChange={(done) => setTasks((previous) => previous.map((item) => item.id === params.id ? { ...item, done } : item))} /><View style={{ gap: 12 }}><NativeButton onPress={save}>변경 사항 저장</NativeButton><Text style={{ color: colors.muted }}>Expo Router의 네이티브 Stack에서 뒤로가기와 화면 전환을 확인할 수 있습니다.</Text></View></AppScreen>
}
