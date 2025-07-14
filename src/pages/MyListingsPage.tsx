import React, { useState, useEffect } from 'react'
import { Home, Plus, Eye, Edit, Trash2, Star, Loader2, Pause, Play } from 'lucide-react'
import { Card, CardBody, Chip, Button, Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Pagination } from '@heroui/react'
import { toast } from 'react-hot-toast'
import { PropertyStatsModal, PropertyEditConfirmationModal, PropertyListingSkeleton } from '../components/shared'
import { useUserListings } from '../hooks/useUserListings'
import { DatabaseProperty, PropertyEditConfirmation } from '../interfaces'
import { MyListingsPageProps } from '../interfaces'
import { convertDatabasePropertyToProperty, getStatusColor, getStatusDisplayName } from '../utils/propertyUtils'
import { useNavigation } from '../hooks/useNavigation'
import PropertySubmissionForm from '../components/features/property/PropertySubmissionForm'

// Component implementation

const MyListingsPage: React.FC<MyListingsPageProps> = ({ onPageChange }) => {
  // Navigation hook
  const { navigateWithAuth } = useNavigation()
  
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
    updateListing,
    toggleListingStatus,
    setStatusFilter,
    checkEditConfirmation,
    goToPage
  } = useUserListings()

  // Component state
  const [propertyToDelete, setPropertyToDelete] = useState<DatabaseProperty | null>(null)
  const [propertyToEdit, setPropertyToEdit] = useState<DatabaseProperty | null>(null)
  const [propertyForStats, setPropertyForStats] = useState<DatabaseProperty | null>(null)
  const [editConfirmation, setEditConfirmation] = useState<PropertyEditConfirmation | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)

  // Modals
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isStatsOpen, onOpen: onStatsOpen, onClose: onStatsClose } = useDisclosure()
  const { isOpen: isEditConfirmOpen, onOpen: onEditConfirmOpen, onClose: onEditConfirmClose } = useDisclosure()

  // Load listings on component mount
  useEffect(() => {
    fetchUserListings()
  }, [fetchUserListings])

  const handleEdit = (property: DatabaseProperty) => {
    // Check if editing requires confirmation
    const confirmation = checkEditConfirmation(property)
    
    if (confirmation.willResetToPending) {
      setEditConfirmation(confirmation)
      onEditConfirmOpen()
    } else {
      setPropertyToEdit(property)
      onEditOpen()
    }
  }

  const handleConfirmEdit = () => {
    if (editConfirmation) {
      setPropertyToEdit(editConfirmation.property)
      onEditConfirmClose()
      onEditOpen()
    }
  }

  const handleEditSubmitSuccess = async (propertyData: any) => {
    if (propertyToEdit) {
      console.log('📝 Processing edit form data:', propertyData)
      
      setIsEditSubmitting(true)
      
      try {
        // Process images: keep existing URLs, upload new files
        let finalImages = propertyData.images || []
        let finalVideo = propertyData.videos?.[0] || ''
        
        // If there are File objects in images or videos, they need to be uploaded
        // This is handled by the updateListing function automatically
        
        // Convert the form data back to database format and update
        const updates = {
          title: propertyData.title,
          description: propertyData.description,
          price: propertyData.price, // Use 'price' instead of 'price_per_night' for updateListing
          currency: propertyData.currency,
          location: propertyData.location,
          amenities: propertyData.amenities,
          images: finalImages,
          videos: propertyData.videos || [], // Keep as array for updateListing
          propertyType: propertyData.propertyType,
          maxGuests: propertyData.maxGuests,
          bedrooms: propertyData.bedrooms,
          bathrooms: propertyData.bathrooms,
          cleaningFee: propertyData.cleaningFee,
          serviceFee: propertyData.serviceFee
        }
        
        console.log('📤 Sending updates:', updates)
        
        const result = await updateListing(propertyToEdit.id, updates)
        
        if (result.success) {
          toast.success('Property updated successfully! 🎉')
          onEditClose()
          setPropertyToEdit(null)
          // Data will be refreshed automatically by the updateListing function
        } else {
          toast.error(result.error || 'Failed to update property')
        }
      } catch (error) {
        console.error('❌ Error updating property:', error)
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
        toast.error(`Update failed: ${errorMessage}`)
      } finally {
        setIsEditSubmitting(false)
      }
    }
  }

  const handleEditCancel = () => {
    onEditClose()
    setPropertyToEdit(null)
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
      <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-6">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-8 rounded-lg mb-8">
          <div className="text-left">
            <h1 className="text-3xl font-bold mb-2">My Listings</h1>
            <p className="text-primary-100 text-lg mb-4">Manage your properties and track performance</p>
            <Button
              color="secondary"
              startContent={<Plus className="w-4 h-4" />}
              className="bg-white/20 border-white/20 text-white hover:bg-white/30"
              onPress={handleAddListing}
            >
              Add Listing
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="w-full">
          <Tabs
            selectedKey={statusFilter}
            onSelectionChange={handleTabSelectionChange}
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-primary-500",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-primary-600"
            }}
          >
            <Tab key="all" title={`All (${statusCounts.all})`} />
            <Tab key="approved" title={`Approved (${statusCounts.approved})`} />
            <Tab key="pending" title={`Pending (${statusCounts.pending})`} />
            <Tab key="paused" title={`Paused (${statusCounts.paused})`} />
            <Tab key="rejected" title={`Rejected (${statusCounts.rejected})`} />
          </Tabs>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <PropertyListingSkeleton  className="col-span-1 md:col-span-2 lg:col-span-3" />
      )}

      {/* Error State */}
      {error && (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Listings</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button color="primary" onPress={() => fetchUserListings({ force: true })}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Listings Container with Fixed Height */}
      {!isLoading && !error && filteredListings.length > 0 && (
        <>
          {/* Fixed Height Scrollable Container */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <div className="h-[600px] overflow-y-auto pr-2 border border-gray-200 rounded-lg bg-gray-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {filteredListings.map((listing) => {
                  const stats = listingStats[listing.id]
                  const isActionLoading = actionLoading === `toggle-${listing.id}`
                  const canEdit = listing.status !== 'paused'
                  
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
                                Pause
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
                                Resume
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
                                  (${listing.price_per_night}/night)
                                </span>
                              </div>
                            </div>

                            {/* Stats */}
                            {stats && (
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                  <p className="text-sm font-bold text-secondary-600">{stats.views}</p>
                                  <p className="text-xs text-gray-500">Views</p>
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-green-600">{stats.bookings}</p>
                                  <p className="text-xs text-gray-500">Bookings</p>
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-primary-600">${stats.revenue}</p>
                                  <p className="text-xs text-gray-500">Revenue</p>
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
                                Stats
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
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="flat"
                                color="danger"
                                startContent={<Trash2 className="w-4 h-4" />}
                                onPress={() => handleDelete(listing)}
                                className="flex-1"
                              >
                                Delete
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
          </div>
          
          {/* Pagination - Outside Fixed Container */}
          {pagination && pagination.totalPages > 1 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center py-6 bg-white border-t border-gray-200">
              <div className="flex items-center gap-4">
                {/* Results info */}
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((pagination.currentPage - 1) * pagination.pageSize) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}</span> of{' '}
                  <span className="font-medium">{pagination.totalItems}</span> results
                </div>
                
                {/* HeroUI Pagination */}
                <Pagination
                  page={pagination.currentPage}
                  total={pagination.totalPages}
                  onChange={handlePageChange}
                  size="sm"
                  variant="bordered"
                  isDisabled={isLoading}
                  showControls={true}
                  classNames={{
                    wrapper: "gap-0 overflow-visible h-8 rounded border border-divider",
                    item: "w-8 h-8 text-small rounded-none bg-transparent",
                    cursor: "bg-gradient-to-br from-primary-500 to-primary-600 border-primary-500 text-white font-medium"
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Empty State */}
      {!isLoading && !error && filteredListings.length === 0 && (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {statusFilter === 'all' ? '' : statusFilter} listings
          </h3>
          <p className="text-gray-500 mb-4">
            {statusFilter === 'all' && "You haven't created any listings yet."}
            {statusFilter === 'approved' && "You don't have any approved listings."}
            {statusFilter === 'pending' && "You don't have any pending listings."}
            {statusFilter === 'paused' && "You don't have any paused listings."}
            {statusFilter === 'rejected' && "You don't have any rejected listings."}
          </p>
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={handleAddListing}
          >
            Create Your First Listing
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">Delete Listing</h2>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
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
                      Are you sure you want to delete this listing? This will permanently remove the property from your listings and cannot be undone.
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
                  Cancel
                </Button>
                <Button 
                  color="danger" 
                  onPress={confirmDelete}
                  isLoading={actionLoading === 'delete'}
                >
                  Delete Listing
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Listing Modal */}
      <Modal 
        isOpen={isEditOpen} 
        onClose={onEditClose}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">Edit Listing</h2>
                {propertyToEdit && (
                  <p className="text-sm text-gray-600">Update your property details</p>
                )}
              </ModalHeader>
              <ModalBody>
                {propertyToEdit && (
                  <div className="space-y-6">
                    <PropertySubmissionForm 
                      initialData={convertDatabasePropertyToProperty(propertyToEdit)}
                      isEditMode={true}
                      onSubmitSuccess={handleEditSubmitSuccess}
                      onCancel={handleEditCancel}
                      externalLoading={isEditSubmitting}
                    />
                  </div>
                )}
              </ModalBody>
              {/* Form handles its own submission, so we remove the footer buttons */}
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