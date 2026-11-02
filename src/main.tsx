import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './theme/fonts.css'
import './theme/default.css'
import './components/ui/styles.css'
import './components/token-editor.css'
import './theme/readability.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
