import { useState, Suspense, lazy } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import CustomCursor from './components/CustomCursor'
import ScrollToTop from './components/ScrollToTop'
import ScrollToBottom from './components/ScrollToBottom'
import ErrorBoundary from './components/ErrorBoundary'

const HomePage = lazy(() => import('./pages/HomePage'))
const AgentPage = lazy(() => import('./pages/AgentPage'))
const BattleModeLanding = lazy(() => import('./pages/BattleModeLanding'))
const BattleModeSetup = lazy(() => import('./pages/BattleModeSetup'))
const BattleModeArena = lazy(() => import('./pages/BattleModeArena'))
const BattleModeWinner = lazy(() => import('./pages/BattleModeWinner'))
const WorkflowLibrary = lazy(() => import('./pages/WorkflowLibrary'))
const WorkflowBuilder = lazy(() => import('./pages/WorkflowBuilder'))
const WorkflowDetail = lazy(() => import('./pages/WorkflowDetail'))
const WorkflowRunner = lazy(() => import('./pages/WorkflowRunner'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const SuitesPage = lazy(() => import('./pages/SuitesPage'))
const CollectionsPage = lazy(() => import('./pages/CollectionsPage'))
const CollectionDetailPage = lazy(() => import('./pages/CollectionDetailPage'))
const SchedulerPage = lazy(() => import('./pages/SchedulerPage'))
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'))
const Privacy = lazy(() => import('./pages/Privacy'))

function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
      <Loader2 size={32} className="animate-spin text-accent" />
      <p className="text-sm dark:text-text-secondary text-gray-500">Loading...</p>
    </div>
  )
}

function MainLayout({ sidebarOpen, setSidebarOpen }) {
  return (
    <>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <CustomCursor />
      <main className="pt-28 lg:pl-60">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </>
  )
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen transition-theme dark:bg-surface bg-gray-50">
      <ScrollToTop />
      <ScrollToBottom />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/agent/:id" element={<AgentPage />} />
              <Route path="/suites" element={<SuitesPage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/collections/:id" element={<CollectionDetailPage />} />
              <Route path="/scheduler" element={<SchedulerPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/workflows" element={<WorkflowLibrary />} />
              <Route path="/workflows/build" element={<WorkflowBuilder />} />
              <Route path="/workflows/:id" element={<WorkflowDetail />} />
              <Route path="/workflows/:id/run" element={<WorkflowRunner />} />
              <Route path="/battle" element={<BattleModeLanding />} />
              <Route path="/battle/setup" element={<BattleModeSetup />} />
              <Route path="/battle/arena" element={<BattleModeArena />} />
              <Route path="/battle/winner" element={<BattleModeWinner />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}