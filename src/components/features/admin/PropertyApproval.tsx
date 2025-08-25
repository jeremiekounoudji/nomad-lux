import React, { useState, useEffect } from 'react'
import { 
  Card, 
  CardBody, 
  Button, 
  Chip, 
  useDisclosure,
  Tabs,
  Tab,
  Checkbox,
  Input,
  Avatar,
  Pagination
} from '@heroui/react'
import { CheckCircle, XCircle, Eye, MapPin, Image as ImageIcon, Video, Star, Search, Home, Ban, Loader2 } from 'lucide-react'
import { 
  PropertyApprovalModal, 
  PropertyRejectionModal, 
  PropertySuspensionModal, 
  PropertyDetailsModal,
  ImageLightboxModal,
  BulkActionModal,
  BulkSuspendModal
} from './modals'
import { useAdminProperty } from '../../../hooks/useAdminProperty'
import { DatabaseProperty } from '../../../interfaces/DatabaseProperty'
import { getStatusColor, getStatusDisplayName } from '../../../utils/propertyUtils'
import toast from 'react-hot-toast'
import { useTranslation } from '../../../lib/stores/translationStore'
import { formatPrice } from '../../../utils/currencyUtils'

// props are managed via internal navigation hooks; no external props currently used

export const PropertyApproval: React.FC = () => {
  const { t } = useTranslation(['admin', 'property', 'common'])
  // Hook for admin property management
  const {
    filteredProperties,
    isLoading,
    error,
    statusFilter,
    statusCounts,
    pagination,
    fetchAdminProperties,
    approveProperty,
    rejectProperty,
    handleTabSelectionChange,
    goToPage,
    isAdmin,
    bulkApproveProperties,
    bulkRejectProperties,
    bulkSuspendProperties,
    suspendProperty,
    getPropertyStatistics
  } = useAdminProperty()

  // Component state
  const [selectedProperty, setSelectedProperty] = useState<DatabaseProperty | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [rejectionReason, setRejectionReason] = useState('')
  const [suspensionReason, setSuspensionReason] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [reviewChecklist, setReviewChecklist] = useState({
    title: false,
    description: false,
    images: false,
    location: false,
    price: false,
    amenities: false,
    policies: false
  })
  const [bulkActionType, setBulkActionType] = useState<'approve' | 'reject' | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkSuspendLoading, setBulkSuspendLoading] = useState(false)
  const [isBulkSuspendModalOpen, setIsBulkSuspendModalOpen] = useState(false)

  // Load properties on component mount
  useEffect(() => {
    if (isAdmin) {
      fetchAdminProperties()
    }
  }, [fetchAdminProperties, isAdmin])

  // Fetch property statistics as early as possible
  useEffect(() => {
    if (isAdmin) {
      getPropertyStatistics()
    }
  }, [getPropertyStatistics, isAdmin])

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { 
    isOpen: isRejectOpen, 
    onOpen: onRejectOpen, 
    onClose: onRejectClose 
  } = useDisclosure()
  const {
    isOpen: isImageOpen,
    onClose: onImageClose
  } = useDisclosure()
  const {
    isOpen: isApproveOpen,
    onOpen: onApproveOpen,
    onClose: onApproveClose
  } = useDisclosure()
  const {
    isOpen: isSuspendOpen,
    onOpen: onSuspendOpen,
    onClose: onSuspendClose
  } = useDisclosure()
  const {
    isOpen: isBulkModalOpen,
    onOpen: onBulkModalOpen,
    onClose: onBulkModalClose
  } = useDisclosure()

  const [pendingApprovalProperty, setPendingApprovalProperty] = useState<DatabaseProperty | null>(null)

  // Filter properties by search query (backend filtering is handled by the hook)
  const searchFilteredProperties = filteredProperties.filter(property => {
    if (!searchQuery.trim()) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      property.title.toLowerCase().includes(searchLower) ||
      `${property.location?.city}, ${property.location?.country}`.toLowerCase().includes(searchLower) ||
      property.description.toLowerCase().includes(searchLower)
    )
  })

  const handleApproveConfirm = (property: DatabaseProperty) => {
    setPendingApprovalProperty(property)
    onApproveOpen()
  }

  const handleApprove = async () => {
    if (pendingApprovalProperty) {
      console.log('Approving property:', pendingApprovalProperty.id)
      setActionLoading('approve')
      
      const result = await approveProperty(pendingApprovalProperty.id)
      
      if (result) {
        onApproveClose()
        setPendingApprovalProperty(null)
        toast.success(t('property.messages.propertyApproved'))
      }
      setActionLoading(null)
    }
  }

  const handleReject = async (propertyId: string, reason: string) => {
    console.log('Rejecting property:', propertyId, 'Reason:', reason)
    setActionLoading('reject')
    
    const result = await rejectProperty(propertyId, reason)
    
    if (result) {
      setRejectionReason('')
      onRejectClose()
      toast.success(t('property.messages.propertyRejected'))
    }
    setActionLoading(null)
  }

  const handleRejectModal = () => {
    if (selectedProperty && rejectionReason.trim()) {
      handleReject(selectedProperty.id, rejectionReason)
    }
  }

  const handleSuspend = async (propertyId: string, reason: string) => {
    setActionLoading('suspend')
    try {
      await suspendProperty(propertyId, reason)
      toast.success(t('property.messages.propertySuspended'))
    } catch (e: any) {
      toast.error(e?.message || t('property.messages.failedToLoad', { defaultValue: 'Failed to suspend property' }))
    }
    setSuspensionReason('')
    setActionLoading(null)
    onSuspendClose()
  }

  const handleSuspendModal = () => {
    if (selectedProperty && suspensionReason.trim()) {
      handleSuspend(selectedProperty.id, suspensionReason)
    }
  }

  const handleSuspendConfirm = (property: DatabaseProperty) => {
    setSelectedProperty(property)
    onSuspendOpen()
  }

  const getStatusChip = (status: DatabaseProperty['status']) => {
    return (
      <Chip 
        size="sm" 
        color={getStatusColor(status)} 
        variant="solid"
        className="text-white font-medium"
      >
        {getStatusDisplayName(status)}
      </Chip>
    )
  }

  const getActionButtons = (property: DatabaseProperty) => {
    const isPropertyLoading = actionLoading === 'approve' && pendingApprovalProperty?.id === property.id ||
                             actionLoading === 'reject' && selectedProperty?.id === property.id

    switch (property.status) {
      case 'pending':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              color="danger"
              variant="flat"
              startContent={isPropertyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              onPress={() => {
                setSelectedProperty(property)
                onRejectOpen()
              }}
              isDisabled={isPropertyLoading}
            >
              Reject
            </Button>
            <Button
              size="sm"
              color="success"
              startContent={isPropertyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              onPress={() => handleApproveConfirm(property)}
              isDisabled={isPropertyLoading}
            >
              Accept
            </Button>
          </div>
        )
      case 'approved':
        return (
          <Button
            size="sm"
            color="warning"
            variant="flat"
            startContent={<Ban className="w-4 h-4" />}
            onPress={() => handleSuspendConfirm(property)}
          >
            Suspend
          </Button>
        )
      case 'rejected':
        return null
      default:
        return null
    }
  }

  const handleBulkAction = (action: 'approve' | 'reject') => {
    setBulkActionType(action)
    onBulkModalOpen()
  }

  const handleBulkConfirm = async () => {
    if (!bulkActionType) return
    setBulkLoading(true)
    if (bulkActionType === 'approve') {
      const { success, failed } = await bulkApproveProperties(selectedProperties)
      toast.success(`${success.length} properties approved. ${failed.length ? failed.length + ' failed.' : ''}`)
    } else if (bulkActionType === 'reject') {
      const { success, failed } = await bulkRejectProperties(selectedProperties, rejectionReason)
      toast.success(`${success.length} properties rejected. ${failed.length ? failed.length + ' failed.' : ''}`)
    }
    setBulkLoading(false)
    setSelectedProperties([])
    setBulkActionType(null)
    onBulkModalClose()
  }

  const handlePropertySelect = (propertyId: string, checked: boolean) => {
    if (checked) {
      setSelectedProperties([...selectedProperties, propertyId])
    } else {
      setSelectedProperties(selectedProperties.filter(id => id !== propertyId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProperties(searchFilteredProperties.map(p => p.id))
    } else {
      setSelectedProperties([])
    }
  }

  const handleViewDetails = (property: DatabaseProperty) => {
    setSelectedProperty(property)
    setCurrentImageIndex(0)
    onOpen()
  }

  // Lightbox image open managed by other UI; helper kept if reintroduced later

  const nextImage = () => {
    if (selectedProperty) {
      setCurrentImageIndex((prev) => 
        prev === selectedProperty.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (selectedProperty) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProperty.images.length - 1 : prev - 1
      )
    }
  }

  const allChecked = Object.values(reviewChecklist).every(Boolean)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.properties.pendingApproval')}</h1>
        <p className="text-gray-600 mt-1">{t('admin.dashboard.overview', { defaultValue: 'Review and approve property listings' })}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <CardBody className="p-6 text-center">
            <h3 className="text-4xl font-bold text-white">{statusCounts.pending}</h3>
            <p className="text-white/90 font-medium">{t('admin.properties.pendingApproval')}</p>
            <p className="text-white/70 text-sm">{t('admin.bookings.requireAttention', { defaultValue: 'Requires attention' })}</p>
          </CardBody>
        </Card>
        
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <CardBody className="p-6 text-center">
            <h3 className="text-4xl font-bold text-white">{statusCounts.approved}</h3>
            <p className="text-white/90 font-medium">{t('admin.properties.approved')}</p>
            <p className="text-white/70 text-sm">{t('property.stats.sections.revenue', { defaultValue: 'Live properties' })}</p>
          </CardBody>
        </Card>
        
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-red-500 to-pink-500 text-white">
          <CardBody className="p-6 text-center">
            <h3 className="text-4xl font-bold text-white">{statusCounts.rejected}</h3>
            <p className="text-white/90 font-medium">{t('admin.properties.rejected')}</p>
            <p className="text-white/70 text-sm">{t('admin.messages.actionCannotBeUndone', { defaultValue: 'Not approved' })}</p>
          </CardBody>
        </Card>

        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
          <CardBody className="p-6 text-center">
            <h3 className="text-4xl font-bold text-white">{statusCounts.suspended || 0}</h3>
            <p className="text-white/90 font-medium">{t('admin.properties.suspended')}</p>
            <p className="text-white/70 text-sm">{t('admin.messages.confirmAction', { defaultValue: 'Temporarily disabled' })}</p>
          </CardBody>
        </Card>
      </div>

      {/* Search and Bulk Actions */}
      <Card className="shadow-sm border border-gray-200">
        <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1">
              <Input
                placeholder={t('admin.actions.search') + '...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search className="w-4 h-4 text-gray-400" />}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Checkbox
                isSelected={selectedProperties.length === filteredProperties.length && filteredProperties.length > 0}
                isIndeterminate={selectedProperties.length > 0 && selectedProperties.length < filteredProperties.length}
                onValueChange={handleSelectAll}
              >
                {t('admin.actions.selectAll')}
              </Checkbox>
              
              {selectedProperties.length > 0 && (
                <div className="flex gap-2">
                  <Chip color="primary" variant="flat">
                    {t('common.labels.selectedCount', { count: selectedProperties.length, defaultValue: '{{count}} selected' })}
                  </Chip>
                  <Button
                    size="sm"
                    color="success"
                    onPress={() => handleBulkAction('approve')}
                  >
                    {t('admin.actions.approve', { defaultValue: 'Bulk Approve' })}
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    onPress={() => handleBulkAction('reject')}
                  >
                    {t('admin.actions.reject', { defaultValue: 'Bulk Reject' })}
                  </Button>
                  <Button
                    size="sm"
                    color="warning"
                    variant="flat"
                    isLoading={bulkSuspendLoading}
                    onPress={() => setIsBulkSuspendModalOpen(true)}
                  >
                    {t('admin.actions.suspend', { defaultValue: 'Bulk Suspend' })}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

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
          <Tab key="pending" title={`${t('admin.properties.pendingApproval')} (${statusCounts.pending})`} />
          <Tab key="approved" title={`${t('admin.properties.approved')} (${statusCounts.approved})`} />
          <Tab key="rejected" title={`${t('admin.properties.rejected')} (${statusCounts.rejected})`} />
          <Tab key="suspended" title={`${t('admin.properties.suspended')} (${statusCounts.suspended || 0})`} />
        </Tabs>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>{t('property.messages.loadingProperties')}</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">{t('property.messages.failedToLoad', { defaultValue: 'Error Loading Properties' })}</h3>
            <Button color="primary" onPress={() => fetchAdminProperties({ force: true })}>
              {t('common.actions.retry', { defaultValue: 'Try Again' })}
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && searchFilteredProperties.length === 0 && (
        <div className="text-center py-12">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('property.messages.noProperties', { defaultValue: `No ${statusFilter === 'all' ? '' : statusFilter} properties found` })}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? t('admin.properties.noMatch', { defaultValue: 'No properties match "{{query}}"', query: searchQuery }) : t('admin.properties.noneAvailable', { defaultValue: `No ${statusFilter} properties available.` })}
          </p>
          {searchQuery && (
            <Button color="primary" onPress={() => setSearchQuery('')}>
              {t('common.actions.clear', { defaultValue: 'Clear Search' })}
            </Button>
          )}
        </div>
      )}

      {/* Properties Grid */}
      {!isLoading && !error && searchFilteredProperties.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {searchFilteredProperties.map((property) => (
            <Card key={property.id} className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <CardBody className="p-0">
                {/* Selection Checkbox */}
                <div className="absolute top-4 left-4 z-10">
                  <Checkbox
                    isSelected={selectedProperties.includes(property.id)}
                    onValueChange={(checked) => handlePropertySelect(property.id, checked)}
                    classNames={{
                      base: "bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-white/20",
                      wrapper: "before:border-primary-500 after:bg-primary-500",
                      icon: "text-white"
                    }}
                  />
                </div>

                {/* Property Image */}
                <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center gap-2 text-sm">
                      <ImageIcon className="w-4 h-4" />
                        <span>{property.images.length} {t('property.labels.images')}</span>
                      {property.video && (
                        <>
                          <span>•</span>
                          <Video className="w-4 h-4" />
                            <span>1 {t('property.labels.video')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    {getStatusChip(property.status)}
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{property.location?.city}, {property.location?.country}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{property.property_type}</span>
                        <span>•</span>
                        <span>{property.bedrooms} {t('property.labels.beds')}</span>
                        <span>•</span>
                        <span>{property.bathrooms} {t('property.labels.baths')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{formatPrice(property.price_per_night, property.currency || 'USD')}</div>
                      <div className="text-sm text-gray-600">{t('property.labels.perNight')}</div>
                    </div>
                  </div>

                  {/* Host Info */}
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <Avatar
                      name={t('property.modal.contactHost.title', { defaultValue: 'Host' })}
                      size="sm"
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{t('admin.properties.hostInformation', { defaultValue: 'Host ID:' })} {property.host_id}</div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">{property.rating || 0}</span>
                        <span className="text-xs text-gray-500">• {t('admin.properties.createdYear', { defaultValue: 'Created {{year}}', year: new Date(property.created_at).getFullYear() })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Amenities Preview */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {property.amenities.slice(0, 3).map((amenity) => (
                        <Chip key={amenity} size="sm" variant="flat" color="default">
                          {amenity}
                        </Chip>
                      ))}
                      {property.amenities.length > 3 && (
                        <Chip size="sm" variant="flat" color="default">
                          +{property.amenities.length - 3} {t('property.labels.more')}
                        </Chip>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 items-center">
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => handleViewDetails(property as DatabaseProperty)}
                      startContent={<Eye className="w-4 h-4" />}
                    >
                      {t('property.actions.viewDetails')}
                    </Button>
                    {getActionButtons(property as DatabaseProperty)}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => goToPage(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1 || isLoading}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${pagination.currentPage === 1 || isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-primary-600 text-white hover:bg-primary-700'}`}
          >
            {t('admin.pagination.previous', { defaultValue: 'Previous' })}
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {t('admin.pagination.pageOf', { defaultValue: 'Page {{current}} of {{total}}', current: pagination.currentPage, total: pagination.totalPages })}
            </span>
          </div>
          <button
            onClick={() => goToPage(pagination.currentPage + 1)}
            disabled={isLoading || pagination.currentPage >= pagination.totalPages}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${isLoading || pagination.currentPage >= pagination.totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-primary-600 text-white hover:bg-primary-700'}`}
          >
            {t('admin.pagination.next', { defaultValue: 'Next' })}
          </button>
        </div>
      )}

      {/* Property Details Modal - now extracted */}
      <PropertyDetailsModal
        isOpen={isOpen}
        onClose={onClose}
        selectedProperty={selectedProperty}
        reviewChecklist={reviewChecklist}
        setReviewChecklist={setReviewChecklist}
        allChecked={allChecked}
        onRejectOpen={onRejectOpen}
        handleApproveConfirm={handleApproveConfirm}
      />

      {/* Image Lightbox Modal - now extracted */}
      <ImageLightboxModal
        isOpen={isImageOpen}
        onClose={onImageClose}
        selectedProperty={selectedProperty}
        currentImageIndex={currentImageIndex}
        prevImage={prevImage}
        nextImage={nextImage}
      />

      {/* Use extracted modal components */}
      <PropertyApprovalModal
        isOpen={isApproveOpen}
        onClose={onApproveClose}
        property={pendingApprovalProperty}
        onApprove={handleApprove}
      />

      <PropertyRejectionModal
        isOpen={isRejectOpen}
        onClose={onRejectClose}
        property={selectedProperty}
        rejectionReason={rejectionReason}
        onReasonChange={setRejectionReason}
        onReject={handleRejectModal}
      />

      <PropertySuspensionModal
        isOpen={isSuspendOpen}
        onClose={onSuspendClose}
        property={selectedProperty}
        suspensionReason={suspensionReason}
        onReasonChange={setSuspensionReason}
        onSuspend={handleSuspendModal}
      />

      {/* Bulk Action Confirmation Modal - now extracted */}
      <BulkActionModal
        isOpen={isBulkModalOpen}
        onClose={onBulkModalClose}
        bulkActionType={bulkActionType}
        selectedProperties={selectedProperties}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        handleBulkConfirm={handleBulkConfirm}
        bulkLoading={bulkLoading}
      />

      {/* Bulk Suspend Confirmation Modal - now extracted */}
      <BulkSuspendModal
        isOpen={isBulkSuspendModalOpen}
        onClose={() => setIsBulkSuspendModalOpen(false)}
        selectedProperties={selectedProperties}
        bulkSuspendLoading={bulkSuspendLoading}
        handleBulkSuspendConfirm={async () => {
          setBulkSuspendLoading(true)
          const { success, failed } = await bulkSuspendProperties(selectedProperties, '')
          toast.success(`${success.length} properties suspended. ${failed.length ? failed.length + ' failed.' : ''}`)
          setSelectedProperties([])
          setBulkSuspendLoading(false)
          setIsBulkSuspendModalOpen(false)
        }}
      />
    </div>
  )
} 