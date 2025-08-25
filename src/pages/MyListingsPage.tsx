import React, { useState, useEffect } from 'react'
import { Home, Plus, Eye, Edit, Trash2, Star, Loader2, Pause, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody, Chip, Button, Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react'
import { toast } from 'react-hot-toast'
import { PropertyStatsModal, PropertyEditConfirmationModal, PropertyListingSkeleton, PageBanner } from '../components/shared'
import { getBannerConfig } from '../utils/bannerConfig'
import { useUserListings } from '../hooks/useUserListings'
import { DatabaseProperty, PropertyEditConfirmation } from '../interfaces'
import { MyListingsPageProps } from '../interfaces'
import { convertDatabasePropertyToProperty, getStatusColor, getStatusDisplayName } from '../utils/propertyUtils'
import { ROUTES } from '../router/types'
import { useTranslation } from '../lib/stores/translationStore'
import { formatPrice } from '../utils/currencyUtils'
import { usePropertyEditStore } from '../lib/stores/propertyEditStore'

// Component implementation

const MyListingsPage: React.FC<MyListingsPageProps> = ({ onPageChange }) => {
  const { t } = useTranslation(['property', 'common'])
  const navigate = useNavigate()
  
  // User listings hook
  const {
    filteredListings,
    listingStats,
    isLoading,
    error,
    statusFilter,
    statusCounts,
    pagination,
    fetchUserListings,
    deleteListing,
    toggleListingStatus,
    setStatusFilter,
    checkEditConfirmation,
    goToPage
  } = useUserListings()

  // Component state
  const [propertyToDelete, setPropertyToDelete] = useState<DatabaseProperty | null>(null)
  const [propertyForStats, setPropertyForStats] = useState<DatabaseProperty | null>(null)
  const [editConfirmation, setEditConfirmation] = useState<PropertyEditConfirmation | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Property edit store
  const { setProperty } = usePropertyEditStore()

  // Modals
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isStatsOpen, onOpen: onStatsOpen, onClose: onStatsClose } = useDisclosure()
  const { isOpen: isEditConfirmOpen, onOpen: onEditConfirmOpen, onClose: onEditConfirmClose } = useDisclosure()

  // Load listings on component mount
  useEffect(() => {
    fetchUserListings()
  }, [fetchUserListings])

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleEdit = (property: DatabaseProperty) => {
    console.log('🔧 Edit button clicked for property:', property.id)
    
    // Save property to edit store
    setProperty(property)
    
    // Check if editing requires confirmation
    const confirmation = checkEditConfirmation(property)
    console.log('🔧 Edit confirmation:', confirmation)
    
    if (confirmation.willResetToPending) {
      setEditConfirmation(confirmation)
      onEditConfirmOpen()
    } else {
      // Navigate to edit page
      const editRoute = ROUTES.EDIT_PROPERTY.replace(':id', property.id)
      console.log('🔧 Navigating to:', editRoute)
      navigate(editRoute)
    }
  }

  const handleConfirmEdit = () => {
    if (editConfirmation) {
      // Save property to edit store and navigate to edit page after confirmation
      setProperty(editConfirmation.property)
      navigate(ROUTES.EDIT_PROPERTY.replace(':id', editConfirmation.property.id))
      onEditConfirmClose()
    }
  }



  const handleDelete = (property: DatabaseProperty) => {
    setPropertyToDelete(property)
    onDeleteOpen()
  }

  const confirmDelete = async () => {
    if (propertyToDelete) {
      setActionLoading('delete')
      const result = await deleteListing(propertyToDelete.id)
      
      if (result.success) {
        onDeleteClose()
        setPropertyToDelete(null)
      }
      setActionLoading(null)
    }
  }

  const handleViewStats = (property: DatabaseProperty) => {
    setPropertyForStats(property)
    onStatsOpen()
  }

  const handleToggleStatus = async (property: DatabaseProperty) => {
    const newStatus = property.status === 'paused' ? 'approved' : 'paused'
    setActionLoading(`toggle-${property.id}`)
    
    await toggleListingStatus(property.id, newStatus)
    setActionLoading(null)
  }

  const handleAddListing = () => {
    if (onPageChange) {
      onPageChange('create')
    }
  }

  // Handle tab selection change
  const handleTabSelectionChange = async (key: React.Key) => {
    console.log('🔄 Tab selection changed to:', key)
    await setStatusFilter(key as any)
  }

  // Handle pagination change
  const handlePageChange = async (page: number) => {
    console.log('📄 Page change to:', page)
    await goToPage(page)
  }

  return (
    <>
      <div className="col-span-1 md:col-span-2 lg:col-span-4 space-y-6 p-5">
        {/* Banner Header */}
        <PageBanner
          backgroundImage={getBannerConfig('myListings').image}
          title={t('property.myListings')}
          subtitle={t('property.managePropertiesAndTrack')}
          imageAlt={t('common.pageBanner.myListings')}
          overlayOpacity={getBannerConfig('myListings').overlayOpacity}
          height={getBannerConfig('myListings').height}
          className="mb-8"
        >
          <Button
            color="secondary"
            startContent={<Plus className="w-4 h-4" />}
            className="bg-white/20 border-white/20 text-white hover:bg-white/30"
            onPress={handleAddListing}
          >
            {t('property.addListing')}
          </Button>
        </PageBanner>

        {/* Tabs */}
        <div className="w-full">
          <div className="overflow-x-auto scrollbar-none -mx-5 px-5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <Tabs
              selectedKey={statusFilter}
              onSelectionChange={handleTabSelectionChange}
              variant="underlined"
              classNames={{
                tabList: "gap-2 sm:gap-4 md:gap-6 w-max relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-primary-500",
                tab: "max-w-fit px-2 sm:px-3 md:px-4 h-12 flex-shrink-0",
                tabContent: "group-data-[selected=true]:text-primary-600 text-xs sm:text-sm md:text-base whitespace-nowrap"
              }}
            >
              <Tab key="all" title={`${t('property.listings.tabs.all')} (${statusCounts.all})`} />
              <Tab key="approved" title={`${t('property.listings.tabs.approved')} (${statusCounts.approved})`} />
              <Tab key="pending" title={`${t('property.listings.tabs.pending')} (${statusCounts.pending})`} />
              <Tab key="paused" title={`${t('property.listings.tabs.paused')} (${statusCounts.paused})`} />
              <Tab key="rejected" title={`${t('property.listings.tabs.rejected')} (${statusCounts.rejected})`} />
            </Tabs>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <PropertyListingSkeleton  className="col-span-1 md:col-span-2 lg:col-span-4" />
      )}

      {/* Error State */}
      {error && (
        <div className="col-span-1 md:col-span-2 lg:col-span-4 text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">{t('property.listings.errors.loadingListings')}</h3>
            <Button color="primary" onPress={() => fetchUserListings({ force: true })}>
              {t('property.listings.errors.tryAgain')}
            </Button>
          </div>
        </div>
      )}

      {/* Listings Grid */}
      {!isLoading && !error && filteredListings.length > 0 && (
        <>
          {/* Listings Container */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredListings.map((listing) => {
                  const stats = listingStats[listing.id]
                  const isActionLoading = actionLoading === `toggle-${listing.id}`
                  const canEdit = listing.status !== 'paused'
                  
                  // Debug: Log the listing data
                  console.log('🔍 Listing data:', {
                    id: listing.id,
                    title: listing.title,
                    currency: listing.currency,
                    price_per_night: listing.price_per_night
                  })
                  
                  return (
                    <div key={listing.id} className="w-full">
                      <Card className="hover:shadow-lg transition-shadow duration-200">
                        {/* Property Image */}
                        <div className="relative">
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-3 left-3">
                            <Chip 
                              color={getStatusColor(listing.status)}
                              variant="solid"
                              size="sm"
                              className="text-white font-medium"
                            >
                              {getStatusDisplayName(listing.status)}
                            </Chip>
                          </div>
                          {listing.status === 'approved' && (
                            <div className="absolute top-3 right-3">
                              <Button
                                size="sm"
                                variant="flat"
                                color="secondary"
                                startContent={isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Pause className="w-3 h-3" />}
                                onPress={() => handleToggleStatus(listing)}
                                isDisabled={isActionLoading}
                                className="min-w-0 px-2"
                              >
                                {t('property.listings.actions.pause')}
                              </Button>
                            </div>
                          )}
                          {listing.status === 'paused' && (
                            <div className="absolute top-3 right-3">
                              <Button
                                size="sm"
                                variant="flat"
                                color="success"
                                startContent={isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                onPress={() => handleToggleStatus(listing)}
                                isDisabled={isActionLoading}
                                className="min-w-0 px-2"
                              >
                                {t('property.listings.actions.resume')}
                              </Button>
                            </div>
                          )}
                        </div>

                        <CardBody className="p-4">
                          {/* Property Info */}
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                                {listing.title}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                {listing.description}
                              </p>
                              <div className="flex items-center gap-1 mt-2">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium">{stats?.rating || 0}</span>
                                <span className="text-sm text-gray-500">
                                  ({formatPrice(listing.price_per_night, listing.currency || 'USD')}/night)
                                </span>
                              </div>
                            </div>

                            {/* Stats */}
                            {stats && (
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                  <p className="text-sm font-bold text-secondary-600">{stats.views}</p>
                                  <p className="text-xs text-gray-500">{t('property.listings.stats.views')}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-green-600">{stats.bookings}</p>
                                  <p className="text-xs text-gray-500">{t('property.listings.stats.bookings')}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-primary-600">{formatPrice(stats.revenue, listing.currency || 'USD')}</p>
                                  <p className="text-xs text-gray-500">{t('property.listings.stats.revenue')}</p>
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="flat"
                                color="secondary"
                                startContent={<Eye className="w-4 h-4" />}
                                onPress={() => handleViewStats(listing)}
                                className="flex-1"
                              >
                                {t('property.listings.actions.stats')}
                              </Button>
                              <Button
                                size="sm"
                                variant="flat"
                                color="primary"
                                startContent={<Edit className="w-4 h-4" />}
                                onPress={() => handleEdit(listing)}
                                isDisabled={!canEdit}
                                className="flex-1"
                              >
                                {t('property.listings.actions.edit')}
                              </Button>
                              <Button
                                size="sm"
                                variant="flat"
                                color="danger"
                                startContent={<Trash2 className="w-4 h-4" />}
                                onPress={() => handleDelete(listing)}
                                className="flex-1"
                              >
                                {t('property.listings.actions.delete')}
                              </Button>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  )
                })}
            </div>
          </div>
          
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-4 flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1 || isLoading}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                  ${pagination.currentPage === 1 || isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-primary-600 text-white hover:bg-primary-700'}`}
              >
                {t('property.listings.pagination.previous')}
              </button>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {t('property.listings.pagination.pageOf', { defaultValue: 'Page {{current}} of {{total}}', current: pagination.currentPage, total: pagination.totalPages })}
                </span>
              </div>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={isLoading || pagination.currentPage >= pagination.totalPages}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                  ${isLoading || pagination.currentPage >= pagination.totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-primary-600 text-white hover:bg-primary-700'}`}
              >
                {t('property.listings.pagination.next')}
              </button>
            </div>
          )}
        </>
      )}
      
      {/* Empty State */}
      {!isLoading && !error && filteredListings.length === 0 && (
        <div className="col-span-1 md:col-span-2 lg:col-span-4 text-center py-12">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {statusFilter === 'all' ? t('property.listings.empty.noListingsDescription') : t('property.listings.empty.noListings', { status: statusFilter })}
          </h3>
          <p className="text-gray-500 mb-4">
            {statusFilter === 'all' && t('property.listings.empty.noListingsDescription')}
            {statusFilter === 'approved' && t('property.listings.empty.noApproved')}
            {statusFilter === 'pending' && t('property.listings.empty.noPending')}
            {statusFilter === 'paused' && t('property.listings.empty.noPaused')}
            {statusFilter === 'rejected' && t('property.listings.empty.noRejected')}
          </p>
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={handleAddListing}
          >
            {t('property.listings.empty.createFirst')}
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">{t('property.listings.modals.deleteTitle')}</h2>
                <p className="text-sm text-gray-600">{t('property.listings.modals.deleteConfirmation')}</p>
              </ModalHeader>
              <ModalBody>
                {propertyToDelete && (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <img
                        src={propertyToDelete.images[0]}
                        alt={propertyToDelete.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold">{propertyToDelete.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {propertyToDelete.description}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {t('property.listings.modals.deleteMessage')}
                    </p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="default" 
                  variant="light" 
                  onPress={onClose}
                  disabled={actionLoading === 'delete'}
                >
                  {t('property.listings.modals.cancel')}
                </Button>
                <Button 
                  color="danger" 
                  onPress={confirmDelete}
                  isLoading={actionLoading === 'delete'}
                >
                  {t('property.listings.modals.deleteButton')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>



      {/* Property Stats Modal */}
      {propertyForStats && (
        <PropertyStatsModal
          isOpen={isStatsOpen}
          onClose={onStatsClose}
          property={convertDatabasePropertyToProperty(propertyForStats)}
          stats={listingStats[propertyForStats.id]}
        />
      )}

      {/* Property Edit Confirmation Modal */}
      <PropertyEditConfirmationModal
        isOpen={isEditConfirmOpen}
        onClose={onEditConfirmClose}
        onConfirm={handleConfirmEdit}
        confirmation={editConfirmation}
        isLoading={false}
      />
    </>
  )
}

export default MyListingsPage 