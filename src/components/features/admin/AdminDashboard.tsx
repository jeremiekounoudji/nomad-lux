import React, { useState, useEffect } from 'react'
import { Card, CardBody, Button, useDisclosure } from '@heroui/react'
import { 
  Users, 
  Building, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Map
} from 'lucide-react'
import { PageBanner } from '../../shared'
import { getBannerConfig } from '../../../utils/bannerConfig'
import { PropertyApprovalModal, PropertyRejectionModal } from './modals'
import { PayoutRequestsTable } from './PayoutRequestsTable'
import { ApproveRejectPayoutModal } from './modals/ApproveRejectPayoutModal'
import { PropertyDistributionMap } from './PropertyDistributionMap'
import { useAdminPayoutRequests } from '../../../hooks/useAdminPayoutRequests'
import { useAdminProperty } from '../../../hooks/useAdminProperty'
import { PayoutRequest } from '../../../interfaces'
import { DatabaseProperty } from '../../../interfaces/DatabaseProperty'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation(['admin', 'common'])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [pendingApprovalProperty, setPendingApprovalProperty] = useState<Property | null>(null)
  const [showPropertyMap, setShowPropertyMap] = useState(false)
  
  const {
    requests,
    isLoading,
    error,
    fetchPayoutRequests,
    approve,
    reject
  } = useAdminPayoutRequests()

  // Get admin properties for the map
  const { filteredProperties } = useAdminProperty()

  const [modalOpen, setModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null)

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
  const convertToModalProperty = (adminProperty: Property): DatabaseProperty => {
    return {
      id: adminProperty.id.toString(),
      title: adminProperty.title,
      description: '',
      location: {
        address: '',
        city: adminProperty.location,
        country: '',
        coordinates: { lat: 0, lng: 0 }
      },
      price_per_night: 0,
      currency: 'USD',
      images: Array.isArray(adminProperty.images) ? adminProperty.images : [],
      video: undefined,
      host_id: '',
      property_type: '',
      amenities: [],
      max_guests: 0,
      bedrooms: 0,
      bathrooms: 0,
      cleaning_fee: 0,
      service_fee: 0,
      rating: 0,
      review_count: 0,
      view_count: 0,
      booking_count: 0,
      total_revenue: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'pending' as const,
      suspended_at: null,
      suspended_by: null,
      suspension_reason: null
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

  const handleApprove = (req: PayoutRequest) => {
    setSelectedRequest(req)
    setModalAction('approve')
    setModalOpen(true)
  }

  const handleQuickReject = (property: Property) => {
    setSelectedProperty(property)
    onRejectOpen()
  }

  const handleReject = (req: PayoutRequest) => {
    setSelectedRequest(req)
    setModalAction('reject')
    setModalOpen(true)
  }

  const handlePropertyClick = (property: DatabaseProperty) => {
    // Navigate to property details or open modal
    console.log('Property clicked:', property.title)
  }

  useEffect(() => {
    fetchPayoutRequests()
  }, [fetchPayoutRequests])

  return (
    <div className="space-y-8">
      {/* Admin Banner */}
      <PageBanner
        backgroundImage={getBannerConfig('admin').image}
        title={t('admin.navigation.dashboard')}
        subtitle={t('admin.dashboard.overview')}
        imageAlt={getBannerConfig('admin').alt}
        overlayOpacity={getBannerConfig('admin').overlayOpacity}
        height={getBannerConfig('admin').height}
      >
        <div className="flex gap-3 mt-4">
          <Button 
            color="secondary" 
            variant="flat"
            onPress={() => onSectionChange?.('analytics')}
            className="bg-white/20 border-white/20 text-white hover:bg-white/30"
          >
            {t('admin.reports.generateReport', { defaultValue: 'View Analytics' })}
          </Button>
          <Button 
            color="secondary"
            variant="flat"
            onPress={() => onSectionChange?.('properties')}
            className="bg-white/20 border-white/20 text-white hover:bg-white/30"
          >
            {t('admin.properties.pendingApproval')}
          </Button>
        </div>
      </PageBanner>



      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card className="shadow-sm border border-gray-200">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('admin.dashboard.totalUsers')}</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.totalUsers.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">+{mockStats.userGrowth}%</span>
                  <span className="text-sm text-gray-500">{t('common.time.thisMonth')}</span>
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
                <p className="text-sm font-medium text-gray-600">{t('admin.navigation.properties')}</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.totalProperties}</p>
                <div className="flex items-center gap-1 mt-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-600">{mockStats.pendingProperties} {t('admin.properties.pendingApproval')}</span>
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
                <p className="text-sm font-medium text-gray-600">{t('admin.navigation.bookings')}</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.totalBookings.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-600">{mockStats.activeBookings} {t('common.status.active')}</span>
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
                <p className="text-sm font-medium text-gray-600">{t('admin.dashboard.totalRevenue')}</p>
                <p className="text-3xl font-bold text-gray-900">${mockStats.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">+{mockStats.revenueGrowth}%</span>
                  <span className="text-sm text-gray-500">{t('common.time.thisMonth')}</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Property Distribution Map Section */}
      <Card className="shadow-sm border border-gray-200">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Map className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">{t('admin.dashboard.popularProperties', { defaultValue: 'Property Distribution' })}</h3>
            </div>
            <Button
              size="sm"
              color="primary"
              variant={showPropertyMap ? "solid" : "flat"}
              onPress={() => setShowPropertyMap(!showPropertyMap)}
              startContent={<Map className="w-4 h-4" />}
            >
              {showPropertyMap ? t('common.buttons.close', { defaultValue: 'Hide Map' }) : t('common.buttons.view', { defaultValue: 'Show Map' })}
            </Button>
          </div>
          
          {showPropertyMap && filteredProperties.length > 0 ? (
            <PropertyDistributionMap
              properties={filteredProperties as unknown as DatabaseProperty[]}
              onPropertyClick={handlePropertyClick}
              height="400px"
            />
          ) : showPropertyMap ? (
            <div className="text-center py-12">
              <Map className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.properties.allProperties', { defaultValue: 'No Properties Available' })}</h3>
              <p className="text-gray-500">{t('admin.messages.noProperties', { defaultValue: 'There are no properties to display on the map.' })}</p>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Map className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.dashboard.overview', { defaultValue: 'Property Distribution Map' })}</h3>
              <p className="text-gray-500 mb-4">{t('admin.messages.propertyMapDescription', { defaultValue: 'View all properties distributed across locations on an interactive map.' })}</p>
              <Button
                color="primary"
                onPress={() => setShowPropertyMap(true)}
                startContent={<Map className="w-4 h-4" />}
              >
                {t('common.buttons.view', { defaultValue: 'Show Distribution Map' })}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Property Approvals */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border border-gray-200 h-full">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('admin.properties.pendingApproval')}</h3>
                <Button 
                  size="sm" 
                  color="primary"
                  variant="flat"
                  onPress={() => onSectionChange?.('properties')}
                >
                  {t('common.buttons.view', { defaultValue: 'View All' })}
                </Button>
              </div>
              
              <div className="space-y-4">
                {mockPendingApprovals.map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{property.title}</h4>
                      <p className="text-sm text-gray-600">{property.location}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500">{t('admin.dashboard.submitted', { defaultValue: 'Submitted' })} {property.submitted}</span>
                        <span className="text-xs text-gray-500">
                          {Array.isArray(property.images) ? property.images.length : property.images} {t('property.labels.images')}
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
        <div className="lg:col-span-1">
          <Card className="shadow-sm border border-gray-200 h-full">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('admin.dashboard.recentActivity')}</h3>
                <Button 
                  size="sm" 
                  color="primary"
                  variant="flat"
                  onPress={() => onSectionChange?.('activities')}
                >
                  {t('common.buttons.view', { defaultValue: 'View All' })}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.actions.bulkAction', { defaultValue: 'Quick Actions' })}</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardBody className="p-6 text-center">
                <Button 
                  className="h-16 flex-col bg-white/20 hover:bg-white/30 text-white border-0"
                  variant="flat"
                  onPress={() => onSectionChange?.('users')}
                >
                  <Users className="w-5 h-5 mb-1" />
                  <span className="text-sm">{t('admin.users.allUsers')}</span>
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
                  <span className="text-sm">{t('admin.properties.pendingApproval')}</span>
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
                  <span className="text-sm">{t('admin.bookings.allBookings')}</span>
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
                  <span className="text-sm">{t('admin.reports.bookingReports', { defaultValue: 'View Analytics' })}</span>
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
        onApprove={() => handleApprove(selectedRequest!)}
      />

      <PropertyRejectionModal
        isOpen={isRejectOpen}
        onClose={onRejectClose}
        property={selectedProperty ? convertToModalProperty(selectedProperty) : null}
        rejectionReason={rejectionReason}
        onReasonChange={setRejectionReason}
        onReject={() => handleReject(selectedRequest!)}
      />

      <section className="space-y-6">
        <h2 className="text-xl font-bold mb-4">{t('admin.payments.payoutRequests')}</h2>
        <PayoutRequestsTable
          requests={requests}
          isLoading={isLoading}
          error={error}
          onApprove={handleApprove}
          onReject={handleReject}
        />
        <ApproveRejectPayoutModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          request={selectedRequest}
          action={modalAction}
          onSubmit={async (note) => {
            if (!selectedRequest || !modalAction) return
            if (modalAction === 'approve') {
              await approve(selectedRequest, note)
            } else {
              await reject(selectedRequest, note)
            }
            setModalOpen(false)
          }}
        />
      </section>
    </div>
  )
} 