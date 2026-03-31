import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 1. Ensure your contexts are imported
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ShopProvider } from './contexts/ShopContext.jsx'

// 2. Import TanStack Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 3. Create the client OUTSIDE the render function
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 4. WRAP EVERYTHING HERE */}
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ShopProvider>
          <App />
        </ShopProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)