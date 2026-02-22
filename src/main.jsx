import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { LangProvider } from './i18n/LangContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { initPurchases } from './lib/purchases'
import './styles/global.css'

// Initialize RevenueCat on native platforms
initPurchases().catch(err => console.warn('[App] RevenueCat init skipped:', err))

// Code splitting — heavy components load on demand
const App = lazy(() => import('./App'))

const LoadingFallback = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100svh', background: '#0f0f0f'
  }}>
    <div style={{
      width: '36px', height: '36px', border: '3px solid #333',
      borderTopColor: '#E07A5F', borderRadius: '50%',
      animation: 'spin 0.7s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LangProvider>
        <Suspense fallback={<LoadingFallback />}>
          <App />
        </Suspense>
      </LangProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
