import React, { useState, useEffect } from 'react'
import { 
  Card, 
  CardBody, 
  Button, 
  Chip, 
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tabs,
  Tab,
  Textarea,
  Checkbox,
  Input,
  Select,
  SelectItem,
  Avatar,
  Progress,
  Image,
  Divider,
  Pagination
} from '@heroui/react'
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  MapPin, 
  Calendar,
  Image as ImageIcon,
  Video,
  Star,
  DollarSign,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  ZoomIn,
  Play,
  Clock,
  Bath,
  Bed,
  Car,
  Wifi,
  Users,
  Flag,
  MessageSquare,
  Home,
  Camera,
  Ban,
  Loader2
} from 'lucide-react'
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

interface PropertyApprovalProps {
  onPageChange: (page: string) => void
}

export const PropertyApproval: React.FC = () => {
  // Hook for admin property management
  const {
    filteredProperties,
    propertyStats,
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
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { 
    isOpen: isRejectOpen, 
    onOpen: onRejectOpen, 
    onClose: onRejectClose 
  } = useDisclosure()
  const {
    isOpen: isImageOpen,
    onOpen: onImageOpen,
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
        toast.success('Property approved successfully!')
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
      toast.success('Property rejected successfully!')
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
      toast.success('Property suspended successfully!')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to suspend property')
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

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index)
    onImageOpen()
  }

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
        <h1 className="text-3xl font-bold text-gray-900">Property Approval</h1>
        <p className="text-gray-600 mt-1">Review and approve property listings</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <CardBody className="p-6 text-center">
            <h3 className="text-4xl font-bold text-white">{statusCounts.pending}</h3>
            <p className="text-white/90 font-medium">Pending Review</p>
            <p className="text-white/70 text-sm">Requires attention</p>
          </CardBody>
        </Card>
        
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <CardBody className="p-6 text-center">
            <h3 className="text-4xl font-bold text-white">{statusCounts.approved}</h3>
            <p className="text-white/90 font-medium">Approved</p>
            <p className="text-white/70 text-sm">Live properties</p>
          </CardBody>
        </Card>
        
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-red-500 to-pink-500 text-white">
          <CardBody className="p-6 text-center">
            <h3 className="text-4xl font-bold text-white">{statusCounts.rejected}</h3>
            <p className="text-white/90 font-medium">Rejected</p>
            <p className="text-white/70 text-sm">Not approved</p>
          </CardBody>
        </Card>

        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
          <CardBody className="p-6 text-center">
            <h3 className="text-4xl font-bold text-white">{statusCounts.suspended || 0}</h3>
            <p className="text-white/90 font-medium">Suspended</p>
            <p className="text-white/70 text-sm">Temporarily disabled</p>
          </CardBody>
        </Card>
      </div>

      {/* Search and Bulk Actions */}
      <Card className="shadow-sm border border-gray-200">
        <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search properties by title, location, or host..."
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
                Select All
              </Checkbox>
              
              {selectedProperties.length > 0 && (
                <div className="flex gap-2">
                  <Chip color="primary" variant="flat">
                    {selectedProperties.length} selected
                  </Chip>
                  <Button
                    size="sm"
                    color="success"
                    onPress={() => handleBulkAction('approve')}
                  >
                    Bulk Approve
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    onPress={() => handleBulkAction('reject')}
                  >
                    Bulk Reject
                  </Button>
                  <Button
                    size="sm"
                    color="warning"
                    variant="flat"
                    isLoading={bulkSuspendLoading}
                    onPress={() => setIsBulkSuspendModalOpen(true)}
                  >
                    Bulk Suspend
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
          <Tab key="pending" title={`Pending (${statusCounts.pending})`} />
          <Tab key="approved" title={`Approved (${statusCounts.approved})`} />
          <Tab key="rejected" title={`Rejected (${statusCounts.rejected})`} />
          <Tab key="suspended" title={`Suspended (${statusCounts.suspended || 0})`} />
        </Tabs>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading properties...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Properties</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button color="primary" onPress={() => fetchAdminProperties({ force: true })}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && searchFilteredProperties.length === 0 && (
        <div className="text-center py-12">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {statusFilter === 'all' ? '' : statusFilter} properties found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? `No properties match "${searchQuery}"` : `No ${statusFilter} properties available.`}
          </p>
          {searchQuery && (
            <Button color="primary" onPress={() => setSearchQuery('')}>
              Clear Search
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
                      <span>{property.images.length} photos</span>
                      {property.video && (
                        <>
                          <span>•</span>
                          <Video className="w-4 h-4" />
                          <span>1 video</span>
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
                        <span>{property.bedrooms} bed</span>
                        <span>•</span>
                        <span>{property.bathrooms} bath</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">${property.price_per_night}</div>
                      <div className="text-sm text-gray-600">per night</div>
                    </div>
                  </div>

                  {/* Host Info */}
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <Avatar
                      name="Host"
                      size="sm"
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">Host ID: {property.host_id}</div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">{property.rating || 0}</span>
                        <span className="text-xs text-gray-500">• Created {new Date(property.created_at).getFullYear()}</span>
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
                          +{property.amenities.length - 3} more
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
                      View Details
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
        <div className="flex justify-center py-6">
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
              onChange={goToPage}
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