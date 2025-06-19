import React, { useState } from 'react'
import { Card, CardBody, Button, Chip, useDisclosure } from '@heroui/react'
import { 
  Users, 
  Building, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  AlertTriangle
} from 'lucide-react'
import { PropertyApprovalModal, PropertyRejectionModal, Property as PropertyType } from './modals'

interface AdminDashboardProps {
  onSectionChange?: (section: string) => void
}

interface Property {
  id: number
  title: string
  location: string
  submitted: string
  images: number | string[]
  host?: {
    name: string
    email: string
  }
}

// Mock data for dashboard
const mockStats = {
  totalUsers: 2847,
  userGrowth: 12.5,
  totalProperties: 456,
  pendingProperties: 23,
  totalBookings: 1289,
  activeBookings: 45,
  totalRevenue: 125600,
  revenueGrowth: 18.2
}

const mockRecentActivity = [
  { type: 'user', action: 'New user registered', user: 'Sarah Johnson', time: '2 mins ago' },
  { type: 'property', action: 'Property submitted for approval', property: 'Luxury Villa in Miami', time: '5 mins ago' },
  { type: 'booking', action: 'New booking request', booking: '#BK-2847', time: '12 mins ago' },
  { type: 'property', action: 'Property approved', property: 'Beachfront Condo', time: '18 mins ago' },
  { type: 'user', action: 'User suspended', user: 'John Doe', time: '25 mins ago' }
]

