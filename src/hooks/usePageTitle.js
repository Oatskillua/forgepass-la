import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { routeMeta } from '../config/routeMeta'

export function usePageTitle() {
  const location = useLocation()

  useEffect(() => {
    const meta = routeMeta[location.pathname]

    if (!meta) {
      document.title = 'ForgePass LA'
      return
    }

    document.title = `${meta.title} | ForgePass LA`
  }, [location.pathname])
}