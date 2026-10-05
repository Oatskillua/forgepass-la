import * as Sentry from '@sentry/react'
import { sanitizeBreadcrumb, sanitizeErrorUrls } from './telemetryUrls'

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN


  if (!dsn) {
    return
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    beforeBreadcrumb: sanitizeBreadcrumb,
    beforeSend: sanitizeErrorUrls,
  })
}
