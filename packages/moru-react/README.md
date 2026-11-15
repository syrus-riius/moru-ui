# Moru UI for React

Moru UI provides React components, design tokens, and ready-to-use interface blocks. This beta targets Vite apps using React and React DOM 19.3 and ships ES modules, TypeScript declarations, and compiled CSS.

## Install

Once the beta is available on npm, install it in your React app.

```sh
npm install moru-ui@beta
```

To try a local build, install the package archive in your app.

```sh
npm install /path/to/moru-ui-0.4.0-beta.1.tgz
```

Import the stylesheet once in your app entry and wrap the area that uses Moru in `MoruProvider`.

```tsx
import { Button, MoruProvider } from 'moru-ui'
import 'moru-ui/styles.css'

export function App() {
  return (
    <MoruProvider>
      <Button variant="primary">Save</Button>
    </MoruProvider>
  )
}
```

Pass `mode="dark"` to `MoruProvider` for the dark theme. Pass a `tokens` object to supply your own theme tokens. Moru applies its styles inside the provider, including overlays that render through Moru's portals.

## Components and blocks

Import UI components such as `Button`, `Dialog`, and `DatePicker`, or blocks such as `LoginBlock`, `OTPBlock`, `SearchFiltersBlock`, and `SettingsBlock`, from `moru-ui`. The login and OTP blocks demonstrate client-side flows.

Use these entry points for charts, data tables, carousels, and resizable layouts.

```tsx
import { Chart } from 'moru-ui/chart'
import { DataTable } from 'moru-ui/data-table'
import { Carousel } from 'moru-ui/carousel'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from 'moru-ui/resizable'
```

Browse the component examples and installation guide. [Component gallery](https://moru-ui-lab.riius.chatgpt.site/#components) · [Moru guide](https://moru-ui-lab.riius.chatgpt.site/#guide)

## Copy component source into your app

Use Moru's registry when you want to own and edit a component's source in your project.

```sh
npx shadcn@4.23.0 add https://moru-ui-lab.riius.chatgpt.site/r/v0.4.0/button.json
```

## License

MIT. [License text](https://github.com/syrus-riius/moru-ui/blob/main/LICENSE)
