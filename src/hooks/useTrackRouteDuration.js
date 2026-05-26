import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { trackEvent } from '../lib/analytics'
import { analyticsEvents } from '../config/analyticsEvents'

export function useTrackRouteDuration() {
  const location = useLocation()

  useEffect(() => {
    const start = Date.now()

    return () => {
      const duration = Math.round((Date.now() - start) / 1000)

      trackEvent(analyticsEvents.ROUTE_DURATION, {
        path: location.pathname,
        seconds: duration,
      })
    }
  }, [location.pathname])
}