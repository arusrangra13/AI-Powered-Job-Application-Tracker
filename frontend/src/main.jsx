import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#161929',
            color: '#e2e8f0',
            border: '1px solid rgba(100,120,249,0.2)',
            borderRadius: '0.75rem',
          },
          success: { iconTheme: { primary: '#4ade80', secondary: '#161929' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#161929' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
