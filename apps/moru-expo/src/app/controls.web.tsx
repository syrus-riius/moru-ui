import { useState } from 'react'
import { router } from 'expo-router'
import { Text, View } from 'react-native'
import { AppScreen, NativeActionSheet, NativeButton, NativeCheckbox, NativeRadioGroup, NativeStepper, NativeSwitch, NavigationBar, useMoruNativeTheme } from '@moru/native'
import { NativePicker, NativeSlider } from '@moru/native/expo'
import { BrowserDatePicker as NativeDatePicker } from '../components/BrowserDatePicker'
export default function Controls() {
  const { colors } = useMoruNativeTheme()
  const [priority, setPriority] = useState('medium')
  const [slider, setSlider] = useState(50)
  const [date, setDate] = useState(new Date(2026, 9, 26, 10, 30))
  const [enabled, setEnabled] = useState(true)
  const [checked, setChecked] = useState(false)
  const [size, setSize] = useState('medium')
  const [count, setCount] = useState(2)
  const [sheet, setSheet] = useState(false)
  const [result, setResult] = useState('선택한 동작이 여기에 표시됩니다.')
  return <AppScreen><NavigationBar title="입력 컨트롤" subtitle="공통 소스 · 웹에서 확인" onBack={() => router.back()} /><Text style={{ color: colors.muted, fontSize: 14, lineHeight: 22 }}>Picker·Slider는 앱과 같은 Moru 컴포넌트가 Expo UI의 웹 구현으로 표시됩니다. 날짜 선택은 브라우저 대체이며 OS 시스템 외형·제스처 검증은 기기에서 진행합니다.</Text>
    <NativeButton variant="secondary" onPress={() => router.push('/system-tabs')}>시스템 탭의 웹 구현 보기</NativeButton>
    <NativePicker label="우선순위" items={[{ value: 'low', label: '낮음' }, { value: 'medium', label: '보통' }, { value: 'high', label: '높음' }]} value={priority} onValueChange={setPriority} />
    <NativeSlider label="목표 진행률" value={slider} onValueChange={setSlider} min={0} max={100} step={5} />
    <NativeDatePicker label="마감 날짜" value={date} onValueChange={setDate} />
    <NativeSwitch label="활동 알림" description="플랫폼 기본 스위치" value={enabled} onValueChange={setEnabled} />
    <NativeCheckbox label="작업 준비 완료" value={checked} onValueChange={setChecked} />
    <NativeRadioGroup label="표시 밀도" items={[{ value: 'small', label: '촘촘하게' }, { value: 'medium', label: '기본' }, { value: 'large', label: '여유롭게' }]} value={size} onValueChange={setSize} />
    <NativeStepper label="참여 인원" value={count} onValueChange={setCount} min={1} max={8} />
    <View style={{ gap: 12 }}><NativeButton onPress={() => setSheet(true)}>동작 시트 열기</NativeButton><Text accessibilityLiveRegion="polite" style={{ color: colors.muted }}>{result}</Text></View>
    <NativeActionSheet open={sheet} onOpenChange={setSheet} title="작업 동작" actions={[{ label: '링크 공유 예제', onPress: () => setResult('공유 동작을 선택했습니다. 외부 전송은 하지 않습니다.') }, { label: '보관하기', onPress: () => setResult('예제 작업을 보관했습니다.') }]} />
  </AppScreen>
}
