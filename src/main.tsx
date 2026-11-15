import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { SiteI18nProvider } from './i18n/SiteI18nProvider'
import './styles.css'
import './theme/fonts.css'
import './theme/default.css'
import './components/ui/styles.css'
import './components/token-editor/token-editor.css'
import './theme/readability.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SiteI18nProvider>
      <App />
    </SiteI18nProvider>
  </StrictMode>,
)
