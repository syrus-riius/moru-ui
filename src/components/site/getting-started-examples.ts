import type { Locale } from '../../lib/locale'

/** Complete, copyable files shared by the guide and its installation check. */
export function gettingStartedExamples(
  locale: Locale,
  copy: { project: string; placeholder: string; date: string },
) {
  const field = `      <Field label={${JSON.stringify(copy.project)}}>
        <Input name="project" placeholder={${JSON.stringify(copy.placeholder)}} />
      </Field>`
  return {
    app: `import { Field, Input, MoruProvider } from 'moru-ui'
import 'moru-ui/styles.css'

export default function App() {
  return (
    <MoruProvider locale="${locale}">
${field}
    </MoruProvider>
  )
}`,
    locale: `import { DatePicker, MoruProvider } from 'moru-ui'
import 'moru-ui/styles.css'

export default function App() {
  return (
    <MoruProvider locale="${locale}">
      <DatePicker label={${JSON.stringify(copy.date)}} />
    </MoruProvider>
  )
}`,
    nextProvider: `'use client'

import type { ReactNode } from 'react'
import { MoruProvider } from 'moru-ui'

export function Providers({ children }: { children: ReactNode }) {
  return <MoruProvider locale="${locale}">{children}</MoruProvider>
}`,
    nextLayout: `import type { ReactNode } from 'react'
import 'moru-ui/styles.css'
import { Providers } from './providers'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="${locale}">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}`,
    nextPage: `'use client'

import { Field, Input } from 'moru-ui'

export default function Page() {
  return (
    <Field label={${JSON.stringify(copy.project)}}>
      <Input name="project" placeholder={${JSON.stringify(copy.placeholder)}} />
    </Field>
  )
}`,
    source: `import { Field } from '@/components/ui/moru/field'
import { Input } from '@/components/ui/moru/input'
import { MoruProvider } from '@/components/ui/moru/provider'
import '@/components/ui/moru/styles.css'

export default function App() {
  return (
    <MoruProvider locale="${locale}">
${field}
    </MoruProvider>
  )
}`,
  }
}
