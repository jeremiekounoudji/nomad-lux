import React from 'react'
import { Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router-dom'
import { useAuthInit } from './hooks/useAuthInit'
import { useTranslationInit } from './hooks/useTranslationInit'
import { router } from './router'
import './App.css'
import './lib/i18n' // Initialize i18next

// App initialization wrapper component
const AppInitWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useAuthInit()
  useTranslationInit()
  return <>{children}</>
}

function App() {
  console.log('🚀 App component initializing', { timestamp: new Date().toISOString() })
  
  return (
    <AppInitWrapper>
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
    </AppInitWrapper>
  )
}

export default App 