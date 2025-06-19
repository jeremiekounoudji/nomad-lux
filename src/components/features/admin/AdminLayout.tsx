import React, { useState } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'

interface AdminLayoutProps {
  children: React.ReactNode
  currentSection: string
  onSectionChange: (section: string) => void
  onLogout?: () => void
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  currentSection, 
  onSectionChange,
  onLogout
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar 
        currentSection={currentSection}
        onSectionChange={onSectionChange}
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        onLogout={handleLogout}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <AdminHeader 
          onToggleSidebar={toggleSidebar}
          onLogout={handleLogout}
          onSectionChange={onSectionChange}
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-none">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
} 