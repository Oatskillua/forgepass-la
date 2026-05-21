import { createBrowserRouter } from 'react-router-dom'

import Home from './pages/Home'
import Discover from './pages/Discover'
import Events from './pages/Events'
import Rewards from './pages/Rewards'
import Safety from './pages/Safety'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/discover',
    element: <Discover />,
  },
  {
    path: '/events',
    element: <Events />,
  },
  {
    path: '/rewards',
    element: <Rewards />,
  },
  {
    path: '/safety',
    element: <Safety />,
  },
])