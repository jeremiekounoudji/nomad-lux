import React, { useState } from 'react'
import { AdminLayout } from '../components/features/admin/AdminLayout'
import { AdminDashboard } from '../components/features/admin/AdminDashboard'
import { UserManagement } from '../components/features/admin/UserManagement'
import { PropertyApproval } from '../components/features/admin/PropertyApproval'
import { BookingManagement } from '../components/features/admin/BookingManagement'
import { AnalyticsDashboard } from '../components/features/admin/AnalyticsDashboard'
import { SystemSettings } from '../components/features/admin/SystemSettings'
import { ActivityLog } from '../components/features/admin/ActivityLog'

import { AdminPageProps } from '../interfaces'

export const AdminPage: React.FC<AdminPageProps> = ({ onPageChange }) => {
  const [currentSection, setCurrentSection] = useState('dashboard')

  // Admin authentication check (in real app, this would check JWT token, etc.)
  const isAdminAuthenticated = () => {
    // For demo purposes, we'll assume user is authenticated
    // In real app, check localStorage token, session, etc.
    return true
  }

  // Handle logout and redirect to admin login
  const handleLogout = () => {
    // Clear admin session/token
    localStorage.removeItem('adminToken')
    // Redirect to admin login
    onPageChange?.('admin-login')
  }

  // If not authenticated, redirect to admin login
  if (!isAdminAuthenticated()) {
    onPageChange?.('admin-login')
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