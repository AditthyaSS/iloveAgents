import { useState } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import CustomCursor from './components/CustomCursor'
import HomePage from './pages/HomePage'
import AgentPage from './pages/AgentPage'
import ScrollToTop from './components/ScrollToTop'
import ScrollToBottom from './components/ScrollToBottom'
import BattleModeLanding from './pages/BattleModeLanding'
import BattleModeSetup from './pages/BattleModeSetup'
import BattleModeArena from './pages/BattleModeArena'
import BattleModeWinner from './pages/BattleModeWinner'
import WorkflowLibrary from './pages/WorkflowLibrary'
import WorkflowBuilder from './pages/WorkflowBuilder'
import WorkflowDetail from './pages/WorkflowDetail'
import WorkflowRunner from './pages/WorkflowRunner'
import NotFoundPage from './pages/NotFoundPage'
import SuitesPage from './pages/SuitesPage'
import CollectionsPage from './pages/CollectionsPage'
import CollectionDetailPage from './pages/CollectionDetailPage'
import ErrorBoundary from './components/ErrorBoundary'

// Shared layout: Navbar + Sidebar + main content area
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
        <Routes>
          {/* Battle Mode — full-screen, own layout */}
          <Route path="/battle" element={<BattleModeLanding />} />
          <Route path="/battle/setup" element={<BattleModeSetup />} />
          <Route path="/battle/arena" element={<BattleModeArena />} />
          <Route path="/battle/winner" element={<BattleModeWinner />} />

          {/* Main app layout — all routes share Navbar + Sidebar */}
          <Route element={<MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/agent/:id" element={<AgentPage />} />

            {/* Suites */}
            <Route path="/suites" element={<SuitesPage />} />

            {/* Collections */}
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/collections/:id" element={<CollectionDetailPage />} />

            {/* Workflow routes */}
            <Route path="/workflows" element={<WorkflowLibrary />} />
            <Route path="/workflows/build" element={<WorkflowBuilder />} />
            <Route path="/workflows/:id" element={<WorkflowDetail />} />
            <Route path="/workflows/:id/run" element={<WorkflowRunner />} />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </div>
  )
}