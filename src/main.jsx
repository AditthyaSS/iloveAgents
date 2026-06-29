import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AgentsProvider } from './lib/useAgents'
import { ToastProvider } from './lib/useToast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AgentsProvider>
          <App />
        </AgentsProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
)
