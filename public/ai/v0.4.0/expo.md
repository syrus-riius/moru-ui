# Moru for Expo / React Native

Version 0.4.0 · source e068de2cd7d2d1f2f198a786dcd23f4fee5b398de94b2591cabeb3a5ceb100f6

The web catalog is not a native component catalog. Use `apps/moru-expo` with the local `packages/moru-native` package. Its dependency is `file:../../packages/moru-native`; preserve that monorepo relation or deliberately relocate both. This is not an npm publication claim.

## Native setup and minimal example

Retain the starter’s Expo dependencies and entry configuration. Wrap the application once in SafeAreaProvider and MoruNativeProvider. Native callbacks differ from the web controls.

```tsx
import { useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AppScreen, MoruNativeProvider, NativeButton, TextField } from '@moru/native'

export default function App() {
  const [name, setName] = useState('')
  return <SafeAreaProvider><MoruNativeProvider mode="light">
    <AppScreen>
      <TextField label="Project name" value={name} onChangeText={setName} />
      <NativeButton onPress={() => setName('')} disabled={!name}>Clear name</NativeButton>
    </AppScreen>
  </MoruNativeProvider></SafeAreaProvider>
}
```

- NativeButton uses onPress; TextField uses onChangeText. NativeSwitch uses value/onValueChange. Do not paste web onClick, Field/Input or CSS variable APIs into native screens.
- AppScreen owns safe area, keyboard avoidance, optional scrolling, pull-to-refresh and a fixed footer. Avoid double-counting navigator insets; use its edges prop. Use scroll={false} when supplying a virtualized list.
- MoruNativeProvider follows system appearance if mode is omitted. Exported native theme JSON can be applied as `mode={exported.mode} tokens={exported.tokens}`; web CSS token objects are not interchangeable.
- Native tokens contain numeric spacing/radius/metrics and color strings. `webFontFamily` only affects React Native Web; register a device font and use tokens.fontFamily, or keep the system font.
- Style-pack settings are preserved as `designIntent.appearance` in exports, with `compatibility.stylePack: 'solid-fallback'`. The current native provider renders solid surfaces and does not implement web blur/glow. Do not claim visual effect parity or pass web CSS into native components.
- Maintain the 48pt/dp minimum native touch target, accessibility labels/state and keyboard handling. Web previews cannot verify device gestures, screen-reader behavior or native rendering.
- NativePicker, NativeSlider and NativeDatePicker come from `@moru/native/expo` and use the starter’s `@expo/ui` dependency. They are not web registry exports. NativeDatePicker is a single-date/time picker; do not invent a native date-range or OTP component because one exists on the web.

## Actual runtime exports

Derived from the native entry modules in this repository; helpers are listed alongside components.

`@moru/native`: `ActionGrid`, `ActivityCalendar`, `Amount`, `AppScreen`, `AvatarGroup`, `BottomSheet`, `BottomTabBar`, `CardStack`, `DateStrip`, `IconButton`, `ListRow`, `ListSection`, `MetricCard`, `MobileSearchField`, `MoruNativeProvider`, `NativeActionSheet`, `NativeButton`, `NativeChart`, `NativeCheckbox`, `NativeRadioGroup`, `NativeSparkline`, `NativeStepper`, `NativeSwitch`, `NavigationBar`, `PageControl`, `ProgressRing`, `SegmentedControl`, `SwipeableRow`, `TextField`, `calendarMonthCells`, `closestDetent`, `defaultMoruNativeTheme`, `isLeapYear`, `progressValues`, `readableOn`, `sheetDetentHeights`, `steppedValue`, `useMoruNativeTheme`.

`@moru/native/expo`: `NativeDatePicker`, `NativePicker`, `NativeSlider`.

## Selected source-derived declarations

React Native inherited props remain inherited. These are excerpts, not replacement implementations.

```ts
type MoruNativeProviderProps = {
  children: ReactNode
  /** Omit to follow the operating system's appearance. */
  mode?: MoruNativeMode
  accent?: string
  /** Native overrides can be derived from exported Moru web tokens. */
  tokens?: Partial<Pick<MoruNativeTheme, 'space' | 'radius' | 'borderWidth' | 'density'>> & {
    colors?: Partial<MoruNativeColors>
    metrics?: NativeMetricOverrides
    typography?: NativeTypographyOverrides
    componentSpacing?: NativeComponentSpacing
    fontFamily?: string
    webFontFamily?: string
  }
}

type AppScreenProps = {
  children: ReactNode
  scroll?: boolean
  footer?: ReactNode
  style?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
  refreshing?: boolean
  onRefresh?: () => void
  /** Exclude top/bottom when an enclosing native navigator already owns those insets. */
  edges?: Edge[]
  keyboardVerticalOffset?: number
}

type NativeButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: NativeSize
  loading?: boolean
  style?: StyleProp<ViewStyle>
}

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string
  error?: string
  description?: string
  style?: StyleProp<ViewStyle>
  inputStyle?: StyleProp<TextStyle>
  size?: NativeSize
}

type NativeSwitchProps = {
  label: string
  description?: string
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}
```


```ts
type NativePickerProps = {
  label: string
  items: { value: string; label: string }[]
  value: string
  onValueChange: (value: string) => void
  appearance?: 'menu' | 'wheel'
  disabled?: boolean
}

type NativeSliderProps = {
  label: string
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

type NativeDatePickerProps = {
  label: string
  value: Date
  onValueChange: (value: Date) => void
  mode?: 'date' | 'time'
  minimumDate?: Date
  maximumDate?: Date
}
```

Read [native README](https://github.com/syrus-riius/moru-ui/blob/main/packages/moru-native/README.md) and [native source](https://github.com/syrus-riius/moru-ui/tree/main/packages/moru-native/src) for the remaining component props. Use the source’s actual exports instead of assuming SwiftUI and web components have one-to-one wrappers.
