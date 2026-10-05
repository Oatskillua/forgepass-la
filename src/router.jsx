/* eslint-disable react-refresh/only-export-components -- route modules are lazy-loaded here */
import { createBrowserRouter } from 'react-router-dom'
import { lazy } from 'react'

const Home = lazy(() => import('./pages/Home'))
const Discover = lazy(() => import('./pages/Discover'))
const Events = lazy(() => import('./pages/Events'))
const Rewards = lazy(() => import('./pages/Rewards'))
const Safety = lazy(() => import('./pages/Safety'))
const Status = lazy(() => import('./pages/Status'))
const Health = lazy(() => import('./pages/Health'))
const NotFound = lazy(() => import('./pages/NotFound'))
const ErrorFallback = lazy(() => import('./components/ErrorFallback'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Contact = lazy(() => import('./pages/Contact'))
const Terms = lazy(() => import('./pages/Terms'))
const Security = lazy(() => import('./pages/Security'))
const Feedback = lazy(() => import('./pages/Feedback'))
const AlphaGuide = lazy(() => import('./pages/AlphaGuide'))
const AlphaLaunch = lazy(() => import('./pages/AlphaLaunch'))
const Admin = lazy(() => import('./pages/Admin'))
const Auth = lazy(() => import('./pages/Auth'))
const UpdatePassword = lazy(() => import('./pages/UpdatePassword'))
const UserDashboard = lazy(() => import('./pages/UserDashboard'))
const ProtectedRoute = lazy(() => import('./auth/ProtectedRoute'))
const Saved = lazy(() => import('./pages/Saved'))
const Itineraries = lazy(() => import('./pages/Itineraries'))
const SharedItinerary = lazy(() => import('./pages/SharedItinerary'))
const Profile = lazy(() => import('./pages/Profile'))
const AppRewards = lazy(() => import('./pages/AppRewards'))
const Alerts = lazy(() => import('./pages/Alerts'))
const MapPage = lazy(() => import('./pages/Map'))
const CityIntelligence = lazy(() => import('./pages/CityIntelligence'))

export const router = createBrowserRouter([
  { path: '/shared-trip', element: <SharedItinerary />, errorElement: <ErrorFallback /> },
  { path: '/auth/update-password', element: <UpdatePassword />, errorElement: <ErrorFallback /> },
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
    path: '/contact',
    element: <Contact />,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/security',
    element: <Security />,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/feedback',
    element: <Feedback />,
    errorElement: <ErrorFallback />,
  },
  {
  path: '/alpha-guide',
  element: <AlphaGuide />,
  errorElement: <ErrorFallback />,
  },
  {
  path: '/alpha-launch',
  element: <AlphaLaunch />,
  errorElement: <ErrorFallback />,
  },
  {
  path: '/admin',
  element: <Admin />,
  },
  {
    path: '/auth',
    element: <Auth />,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <UserDashboard />
      </ProtectedRoute>
    ),
    errorElement: <ErrorFallback />,
  },
  {
    path: '/app/saved',
    element: <ProtectedRoute><Saved /></ProtectedRoute>,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/app/itineraries',
    element: <ProtectedRoute><Itineraries /></ProtectedRoute>,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/app/profile',
    element: <ProtectedRoute><Profile /></ProtectedRoute>,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/app/rewards',
    element: <ProtectedRoute><AppRewards /></ProtectedRoute>,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/app/alerts',
    element: <ProtectedRoute><Alerts /></ProtectedRoute>,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/map',
    element: <MapPage />,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/city-intelligence',
    element: <CityIntelligence />,
    errorElement: <ErrorFallback />,
  },
  {
    path: '*',
    element: <NotFound />,
    errorElement: <ErrorFallback />,
  },
])