const mockPendingApprovals: Property[] = [
  { 
    id: 1, 
    title: 'Luxury Beach House', 
    location: 'Malibu, CA', 
    submitted: '2 hours ago', 
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'
    ],
    host: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com'
    }
  },
  { 
    id: 2, 
    title: 'Downtown Apartment', 
    location: 'New York, NY', 
    submitted: '4 hours ago', 
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400'
    ],
    host: {
      name: 'Michael Chen',
      email: 'michael.chen@email.com'
    }
  },
  { 
    id: 3, 
    title: 'Mountain Cabin', 
    location: 'Aspen, CO', 
    submitted: '6 hours ago', 
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
    ],
    host: {
      name: 'Emma Rodriguez',
      email: 'emma.rodriguez@email.com'
    }
  }
]

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSectionChange }) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [pendingApprovalProperty, setPendingApprovalProperty] = useState<Property | null>(null)

  const { 
    isOpen: isApproveOpen, 
    onOpen: onApproveOpen, 
    onClose: onApproveClose 
  } = useDisclosure()
  const { 
    isOpen: isRejectOpen, 
    onOpen: onRejectOpen, 
    onClose: onRejectClose 
  } = useDisclosure()

  // Convert admin property to modal property format
  const convertToModalProperty = (adminProperty: Property): PropertyType => {
    return {
      id: adminProperty.id.toString(),
      title: adminProperty.title,
      description: '',
      location: adminProperty.location,
      coordinates: { lat: 0, lng: 0 },
      price: 0,
      images: Array.isArray(adminProperty.images) ? adminProperty.images : [],
      host: {
        name: adminProperty.host?.name || '',
        email: adminProperty.host?.email || '',
        rating: 4.5,
        joinDate: '2023-01-01'
      },
      submittedDate: adminProperty.submitted,
      status: 'pending' as const,
      amenities: [],
      propertyType: '',
      bedrooms: 0,
      bathrooms: 0,
      maxGuests: 0
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="w-4 h-4 text-blue-500" />
      case 'property': return <Building className="w-4 h-4 text-green-500" />
      case 'booking': return <Calendar className="w-4 h-4 text-orange-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const handleQuickApprove = (property: Property) => {
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

  const handleQuickReject = (property: Property) => {
    setSelectedProperty(property)
    onRejectOpen()
  }

  const handleReject = () => {
    if (selectedProperty && rejectionReason.trim()) {
      console.log('Rejecting property:', selectedProperty.id, 'Reason:', rejectionReason)
      setRejectionReason('')
      onRejectClose()
      setSelectedProperty(null)
      // TODO: Implement rejection logic
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of platform activity and performance</p>
        </div>
        <div className="flex gap-3">
          <Button 
            color="primary" 
            variant="flat"
            onPress={() => onSectionChange?.('analytics')}
          >
            View Analytics
          </Button>
          <Button 
            color="primary"
            onPress={() => onSectionChange?.('properties')}
          >
            Review Properties
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card className="shadow-sm border border-gray-200">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.totalUsers.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">+{mockStats.userGrowth}%</span>
                  <span className="text-sm text-gray-500">this month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Total Properties */}
        <Card className="shadow-sm border border-gray-200">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Properties</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.totalProperties}</p>
                <div className="flex items-center gap-1 mt-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-600">{mockStats.pendingProperties} pending</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Total Bookings */}
        <Card className="shadow-sm border border-gray-200">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.totalBookings.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-600">{mockStats.activeBookings} active</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Revenue */}
        <Card className="shadow-sm border border-gray-200">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${mockStats.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">+{mockStats.revenueGrowth}%</span>
                  <span className="text-sm text-gray-500">this month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Property Approvals */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border border-gray-200 h-full">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Pending Property Approvals</h3>
                <Button 
                  size="sm" 
                  color="primary"
                  variant="flat"
                  onPress={() => onSectionChange?.('properties')}
                >
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                {mockPendingApprovals.map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{property.title}</h4>
                      <p className="text-sm text-gray-600">{property.location}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500">Submitted {property.submitted}</span>
                        <span className="text-xs text-gray-500">
                          {Array.isArray(property.images) ? property.images.length : property.images} images
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="flat" 
                        color="danger"
                        onPress={() => handleQuickReject(property)}
                        isIconOnly
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        color="success"
                        onPress={() => handleQuickApprove(property)}
                        isIconOnly
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="shadow-sm border border-gray-200 h-full">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <Button 
                  size="sm" 
                  color="primary"
                  variant="flat"
                  onPress={() => onSectionChange?.('activities')}
                >
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                {mockRecentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-sm font-medium text-gray-700">
                        {activity.user || activity.property || activity.booking}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-sm border border-gray-200">
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardBody className="p-6 text-center">
                <Button 
                  className="h-16 flex-col bg-white/20 hover:bg-white/30 text-white border-0"
                  variant="flat"
                  onPress={() => onSectionChange?.('users')}
                >
                  <Users className="w-5 h-5 mb-1" />
                  <span className="text-sm">Manage Users</span>
                </Button>
              </CardBody>
            </Card>
            
            <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardBody className="p-6 text-center">
                <Button 
                  className="h-16 flex-col bg-white/20 hover:bg-white/30 text-white border-0"
                  variant="flat"
                  onPress={() => onSectionChange?.('properties')}
                >
                  <Building className="w-5 h-5 mb-1" />
                  <span className="text-sm">Review Properties</span>
                </Button>
              </CardBody>
            </Card>
            
            <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardBody className="p-6 text-center">
                <Button 
                  className="h-16 flex-col bg-white/20 hover:bg-white/30 text-white border-0"
                  variant="flat"
                  onPress={() => onSectionChange?.('bookings')}
                >
                  <Calendar className="w-5 h-5 mb-1" />
                  <span className="text-sm">Manage Bookings</span>
                </Button>
              </CardBody>
            </Card>
            
            <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardBody className="p-6 text-center">
                <Button 
                  className="h-16 flex-col bg-white/20 hover:bg-white/30 text-white border-0"
                  variant="flat"
                  onPress={() => onSectionChange?.('analytics')}
                >
                  <TrendingUp className="w-5 h-5 mb-1" />
                  <span className="text-sm">View Analytics</span>
                </Button>
              </CardBody>
            </Card>
          </div>
        </CardBody>
      </Card>

      {/* Use extracted modal components */}
      <PropertyApprovalModal
        isOpen={isApproveOpen}
        onClose={onApproveClose}
        property={pendingApprovalProperty ? convertToModalProperty(pendingApprovalProperty) : null}
        onApprove={handleApprove}
      />

      <PropertyRejectionModal
        isOpen={isRejectOpen}
        onClose={onRejectClose}
        property={selectedProperty ? convertToModalProperty(selectedProperty) : null}
        rejectionReason={rejectionReason}
        onReasonChange={setRejectionReason}
        onReject={handleReject}
      />
    </div>
  )
} 