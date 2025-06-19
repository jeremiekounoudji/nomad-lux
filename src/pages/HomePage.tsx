import React, { useState } from 'react'
import MainLayout from '../components/layout/MainLayout'
import PopularPlaces from '../components/shared/PopularPlaces'
import PropertyCard from '../components/shared/PropertyCard'
import ProfileModal from '../components/shared/ProfileModal'
import PropertyDetailPage from './PropertyDetailPage'
import CreatePropertyPage from './CreatePropertyPage'
import LikedPropertiesPage from './LikedPropertiesPage'
import MyBookingsPage from './MyBookingsPage'
import MyListingsPage from './MyListingsPage'
import NotificationsPage from './NotificationsPage'
import BookingRequestsPage from './BookingRequestsPage'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'
import SearchPage from './SearchPage'
import { AdminLoginPage } from './AdminLoginPage'
import { AdminRegisterPage } from './AdminRegisterPage'
import { AdminPage } from './AdminPage'
import { Property } from '../interfaces'
import { mockProperties } from '../lib/mockData'
// import { AuthTest } from '../components/shared/AuthTest'

const HomePage: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [currentPage, setCurrentPage] = useState('home')
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  console.log('🏠 HomePage rendered', { currentPage, timestamp: new Date().toISOString() })

  const handleLike = (propertyId: string) => {
    console.log('Liked property:', propertyId)
  }

  const handleShare = (property: Property) => {
    console.log('Share property:', property.title)
  }

  const handleBook = (property: Property) => {
    console.log('Book property:', property.title)
  }

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property)
  }

  const handleBackToHome = () => {
    setSelectedProperty(null)
    setCurrentPage('home')
  }

  const handlePageChange = (page: string) => {
    if (page === 'profile') {
      setIsProfileModalOpen(true)
      // Don't change currentPage for profile modal
      return
    }
    
    setCurrentPage(page)
    setSelectedProperty(null)
    // Close profile modal if it's open when navigating to other pages
    setIsProfileModalOpen(false)
  }

  const handleProfileModalClose = () => {
    setIsProfileModalOpen(false)
    // Reset to ensure it can be opened again
    setTimeout(() => {
      // Small delay to ensure state is properly reset
    }, 100)
  }

  // Handle different page views
  if (selectedProperty) {
    return (
      <PropertyDetailPage 
        property={selectedProperty} 
        onBack={handleBackToHome}
      />
    )
  }

  // Route to different pages
  switch (currentPage) {
    case 'create':
      return <CreatePropertyPage onPageChange={handlePageChange} />
    case 'liked':
      return <LikedPropertiesPage onPageChange={handlePageChange} />
    case 'bookings':
      return <MyBookingsPage onPageChange={handlePageChange} />
    case 'listings':
      return <MyListingsPage onPageChange={handlePageChange} />
    case 'notifications':
      return <NotificationsPage onPageChange={handlePageChange} />
    case 'requests':
      return <BookingRequestsPage onPageChange={handlePageChange} />
    case 'login':
      return <LoginPage onPageChange={handlePageChange} />
    case 'register':
      return <RegisterPage onPageChange={handlePageChange} />
    case 'search':
      return <SearchPage onPageChange={handlePageChange} />
    case 'admin-login':
      return <AdminLoginPage onPageChange={handlePageChange} />
    case 'admin-register':
      return <AdminRegisterPage onPageChange={handlePageChange} />
    case 'admin':
      return <AdminPage onPageChange={handlePageChange} />
    default:
      break
  }

  // Default home page view
  return (
    <>
      <MainLayout currentPage={currentPage} onPageChange={handlePageChange}>
        {/* AUTH TEST COMPONENT - TEMPORARILY DISABLED DUE TO CONTEXT ISSUES */}
        {/* <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-6">
          <AuthTest />
        </div> */}

        {/* Popular Places Section - Full width across all columns */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <PopularPlaces />
        </div>

        {/* Property Cards - Each card takes one grid column */}
        {mockProperties.map((property) => (
          <div key={property.id} className="col-span-1">
            <PropertyCard
              property={property}
              variant="feed"
              onLike={handleLike}
              onShare={handleShare}
              onBook={handleBook}
              onClick={handlePropertyClick}
            />
          </div>
        ))}
      </MainLayout>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={handleProfileModalClose}
      />
    </>
  )
}

export default HomePage 