import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@/styles/globals.css'
import App from '@/App.jsx'
import { RealtimeProvider } from '@/realtime/RealtimeProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <RealtimeProvider>
        <App />
      </RealtimeProvider>
    </BrowserRouter>
  </StrictMode>,
)
