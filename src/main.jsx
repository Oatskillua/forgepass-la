import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './index.css'
import App from './App.jsx'
import { initSentry } from './lib/sentry'
import { sanitizeAnalyticsUrl } from './lib/telemetryUrls'

initSentry()
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Analytics beforeSend={sanitizeAnalyticsUrl} />
    <SpeedInsights beforeSend={sanitizeAnalyticsUrl} />
  </StrictMode>,
)
