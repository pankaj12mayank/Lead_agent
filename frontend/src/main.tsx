import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App.tsx'
import './index.css'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { useAuthStore } from '@/store/authStore'
import { initDocumentTheme } from '@/store/themeStore'

initDocumentTheme()
useAuthStore.getState().hydrate()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
