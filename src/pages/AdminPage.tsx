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
import { PageBanner } from '../components/shared'
import { getBannerConfig } from '../utils/bannerConfig'
import { useTranslation } from '../lib/stores/translationStore'

import { AdminPageProps } from '../interfaces'

export const AdminPage: React.FC<AdminPageProps> = ({ onPageChange }) => {
  const { t } = useTranslation(['admin', 'common'])
  const [currentSection, setCurrentSection] = useState(t('admin.sections.dashboard'))
  
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
      onPageChange?.(t('admin.navigation.login'))
      return
    }

    console.log('✅ Admin authenticated successfully:', user?.email)
  }, [isAuthenticated, isAdmin, user, onPageChange, t])

  // Handle logout
  const handleLogout = async () => {
    try {
      console.log('🚪 Admin logout initiated')
      await signOut()
      console.log('🚀 Redirecting to admin login')
      
      // Small delay to ensure auth state is cleared
      setTimeout(() => {
        onPageChange?.(t('admin.navigation.login'))
      }, 100)
    } catch (error) {
      console.error('❌ Logout error:', error)
      // Force redirect even if logout fails
      setTimeout(() => {
        onPageChange?.(t('admin.navigation.login'))
      }, 100)
    }
  }

  // If not authenticated, don't render admin content
  if (!isAuthenticated || !isAdmin) {
    return null
  }

  const renderContent = () => {
    switch (currentSection) {
      case t('admin.sections.dashboard'):
        return <AdminDashboard onSectionChange={setCurrentSection} />
      case t('admin.sections.users'):
        return <UserManagement />
      case t('admin.sections.properties'):
        return <PropertyApproval />
      case t('admin.sections.bookings'):
        return <BookingManagement />
      case t('admin.sections.analytics'):
        return <AnalyticsDashboard />
      case t('admin.sections.settings'):
        return <SystemSettings />
      case t('admin.sections.activities'):
        return <ActivityLog onBack={() => setCurrentSection(t('admin.sections.dashboard'))} />
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
      {/* Banner */}
      <div className="mb-6">
        <PageBanner
          backgroundImage={getBannerConfig('admin').image}
          title={t('admin.banner.title')}
          subtitle={t('admin.banner.subtitle')}
          imageAlt={t('common.pageBanner.admin')}
          overlayOpacity={getBannerConfig('admin').overlayOpacity}
          height={getBannerConfig('admin').height}
        />
      </div>

      {renderContent()}
    </AdminLayout>
  )
} 