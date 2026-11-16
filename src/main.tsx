import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { prepareTelegramLaunch } from './navigation/telegramLaunch'

const launch = await prepareTelegramLaunch()
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App initialHash={launch.initialHash} />
  </StrictMode>,
)

launch.ready()
