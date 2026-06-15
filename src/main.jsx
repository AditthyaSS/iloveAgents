import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AgentsProvider } from './lib/useAgents'
import { ApiKeyProvider } from './lib/useApiKey'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ApiKeyProvider>
        <AgentsProvider>
          <App />
        </AgentsProvider>
      </ApiKeyProvider>
    </BrowserRouter>
  </React.StrictMode>
)
