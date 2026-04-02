import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { AuthProvider } from './contexts/AuthContext.jsx'
import { ShopProvider } from './contexts/ShopContext.jsx'
import { UIProvider } from './contexts/UIContext.jsx' // <-- NEW IMPORT

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ShopProvider>
          {/* Wrap App with UIProvider */}
          <UIProvider>
            <App />
          </UIProvider>
        </ShopProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)