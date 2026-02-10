import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'

const LandingPage = lazy(() => import('./pages/LandingPage.jsx'))
const PlannerPage = lazy(() => import('./pages/PlannerPage.jsx'))
const AuthPage = lazy(() => import('./pages/AuthPage.jsx'))
const EventsPage = lazy(() => import('./pages/EventsPage.jsx'))
const UpgradePage = lazy(() => import('./pages/UpgradePage.jsx'))
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

import AuthGuard from './components/AuthGuard'
import { AuthProvider } from './hooks/useAuth'
import { TierProvider } from './contexts/TierContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <TierProvider>
            <Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/app" element={<PlannerPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/events" element={<AuthGuard><EventsPage /></AuthGuard>} />
                <Route path="/events/:eventId" element={<AuthGuard><PlannerPage /></AuthGuard>} />
                <Route path="/upgrade" element={<AuthGuard><UpgradePage /></AuthGuard>} />
                <Route path="/payment-success" element={<AuthGuard><PaymentSuccessPage /></AuthGuard>} />
                <Route path="/find-seat/:eventId" element={<PlannerPage findSeatMode />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </TierProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
