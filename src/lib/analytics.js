export function trackEvent(event, metadata = {}) {
  if (import.meta.env.DEV) {
    console.log('[analytics]', event, metadata)
  }

  /*
    Future integrations:
    - PostHog
    - Vercel Analytics
    - GA4
    - Segment
    - Mixpanel
  */
}