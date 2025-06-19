import React, { useState } from 'react'
import { 
  Card, 
  CardBody, 
  Button, 
  Chip, 
  Avatar,
  useDisclosure,
  Tabs,
  Tab,
  Input,
  Select,
  SelectItem,
  Progress,
  Divider,
  Badge
} from '@heroui/react'
import {
  BookingDetailsModal,
  DisputeManagementModal,
  RefundModal,
  ContactPartiesModal,
  Booking,
  Dispute
} from './modals'
import { 
  Search,
  Calendar,
  DollarSign,
  User,
  Home,
  Eye,
  XCircle,
  RotateCcw,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Filter,
  Download,
  CreditCard,
  RefreshCw,
  Clock,
  Phone,
  Mail,
  Shield,
  Flag,
  ArrowRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface BookingManagementProps {
  onPageChange: (page: string) => void
}



const mockBookings: Booking[] = [
  {
    id: 'BK001',
    propertyId: 'P001',
    propertyTitle: 'Luxury Beach House with Ocean View',
    propertyImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    guestName: 'John Smith',
    guestEmail: 'john.smith@email.com',
    guestPhone: '+1 (555) 123-4567',
    hostName: 'Sarah Johnson',
    hostEmail: 'sarah.johnson@email.com',
    hostPhone: '+1 (555) 111-2222',
    checkIn: '2024-02-15',
    checkOut: '2024-02-20',
    totalAmount: 2250,
    status: 'dispute',
    paymentStatus: 'paid',
    bookingDate: '2024-01-10',
    guests: 4,
    nights: 5,
    disputeReason: 'Property not as described',
    disputeDate: '2024-02-16',
    lastActivity: '2 hours ago'
  },
  {
    id: 'BK002',
    propertyId: 'P002',
    propertyTitle: 'Modern Downtown Apartment',
    propertyImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
    guestName: 'Lisa Chen',
    guestEmail: 'lisa.chen@email.com',
    guestPhone: '+1 (555) 987-6543',
    hostName: 'Michael Chen',
    hostEmail: 'michael.chen@email.com',
    hostPhone: '+1 (555) 333-4444',
    checkIn: '2024-02-10',
    checkOut: '2024-02-12',
    totalAmount: 360,
    status: 'completed',
    paymentStatus: 'paid',
    bookingDate: '2024-01-20',
    guests: 2,
    nights: 2,
    lastActivity: '1 week ago'
  },
  {
    id: 'BK003',
    propertyId: 'P003',
    propertyTitle: 'Cozy Mountain Cabin',
    propertyImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
    guestName: 'David Wilson',
    guestEmail: 'david.wilson@email.com',
    guestPhone: '+1 (555) 456-7890',
    hostName: 'Emma Rodriguez',
    hostEmail: 'emma.rodriguez@email.com',
    hostPhone: '+1 (555) 555-6666',
    checkIn: '2024-02-25',
    checkOut: '2024-03-01',
    totalAmount: 1320,
    status: 'confirmed',
    paymentStatus: 'paid',
    bookingDate: '2024-01-25',
    guests: 3,
    nights: 6,
    lastActivity: '3 days ago'
  },
  {
    id: 'BK004',
    propertyId: 'P004',
    propertyTitle: 'City Loft with Rooftop',
    propertyImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    guestName: 'Anna Taylor',
    guestEmail: 'anna.taylor@email.com',
    guestPhone: '+1 (555) 234-5678',
    hostName: 'James Park',
    hostEmail: 'james.park@email.com',
    hostPhone: '+1 (555) 777-8888',
    checkIn: '2024-01-28',
    checkOut: '2024-01-30',
    totalAmount: 480,
    status: 'cancelled',
    paymentStatus: 'refunded',
    bookingDate: '2024-01-15',
    guests: 2,
    nights: 2,
    lastActivity: '5 days ago'
  }
]

const mockDisputes: Dispute[] = [
  {
    id: 'D001',
    bookingId: 'BK001',
    type: 'property_issue',
    priority: 'high',
    reporter: 'guest',
    description: 'Property was not clean upon arrival, and several amenities listed were not available.',
    status: 'investigating',
    createdDate: '2024-02-16',
    assignedTo: 'Admin Team',
    messages: [
      {
        id: 'M001',
        sender: 'John Smith',
        message: 'The property was not clean when we arrived, and the pool was not accessible as advertised.',
        timestamp: '2024-02-16 14:30',
        isAdmin: false
      },
      {
        id: 'M002',
        sender: 'Admin Support',
        message: 'Thank you for reporting this issue. We are investigating and will contact the host immediately.',
        timestamp: '2024-02-16 15:45',
        isAdmin: true
      },
      {
        id: 'M003',
        sender: 'Sarah Johnson',
        message: 'I apologize for the inconvenience. The cleaning service was delayed, and the pool heater is being repaired.',
        timestamp: '2024-02-16 16:20',
        isAdmin: false
      }
    ]
  },
  {
    id: 'D002',
    bookingId: 'BK005',
    type: 'cancellation',
    priority: 'medium',
    reporter: 'host',
    description: 'Guest violated house rules and caused property damage.',
    status: 'open',
    createdDate: '2024-02-14',
    messages: [
      {
        id: 'M004',
        sender: 'Host Name',
        message: 'Guest threw a party despite strict no-party policy and damaged furniture.',
        timestamp: '2024-02-14 22:15',
        isAdmin: false
      }
    ]
  }
]

export const BookingManagement: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [disputeMessage, setDisputeMessage] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const { isOpen, onOpen, onClose } = useDisclosure()
  const { 
    isOpen: isDisputeOpen, 
    onOpen: onDisputeOpen, 
    onClose: onDisputeClose 
  } = useDisclosure()
  const {
    isOpen: isRefundOpen,
    onOpen: onRefundOpen,
    onClose: onRefundClose
  } = useDisclosure()
  const {
    isOpen: isContactOpen,
    onOpen: onContactOpen,
    onClose: onContactClose
  } = useDisclosure()

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    onOpen()
  }

  const handleContactParties = (booking: Booking) => {
    setSelectedBooking(booking)
    onContactOpen()
  }

  const handleViewDispute = (dispute: Dispute) => {
    setSelectedDispute(dispute)
    onDisputeOpen()
  }

  const handleRefund = (bookingId: string, amount: string) => {
    console.log('Processing refund:', bookingId, amount)
    setRefundAmount('')
    onRefundClose()
    // TODO: Implement refund logic
  }

  const handleDisputeMessage = (disputeId: string, message: string) => {
    console.log('Sending dispute message:', disputeId, message)
    setDisputeMessage('')
    // TODO: Implement message sending
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success'
      case 'pending': return 'warning'
      case 'cancelled': return 'danger'
      case 'completed': return 'primary'
      case 'dispute': return 'danger'
      default: return 'default'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success'
      case 'pending': return 'warning'
      case 'refunded': return 'primary'
      case 'partial_refund': return 'secondary'
      default: return 'default'
    }
  }

  const getDisputePriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'danger'
      case 'high': return 'warning'
      case 'medium': return 'primary'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch = 
      booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: mockBookings.length,
    confirmed: mockBookings.filter(b => b.status === 'confirmed').length,
    disputes: mockBookings.filter(b => b.status === 'dispute').length,
    revenue: mockBookings.reduce((sum, b) => sum + (b.status === 'completed' ? b.totalAmount : 0), 0)
  }

  const disputeStats = {
    open: mockDisputes.filter(d => d.status === 'open').length,
    investigating: mockDisputes.filter(d => d.status === 'investigating').length,
    urgent: mockDisputes.filter(d => d.priority === 'urgent').length
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
        <p className="text-gray-600 mt-1">Monitor and manage all platform bookings</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
          <CardBody className="p-6 text-center">
            <h3 className="text-4xl font-bold text-white">{stats.total}</h3>
            <p className="text-white/90 font-medium">Total Bookings</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="text-white/70 text-sm">📈 +12% this month</span>
            </div>
          </CardBody>
        </Card>
        
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-green-500 to-teal-500 text-white">
          <CardBody className="p-6 text-center">
            <h3 className="text-4xl font-bold text-white">{stats.confirmed}</h3>
            <p className="text-white/90 font-medium">Active Bookings</p>
            <p className="text-white/70 text-sm">Currently confirmed</p>
          </CardBody>
        </Card>
        
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-red-500 to-orange-500 text-white">
          <CardBody className="p-6 text-center">
            <h3 className="text-4xl font-bold text-white">{stats.disputes}</h3>
            <p className="text-white/90 font-medium">Active Disputes</p>
            <p className="text-white/70 text-sm">Require attention</p>
          </CardBody>
        </Card>
        
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <CardBody className="p-6 text-center">
            <h3 className="text-4xl font-bold text-white">${stats.revenue.toLocaleString()}</h3>
            <p className="text-white/90 font-medium">Revenue (Completed)</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="text-white/70 text-sm">📈 +8% this month</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Dispute Alert */}
      {disputeStats.urgent > 0 && (
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900">Urgent Disputes Require Attention</h4>
                <p className="text-sm text-red-700">
                  {disputeStats.urgent} urgent dispute{disputeStats.urgent !== 1 ? 's' : ''} need immediate resolution
                </p>
              </div>
              <Button size="sm" color="danger" variant="flat">
                View Disputes
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="shadow-sm border border-gray-200">
        <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by booking ID, guest name, or property..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search className="w-4 h-4 text-gray-400" />}
              />
            </div>
            <div className="flex gap-3">
              <Select
                placeholder="Filter by status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="min-w-[150px]"
              >
                <SelectItem key="all" value="all">All Status</SelectItem>
                <SelectItem key="confirmed" value="confirmed">Confirmed</SelectItem>
                <SelectItem key="pending" value="pending">Pending</SelectItem>
                <SelectItem key="completed" value="completed">Completed</SelectItem>
                <SelectItem key="cancelled" value="cancelled">Cancelled</SelectItem>
                <SelectItem key="dispute" value="dispute">Dispute</SelectItem>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Main Content Tabs */}
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
          <Tab key="all" title={`All Bookings (${filteredBookings.length})`} />
          <Tab key="disputes" title={`Disputes (${disputeStats.open + disputeStats.investigating})`} />
          <Tab key="payments" title="Payment Tracking" />
        </Tabs>
      </div>

      {/* Bookings List */}
      {selectedTab === 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <CardBody className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Property Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={booking.propertyImage}
                      alt={booking.propertyTitle}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{booking.propertyTitle}</h3>
                          <Chip
                            color={getStatusColor(booking.status)}
                            variant="flat"
                            size="sm"
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Chip>
                          <Chip
                            color={getPaymentStatusColor(booking.paymentStatus)}
                            variant="flat"
                            size="sm"
                          >
                            {booking.paymentStatus.replace('_', ' ').charAt(0).toUpperCase() + booking.paymentStatus.replace('_', ' ').slice(1)}
                          </Chip>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-4">
                            <span className="font-medium">ID:</span>
                            <span className="font-mono">{booking.id}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium">Guest:</span>
                            <span>{booking.guestName}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium">Host:</span>
                            <span>{booking.hostName}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">${booking.totalAmount.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">{booking.nights} nights • {booking.guests} guests</div>
                        <div className="text-xs text-gray-500 mt-1">Last activity: {booking.lastActivity}</div>
                      </div>
                    </div>

                    {/* Dates and Status */}
                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{booking.checkIn} → {booking.checkOut}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span>Booked on {booking.bookingDate}</span>
                      </div>
                      {booking.status === 'dispute' && booking.disputeDate && (
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Dispute filed on {booking.disputeDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => handleViewBooking(booking)}
                        startContent={<Eye className="w-4 h-4" />}
                      >
                        View Details
                      </Button>
                      
                      {booking.status === 'dispute' && (
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          startContent={<Flag className="w-4 h-4" />}
                        >
                          Manage Dispute
                        </Button>
                      )}
                      
                      {(booking.paymentStatus === 'paid' || booking.paymentStatus === 'partial_refund') && (
                        <Button
                          size="sm"
                          color="secondary"
                          variant="flat"
                          onPress={() => {
                            setSelectedBooking(booking)
                            onRefundOpen()
                          }}
                          startContent={<RefreshCw className="w-4 h-4" />}
                        >
                          Process Refund
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<MessageSquare className="w-4 h-4" />}
                        onPress={() => handleContactParties(booking)}
                      >
                        Contact Parties
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Disputes Tab */}
      {selectedTab === 'disputes' && (
        <div className="space-y-4">
          {/* Dispute Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-l-4 border-l-red-500">
              <CardBody className="p-4">
                <div className="text-2xl font-bold text-red-600">{disputeStats.open}</div>
                <div className="text-sm text-gray-600">Open Disputes</div>
              </CardBody>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardBody className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{disputeStats.investigating}</div>
                <div className="text-sm text-gray-600">Under Investigation</div>
              </CardBody>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardBody className="p-4">
                <div className="text-2xl font-bold text-purple-600">{disputeStats.urgent}</div>
                <div className="text-sm text-gray-600">Urgent Priority</div>
              </CardBody>
            </Card>
          </div>

          {/* Disputes List */}
          {mockDisputes.map((dispute) => (
            <Card key={dispute.id} className="shadow-sm border border-gray-200">
              <CardBody className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-lg text-gray-900">
                        Dispute #{dispute.id}
                      </h3>
                      <Chip
                        color={getDisputePriorityColor(dispute.priority)}
                        variant="flat"
                        size="sm"
                      >
                        {dispute.priority.charAt(0).toUpperCase() + dispute.priority.slice(1)} Priority
                      </Chip>
                      <Chip
                        color={dispute.status === 'open' ? 'danger' : 'warning'}
                        variant="flat"
                        size="sm"
                      >
                        {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                      </Chip>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div><strong>Booking ID:</strong> {dispute.bookingId}</div>
                      <div><strong>Type:</strong> {dispute.type.replace('_', ' ')}</div>
                      <div><strong>Reporter:</strong> {dispute.reporter}</div>
                      <div><strong>Created:</strong> {dispute.createdDate}</div>
                      {dispute.assignedTo && <div><strong>Assigned to:</strong> {dispute.assignedTo}</div>}
                    </div>
                    
                    <p className="text-gray-700 mb-4">{dispute.description}</p>
                    
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {dispute.messages.length} message{dispute.messages.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      color="primary"
                      onPress={() => handleViewDispute(dispute)}
                    >
                      Manage Dispute
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={<ArrowRight className="w-4 h-4" />}
                    >
                      View Booking
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Tracking Tab */}
      {selectedTab === 'payments' && (
        <div className="space-y-6">
          <Card className="shadow-sm border border-gray-200">
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ${mockBookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-green-700">Total Collected</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    ${mockBookings.filter(b => b.paymentStatus === 'pending').reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-yellow-700">Pending Payments</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ${mockBookings.filter(b => b.paymentStatus === 'refunded').reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-700">Total Refunded</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    ${mockBookings.filter(b => b.paymentStatus === 'partial_refund').reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-700">Partial Refunds</div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Recent Transactions */}
          <Card className="shadow-sm border border-gray-200">
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Payment Activities</h3>
              <div className="space-y-3">
                {mockBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        booking.paymentStatus === 'paid' ? 'bg-green-500' :
                        booking.paymentStatus === 'pending' ? 'bg-yellow-500' :
                        booking.paymentStatus === 'refunded' ? 'bg-blue-500' : 'bg-purple-500'
                      }`} />
                      <div>
                        <div className="font-medium">{booking.id} - {booking.guestName}</div>
                        <div className="text-sm text-gray-600">{booking.propertyTitle}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${booking.totalAmount.toLocaleString()}</div>
                      <div className="text-sm text-gray-600 capitalize">
                        {booking.paymentStatus.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={isOpen}
        onClose={onClose}
        booking={selectedBooking}
        getStatusColor={getStatusColor}
        getPaymentStatusColor={getPaymentStatusColor}
      />

      {/* Dispute Management Modal */}
      <DisputeManagementModal
        isOpen={isDisputeOpen}
        onClose={onDisputeClose}
        dispute={selectedDispute}
        disputeMessage={disputeMessage}
        onDisputeMessageChange={setDisputeMessage}
        onSendMessage={() => {
          if (selectedDispute && disputeMessage.trim()) {
            handleDisputeMessage(selectedDispute.id, disputeMessage)
          }
        }}
        getDisputePriorityColor={getDisputePriorityColor}
      />

      {/* Refund Modal */}
      <RefundModal
        isOpen={isRefundOpen}
        onClose={onRefundClose}
        booking={selectedBooking}
        refundAmount={refundAmount}
        onRefundAmountChange={setRefundAmount}
        onProcessRefund={() => {
          if (selectedBooking && refundAmount) {
            handleRefund(selectedBooking.id, refundAmount)
          }
        }}
      />

      {/* Contact Parties Modal */}
      <ContactPartiesModal
        isOpen={isContactOpen}
        onClose={onContactClose}
        booking={selectedBooking}
      />
    </div>
  )
} 