import React, { useState, useEffect } from 'react'
import { AdminLayout } from '../components/features/admin/AdminLayout'
import { AdminDashboard } from '../components/features/admin/AdminDashboard'
import { UserManagement } from '../components/features/admin/UserManagement'
import { PropertyApproval } from '../components/features/admin/PropertyApproval'
import { BookingManagement } from '../components/features/admin/BookingManagement'
import { AnalyticsDashboard } from '../components/features/admin/AnalyticsDashboard'
import { SystemSettings } from '../components/features/admin/SystemSettings'
import { ActivityLog } from '../components/features/admin/ActivityLog'
import { useAuthStore } from '../lib/stores/authStore'
import { useAdminAuth } from '../hooks/useAdminAuth'

import { AdminPageProps } from '../interfaces'

export const AdminPage: React.FC<AdminPageProps> = ({ onPageChange }) => {
  const [currentSection, setCurrentSection] = useState('dashboard')
  
  const { isAuthenticated, isAdmin, user } = useAuthStore()
  const { signOut } = useAdminAuth()

  console.log('🏛️ AdminPage loaded:', {
    isAuthenticated,
    isAdmin,
    userEmail: user?.email || 'null',
    userRole: user?.user_role || 'null'
  })

  // Check admin authentication
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      console.log('❌ Admin access denied - redirecting to login')
      onPageChange?.('admin-login')
      return
    }

    console.log('✅ Admin authenticated successfully:', user?.email)
  }, [isAuthenticated, isAdmin, user, onPageChange])

  // Handle logout
  const handleLogout = async () => {
    try {
      console.log('🚪 Admin logout initiated')
      await signOut()
      console.log('🚀 Redirecting to admin login')
      
      // Small delay to ensure auth state is cleared
      setTimeout(() => {
        onPageChange?.('admin-login')
      }, 100)
    } catch (error) {
      console.error('❌ Logout error:', error)
      // Force redirect even if logout fails
      setTimeout(() => {
        onPageChange?.('admin-login')
      }, 100)
    }
  }

  // If not authenticated, don't render admin content
  if (!isAuthenticated || !isAdmin) {
    return null
  }

  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return <AdminDashboard onSectionChange={setCurrentSection} />
      case 'users':
        return <UserManagement />
      case 'properties':
        return <PropertyApproval />
      case 'bookings':
        return <BookingManagement />
      case 'analytics':
        return <AnalyticsDashboard />
      case 'settings':
        return <SystemSettings />
      case 'activities':
        return <ActivityLog onBack={() => setCurrentSection('dashboard')} />
      default:
        return <AdminDashboard onSectionChange={setCurrentSection} />
    }
  }

  return (
    <AdminLayout 
      currentSection={currentSection} 
      onSectionChange={setCurrentSection}
      onLogout={handleLogout}
    >
      {renderContent()}
    </AdminLayout>
  )
} 