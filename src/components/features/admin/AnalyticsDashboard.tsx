import React, { useState } from 'react'
import { 
  Card, 
  CardBody, 
  Button, 
  Select,
  SelectItem,
  Tabs,
  Tab,
  Progress,
  Avatar
} from '@heroui/react'
import { 
  TrendingUp,
  DollarSign,
  Users,
  Home,
  Calendar,
  Download,
  Filter,
  ArrowUp,
  ArrowDown,
  MapPin,
  Star,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'
import { useTranslation } from '../../../lib/stores/translationStore'
import { formatPrice } from '../../../utils/currencyUtils'

// interface AnalyticsDashboardProps { // Commented out to avoid unused interface warning
//   onPageChange: (page: string) => void
// }

interface MetricCard {
  title: string
  value: string | number
  change: number
  period: string
  icon: React.ReactNode
  color: 'primary' | 'success' | 'warning' | 'danger'
}

interface ChartData {
  name: string
  value: number
  color?: string
}

interface TopProperty {
  id: string
  title: string
  image: string
  location: string
  revenue: number
  bookings: number
  rating: number
  host: string
}

interface TopHost {
  id: string
  name: string
  avatar: string
  properties: number
  revenue: number
  rating: number
  responseRate: number
}

export const AnalyticsDashboard: React.FC = () => {
  const { t } = useTranslation(['admin', 'common', 'booking'])
  const [selectedPeriod, setSelectedPeriod] = useState('30days')
  const [selectedTab, setSelectedTab] = useState('overview')

  // Mock data
  const metrics: MetricCard[] = [
    {
      title: t('admin.dashboard.totalRevenue', { defaultValue: 'Total Revenue' }),
      value: formatPrice(248750, 'USD'),
      change: 12.5,
      period: t('admin.analytics.vsLastMonth', { defaultValue: 'vs last month' }),
      icon: <DollarSign className="size-6" />,
      color: 'success'
    },
    {
      title: t('admin.dashboard.totalUsers', { defaultValue: 'Total Users' }),
      value: '2,847',
      change: 8.2,
      period: t('admin.analytics.vsLastMonth', { defaultValue: 'vs last month' }),
      icon: <Users className="size-6" />,
      color: 'primary'
    },
    {
      title: t('admin.dashboard.activeProperties', { defaultValue: 'Active Properties' }),
      value: '456',
      change: 5.7,
      period: t('admin.analytics.vsLastMonth', { defaultValue: 'vs last month' }),
      icon: <Home className="size-6" />,
      color: 'warning'
    },
    {
      title: t('admin.dashboard.totalBookings', { defaultValue: 'Total Bookings' }),
      value: '1,234',
      change: -2.3,
      period: t('admin.analytics.vsLastMonth', { defaultValue: 'vs last month' }),
      icon: <Calendar className="size-6" />,
      color: 'danger'
    }
  ]

  const revenueData: ChartData[] = [
    { name: 'Jan', value: 45000 },
    { name: 'Feb', value: 52000 },
    { name: 'Mar', value: 48000 },
    { name: 'Apr', value: 61000 },
    { name: 'May', value: 55000 },
    { name: 'Jun', value: 67000 },
    { name: 'Jul', value: 71000 },
    { name: 'Aug', value: 69000 },
    { name: 'Sep', value: 78000 },
    { name: 'Oct', value: 82000 },
    { name: 'Nov', value: 89000 },
    { name: 'Dec', value: 95000 }
  ]

  const bookingStatusData: ChartData[] = [
    { name: 'Confirmed', value: 68, color: '#10B981' },
    { name: 'Pending', value: 15, color: '#F59E0B' },
    { name: 'Cancelled', value: 12, color: '#EF4444' },
    { name: 'Completed', value: 5, color: '#8B5CF6' }
  ]

  const userGrowthData: ChartData[] = [
    { name: 'Jan', value: 2100 },
    { name: 'Feb', value: 2250 },
    { name: 'Mar', value: 2400 },
    { name: 'Apr', value: 2580 },
    { name: 'May', value: 2650 },
    { name: 'Jun', value: 2847 }
  ]

  const topProperties: TopProperty[] = [
    {
      id: 'P001',
      title: 'Luxury Beach House with Ocean View',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
      location: 'Malibu, CA',
      revenue: 24500,
      bookings: 28,
      rating: 4.9,
      host: 'Sarah Johnson'
    },
    {
      id: 'P002',
      title: 'Modern Downtown Apartment',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      location: 'New York, NY',
      revenue: 18200,
      bookings: 45,
      rating: 4.7,
      host: 'Michael Chen'
    },
    {
      id: 'P003',
      title: 'Cozy Mountain Cabin',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
      location: 'Aspen, CO',
      revenue: 15800,
      bookings: 22,
      rating: 4.8,
      host: 'Emma Rodriguez'
    },
    {
      id: 'P004',
      title: 'City Loft with Rooftop',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      location: 'San Francisco, CA',
      revenue: 14100,
      bookings: 31,
      rating: 4.6,
      host: 'James Park'
    },
    {
      id: 'P005',
      title: 'Historic Townhouse',
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400',
      location: 'Boston, MA',
      revenue: 12900,
      bookings: 19,
      rating: 4.8,
      host: 'Lisa Thompson'
    }
  ]

  const topHosts: TopHost[] = [
    {
      id: 'H001',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b732?w=100',
      properties: 3,
      revenue: 42500,
      rating: 4.9,
      responseRate: 98
    },
    {
      id: 'H002',
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      properties: 2,
      revenue: 35800,
      rating: 4.7,
      responseRate: 95
    },
    {
      id: 'H003',
      name: 'Emma Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      properties: 4,
      revenue: 28900,
      rating: 4.8,
      responseRate: 92
    },
    {
      id: 'H004',
      name: 'James Park',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      properties: 2,
      revenue: 24100,
      rating: 4.6,
      responseRate: 89
    }
  ]

  const SimpleBarChart: React.FC<{ data: ChartData[]; height?: number }> = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.map(item => item.value))
    
    return (
      <div className="flex items-end justify-between gap-2 px-4" style={{ height }}>
        {data.map((item, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-2">
            <div className="text-xs font-medium text-gray-900">
              ${typeof item.value === 'number' ? (item.value / 1000).toFixed(0) : item.value}k
            </div>
            <div 
              className="w-full rounded-t-sm bg-primary-500 transition-all duration-300 hover:bg-primary-600"
              style={{ 
                height: `${(item.value / maxValue) * (height - 60)}px`,
                minHeight: '4px'
              }}
            />
            <div className="text-xs text-gray-600">{item.name}</div>
          </div>
        ))}
      </div>
    )
  }

  const SimpleLineChart: React.FC<{ data: ChartData[]; height?: number }> = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.map(item => item.value))
    const minValue = Math.min(...data.map(item => item.value))
    const range = maxValue - minValue
    
    return (
      <div className="relative px-4" style={{ height }}>
        <svg width="100%" height={height - 40} className="overflow-visible">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent) => (
            <line
              key={percent}
              x1="0"
              y1={`${percent}%`}
              x2="100%"
              y2={`${percent}%`}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}
          
          {/* Line path */}
          <path
            d={`M ${data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100
              const y = 100 - ((item.value - minValue) / range) * 100
              return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`
            }).join(' ')}`}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Fill area */}
          <path
            d={`M ${data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100
              const y = 100 - ((item.value - minValue) / range) * 100
              return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`
            }).join(' ')} L 100% 100% L 0% 100% Z`}
            fill="url(#lineGradient)"
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 100 - ((item.value - minValue) / range) * 100
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill="#3B82F6"
                stroke="white"
                strokeWidth="2"
                className="hover:r-6 cursor-pointer transition-all"
              />
            )
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="mt-2 flex justify-between text-xs text-gray-600">
          {data.map((item, index) => (
            <span key={index}>{item.name}</span>
          ))}
        </div>
      </div>
    )
  }

  const SimplePieChart: React.FC<{ data: ChartData[]; size?: number }> = ({ data, size = 160 }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let currentAngle = 0
    
    return (
      <div className="flex items-center gap-6">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            {data.map((item, index) => {
              const percentage = item.value / total
              const angle = percentage * 360
              const radius = size / 2 - 10
              const centerX = size / 2
              const centerY = size / 2
              
              const startAngle = (currentAngle * Math.PI) / 180
              const endAngle = ((currentAngle + angle) * Math.PI) / 180
              
              const x1 = centerX + radius * Math.cos(startAngle)
              const y1 = centerY + radius * Math.sin(startAngle)
              const x2 = centerX + radius * Math.cos(endAngle)
              const y2 = centerY + radius * Math.sin(endAngle)
              
              const largeArcFlag = angle > 180 ? 1 : 0
              
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ')
              
              currentAngle += angle
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color || '#3B82F6'}
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer transition-opacity hover:opacity-80"
                />
              )
            })}
          </svg>
        </div>
        
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="size-3 rounded-full"
                style={{ backgroundColor: item.color || '#3B82F6' }}
              />
              <span className="text-sm text-gray-700">{item.name}</span>
              <span className="text-sm font-medium text-gray-900">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.analytics.title', { defaultValue: 'Analytics Dashboard' })}</h1>
        <p className="mt-1 text-gray-600">{t('admin.analytics.subtitle', { defaultValue: 'Detailed insights and platform performance metrics' })}</p>
      </div>

      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.analytics.title', { defaultValue: 'Analytics Dashboard' })}</h1>
          <p className="mt-1 text-gray-600">{t('admin.analytics.subtitleShort', { defaultValue: 'Platform insights and performance metrics' })}</p>
        </div>
        <div className="flex gap-3">
          <Select
            placeholder={t('admin.analytics.period.select', { defaultValue: 'Select period' })}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="min-w-[150px]"
          >
            <SelectItem key="7days">{t('admin.analytics.period.last7', { defaultValue: 'Last 7 days' })}</SelectItem>
            <SelectItem key="30days">{t('admin.analytics.period.last30', { defaultValue: 'Last 30 days' })}</SelectItem>
            <SelectItem key="90days">{t('admin.analytics.period.last90', { defaultValue: 'Last 90 days' })}</SelectItem>
            <SelectItem key="1year">{t('admin.analytics.period.lastYear', { defaultValue: 'Last year' })}</SelectItem>
          </Select>
          <Button 
            variant="flat"
            startContent={<Download className="size-4" />}
          >
            {t('admin.reports.exportReport', { defaultValue: 'Export Report' })}
          </Button>
          <Button 
            variant="flat"
            startContent={<Filter className="size-4" />}
          >
            {t('admin.analytics.customRange', { defaultValue: 'Custom Range' })}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border border-gray-200 shadow-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`bg- rounded-lg p-2${metric.color}-100`}>
                    <div className={`text-${metric.color}-600`}>
                      {metric.icon}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">{metric.title}</div>
                    <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {metric.change > 0 ? (
                  <ArrowUp className="size-4 text-green-500" />
                ) : (
                  <ArrowDown className="size-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  metric.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(metric.change)}%
                </span>
                <span className="text-sm text-gray-500">{metric.period}</span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
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
          <Tab key="overview" title={t('admin.dashboard.overview', { defaultValue: 'Overview' })} />
          <Tab key="revenue" title={t('admin.analytics.tabs.revenue', { defaultValue: 'Revenue' })} />
          <Tab key="users" title={t('admin.navigation.users', { defaultValue: 'Users' })} />
          <Tab key="properties" title={t('admin.navigation.properties', { defaultValue: 'Properties' })} />
          <Tab key="bookings" title={t('admin.navigation.bookings', { defaultValue: 'Bookings' })} />
        </Tabs>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Revenue Chart */}
          <Card className="border border-gray-200 shadow-sm">
            <CardBody className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{t('admin.analytics.sections.revenueTrend', { defaultValue: 'Revenue Trend' })}</h3>
                <BarChart3 className="size-5 text-gray-400" />
              </div>
              <SimpleBarChart data={revenueData} height={250} />
            </CardBody>
          </Card>

          {/* Booking Status */}
          <Card className="border border-gray-200 shadow-sm">
            <CardBody className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{t('admin.analytics.sections.bookingStatus', { defaultValue: 'Booking Status' })}</h3>
                <PieChart className="size-5 text-gray-400" />
              </div>
              <SimplePieChart data={bookingStatusData} />
            </CardBody>
          </Card>

          {/* User Growth */}
          <Card className="border border-gray-200 shadow-sm">
            <CardBody className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{t('admin.analytics.sections.userGrowth', { defaultValue: 'User Growth' })}</h3>
                <LineChart className="size-5 text-gray-400" />
              </div>
              <SimpleLineChart data={userGrowthData} height={250} />
            </CardBody>
          </Card>

          {/* Quick Stats */}
          <Card className="border border-gray-200 shadow-sm">
            <CardBody className="p-6">
              <h3 className="mb-6 text-lg font-semibold text-gray-900">{t('admin.analytics.sections.platformHealth', { defaultValue: 'Platform Health' })}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('admin.analytics.stats.avgResponseTime', { defaultValue: 'Average Response Time' })}</span>
                  <span className="text-sm font-medium text-gray-900">2.3 hours</span>
                </div>
                <Progress value={85} color="success" size="sm" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('admin.analytics.stats.customerSatisfaction', { defaultValue: 'Customer Satisfaction' })}</span>
                  <span className="text-sm font-medium text-gray-900">4.7/5.0</span>
                </div>
                <Progress value={94} color="primary" size="sm" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('admin.analytics.stats.propertyApprovalRate', { defaultValue: 'Property Approval Rate' })}</span>
                  <span className="text-sm font-medium text-gray-900">87%</span>
                </div>
                <Progress value={87} color="warning" size="sm" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('admin.analytics.stats.platformUptime', { defaultValue: 'Platform Uptime' })}</span>
                  <span className="text-sm font-medium text-gray-900">99.8%</span>
                </div>
                <Progress value={99.8} color="success" size="sm" />
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Revenue Tab */}
      {selectedTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="border border-gray-200 shadow-sm lg:col-span-2">
              <CardBody className="p-6">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">{t('admin.analytics.revenue.monthlyRevenue', { defaultValue: 'Monthly Revenue' })}</h3>
                <SimpleBarChart data={revenueData} height={300} />
              </CardBody>
            </Card>
            
            <Card className="border border-gray-200 shadow-sm">
              <CardBody className="p-6">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">{t('admin.analytics.revenue.breakdown', { defaultValue: 'Revenue Breakdown' })}</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                    <span className="text-sm font-medium text-green-800">{t('admin.analytics.revenue.commission', { defaultValue: 'Commission' })}</span>
                    <span className="text-lg font-bold text-green-600">{formatPrice(198250, 'USD')}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                    <span className="text-sm font-medium text-blue-800">{t('admin.analytics.revenue.serviceFees', { defaultValue: 'Service Fees' })}</span>
                    <span className="text-lg font-bold text-blue-600">{formatPrice(42150, 'USD')}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-purple-50 p-3">
                    <span className="text-sm font-medium text-purple-800">{t('admin.analytics.revenue.premiumFeatures', { defaultValue: 'Premium Features' })}</span>
                    <span className="text-lg font-bold text-purple-600">{formatPrice(8350, 'USD')}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Top Performing Properties */}
          <Card className="border border-gray-200 shadow-sm">
            <CardBody className="p-6">
              <h3 className="mb-6 text-lg font-semibold text-gray-900">{t('admin.analytics.topPerformingProperties', { defaultValue: 'Top Performing Properties' })}</h3>
              <div className="space-y-4">
                {topProperties.map((property, index) => (
                  <div key={property.id} className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
                    <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                    <img
                      src={property.image}
                      alt={property.title}
                      className="size-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{property.title}</h4>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {property.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="size-3 fill-yellow-400 text-yellow-400" />
                          {property.rating}
                        </span>
                        <span>{t('admin.analytics.labels.bookings', { count: property.bookings, defaultValue: '{{count}} bookings' })}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">${property.revenue.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">{t('admin.analytics.labels.revenue', { defaultValue: 'revenue' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {selectedTab === 'users' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border border-gray-200 shadow-sm">
              <CardBody className="p-6">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">{t('admin.analytics.sections.userGrowth', { defaultValue: 'User Growth' })}</h3>
                <SimpleLineChart data={userGrowthData} height={300} />
              </CardBody>
            </Card>
            
            <Card className="border border-gray-200 shadow-sm">
              <CardBody className="p-6">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">{t('admin.analytics.users.statistics', { defaultValue: 'User Statistics' })}</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('admin.analytics.users.totalRegistered', { defaultValue: 'Total Registered Users' })}</span>
                    <span className="text-xl font-bold text-gray-900">2,847</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('admin.analytics.users.active30Days', { defaultValue: 'Active Users (30 days)' })}</span>
                    <span className="text-xl font-bold text-green-600">1,924</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('admin.analytics.users.newThisMonth', { defaultValue: 'New Users (This Month)' })}</span>
                    <span className="text-xl font-bold text-blue-600">197</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('admin.analytics.users.retentionRate', { defaultValue: 'User Retention Rate' })}</span>
                    <span className="text-xl font-bold text-purple-600">78%</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Top Hosts */}
          <Card className="border border-gray-200 shadow-sm">
            <CardBody className="p-6">
              <h3 className="mb-6 text-lg font-semibold text-gray-900">{t('admin.analytics.topPerformingHosts', { defaultValue: 'Top Performing Hosts' })}</h3>
              <div className="space-y-4">
                {topHosts.map((host, index) => (
                  <div key={host.id} className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
                    <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                    <Avatar src={host.avatar} name={host.name} size="lg" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{host.name}</h4>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                        <span>{t('admin.analytics.labels.properties', { count: host.properties, defaultValue: '{{count}} properties' })}</span>
                        <span className="flex items-center gap-1">
                          <Star className="size-3 fill-yellow-400 text-yellow-400" />
                          {host.rating}
                        </span>
                        <span>{t('admin.analytics.labels.responseRate', { value: host.responseRate, defaultValue: '{{value}}% response rate' })}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">${host.revenue.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">{t('admin.analytics.labels.totalRevenue', { defaultValue: 'total revenue' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Properties Tab */}
      {selectedTab === 'properties' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="border border-gray-200 shadow-sm">
              <CardBody className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">456</div>
                <div className="mt-1 text-sm text-gray-600">{t('admin.dashboard.totalProperties', { defaultValue: 'Total Properties' })}</div>
                <div className="mt-2 flex items-center justify-center gap-1">
                  <TrendingUp className="size-4 text-green-500" />
                  <span className="text-sm text-green-600">+5.7% this month</span>
                </div>
              </CardBody>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardBody className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">398</div>
                <div className="mt-1 text-sm text-gray-600">{t('admin.dashboard.activeProperties', { defaultValue: 'Active Properties' })}</div>
                <div className="mt-2 text-sm text-gray-500">87% of total</div>
              </CardBody>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardBody className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600">23</div>
                <div className="mt-1 text-sm text-gray-600">{t('admin.properties.pendingApproval', { defaultValue: 'Pending Approval' })}</div>
                <div className="mt-2 text-sm text-gray-500">{t('admin.analytics.labels.avgDays', { value: '2.3', defaultValue: 'Avg. {{value}} days' })}</div>
              </CardBody>
            </Card>
          </div>

          <Card className="border border-gray-200 shadow-sm">
            <CardBody className="p-6">
              <h3 className="mb-6 text-lg font-semibold text-gray-900">{t('admin.analytics.properties.performance', { defaultValue: 'Property Performance' })}</h3>
              <div className="space-y-4">
                {topProperties.map((property, index) => (
                  <div key={property.id} className="flex items-center gap-4 rounded-lg border border-gray-200 p-4">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="size-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{property.title}</h4>
                      <div className="mt-1 text-sm text-gray-600">
                        <div className="mb-1 flex items-center gap-1">
                          <MapPin className="size-3" />
                          {property.location}
                        </div>
                        <div>{t('admin.analytics.labels.host', { defaultValue: 'Host' })}: {property.host}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{property.bookings}</div>
                        <div className="text-xs text-gray-600">{t('admin.analytics.labels.bookingsOnly', { defaultValue: 'Bookings' })}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">{property.rating}</div>
                        <div className="text-xs text-gray-600">{t('admin.analytics.labels.rating', { defaultValue: 'Rating' })}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">${property.revenue.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">{t('admin.analytics.labels.revenueOnly', { defaultValue: 'Revenue' })}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Bookings Tab */}
      {selectedTab === 'bookings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border border-gray-200 shadow-sm">
              <CardBody className="p-6">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">{t('admin.analytics.bookings.statusDistribution', { defaultValue: 'Booking Status Distribution' })}</h3>
                <SimplePieChart data={bookingStatusData} size={200} />
              </CardBody>
            </Card>
            
            <Card className="border border-gray-200 shadow-sm">
              <CardBody className="p-6">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">{t('admin.analytics.bookings.metrics', { defaultValue: 'Booking Metrics' })}</h3>
                <div className="space-y-6">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('admin.analytics.bookings.avgValue', { defaultValue: 'Average Booking Value' })}</span>
                      <span className="text-lg font-bold text-gray-900">{formatPrice(485, 'USD')}</span>
                    </div>
                    <Progress value={75} color="primary" size="sm" />
                  </div>
                  
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('admin.analytics.bookings.successRate', { defaultValue: 'Booking Success Rate' })}</span>
                      <span className="text-lg font-bold text-green-600">89%</span>
                    </div>
                    <Progress value={89} color="success" size="sm" />
                  </div>
                  
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('admin.analytics.bookings.avgStay', { defaultValue: 'Average Stay Duration' })}</span>
                      <span className="text-lg font-bold text-purple-600">3.2 nights</span>
                    </div>
                    <Progress value={64} color="secondary" size="sm" />
                  </div>
                  
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('admin.analytics.bookings.repeatRate', { defaultValue: 'Repeat Booking Rate' })}</span>
                      <span className="text-lg font-bold text-orange-600">32%</span>
                    </div>
                    <Progress value={32} color="warning" size="sm" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
} 