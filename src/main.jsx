// src/main.jsx  — add SettingsProvider
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { BrowserRouter } from 'react-router-dom'

import { AuthProvider } from './contexts/AuthContext.jsx'
import { ShopProvider } from './contexts/ShopContext.jsx'
import { UIProvider } from './contexts/UIContext.jsx'
import { SettingsProvider } from './contexts/SettingsContext.jsx'   // ← NEW

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SettingsProvider>            {/* ← NEW (wraps ShopProvider so Shop can read settings) */}
            <ShopProvider>
              <UIProvider>
                <App />
              </UIProvider>
            </ShopProvider>
          </SettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)