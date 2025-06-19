import React, { useState } from 'react'
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
  Divider
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
  Ban
} from 'lucide-react'
import { 
  PropertyApprovalModal, 
  PropertyRejectionModal, 
  PropertySuspensionModal, 
  Property 
} from './modals'

interface PropertyApprovalProps {
  onPageChange: (page: string) => void
}

const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Luxury Beach House with Ocean View',
    description: 'Beautiful beachfront property with stunning ocean views, private beach access, and modern amenities. Perfect for families and groups looking for a premium coastal experience.',
    location: 'Malibu, California',
    coordinates: { lat: 34.0259, lng: -118.7798 },
    price: 450,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
      'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=400',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'
    ],
    video: '/property1-video.mp4',
    host: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      rating: 4.8,
      joinDate: '2023-06-15'
    },
    submittedDate: '2024-01-15',
    status: 'pending',
    amenities: ['WiFi', 'Pool', 'Beach Access', 'Kitchen', 'Parking', 'Air Conditioning'],
    propertyType: 'House',
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8
  },
  {
    id: '2',
    title: 'Modern Downtown Apartment',
    description: 'Stylish apartment in the heart of downtown with city views and close to all attractions.',
    location: 'New York, NY',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    price: 180,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400'
    ],
    host: {
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      rating: 4.5,
      joinDate: '2023-12-01'
    },
    submittedDate: '2024-01-16',
    status: 'approved',
    amenities: ['WiFi', 'Gym', 'Concierge', 'Kitchen'],
    propertyType: 'Apartment',
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4
  },
  {
    id: '3',
    title: 'Cozy Mountain Cabin',
    description: 'Rustic cabin nestled in the mountains with hiking trails and scenic views.',
    location: 'Aspen, Colorado',
    coordinates: { lat: 39.1911, lng: -106.8175 },
    price: 220,
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400'
    ],
    host: {
      name: 'Emma Rodriguez',
      email: 'emma.rodriguez@email.com',
      rating: 4.9,
      joinDate: '2023-03-20'
    },
    submittedDate: '2024-01-17',
    status: 'rejected',
    amenities: ['WiFi', 'Fireplace', 'Kitchen', 'Parking', 'Hiking Trails'],
    propertyType: 'Cabin',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6
  },
  {
    id: '4',
    title: 'City Center Loft',
    description: 'Modern loft with industrial design in the heart of the city.',
    location: 'San Francisco, CA',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    price: 320,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400'
    ],
    host: {
      name: 'David Wilson',
      email: 'david.wilson@email.com',
      rating: 4.7,
      joinDate: '2023-08-10'
    },
    submittedDate: '2024-01-18',
    status: 'pending',
    amenities: ['WiFi', 'Kitchen', 'Workspace', 'Parking'],
    propertyType: 'Loft',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2
  }
]

