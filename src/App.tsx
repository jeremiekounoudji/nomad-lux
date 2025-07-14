import React from 'react'
import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router-dom'
import { useAuthInit } from './hooks/useAuthInit'
import { router } from './router'
import './App.css'

// Auth wrapper component to initialize auth state
const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useAuthInit()
  return <>{children}</>
}

function App() {
  console.log('🚀 App component initializing', { timestamp: new Date().toISOString() })
  
  return (
    <AuthWrapper>
      <RouterProvider router={router} />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthWrapper>
  )
}

export default App 