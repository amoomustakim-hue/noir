import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import './styles/base.css'
import './styles/chrome.css'
import './styles/hero.css'
import './styles/chapter.css'
import './styles/sections.css'
import App from './App'
import { LenisProvider } from './hooks/useLenis'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LenisProvider>
      <App />
    </LenisProvider>
  </StrictMode>,
)
