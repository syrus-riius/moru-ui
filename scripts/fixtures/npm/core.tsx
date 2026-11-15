import { createRoot } from 'react-dom/client'
import * as Moru from 'moru-ui'
import * as Blocks from 'moru-ui/blocks'
import 'moru-ui/styles.css'

// Referencing each namespace checks the complete public entry, including exports
// an ordinary tree-shaken demo might never resolve.
const { MoruProvider, Field, Input, Button, InputOTP, Modal, DateRangePicker, TimeRangePicker } =
  Moru
const { LoginBlock, SignupBlock, OTPBlock, SearchFiltersBlock, SettingsBlock } = Blocks

createRoot(document.getElementById('root')!).render(
  <MoruProvider locale="en">
    <p>
      {Object.keys(Moru).join(', ')} / {Object.keys(Blocks).join(', ')}
    </p>
    <Field label="Email">
      <Input type="email" />
    </Field>
    <InputOTP aria-label="Verification code" />
    <Modal trigger={<Button>Open</Button>} title="Consumer modal">
      <Input aria-label="Modal field" />
    </Modal>
    <DateRangePicker aria-label="Travel dates" />
    <TimeRangePicker label="Meeting time" />
    <LoginBlock />
    <SignupBlock />
    <OTPBlock />
    <SearchFiltersBlock />
    <SettingsBlock />
  </MoruProvider>,
)
