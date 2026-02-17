import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './app.css' // <--- MAKE SURE THIS LINE EXISTS AND MATCHES YOUR FILENAME
// or import './App.css' if you put the @tailwind stuff there

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)