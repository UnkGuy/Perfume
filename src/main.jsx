import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { BrowserRouter } from 'react-router-dom' // <-- NEW IMPORT

import { AuthProvider } from './contexts/AuthContext.jsx'
import { ShopProvider } from './contexts/ShopContext.jsx'
import { UIProvider } from './contexts/UIContext.jsx'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* <-- WRAP EVERYTHING HERE */}
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ShopProvider>
            <UIProvider>
              <App />
            </UIProvider>
          </ShopProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)