import { createBrowserRouter } from 'react-router-dom'

import Home from './pages/Home'
import Discover from './pages/Discover'
import Events from './pages/Events'
import Rewards from './pages/Rewards'
import Safety from './pages/Safety'
import Status from './pages/Status'
import Health from './pages/Health'
import NotFound from './pages/NotFound'
import ErrorFallback from './components/ErrorFallback'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/discover',
    element: <Discover />,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/events',
    element: <Events />,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/rewards',
    element: <Rewards />,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/safety',
    element: <Safety />,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/status',
    element: <Status />,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/health',
    element: <Health />,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/privacy',
    element: <Privacy />,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/terms',
    element: <Terms />,
    errorElement: <ErrorFallback />,
  },
  {
    path: '*',
    element: <NotFound />,
    errorElement: <ErrorFallback />,
  },
])