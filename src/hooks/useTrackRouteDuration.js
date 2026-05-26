import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { trackEvent } from '../lib/analytics'

export function useTrackRouteDuration() {
  const location = useLocation()

  useEffect(() => {
    const start = Date.now()

    return () => {
      const duration = Math.round(
        (Date.now() - start) / 1000
      )

      trackEvent('route_duration', {
        path: location.pathname,
        seconds: duration,
      })
    }
  }, [location.pathname])
}