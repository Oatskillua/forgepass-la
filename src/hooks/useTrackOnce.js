import { useEffect, useRef } from 'react'

import { trackEvent } from '../lib/analytics'

export function useTrackOnce(event, metadata = {}) {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return

    tracked.current = true
    trackEvent(event, metadata)
  }, [event])
}