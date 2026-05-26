import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { trackEvent } from '../lib/analytics'
import { analyticsEvents } from '../config/analyticsEvents'

export function useTrackPageView() {
  const location = useLocation()

  useEffect(() => {
    trackEvent(analyticsEvents.PAGE_VIEW, {
      path: location.pathname,
    })
  }, [location.pathname])
}