export const PropertyApproval: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [selectedTab, setSelectedTab] = useState('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [rejectionReason, setRejectionReason] = useState('')
  const [suspensionReason, setSuspensionReason] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [reviewChecklist, setReviewChecklist] = useState({
    title: false,
    description: false,
    images: false,
    location: false,
    price: false,
    amenities: false,
    policies: false
  })
  
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

  const [pendingApprovalProperty, setPendingApprovalProperty] = useState<Property | null>(null)

  const filteredProperties = mockProperties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = selectedTab === 'all' || property.status === selectedTab
    return matchesSearch && matchesTab
  })

  const stats = {
    pending: mockProperties.filter(p => p.status === 'pending').length,
    approved: mockProperties.filter(p => p.status === 'approved').length,
    rejected: mockProperties.filter(p => p.status === 'rejected').length,
    all: mockProperties.length
  }

  const handleApproveConfirm = (property: Property) => {
    setPendingApprovalProperty(property)
    onApproveOpen()
  }

  const handleApprove = () => {
    if (pendingApprovalProperty) {
      console.log('Approving property:', pendingApprovalProperty.id)
      // TODO: Implement approval logic
      onApproveClose()
      setPendingApprovalProperty(null)
    }
  }

  const handleReject = (propertyId: string, reason: string) => {
    console.log('Rejecting property:', propertyId, 'Reason:', reason)
    setRejectionReason('')
    onRejectClose()
    // TODO: Implement rejection logic
  }

  const handleRejectModal = () => {
    if (selectedProperty && rejectionReason.trim()) {
      handleReject(selectedProperty.id, rejectionReason)
    }
  }

  const handleSuspendConfirm = (property: Property) => {
    setSelectedProperty(property)
    onSuspendOpen()
  }

  const handleSuspend = (propertyId: string, reason: string) => {
    console.log('Suspending property:', propertyId, 'Reason:', reason)
    setSuspensionReason('')
    onSuspendClose()
    // TODO: Implement suspension logic
  }

  const handleSuspendModal = () => {
    if (selectedProperty && suspensionReason.trim()) {
      handleSuspend(selectedProperty.id, suspensionReason)
    }
  }

  const getStatusChip = (status: Property['status']) => {
    switch (status) {
      case 'pending':
        return <Chip size="sm" color="warning" variant="solid">Pending</Chip>
      case 'approved':
        return <Chip size="sm" color="success" variant="solid">Approved</Chip>
      case 'rejected':
        return <Chip size="sm" color="danger" variant="solid">Rejected</Chip>
      default:
        return <Chip size="sm" color="default" variant="solid">Unknown</Chip>
    }
  }

  const getActionButtons = (property: Property) => {
    switch (property.status) {
      case 'pending':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              color="danger"
              variant="flat"
              startContent={<XCircle className="w-4 h-4" />}
              onPress={() => {
                setSelectedProperty(property)
                onRejectOpen()
              }}
            >
              Reject
            </Button>
            <Button
              size="sm"
              color="success"
              startContent={<CheckCircle className="w-4 h-4" />}
              onPress={() => handleApproveConfirm(property)}
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
    console.log(`Bulk ${action} for properties:`, selectedProperties)
    setSelectedProperties([])
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
      setSelectedProperties(mockProperties.map(p => p.id))
    } else {
      setSelectedProperties([])
    }
  }

  const handleViewDetails = (property: Property) => {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <CardBody className="p-6 text-center">
            <h3 className="text-4xl font-bold text-white">3</h3>
            <p className="text-white/90 font-medium">Pending Review</p>
            <p className="text-white/70 text-sm">Requires attention</p>
          </CardBody>
        </Card>
        
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <CardBody className="p-6 text-center">
            <h3 className="text-4xl font-bold text-white">45</h3>
            <p className="text-white/90 font-medium">Approved This Month</p>
            <p className="text-white/70 text-sm">85% approval rate</p>
          </CardBody>
        </Card>
        
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-red-500 to-pink-500 text-white">
          <CardBody className="p-6 text-center">
            <h3 className="text-4xl font-bold text-white">8</h3>
            <p className="text-white/90 font-medium">Rejected This Month</p>
            <p className="text-white/70 text-sm">Quality control</p>
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
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabs */}
      <div className="w-full">
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
          variant="underlined"
          classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-primary-500",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-primary-600"
          }}
        >
          <Tab key="all" title={`All (${stats.all})`} />
          <Tab key="pending" title={`Pending (${stats.pending})`} />
          <Tab key="approved" title={`Approved (${stats.approved})`} />
          <Tab key="rejected" title={`Rejected (${stats.rejected})`} />
        </Tabs>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
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
                      <span>{property.location}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{property.propertyType}</span>
                      <span>•</span>
                      <span>{property.bedrooms} bed</span>
                      <span>•</span>
                      <span>{property.bathrooms} bath</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">${property.price}</div>
                    <div className="text-sm text-gray-600">per night</div>
                  </div>
                </div>

                {/* Host Info */}
                <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  <Avatar
                    name={property.host.display_name}
                    size="sm"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{property.host.display_name}</div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">{property.host.rating}</span>
                      <span className="text-xs text-gray-500">• Member since {property.host.joinDate}</span>
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
                    onPress={() => handleViewDetails(property)}
                    startContent={<Eye className="w-4 h-4" />}
                  >
                    View Details
                  </Button>
                  {getActionButtons(property)}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Property Details Modal - Keep this one as it has complex functionality */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="5xl"
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[90vh]",
          body: "py-6"
        }}
      >
        <ModalContent>
          <ModalHeader>
            Property Review: {selectedProperty?.title}
          </ModalHeader>
          <ModalBody className="max-h-[65vh] overflow-y-auto">
            {selectedProperty && (
              <div className="space-y-6">
                {/* Image Gallery */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Property Images</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedProperty.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleImageClick(index)}
                      >
                        <img
                          src={image}
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                          <ZoomIn className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Details with Map */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Location Details</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Address</label>
                        <p className="text-sm text-gray-900">{selectedProperty.location}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Coordinates</label>
                        <p className="text-sm text-gray-900">
                          Lat: {selectedProperty.coordinates.lat}, Lng: {selectedProperty.coordinates.lng}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-2">Map Preview</label>
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                        <img
                          src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-home+ff0000(${selectedProperty.coordinates.lng},${selectedProperty.coordinates.lat})/${selectedProperty.coordinates.lng},${selectedProperty.coordinates.lat},13/300x300?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA`}
                          alt="Property location map"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to OpenStreetMap if Mapbox fails
                            (e.target as HTMLImageElement).src = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${selectedProperty.coordinates.lng},${selectedProperty.coordinates.lat},13/300x300?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property Details Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Property Type</label>
                      <p className="text-sm text-gray-900">{selectedProperty.propertyType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <p className="text-sm text-gray-900">{selectedProperty.location}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Host</label>
                      <div className="flex items-center gap-2">
                        <Avatar name={selectedProperty.host.display_name} size="sm" />
                        <div>
                          <p className="text-sm text-gray-900 font-medium">{selectedProperty.host.display_name}</p>
                          <p className="text-xs text-gray-600">{selectedProperty.host.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Price per night</label>
                      <p className="text-sm text-gray-900">${selectedProperty.price}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Capacity</label>
                      <p className="text-sm text-gray-900">
                        {selectedProperty.bedrooms} bed • {selectedProperty.bathrooms} bath • {selectedProperty.maxGuests} guests
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Submitted</label>
                      <p className="text-sm text-gray-900">{selectedProperty.submittedDate}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedProperty.description}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Amenities</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedProperty.amenities.map((amenity) => (
                      <Chip key={amenity} size="sm" variant="flat">
                        {amenity}
                      </Chip>
                    ))}
                  </div>
                </div>

                {/* Review Checklist - Beautiful Design */}
                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-gray-900">Review Checklist</h4>
                      <p className="text-sm text-gray-600">Complete all items before approval</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'title', label: 'Title is descriptive and appropriate', icon: '📝' },
                      { key: 'description', label: 'Description is detailed and accurate', icon: '📄' },
                      { key: 'images', label: 'Images are high quality and representative', icon: '📸' },
                      { key: 'location', label: 'Location is accurate and properly set', icon: '📍' },
                      { key: 'price', label: 'Price is reasonable for the market', icon: '💰' },
                      { key: 'amenities', label: 'Amenities list is accurate and complete', icon: '✨' },
                      { key: 'policies', label: 'House rules and policies are appropriate', icon: '📋' }
                    ].map((item) => (
                      <div
                        key={item.key}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          reviewChecklist[item.key as keyof typeof reviewChecklist]
                            ? 'bg-success-50 border-success-200 shadow-sm'
                            : 'bg-white border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <Checkbox
                          isSelected={reviewChecklist[item.key as keyof typeof reviewChecklist]}
                          onValueChange={(checked) => 
                            setReviewChecklist(prev => ({ ...prev, [item.key]: checked }))
                          }
                          classNames={{
                            wrapper: "after:bg-primary-500 before:border-primary-500",
                            icon: "text-white"
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                          </div>
                        </Checkbox>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-white/60 rounded-lg border border-primary-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${allChecked ? 'bg-success-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm font-medium">
                          {Object.values(reviewChecklist).filter(Boolean).length} of 7 items completed
                        </span>
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(Object.values(reviewChecklist).filter(Boolean).length / 7) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <div className="flex gap-3 w-full">
              <Button variant="flat" onPress={onClose}>
                Close
              </Button>
              {selectedProperty?.status === 'pending' && (
                <>
                  <Button
                    color="danger"
                    variant="flat"
                    startContent={<XCircle className="w-4 h-4" />}
                    onPress={() => {
                      onClose()
                      onRejectOpen()
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    color="success"
                    startContent={<CheckCircle className="w-4 h-4" />}
                    onPress={() => {
                      if (selectedProperty) {
                        handleApproveConfirm(selectedProperty)
                        onClose()
                      }
                    }}
                    isDisabled={!allChecked}
                  >
                    Approve Property
                  </Button>
                </>
              )}
              {selectedProperty?.status === 'approved' && (
                <Button
                  color="warning"
                  variant="flat"
                  startContent={<Ban className="w-4 h-4" />}
                  onPress={() => {
                    if (selectedProperty) {
                      handleSuspendConfirm(selectedProperty)
                      onClose()
                    }
                  }}
                >
                  Suspend Property
                </Button>
              )}
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Image Lightbox Modal */}
      <Modal isOpen={isImageOpen} onClose={onImageClose} size="4xl">
        <ModalContent>
          <ModalBody className="p-0">
            {selectedProperty && (
              <div className="relative">
                <img
                  src={selectedProperty.images[currentImageIndex]}
                  alt={`Property image ${currentImageIndex + 1}`}
                  className="w-full h-[70vh] object-contain bg-black"
                />
                
                {/* Navigation Arrows */}
                {selectedProperty.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                
                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {selectedProperty.images.length}
                </div>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

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
    </div>
  )
} 