import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { AuthProvider } from './contexts/AuthContext.jsx';
import { ShopProvider } from './contexts/ShopContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ShopProvider>
        <App />
      </ShopProvider>
    </AuthProvider>
  </React.StrictMode>,
)