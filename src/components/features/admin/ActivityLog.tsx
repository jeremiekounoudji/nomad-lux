import React, { useState } from 'react'
import { 
  Card, 
  CardBody, 
  Button, 
  Chip, 
  Input,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Avatar,
  Pagination
} from '@heroui/react'
import { 
  Users, 
  Building, 
  Calendar, 
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Mail,
  CreditCard,
  Shield,
  ArrowLeft
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ActivityLogProps {
  onBack?: () => void
}

interface Activity {
  id: string
  type: 'user' | 'property' | 'booking' | 'payment' | 'security' | 'system'
  action: string
  description: string
  user?: string
  target?: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  ip?: string
  userAgent?: string
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'user',
    action: 'User Registration',
    description: 'New user account created',
    user: 'Sarah Johnson',
    target: 'sarah.johnson@email.com',
    timestamp: '2024-01-20T10:30:00Z',
    severity: 'low',
    ip: '192.168.1.1'
  },
  {
    id: '2',
    type: 'property',
    action: 'Property Submission',
    description: 'New property submitted for approval',
    user: 'Michael Chen',
    target: 'Luxury Villa in Miami',
    timestamp: '2024-01-20T10:25:00Z',
    severity: 'medium',
    ip: '192.168.1.2'
  },
  {
    id: '3',
    type: 'booking',
    action: 'Booking Request',
    description: 'New booking request created',
    user: 'Emma Rodriguez',
    target: 'BK-2847',
    timestamp: '2024-01-20T10:18:00Z',
    severity: 'medium',
    ip: '192.168.1.3'
  },
  {
    id: '4',
    type: 'property',
    action: 'Property Approved',
    description: 'Property approved by admin',
    user: 'Admin User',
    target: 'Beachfront Condo',
    timestamp: '2024-01-20T10:12:00Z',
    severity: 'low',
    ip: '192.168.1.4'
  },
  {
    id: '5',
    type: 'security',
    action: 'User Suspended',
    description: 'User account suspended for policy violation',
    user: 'Admin User',
    target: 'John Doe',
    timestamp: '2024-01-20T10:05:00Z',
    severity: 'high',
    ip: '192.168.1.5'
  },
  {
    id: '6',
    type: 'payment',
    action: 'Payment Failed',
    description: 'Payment processing failed for booking',
    user: 'Alice Smith',
    target: 'BK-2848',
    timestamp: '2024-01-20T09:55:00Z',
    severity: 'high',
    ip: '192.168.1.6'
  },
  {
    id: '7',
    type: 'system',
    action: 'System Backup',
    description: 'Automated system backup completed',
    user: 'System',
    target: 'Database Backup',
    timestamp: '2024-01-20T09:00:00Z',
    severity: 'low'
  },
  {
    id: '8',
    type: 'property',
    action: 'Property Rejected',
    description: 'Property rejected due to quality issues',
    user: 'Admin User',
    target: 'Downtown Studio',
    timestamp: '2024-01-20T08:45:00Z',
    severity: 'medium',
    ip: '192.168.1.7'
  },
  {
    id: '9',
    type: 'user',
    action: 'Password Reset',
    description: 'User requested password reset',
    user: 'David Wilson',
    target: 'david.wilson@email.com',
    timestamp: '2024-01-20T08:30:00Z',
    severity: 'low',
    ip: '192.168.1.8'
  },
  {
    id: '10',
    type: 'booking',
    action: 'Booking Cancelled',
    description: 'Booking cancelled by guest',
    user: 'Jennifer Lee',
    target: 'BK-2849',
    timestamp: '2024-01-20T08:15:00Z',
    severity: 'medium',
    ip: '192.168.1.9'
  }
]

