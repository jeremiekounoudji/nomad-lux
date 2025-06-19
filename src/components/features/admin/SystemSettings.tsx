import React, { useState } from 'react'
import { 
  Card, 
  CardBody, 
  Button, 
  Input, 
  Textarea, 
  Switch, 
  Select,
  SelectItem,
  Tabs,
  Tab,
  Divider,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Slider,
  Badge
} from '@heroui/react'
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Bell, 
  DollarSign, 
  Shield, 
  Mail, 
  Globe, 
  Clock, 
  Users,
  Image as ImageIcon,
  FileText,
  Database,
  Activity,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Calendar
} from 'lucide-react'

interface SettingChange {
  id: string
  setting: string
  oldValue: string
  newValue: string
  changedBy: string
  timestamp: string
  category: string
}

interface NotificationTemplate {
  id: string
  name: string
  subject: string
  type: 'email' | 'sms' | 'push'
  enabled: boolean
  lastModified: string
}

export const SystemSettings: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('general')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  
  // General Settings
  const [platformSettings, setPlatformSettings] = useState({
    siteName: 'Nomad Lux',
    siteDescription: 'Premium property rental platform',
    contactEmail: 'admin@nomadlux.com',
    supportEmail: 'support@nomadlux.com',
    maintenanceMode: false,
    registrationEnabled: true,
    maxFileSize: 10,
    allowedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
    defaultLanguage: 'en',
    timezone: 'UTC'
  })

  // Booking Settings
  const [bookingSettings, setBookingSettings] = useState({
    commissionRate: 10,
    maxAdvanceBooking: 365,
    minAdvanceBooking: 1,
    cancellationGracePeriod: 24,
    autoApprovalEnabled: false,
    instantBookingEnabled: true,
    minimumStay: 1,
    maximumStay: 30,
    paymentProcessingFee: 2.9,
    hostPayoutDelay: 1
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: true,
    bookingConfirmations: true,
    paymentNotifications: true,
    disputeAlerts: true,
    systemAlerts: true,
    weeklyReports: true,
    monthlyReports: true
  })

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorRequired: false,
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    ipWhitelist: '',
    apiRateLimit: 1000,
    enableAuditLog: true,
    dataRetentionPeriod: 365,
    encryptUserData: true
  })

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    stripePublicKey: 'pk_test_...',
    stripeSecretKey: '••••••••••••••••',
    paypalClientId: '••••••••••••••••',
    paypalClientSecret: '••••••••••••••••',
    defaultCurrency: 'USD',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD'],
    autoPayoutEnabled: true,
    minimumPayoutAmount: 50,
    payoutSchedule: 'weekly',
    chargeTaxes: true,
    taxRate: 8.5
  })

  const { isOpen, onOpen, onClose } = useDisclosure()
  const { 
    isOpen: isTemplateOpen, 
    onOpen: onTemplateOpen, 
    onClose: onTemplateClose 
  } = useDisclosure()
  const { 
    isOpen: isEditTemplateOpen, 
    onOpen: onEditTemplateOpen, 
    onClose: onEditTemplateClose 
  } = useDisclosure()

  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    type: 'email' as 'email' | 'sms' | 'push'
  })

  const mockSettingChanges: SettingChange[] = [
    {
      id: '1',
      setting: 'Commission Rate',
      oldValue: '8%',
      newValue: '10%',
      changedBy: 'Admin User',
      timestamp: '2024-01-20 14:30',
      category: 'Booking'
    },
    {
      id: '2',
      setting: 'Two Factor Authentication',
      oldValue: 'Disabled',
      newValue: 'Enabled',
      changedBy: 'System Admin',
      timestamp: '2024-01-19 09:15',
      category: 'Security'
    },
    {
      id: '3',
      setting: 'Maximum File Size',
      oldValue: '5MB',
      newValue: '10MB',
      changedBy: 'Admin User',
      timestamp: '2024-01-18 16:45',
      category: 'General'
    }
  ]

  const mockNotificationTemplates: NotificationTemplate[] = [
    {
      id: '1',
      name: 'Booking Confirmation',
      subject: 'Your booking has been confirmed!',
      type: 'email',
      enabled: true,
      lastModified: '2024-01-15'
    },
    {
      id: '2',
      name: 'Payment Reminder',
      subject: 'Payment due reminder',
      type: 'email',
      enabled: true,
      lastModified: '2024-01-12'
    },
    {
      id: '3',
      name: 'Dispute Alert',
      subject: 'New dispute requires attention',
      type: 'email',
      enabled: true,
      lastModified: '2024-01-10'
    }
  ]

  const handleSaveSettings = (category: string) => {
    console.log(`Saving ${category} settings`)
    setHasUnsavedChanges(false)
    // TODO: Implement save logic
  }

  const handleResetSettings = (category: string) => {
    console.log(`Resetting ${category} settings`)
    setHasUnsavedChanges(false)
    // TODO: Implement reset logic
  }

  const handleSettingChange = (category: string, setting: string, value: any) => {
    console.log('Setting change:', { category, setting, value })
    setHasUnsavedChanges(true)
    
    switch (category) {
      case 'general':
        setPlatformSettings(prev => {
          const updated = { ...prev, [setting]: value }
          console.log('Updated general settings:', updated)
          return updated
        })
        break
      case 'booking':
        setBookingSettings(prev => {
          const updated = { ...prev, [setting]: value }
          console.log('Updated booking settings:', updated)
          return updated
        })
        break
      case 'notifications':
        setNotificationSettings(prev => ({ ...prev, [setting]: value }))
        break
      case 'security':
        setSecuritySettings(prev => ({ ...prev, [setting]: value }))
        break
      case 'payment':
        setPaymentSettings(prev => ({ ...prev, [setting]: value }))
        break
    }
  }

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template)
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      type: template.type
    })
    onEditTemplateOpen()
  }

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      console.log('Saving template:', templateForm)
      // Here you would update the template in your backend
      setHasUnsavedChanges(true)
      onEditTemplateClose()
    }
  }

  const handleDeleteTemplate = (templateId: string) => {
    console.log('Deleting template:', templateId)
    // Here you would delete the template from your backend
    setHasUnsavedChanges(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">Configure platform settings and preferences</p>
      </div>

      {/* Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-3">
          {hasUnsavedChanges && (
            <Chip color="warning" variant="flat">
              Unsaved Changes
            </Chip>
          )}
          <Button 
            variant="flat"
            onPress={onOpen}
            startContent={<RefreshCw className="w-4 h-4" />}
          >
            Change Log
          </Button>
          <Button 
            color="primary"
            startContent={<Save className="w-4 h-4" />}
            isDisabled={!hasUnsavedChanges}
            onPress={() => handleSaveSettings(selectedTab)}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
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
          <Tab key="general" title="General" />
          <Tab key="booking" title="Booking" />
          <Tab key="payment" title="Payment" />
          <Tab key="notifications" title="Notifications" />
          <Tab key="security" title="Security" />
          <Tab key="content" title="Content" />
        </Tabs>
      </div>

      {/* General Settings */}
      {selectedTab === 'general' && (
        <div className="space-y-6">
          <Card className="shadow-sm border border-gray-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Platform Configuration</h3>
                <Settings className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Site Name"
                  value={platformSettings.siteName}
                  onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                />
                
                <Input
                  label="Contact Email"
                  type="email"
                  value={platformSettings.contactEmail}
                  onChange={(e) => handleSettingChange('general', 'contactEmail', e.target.value)}
                />
                
                <Input
                  label="Support Email"
                  type="email"
                  value={platformSettings.supportEmail}
                  onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
                />
                
                <Select
                  label="Default Language"
                  selectedKeys={[platformSettings.defaultLanguage]}
                  onSelectionChange={(keys) => handleSettingChange('general', 'defaultLanguage', Array.from(keys)[0])}
                >
                  <SelectItem key="en" value="en">English</SelectItem>
                  <SelectItem key="es" value="es">Spanish</SelectItem>
                  <SelectItem key="fr" value="fr">French</SelectItem>
                  <SelectItem key="de" value="de">German</SelectItem>
                </Select>
                
                <Select
                  label="Timezone"
                  selectedKeys={[platformSettings.timezone]}
                  onSelectionChange={(keys) => handleSettingChange('general', 'timezone', Array.from(keys)[0])}
                >
                  <SelectItem key="UTC" value="UTC">UTC</SelectItem>
                  <SelectItem key="EST" value="EST">Eastern Time</SelectItem>
                  <SelectItem key="PST" value="PST">Pacific Time</SelectItem>
                  <SelectItem key="GMT" value="GMT">GMT</SelectItem>
                </Select>
                
                <div className="md:col-span-2">
                  <Textarea
                    label="Site Description"
                    value={platformSettings.siteDescription}
                    onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                    minRows={3}
                  />
                </div>
              </div>
              
              <Divider className="my-6" />
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">System Status</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Maintenance Mode</div>
                    <div className="text-sm text-gray-600">Temporarily disable public access</div>
                  </div>
                  <Switch
                    isSelected={platformSettings.maintenanceMode}
                    onValueChange={(value) => handleSettingChange('general', 'maintenanceMode', value)}
                    color="danger"
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-danger-500",
                      thumb: "group-data-[selected=true]:bg-white"
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">User Registration</div>
                    <div className="text-sm text-gray-600">Allow new users to register</div>
                  </div>
                  <Switch
                    isSelected={platformSettings.registrationEnabled}
                    onValueChange={(value) => handleSettingChange('general', 'registrationEnabled', value)}
                    color="success"
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-success-500",
                      thumb: "group-data-[selected=true]:bg-white"
                    }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-sm border border-gray-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">File Upload Settings</h3>
                <ImageIcon className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum File Size (MB)
                  </label>
                  <Slider
                    value={[platformSettings.maxFileSize]}
                    onValueChange={(value) => {
                      console.log('File size slider changed:', value)
                      const newValue = Array.isArray(value) ? value[0] : value
                      handleSettingChange('general', 'maxFileSize', newValue)
                    }}
                    onChange={(value) => {
                      console.log('File size slider onChange:', value)
                      const newValue = Array.isArray(value) ? value[0] : value
                      handleSettingChange('general', 'maxFileSize', newValue)
                    }}
                    maxValue={50}
                    minValue={1}
                    step={1}
                    className="max-w-md w-full"
                    showTooltip={true}
                    color="primary"
                    aria-label="Maximum file size in megabytes"
                    size="md"
                    radius="full"
                    marks={[
                      { value: 1, label: "1MB" },
                      { value: 25, label: "25MB" },
                      { value: 50, label: "50MB" }
                    ]}
                  />
                  <div className="text-sm text-gray-600 mt-2 text-center">
                    Current: {platformSettings.maxFileSize} MB
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed Image Formats
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {['jpg', 'jpeg', 'png', 'webp', 'svg'].map((format, index) => {
                      const isSelected = platformSettings.allowedImageFormats.includes(format)
                      const colors = [
                        'from-blue-500 to-blue-600',
                        'from-green-500 to-green-600', 
                        'from-purple-500 to-purple-600',
                        'from-orange-500 to-orange-600',
                        'from-pink-500 to-pink-600'
                      ]
                      return (
                        <Chip
                          key={format}
                          variant="flat"
                          className={`cursor-pointer transition-all duration-300 transform hover:scale-105 font-semibold px-4 py-2 ${
                            isSelected 
                              ? `bg-gradient-to-r ${colors[index]} text-white shadow-lg hover:shadow-xl border-0` 
                              : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 hover:text-gray-900 border border-gray-300'
                          }`}
                          onClick={() => {
                            const newFormats = platformSettings.allowedImageFormats.includes(format)
                              ? platformSettings.allowedImageFormats.filter(f => f !== format)
                              : [...platformSettings.allowedImageFormats, format]
                            handleSettingChange('general', 'allowedImageFormats', newFormats)
                          }}
                          aria-label={`${isSelected ? 'Disable' : 'Enable'} ${format.toUpperCase()} format`}
                          size="lg"
                        >
                          <span className="font-bold text-sm">{format.toUpperCase()}</span>
                        </Chip>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Booking Settings */}
      {selectedTab === 'booking' && (
        <div className="space-y-6">
          <Card className="shadow-sm border border-gray-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Booking Configuration</h3>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Rate (%)
                  </label>
                  <Slider
                    value={[bookingSettings.commissionRate]}
                    onValueChange={(value) => {
                      console.log('Commission rate slider changed:', value)
                      const newValue = Array.isArray(value) ? value[0] : value
                      handleSettingChange('booking', 'commissionRate', newValue)
                    }}
                    onChange={(value) => {
                      console.log('Commission rate slider onChange:', value)
                      const newValue = Array.isArray(value) ? value[0] : value
                      handleSettingChange('booking', 'commissionRate', newValue)
                    }}
                    maxValue={20}
                    minValue={0}
                    step={0.5}
                    className="w-full"
                    showTooltip={true}
                    color="success"
                    aria-label="Commission rate percentage"
                    size="md"
                    radius="full"
                    marks={[
                      { value: 0, label: "0%" },
                      { value: 10, label: "10%" },
                      { value: 20, label: "20%" }
                    ]}
                  />
                  <div className="text-sm text-gray-600 mt-2 text-center">
                    Current: {bookingSettings.commissionRate}%
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Processing Fee (%)
                  </label>
                  <Slider
                    value={[bookingSettings.paymentProcessingFee]}
                    onValueChange={(value) => {
                      console.log('Payment fee slider changed:', value)
                      const newValue = Array.isArray(value) ? value[0] : value
                      handleSettingChange('booking', 'paymentProcessingFee', newValue)
                    }}
                    onChange={(value) => {
                      console.log('Payment fee slider onChange:', value)
                      const newValue = Array.isArray(value) ? value[0] : value
                      handleSettingChange('booking', 'paymentProcessingFee', newValue)
                    }}
                    maxValue={5}
                    minValue={0}
                    step={0.1}
                    className="w-full"
                    showTooltip={true}
                    color="warning"
                    aria-label="Payment processing fee percentage"
                    size="md"
                    radius="full"
                    marks={[
                      { value: 0, label: "0%" },
                      { value: 2.5, label: "2.5%" },
                      { value: 5, label: "5%" }
                    ]}
                  />
                  <div className="text-sm text-gray-600 mt-2 text-center">
                    Current: {bookingSettings.paymentProcessingFee}%
                  </div>
                </div>
                
                <Input
                  label="Maximum Advance Booking (days)"
                  type="number"
                  value={bookingSettings.maxAdvanceBooking.toString()}
                  onChange={(e) => handleSettingChange('booking', 'maxAdvanceBooking', parseInt(e.target.value))}
                />
                
                <Input
                  label="Minimum Advance Booking (days)"
                  type="number"
                  value={bookingSettings.minAdvanceBooking.toString()}
                  onChange={(e) => handleSettingChange('booking', 'minAdvanceBooking', parseInt(e.target.value))}
                />
                
                <Input
                  label="Cancellation Grace Period (hours)"
                  type="number"
                  value={bookingSettings.cancellationGracePeriod.toString()}
                  onChange={(e) => handleSettingChange('booking', 'cancellationGracePeriod', parseInt(e.target.value))}
                />
                
                <Input
                  label="Host Payout Delay (days)"
                  type="number"
                  value={bookingSettings.hostPayoutDelay.toString()}
                  onChange={(e) => handleSettingChange('booking', 'hostPayoutDelay', parseInt(e.target.value))}
                />
                
                <Input
                  label="Minimum Stay (nights)"
                  type="number"
                  value={bookingSettings.minimumStay.toString()}
                  onChange={(e) => handleSettingChange('booking', 'minimumStay', parseInt(e.target.value))}
                />
                
                <Input
                  label="Maximum Stay (nights)"
                  type="number"
                  value={bookingSettings.maximumStay.toString()}
                  onChange={(e) => handleSettingChange('booking', 'maximumStay', parseInt(e.target.value))}
                />
              </div>
              
              <Divider className="my-6" />
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Booking Features</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Auto-Approval</div>
                    <div className="text-sm text-gray-600">Automatically approve eligible bookings</div>
                  </div>
                  <Switch
                    isSelected={bookingSettings.autoApprovalEnabled}
                    onValueChange={(value) => handleSettingChange('booking', 'autoApprovalEnabled', value)}
                    color="success"
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-success-500",
                      thumb: "group-data-[selected=true]:bg-white"
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Instant Booking</div>
                    <div className="text-sm text-gray-600">Allow guests to book instantly without host approval</div>
                  </div>
                  <Switch
                    isSelected={bookingSettings.instantBookingEnabled}
                    onValueChange={(value) => handleSettingChange('booking', 'instantBookingEnabled', value)}
                    color="primary"
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-primary-500",
                      thumb: "group-data-[selected=true]:bg-white"
                    }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Payment Settings */}
      {selectedTab === 'payment' && (
        <div className="space-y-6">
          <Card className="shadow-sm border border-gray-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Payment Gateway Configuration</h3>
                <DollarSign className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Stripe Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Stripe Public Key"
                      value={paymentSettings.stripePublicKey}
                      onChange={(e) => handleSettingChange('payment', 'stripePublicKey', e.target.value)}
                    />
                    <Input
                      label="Stripe Secret Key"
                      type={showPasswords ? 'text' : 'password'}
                      value={paymentSettings.stripeSecretKey}
                      onChange={(e) => handleSettingChange('payment', 'stripeSecretKey', e.target.value)}
                      endContent={
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          onPress={() => setShowPasswords(!showPasswords)}
                          aria-label={showPasswords ? "Hide password" : "Show password"}
                        >
                          {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      }
                    />
                  </div>
                </div>
                
                <Divider />
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">PayPal Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="PayPal Client ID"
                      type={showPasswords ? 'text' : 'password'}
                      value={paymentSettings.paypalClientId}
                      onChange={(e) => handleSettingChange('payment', 'paypalClientId', e.target.value)}
                    />
                    <Input
                      label="PayPal Client Secret"
                      type={showPasswords ? 'text' : 'password'}
                      value={paymentSettings.paypalClientSecret}
                      onChange={(e) => handleSettingChange('payment', 'paypalClientSecret', e.target.value)}
                    />
                  </div>
                </div>
                
                <Divider />
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Currency & Payout Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Default Currency"
                      selectedKeys={[paymentSettings.defaultCurrency]}
                      onSelectionChange={(keys) => handleSettingChange('payment', 'defaultCurrency', Array.from(keys)[0])}
                    >
                      <SelectItem key="USD" value="USD">USD - US Dollar</SelectItem>
                      <SelectItem key="EUR" value="EUR">EUR - Euro</SelectItem>
                      <SelectItem key="GBP" value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem key="CAD" value="CAD">CAD - Canadian Dollar</SelectItem>
                    </Select>
                    
                    <Select
                      label="Payout Schedule"
                      selectedKeys={[paymentSettings.payoutSchedule]}
                      onSelectionChange={(keys) => handleSettingChange('payment', 'payoutSchedule', Array.from(keys)[0])}
                    >
                      <SelectItem key="daily" value="daily">Daily</SelectItem>
                      <SelectItem key="weekly" value="weekly">Weekly</SelectItem>
                      <SelectItem key="monthly" value="monthly">Monthly</SelectItem>
                    </Select>
                    
                    <Input
                      label="Minimum Payout Amount"
                      type="number"
                      value={paymentSettings.minimumPayoutAmount.toString()}
                      onChange={(e) => handleSettingChange('payment', 'minimumPayoutAmount', parseFloat(e.target.value))}
                      startContent={<DollarSign className="w-4 h-4" />}
                    />
                    
                    <Input
                      label="Tax Rate (%)"
                      type="number"
                      value={paymentSettings.taxRate.toString()}
                      onChange={(e) => handleSettingChange('payment', 'taxRate', parseFloat(e.target.value))}
                      step="0.1"
                    />
                  </div>
                </div>
                
                <Divider />
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Payment Features</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Auto-Payout</div>
                      <div className="text-sm text-gray-600">Automatically process host payouts</div>
                    </div>
                    <Switch
                      isSelected={paymentSettings.autoPayoutEnabled}
                      onValueChange={(value) => handleSettingChange('payment', 'autoPayoutEnabled', value)}
                      color="success"
                      classNames={{
                        wrapper: "group-data-[selected=true]:bg-success-500",
                        thumb: "group-data-[selected=true]:bg-white"
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Charge Taxes</div>
                      <div className="text-sm text-gray-600">Automatically calculate and charge taxes</div>
                    </div>
                    <Switch
                      isSelected={paymentSettings.chargeTaxes}
                      onValueChange={(value) => handleSettingChange('payment', 'chargeTaxes', value)}
                      color="primary"
                      classNames={{
                        wrapper: "group-data-[selected=true]:bg-primary-500",
                        thumb: "group-data-[selected=true]:bg-white"
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Notifications Settings */}
      {selectedTab === 'notifications' && (
        <div className="space-y-6">
          <Card className="shadow-sm border border-gray-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                <Bell className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Notification Channels</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Email Notifications</div>
                        <div className="text-sm text-gray-600">Send notifications via email</div>
                      </div>
                      <Switch
                        isSelected={notificationSettings.emailNotifications}
                        onValueChange={(value) => handleSettingChange('notifications', 'emailNotifications', value)}
                        color="primary"
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-primary-500",
                          thumb: "group-data-[selected=true]:bg-white"
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">SMS Notifications</div>
                        <div className="text-sm text-gray-600">Send notifications via SMS</div>
                      </div>
                      <Switch
                        isSelected={notificationSettings.smsNotifications}
                        onValueChange={(value) => handleSettingChange('notifications', 'smsNotifications', value)}
                        color="success"
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-success-500",
                          thumb: "group-data-[selected=true]:bg-white"
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Push Notifications</div>
                        <div className="text-sm text-gray-600">Send browser push notifications</div>
                      </div>
                      <Switch
                        isSelected={notificationSettings.pushNotifications}
                        onValueChange={(value) => handleSettingChange('notifications', 'pushNotifications', value)}
                        color="warning"
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-warning-500",
                          thumb: "group-data-[selected=true]:bg-white"
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <Divider />
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Notification Types</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'bookingConfirmations', label: 'Booking Confirmations', desc: 'New booking notifications' },
                      { key: 'paymentNotifications', label: 'Payment Notifications', desc: 'Payment success/failure alerts' },
                      { key: 'disputeAlerts', label: 'Dispute Alerts', desc: 'Dispute and issue notifications' },
                      { key: 'systemAlerts', label: 'System Alerts', desc: 'System maintenance and updates' },
                      { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Promotional and marketing content' },
                      { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Weekly platform statistics' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{item.label}</div>
                          <div className="text-sm text-gray-600">{item.desc}</div>
                        </div>
                        <Switch
                          isSelected={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                          onValueChange={(value) => handleSettingChange('notifications', item.key, value)}
                          size="sm"
                          color="primary"
                          classNames={{
                            wrapper: "group-data-[selected=true]:bg-primary-500",
                            thumb: "group-data-[selected=true]:bg-white"
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Email Templates */}
          <Card className="shadow-sm border border-gray-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Email Templates</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    color="primary"
                    onPress={onTemplateOpen}
                    startContent={<Plus className="w-4 h-4" />}
                  >
                    New Template
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                {mockNotificationTemplates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <Chip size="sm" variant="flat" color={template.enabled ? 'success' : 'default'}>
                          {template.enabled ? 'Active' : 'Inactive'}
                        </Chip>
                        <Chip size="sm" variant="flat">
                          {template.type.toUpperCase()}
                        </Chip>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">Last modified: {template.lastModified}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        isIconOnly 
                        size="sm" 
                        variant="flat" 
                        color="primary"
                        aria-label="Edit template"
                        onPress={() => handleEditTemplate(template)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        isIconOnly 
                        size="sm" 
                        variant="flat" 
                        color="danger" 
                        aria-label="Delete template"
                        onPress={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Security Settings */}
      {selectedTab === 'security' && (
        <div className="space-y-6">
          <Card className="shadow-sm border border-gray-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Security Configuration</h3>
                <Shield className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Authentication Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Minimum Password Length"
                      type="number"
                      value={securitySettings.passwordMinLength.toString()}
                      onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                    />
                    
                    <Input
                      label="Session Timeout (minutes)"
                      type="number"
                      value={securitySettings.sessionTimeout.toString()}
                      onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    />
                    
                    <Input
                      label="Max Login Attempts"
                      type="number"
                      value={securitySettings.maxLoginAttempts.toString()}
                      onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    />
                    
                    <Input
                      label="API Rate Limit (per hour)"
                      type="number"
                      value={securitySettings.apiRateLimit.toString()}
                      onChange={(e) => handleSettingChange('security', 'apiRateLimit', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <Divider />
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Security Features</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Two-Factor Authentication Required</div>
                        <div className="text-sm text-gray-600">Require 2FA for all admin accounts</div>
                      </div>
                      <Switch
                        isSelected={securitySettings.twoFactorRequired}
                        onValueChange={(value) => handleSettingChange('security', 'twoFactorRequired', value)}
                        color="success"
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-success-500",
                          thumb: "group-data-[selected=true]:bg-white"
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Require Special Characters</div>
                        <div className="text-sm text-gray-600">Passwords must contain special characters</div>
                      </div>
                      <Switch
                        isSelected={securitySettings.passwordRequireSpecialChars}
                        onValueChange={(value) => handleSettingChange('security', 'passwordRequireSpecialChars', value)}
                        color="primary"
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-primary-500",
                          thumb: "group-data-[selected=true]:bg-white"
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Enable Audit Log</div>
                        <div className="text-sm text-gray-600">Log all admin actions and changes</div>
                      </div>
                      <Switch
                        isSelected={securitySettings.enableAuditLog}
                        onValueChange={(value) => handleSettingChange('security', 'enableAuditLog', value)}
                        color="warning"
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-warning-500",
                          thumb: "group-data-[selected=true]:bg-white"
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Encrypt User Data</div>
                        <div className="text-sm text-gray-600">Encrypt sensitive user information</div>
                      </div>
                      <Switch
                        isSelected={securitySettings.encryptUserData}
                        onValueChange={(value) => handleSettingChange('security', 'encryptUserData', value)}
                        color="success"
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-success-500",
                          thumb: "group-data-[selected=true]:bg-white"
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <Divider />
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Access Control</h4>
                  <div className="space-y-4">
                    <Textarea
                      label="IP Whitelist"
                      placeholder="Enter IP addresses (one per line)"
                      value={securitySettings.ipWhitelist}
                      onChange={(e) => handleSettingChange('security', 'ipWhitelist', e.target.value)}
                      minRows={3}
                      description="Restrict admin access to specific IP addresses"
                    />
                    
                    <Input
                      label="Data Retention Period (days)"
                      type="number"
                      value={securitySettings.dataRetentionPeriod.toString()}
                      onChange={(e) => handleSettingChange('security', 'dataRetentionPeriod', parseInt(e.target.value))}
                      description="How long to keep user data after account deletion"
                    />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Content Settings */}
      {selectedTab === 'content' && (
        <div className="space-y-6">
          <Card className="shadow-sm border border-gray-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Content Management</h3>
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-6">
                <Textarea
                  label="Terms of Service"
                  placeholder="Enter terms of service content..."
                  minRows={6}
                  description="Legal terms and conditions for platform use"
                />
                
                <Textarea
                  label="Privacy Policy"
                  placeholder="Enter privacy policy content..."
                  minRows={6}
                  description="Privacy policy and data handling practices"
                />
                
                <Textarea
                  label="Host Guidelines"
                  placeholder="Enter host guidelines..."
                  minRows={4}
                  description="Guidelines and rules for property hosts"
                />
                
                <Textarea
                  label="Guest Guidelines"
                  placeholder="Enter guest guidelines..."
                  minRows={4}
                  description="Guidelines and rules for guests"
                />
                
                <Textarea
                  label="Cancellation Policy"
                  placeholder="Enter cancellation policy..."
                  minRows={4}
                  description="Default cancellation policy text"
                />
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button
          variant="flat"
          onPress={() => handleResetSettings(selectedTab)}
          startContent={<RotateCcw className="w-4 h-4" />}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0"
          size="lg"
        >
          Reset to Default
        </Button>
        
        <div className="flex gap-4">
          <Button
            variant="flat"
            onPress={() => console.log('Test configuration')}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0"
            size="lg"
          >
            Test Configuration
          </Button>
          <Button
            color="primary"
            onPress={() => handleSaveSettings(selectedTab)}
            isDisabled={!hasUnsavedChanges}
            startContent={<Save className="w-4 h-4" />}
            className={`font-semibold px-6 py-3 shadow-lg hover:shadow-xl transform transition-all duration-200 ${
              hasUnsavedChanges 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:scale-105' 
                : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed'
            }`}
            size="lg"
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Change Log Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalContent>
          <ModalHeader>
            Settings Change Log
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {mockSettingChanges.map((change) => (
                <div key={change.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{change.setting}</h4>
                        <Chip size="sm" variant="flat" color="primary">
                          {change.category}
                        </Chip>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          <span className="font-medium">From:</span> {change.oldValue}
                        </div>
                        <div>
                          <span className="font-medium">To:</span> {change.newValue}
                        </div>
                        <div>
                          <span className="font-medium">Changed by:</span> {change.changedBy}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {change.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Close
            </Button>
            <Button color="primary" startContent={<Download className="w-4 h-4" />}>
              Export Log
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Template Modal */}
      <Modal isOpen={isTemplateOpen} onClose={onTemplateClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            Create Email Template
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Template Name"
                placeholder="Enter template name"
              />
              
              <Input
                label="Subject Line"
                placeholder="Enter email subject"
              />
              
              <Select
                label="Template Type"
                placeholder="Select template type"
              >
                <SelectItem key="email" value="email">Email</SelectItem>
                <SelectItem key="sms" value="sms">SMS</SelectItem>
                <SelectItem key="push" value="push">Push Notification</SelectItem>
              </Select>
              
              <Textarea
                label="Template Content"
                placeholder="Enter template content with variables like {{name}}, {{property}}, etc."
                minRows={6}
              />
              
              <div className="flex items-center gap-2">
                <Switch 
                  size="sm" 
                  color="success"
                  classNames={{
                    wrapper: "group-data-[selected=true]:bg-success-500",
                    thumb: "group-data-[selected=true]:bg-white"
                  }}
                  aria-label="Enable template immediately"
                />
                <label className="text-sm text-gray-700">Enable template immediately</label>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onTemplateClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={onTemplateClose}>
              Create Template
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Template Modal */}
      <Modal isOpen={isEditTemplateOpen} onClose={onEditTemplateClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            Edit Template: {editingTemplate?.name}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Template Name"
                value={templateForm.name}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
              />
              
              <Input
                label="Subject Line"
                value={templateForm.subject}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter email subject"
              />
              
              <Select
                label="Template Type"
                selectedKeys={[templateForm.type]}
                onSelectionChange={(keys) => setTemplateForm(prev => ({ ...prev, type: Array.from(keys)[0] as 'email' | 'sms' | 'push' }))}
              >
                <SelectItem key="email" value="email">Email</SelectItem>
                <SelectItem key="sms" value="sms">SMS</SelectItem>
                <SelectItem key="push" value="push">Push Notification</SelectItem>
              </Select>
              
              <Textarea
                label="Template Content"
                placeholder="Enter template content with variables like {{name}}, {{property}}, etc."
                minRows={6}
                description="Use {{variable}} syntax for dynamic content"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onEditTemplateClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSaveTemplate}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
} 