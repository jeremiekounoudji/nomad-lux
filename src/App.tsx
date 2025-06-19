import React from 'react'
import { AuthProvider } from './context/AuthContext'
import HomePage from './pages/HomePage'
import './App.css'

function App() {
  console.log('🚀 App component initializing', { timestamp: new Date().toISOString() })
  
  return (
    <AuthProvider>
      <div className="App">
        <HomePage />
      </div>
    </AuthProvider>
  )
}

export default App 