export const ActivityLog: React.FC<ActivityLogProps> = ({ onBack }) => {
  const { t } = useTranslation(['admin', 'common'])
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="w-4 h-4 text-blue-500" />
      case 'property': return <Building className="w-4 h-4 text-green-500" />
      case 'booking': return <Calendar className="w-4 h-4 text-orange-500" />
      case 'payment': return <CreditCard className="w-4 h-4 text-purple-500" />
      case 'security': return <Shield className="w-4 h-4 text-red-500" />
      case 'system': return <Settings className="w-4 h-4 text-gray-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityChip = (severity: Activity['severity']) => {
    switch (severity) {
      case 'low':
        return <Chip size="sm" color="success" variant="flat">{t('admin.activity.severity.low', { defaultValue: 'Low' })}</Chip>
      case 'medium':
        return <Chip size="sm" color="warning" variant="flat">{t('admin.activity.severity.medium', { defaultValue: 'Medium' })}</Chip>
      case 'high':
        return <Chip size="sm" color="danger" variant="flat">{t('admin.activity.severity.high', { defaultValue: 'High' })}</Chip>
      case 'critical':
        return <Chip size="sm" color="danger">{t('admin.activity.severity.critical', { defaultValue: 'Critical' })}</Chip>
      default:
        return <Chip size="sm" color="default" variant="flat">{t('common.status.unknown', { defaultValue: 'Unknown' })}</Chip>
    }
  }

  const filteredActivities = mockActivities.filter(activity => {
    const matchesSearch = activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.target?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTab = selectedTab === 'all' || activity.type === selectedTab
    const matchesSeverity = severityFilter === 'all' || activity.severity === severityFilter
    
    return matchesSearch && matchesTab && matchesSeverity
  })

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage)
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const stats = {
    all: mockActivities.length,
    user: mockActivities.filter(a => a.type === 'user').length,
    property: mockActivities.filter(a => a.type === 'property').length,
    booking: mockActivities.filter(a => a.type === 'booking').length,
    payment: mockActivities.filter(a => a.type === 'payment').length,
    security: mockActivities.filter(a => a.type === 'security').length,
    system: mockActivities.filter(a => a.type === 'system').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              isIconOnly
              variant="flat"
              onPress={onBack}
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('admin.activity.title', { defaultValue: 'Activity Log' })}</h1>
            <p className="text-gray-600 mt-1">{t('admin.activity.subtitle', { defaultValue: 'Monitor all platform activities and events' })}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="flat"
            startContent={<Download className="w-4 h-4" />}
          >
            {t('admin.settings.exportLog', { defaultValue: 'Export Log' })}
          </Button>
          <Button 
            color="primary"
            startContent={<Filter className="w-4 h-4" />}
          >
            {t('admin.activity.advancedFilters', { defaultValue: 'Advanced Filters' })}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border border-gray-200">
        <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1">
              <Input
                placeholder={t('admin.activity.searchPlaceholder', { defaultValue: 'Search activities by action, user, target...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search className="w-4 h-4 text-gray-400" />}
              />
            </div>
            
            <div className="flex gap-3">
              <Select
                placeholder={t('admin.activity.severity.label', { defaultValue: 'Severity' })}
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="min-w-[120px]"
              >
                <SelectItem key="all" value="all">{t('admin.activity.severity.all', { defaultValue: 'All Severities' })}</SelectItem>
                <SelectItem key="low" value="low">{t('admin.activity.severity.low', { defaultValue: 'Low' })}</SelectItem>
                <SelectItem key="medium" value="medium">{t('admin.activity.severity.medium', { defaultValue: 'Medium' })}</SelectItem>
                <SelectItem key="high" value="high">{t('admin.activity.severity.high', { defaultValue: 'High' })}</SelectItem>
                <SelectItem key="critical" value="critical">{t('admin.activity.severity.critical', { defaultValue: 'Critical' })}</SelectItem>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Activity Type Tabs */}
      <div className="w-full">
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => {
            setSelectedTab(key as string)
            setCurrentPage(1)
          }}
          variant="underlined"
          classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-primary-500",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-primary-600"
          }}
        >
          <Tab key="all" title={t('admin.activity.tabs.allActivities', { count: stats.all, defaultValue: 'All Activities ({{count}})' })} />
          <Tab key="user" title={t('admin.activity.tabs.users', { count: stats.user, defaultValue: 'Users ({{count}})' })} />
          <Tab key="property" title={t('admin.activity.tabs.properties', { count: stats.property, defaultValue: 'Properties ({{count}})' })} />
          <Tab key="booking" title={t('admin.activity.tabs.bookings', { count: stats.booking, defaultValue: 'Bookings ({{count}})' })} />
          <Tab key="payment" title={t('admin.activity.tabs.payments', { count: stats.payment, defaultValue: 'Payments ({{count}})' })} />
          <Tab key="security" title={t('admin.activity.tabs.security', { count: stats.security, defaultValue: 'Security ({{count}})' })} />
          <Tab key="system" title={t('admin.activity.tabs.system', { count: stats.system, defaultValue: 'System ({{count}})' })} />
        </Tabs>
      </div>

      {/* Activities List */}
      <Card className="shadow-sm border border-gray-200">
        <CardBody className="p-0">
          <div className="divide-y divide-gray-200">
            {paginatedActivities.map((activity) => {
              const { date, time } = formatTimestamp(activity.timestamp)
              
              return (
                <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Activity Icon */}
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>

                    {/* Activity Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{activity.action}</h4>
                            {getSeverityChip(activity.severity)}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                            {activity.user && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{t('common.labels.user', { defaultValue: 'User' })}: {activity.user}</span>
                              </div>
                            )}
                            {activity.target && (
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{t('common.labels.target', { defaultValue: 'Target' })}: {activity.target}</span>
                              </div>
                            )}
                            {activity.ip && (
                              <div className="flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                <span>{t('common.labels.ip', { defaultValue: 'IP' })}: {activity.ip}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Timestamp */}
                        <div className="text-right text-xs text-gray-500 whitespace-nowrap">
                          <div className="font-medium">{date}</div>
                          <div>{time}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Empty State */}
          {paginatedActivities.length === 0 && (
            <div className="p-12 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.activity.empty.title', { defaultValue: 'No activities found' })}</h3>
              <p className="text-gray-600">{t('admin.activity.empty.subtitle', { defaultValue: 'Try adjusting your search filters to see more results.' })}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={setCurrentPage}
            showControls
            showShadow
            color="primary"
          />
        </div>
      )}
    </div>
  )
} 