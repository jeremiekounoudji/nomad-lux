import React, { useState, useCallback } from 'react'
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
  Badge,
  Spinner
} from '@heroui/react'
import { toast } from 'react-hot-toast'
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
import { useAdminSettings } from '../../../hooks/useAdminSettings'
import { 
  PlatformSettings, 
  BookingSettings, 
  NotificationSettings, 
  SecuritySettings, 
  PaymentSettings 
} from '../../../interfaces/Settings'
import { useTranslation } from '../../../lib/stores/translationStore'

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
  const { t } = useTranslation(['admin', 'common', 'notifications'])
  const [selectedTab, setSelectedTab] = useState('general')
  const [showPasswords, setShowPasswords] = useState(false)
  
  // Use the admin settings hook
  const {
    settings,
    isLoading,
    error,
    hasUnsavedChanges,
    saveAllChanges,
    resetDrafts,
    updatePlatformSettings,
    updateBookingSettings,
    updateNotificationSettings,
    updateSecuritySettings,
    updatePaymentSettings
  } = useAdminSettings()

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

  console.log('🔧 SystemSettings rendered with:', {
    hasSettings: !!settings,
    selectedTab,
    isLoading,
    error,
    hasUnsavedChanges
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

  const handleSaveSettings = async () => {
    try {
      console.log('💾 Saving all settings changes')
      await saveAllChanges()
      toast.success(t('admin.messages.settingsUpdated', { defaultValue: 'Settings updated successfully' }))
      console.log('✅ Settings saved successfully')
    } catch (error) {
      console.error('❌ Failed to save settings:', error)
      toast.error(t('common.messages.failed', { defaultValue: 'Failed to save settings. Please try again.' }))
    }
  }

  const handleResetSettings = () => {
    console.log('🔄 Resetting all settings to original values')
    resetDrafts()
  }

    // Handle platform settings changes
  const handlePlatformSettingChange = useCallback(async (setting: string, value: any) => {
    console.log('🔧 Platform setting change:', { setting, value })
    try {
      updatePlatformSettings({ [setting]: value })
    } catch (error) {
      console.error('❌ Failed to update platform setting:', error)
    }
  }, [updatePlatformSettings])

  // Handle booking settings changes
  const handleBookingSettingChange = useCallback(async (setting: string, value: any) => {
    console.log('📅 Booking setting change:', { setting, value })
    try {
      updateBookingSettings({ [setting]: value })
    } catch (error) {
      console.error('❌ Failed to update booking setting:', error)
    }
  }, [updateBookingSettings])

  // Handle notification settings changes
  const handleNotificationSettingChange = useCallback(async (setting: string, value: any) => {
    console.log('🔔 Notification setting change:', { setting, value })
    try {
      updateNotificationSettings({ [setting]: value })
    } catch (error) {
      console.error('❌ Failed to update notification setting:', error)
    }
  }, [updateNotificationSettings])

  // Handle security settings changes
  const handleSecuritySettingChange = useCallback(async (setting: string, value: any) => {
    console.log('🛡️ Security setting change:', { setting, value })
    try {
      updateSecuritySettings({ [setting]: value })
    } catch (error) {
      console.error('❌ Failed to update security setting:', error)
    }
  }, [updateSecuritySettings])

  // Handle payment settings changes
  const handlePaymentSettingChange = useCallback(async (setting: string, value: any) => {
    console.log('💳 Payment setting change:', { setting, value })
    try {
      updatePaymentSettings({ [setting]: value })
    } catch (error) {
      console.error('❌ Failed to update payment setting:', error)
    }
  }, [updatePaymentSettings])

  // Slider onChange handlers with useCallback to prevent ref warnings
  const handleFileSizeChange = useCallback((value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : value
    handlePlatformSettingChange('maxFileSize', newValue)
  }, [handlePlatformSettingChange])

  const handleCommissionRateChange = useCallback((value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : value
    handleBookingSettingChange('commissionRate', newValue)
  }, [handleBookingSettingChange])

  const handlePaymentFeeChange = useCallback((value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : value
    handleBookingSettingChange('paymentProcessingFee', newValue)
  }, [handleBookingSettingChange])

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
      onEditTemplateClose()
    }
  }

  const handleDeleteTemplate = (templateId: string) => {
    console.log('Deleting template:', templateId)
    // Here you would delete the template from your backend
  }

  const handleClearCache = async () => {
    try {
      console.log('🗑️ Cache clearing is temporarily disabled')
      toast.info('Cache clearing is temporarily disabled')
    } catch (error) {
      console.error('❌ Error:', error)
      toast.error('Operation failed')
    }
  }

  const handleClearAllCache = async () => {
    try {
      console.log('🗑️ Cache clearing is temporarily disabled')
      toast.info('Cache clearing is temporarily disabled')
    } catch (error) {
      console.error('❌ Error:', error)
      toast.error('Operation failed')
    }
  }

  const handleForceRefresh = () => {
    try {
      console.log('🔄 Force refresh is temporarily disabled')
      toast.info('Force refresh is temporarily disabled')
    } catch (error) {
      console.error('❌ Error:', error)
      toast.error('Operation failed')
    }
  }

  const handleCheckCacheHealth = () => {
    try {
      console.log('🔍 Cache health check is temporarily disabled')
      toast.info('Cache health check is temporarily disabled')
    } catch (error) {
      console.error('❌ Error:', error)
      toast.error('Operation failed')
    }
  }

  // Show loading spinner if settings are not loaded yet
  if (isLoading && !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" color="primary" />
        <span className="ml-3">{t('admin.messages.loadingSettings', { defaultValue: 'Loading admin settings...' })}</span>
      </div>
    )
  }

  // Show error if settings failed to load
  if (error && !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{t('admin.messages.settingsLoadFailed', { defaultValue: 'Failed to load admin settings' })}</p>
          <p className="text-gray-600 text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  // Default to empty settings if not loaded yet
  const platformSettings = settings?.platform || {} as PlatformSettings
  const bookingSettings = settings?.booking || {} as BookingSettings
  const notificationSettings = settings?.notification || {} as NotificationSettings
  const securitySettings = settings?.security || {} as SecuritySettings
  const paymentSettings = settings?.payment || {} as PaymentSettings

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.settings.generalSettings', { defaultValue: 'System Settings' })}</h1>
        <p className="text-gray-600 mt-1">{t('admin.messages.settingsUpdated', { defaultValue: 'Configure platform settings and preferences' })}</p>
      </div>

      {/* Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-3">
          {hasUnsavedChanges && (
            <Chip color="warning" variant="flat">
              {t('common.messages.unsavedChanges', { defaultValue: 'Unsaved Changes' })}
            </Chip>
          )}
          <Button 
            variant="flat"
            onPress={onOpen}
            startContent={<RefreshCw className="w-4 h-4" />}
          >
            {t('admin.reports.generateReport', { defaultValue: 'Change Log' })}
          </Button>
          <Button 
            color="primary"
            startContent={!isLoading ? <Save className="w-4 h-4" /> : undefined}
            isDisabled={!hasUnsavedChanges || isLoading}
            isLoading={isLoading}
            onPress={() => handleSaveSettings()}
          >
            {t('common.actions.save', { defaultValue: 'Save Changes' })}
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
              <Tab key="general" title={t('admin.settings.generalSettings', { defaultValue: 'General' })} />
              <Tab key="booking" title={t('admin.settings.bookingSettings', { defaultValue: 'Booking' })} />
              <Tab key="payment" title={t('admin.settings.paymentSettings', { defaultValue: 'Payment' })} />
              <Tab key="notifications" title={t('admin.settings.notificationSettings', { defaultValue: 'Notifications' })} />
              <Tab key="security" title={t('admin.settings.securitySettings', { defaultValue: 'Security' })} />
              <Tab key="content" title={t('admin.settings.contentSettings', { defaultValue: 'Content' })} />
              <Tab key="cache" title={t('admin.settings.cacheManagement', { defaultValue: 'Cache Management' })} />
        </Tabs>
      </div>

      {/* General Settings */}
      {selectedTab === 'general' && (
        <div className="space-y-6">
          <Card className="shadow-sm border border-gray-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('admin.settings.generalSettings', { defaultValue: 'Platform Configuration' })}</h3>
                <Settings className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label={t('admin.settings.siteName', { defaultValue: 'Site Name' })}
                  value={platformSettings.siteName || ''}
                  onChange={(e) => handlePlatformSettingChange('siteName', e.target.value)}
                />
                
                <Input
                  label={t('admin.settings.contactEmail', { defaultValue: 'Contact Email' })}
                  type="email"
                  value={platformSettings.contactEmail || ''}
                  onChange={(e) => handlePlatformSettingChange('contactEmail', e.target.value)}
                />
                
                <Input
                  label={t('admin.settings.supportEmail', { defaultValue: 'Support Email' })}
                  type="email"
                  value={platformSettings.supportEmail || ''}
                  onChange={(e) => handlePlatformSettingChange('supportEmail', e.target.value)}
                />
                
                <Select
                  label={t('admin.settings.defaultLanguage', { defaultValue: 'Default Language' })}
                  selectedKeys={platformSettings.defaultLanguage ? [platformSettings.defaultLanguage] : []}
                  onSelectionChange={(keys) => handlePlatformSettingChange('defaultLanguage', Array.from(keys)[0])}
                >
                  <SelectItem key="en">{t('common.languages.en', { defaultValue: 'English' })}</SelectItem>
                  <SelectItem key="es">{t('common.languages.es', { defaultValue: 'Spanish' })}</SelectItem>
                  <SelectItem key="fr">{t('common.languages.fr', { defaultValue: 'French' })}</SelectItem>
                  <SelectItem key="de">{t('common.languages.de', { defaultValue: 'German' })}</SelectItem>
                </Select>
                
                <Select
                  label={t('admin.settings.timezone', { defaultValue: 'Timezone' })}
                  selectedKeys={platformSettings.timezone ? [platformSettings.timezone] : []}
                  onSelectionChange={(keys) => handlePlatformSettingChange('timezone', Array.from(keys)[0])}
                >
                  <SelectItem key="UTC">UTC</SelectItem>
                  <SelectItem key="EST">{t('common.time.zones.est', { defaultValue: 'Eastern Time' })}</SelectItem>
                  <SelectItem key="PST">{t('common.time.zones.pst', { defaultValue: 'Pacific Time' })}</SelectItem>
                  <SelectItem key="GMT">GMT</SelectItem>
                </Select>
                
                <div className="md:col-span-2">
                  <Textarea
                    label={t('admin.settings.siteDescription', { defaultValue: 'Site Description' })}
                    value={platformSettings.siteDescription || ''}
                    onChange={(e) => handlePlatformSettingChange('siteDescription', e.target.value)}
                    minRows={3}
                  />
                </div>
              </div>
              
              <Divider className="my-6" />
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">{t('admin.settings.systemStatus', { defaultValue: 'System Status' })}</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{t('admin.settings.maintenanceMode', { defaultValue: 'Maintenance Mode' })}</div>
                    <div className="text-sm text-gray-600">{t('admin.settings.maintenanceModeDesc', { defaultValue: 'Temporarily disable public access' })}</div>
                  </div>
                  <Switch
                    isSelected={platformSettings.maintenanceMode || false}
                    onValueChange={(value) => handlePlatformSettingChange('maintenanceMode', value)}
                    color="danger"
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-danger-500",
                      thumb: "group-data-[selected=true]:bg-white"
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{t('admin.settings.userRegistration', { defaultValue: 'User Registration' })}</div>
                    <div className="text-sm text-gray-600">{t('admin.settings.userRegistrationDesc', { defaultValue: 'Allow new users to register' })}</div>
                  </div>
                  <Switch
                    isSelected={platformSettings.registrationEnabled || false}
                    onValueChange={(value) => handlePlatformSettingChange('registrationEnabled', value)}
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
                <h3 className="text-lg font-semibold text-gray-900">{t('admin.settings.fileUpload', { defaultValue: 'File Upload Settings' })}</h3>
                <ImageIcon className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.maxFileSize', { defaultValue: 'Maximum File Size (MB)' })}</label>
                  <Slider
                    value={[platformSettings.maxFileSize || 10]}
                    onChange={handleFileSizeChange}
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
                  <div className="text-sm text-gray-600 mt-2 text-center">{t('admin.settings.currentValue', { defaultValue: 'Current: {{value}} MB', value: platformSettings.maxFileSize || 10 })}</div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.allowedImageFormats', { defaultValue: 'Allowed Image Formats' })}</label>
                  <div className="flex flex-wrap gap-3">
                    {['jpg', 'jpeg', 'png', 'webp', 'svg'].map((format, index) => {
                      const allowedFormats = platformSettings.allowedImageFormats || []
                      const isSelected = allowedFormats.includes(format)
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
                            const newFormats = allowedFormats.includes(format)
                              ? allowedFormats.filter(f => f !== format)
                              : [...allowedFormats, format]
                            handlePlatformSettingChange('allowedImageFormats', newFormats)
                          }}
                          aria-label={isSelected ? t('common.actions.disable', { defaultValue: 'Disable' }) + ' ' + format.toUpperCase() + ' ' + t('admin.settings.format', { defaultValue: 'format' }) : t('common.actions.enable', { defaultValue: 'Enable' }) + ' ' + format.toUpperCase() + ' ' + t('admin.settings.format', { defaultValue: 'format' })}
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
                <h3 className="text-lg font-semibold text-gray-900">{t('admin.settings.bookingSettings', { defaultValue: 'Booking Configuration' })}</h3>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.commissionRate', { defaultValue: 'Commission Rate (%)' })}</label>
                  <Slider
                    value={[bookingSettings.commissionRate || 10]}
                    onChange={handleCommissionRateChange}
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
                  <div className="text-sm text-gray-600 mt-2 text-center">{t('admin.settings.currentPercent', { defaultValue: 'Current: {{value}}%', value: bookingSettings.commissionRate || 10 })}</div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.settings.paymentProcessingFee', { defaultValue: 'Payment Processing Fee (%)' })}</label>
                  <Slider
                    value={[bookingSettings.paymentProcessingFee || 2.9]}
                    onChange={handlePaymentFeeChange}
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
                  <div className="text-sm text-gray-600 mt-2 text-center">{t('admin.settings.currentPercent', { defaultValue: 'Current: {{value}}%', value: bookingSettings.paymentProcessingFee || 2.9 })}</div>
                </div>
                
                <Input
                  label={t('admin.settings.maxAdvanceBooking', { defaultValue: 'Maximum Advance Booking (days)' })}
                  type="number"
                  value={bookingSettings.maxAdvanceBooking?.toString() || '365'}
                  onChange={(e) => handleBookingSettingChange('maxAdvanceBooking', parseInt(e.target.value))}
                />
                
                <Input
                  label={t('admin.settings.minAdvanceBooking', { defaultValue: 'Minimum Advance Booking (days)' })}
                  type="number"
                  value={bookingSettings.minAdvanceBooking?.toString() || '1'}
                  onChange={(e) => handleBookingSettingChange('minAdvanceBooking', parseInt(e.target.value))}
                />
                
                <Input
                  label={t('admin.settings.cancellationGrace', { defaultValue: 'Cancellation Grace Period (hours)' })}
                  type="number"
                  value={bookingSettings.cancellationGracePeriod?.toString() || '24'}
                  onChange={(e) => handleBookingSettingChange('cancellationGracePeriod', parseInt(e.target.value))}
                />
                

                
                <Input
                  label={t('admin.settings.minimumStay', { defaultValue: 'Minimum Stay (nights)' })}
                  type="number"
                  value={bookingSettings.minimumStay?.toString() || '1'}
                  onChange={(e) => handleBookingSettingChange('minimumStay', parseInt(e.target.value))}
                />
                
                <Input
                  label={t('admin.settings.maximumStay', { defaultValue: 'Maximum Stay (nights)' })}
                  type="number"
                  value={bookingSettings.maximumStay?.toString() || '30'}
                  onChange={(e) => handleBookingSettingChange('maximumStay', parseInt(e.target.value))}
                />
              </div>
              
              <Divider className="my-6" />
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">{t('admin.settings.bookingFeatures', { defaultValue: 'Booking Features' })}</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{t('admin.settings.autoApproval', { defaultValue: 'Auto-Approval' })}</div>
                    <div className="text-sm text-gray-600">{t('admin.settings.autoApprovalDesc', { defaultValue: 'Automatically approve eligible bookings' })}</div>
                  </div>
                  <Switch
                    isSelected={bookingSettings.autoApprovalEnabled || false}
                    onValueChange={(value) => handleBookingSettingChange('autoApprovalEnabled', value)}
                    color="success"
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-success-500",
                      thumb: "group-data-[selected=true]:bg-white"
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{t('admin.settings.instantBooking', { defaultValue: 'Instant Booking' })}</div>
                    <div className="text-sm text-gray-600">{t('admin.settings.instantBookingDesc', { defaultValue: 'Allow guests to book instantly without host approval' })}</div>
                  </div>
                  <Switch
                    isSelected={bookingSettings.instantBookingEnabled || false}
                    onValueChange={(value) => handleBookingSettingChange('instantBookingEnabled', value)}
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
                <h3 className="text-lg font-semibold text-gray-900">{t('admin.settings.paymentSettings', { defaultValue: 'Payment Gateway Configuration' })}</h3>
                <DollarSign className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">{t('admin.settings.stripe', { defaultValue: 'Stripe Configuration' })}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={t('admin.settings.stripePublicKey', { defaultValue: 'Stripe Public Key' })}
                      value={paymentSettings.stripePublicKey || ''}
                      onChange={(e) => handlePaymentSettingChange('stripePublicKey', e.target.value)}
                    />
                    <Input
                      label={t('admin.settings.stripeSecretKey', { defaultValue: 'Stripe Secret Key' })}
                      type={showPasswords ? 'text' : 'password'}
                      value={paymentSettings.stripeSecretKey || ''}
                      onChange={(e) => handlePaymentSettingChange('stripeSecretKey', e.target.value)}
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
                  <h4 className="font-semibold text-gray-900 mb-4">{t('admin.settings.paypal', { defaultValue: 'PayPal Configuration' })}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={t('admin.settings.paypalClientId', { defaultValue: 'PayPal Client ID' })}
                      type={showPasswords ? 'text' : 'password'}
                      value={paymentSettings.paypalClientId || ''}
                      onChange={(e) => handlePaymentSettingChange('paypalClientId', e.target.value)}
                    />
                    <Input
                      label={t('admin.settings.paypalClientSecret', { defaultValue: 'PayPal Client Secret' })}
                      type={showPasswords ? 'text' : 'password'}
                      value={paymentSettings.paypalClientSecret || ''}
                      onChange={(e) => handlePaymentSettingChange('paypalClientSecret', e.target.value)}
                    />
                  </div>
                </div>
                
                <Divider />
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">{t('admin.settings.currencyAndPayout', { defaultValue: 'Currency & Payout Settings' })}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label={t('admin.settings.defaultCurrency', { defaultValue: 'Default Currency' })}
                      selectedKeys={paymentSettings.defaultCurrency ? [paymentSettings.defaultCurrency] : []}
                      onSelectionChange={(keys) => handlePaymentSettingChange('defaultCurrency', Array.from(keys)[0])}
                    >
                      <SelectItem key="USD">USD - {t('wallet.currency.usd', { defaultValue: 'US Dollar' })}</SelectItem>
                      <SelectItem key="EUR">EUR - {t('wallet.currency.eur', { defaultValue: 'Euro' })}</SelectItem>
                      <SelectItem key="GBP">GBP - {t('wallet.currency.gbp', { defaultValue: 'British Pound' })}</SelectItem>
                      <SelectItem key="CAD">CAD - {t('wallet.currency.cad', { defaultValue: 'Canadian Dollar' })}</SelectItem>
                    </Select>
                    
                    <Select
                      label={t('admin.settings.payoutSchedule', { defaultValue: 'Payout Schedule' })}
                      selectedKeys={paymentSettings.payoutSchedule ? [paymentSettings.payoutSchedule] : []}
                      onSelectionChange={(keys) => handlePaymentSettingChange('payoutSchedule', Array.from(keys)[0])}
                    >
                      <SelectItem key="daily">{t('common.time.daily', { defaultValue: 'Daily' })}</SelectItem>
                      <SelectItem key="weekly">{t('common.time.weekly', { defaultValue: 'Weekly' })}</SelectItem>
                      <SelectItem key="monthly">{t('common.time.monthly', { defaultValue: 'Monthly' })}</SelectItem>
                    </Select>
                    
                    <Input
                      label={t('admin.settings.minimumPayout', { defaultValue: 'Minimum Payout Amount' })}
                      type="number"
                      value={paymentSettings.minimumPayoutAmount?.toString() || '50'}
                      onChange={(e) => handlePaymentSettingChange('minimumPayoutAmount', parseFloat(e.target.value))}
                      startContent={<DollarSign className="w-4 h-4" />}
                    />
                    
                    <Input
                      label={t('admin.settings.paymentHoldDays', { defaultValue: 'Payment Hold Days' })}
                      type="number"
                      value={paymentSettings.paymentHoldDays?.toString() || '1'}
                      onChange={(e) => handlePaymentSettingChange('paymentHoldDays', parseInt(e.target.value))}
                      description={t('admin.settings.paymentHoldDesc', { defaultValue: 'Days to hold payment before making it eligible for payout' })}
                    />
                    
                    <Input
                      label={t('admin.settings.taxRate', { defaultValue: 'Tax Rate (%)' })}
                      type="number"
                      value={paymentSettings.taxRate?.toString() || '0'}
                      onChange={(e) => handlePaymentSettingChange('taxRate', parseFloat(e.target.value))}
                      step="0.1"
                    />
                  </div>
                </div>
                
                <Divider />
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">{t('admin.settings.paymentFeatures', { defaultValue: 'Payment Features' })}</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium text-gray-900">{t('admin.settings.autoPayout', { defaultValue: 'Auto-Payout' })}</div>
                       <div className="text-sm text-gray-600">{t('admin.settings.autoPayoutDesc', { defaultValue: 'Automatically process host payouts' })}</div>
                    </div>
                    <Switch
                      isSelected={paymentSettings.autoPayoutEnabled || false}
                      onValueChange={(value) => handlePaymentSettingChange('autoPayoutEnabled', value)}
                      color="success"
                      classNames={{
                        wrapper: "group-data-[selected=true]:bg-success-500",
                        thumb: "group-data-[selected=true]:bg-white"
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium text-gray-900">{t('admin.settings.chargeTaxes', { defaultValue: 'Charge Taxes' })}</div>
                       <div className="text-sm text-gray-600">{t('admin.settings.chargeTaxesDesc', { defaultValue: 'Automatically calculate and charge taxes' })}</div>
                    </div>
                    <Switch
                      isSelected={paymentSettings.chargeTaxes || false}
                      onValueChange={(value) => handlePaymentSettingChange('chargeTaxes', value)}
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
                <h3 className="text-lg font-semibold text-gray-900">{t('admin.settings.notificationSettings', { defaultValue: 'Notification Preferences' })}</h3>
                <Bell className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">{t('admin.settings.notificationChannels', { defaultValue: 'Notification Channels' })}</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{t('admin.settings.emailNotifications', { defaultValue: 'Email Notifications' })}</div>
                        <div className="text-sm text-gray-600">{t('admin.settings.emailNotificationsDesc', { defaultValue: 'Send notifications via email' })}</div>
                      </div>
                      <Switch
                        isSelected={notificationSettings.emailNotifications || false}
                        onValueChange={(value) => handleNotificationSettingChange('emailNotifications', value)}
                        color="primary"
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-primary-500",
                          thumb: "group-data-[selected=true]:bg-white"
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{t('admin.settings.smsNotifications', { defaultValue: 'SMS Notifications' })}</div>
                        <div className="text-sm text-gray-600">{t('admin.settings.smsNotificationsDesc', { defaultValue: 'Send notifications via SMS' })}</div>
                      </div>
                      <Switch
                        isSelected={notificationSettings.smsNotifications || false}
                        onValueChange={(value) => handleNotificationSettingChange('smsNotifications', value)}
                        color="success"
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-success-500",
                          thumb: "group-data-[selected=true]:bg-white"
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{t('admin.settings.pushNotifications', { defaultValue: 'Push Notifications' })}</div>
                        <div className="text-sm text-gray-600">{t('admin.settings.pushNotificationsDesc', { defaultValue: 'Send browser push notifications' })}</div>
                      </div>
                      <Switch
                        isSelected={notificationSettings.pushNotifications || false}
                        onValueChange={(value) => handleNotificationSettingChange('pushNotifications', value)}
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
                  <h4 className="font-semibold text-gray-900 mb-4">{t('admin.settings.notificationTypes', { defaultValue: 'Notification Types' })}</h4>
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
                          onValueChange={(value) => handleNotificationSettingChange(item.key, value)}
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
                <h3 className="text-lg font-semibold text-gray-900">{t('notifications.templates.title', { defaultValue: 'Email Templates' })}</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    color="primary"
                    onPress={onTemplateOpen}
                    startContent={<Plus className="w-4 h-4" />}
                  >
                    {t('notifications.templates.new', { defaultValue: 'New Template' })}
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
                          {template.enabled ? t('common.status.active') : t('common.status.inactive', { defaultValue: 'Inactive' })}
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
                         aria-label={t('common.actions.edit', { defaultValue: 'Edit template' })}
                        onPress={() => handleEditTemplate(template)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        isIconOnly 
                        size="sm" 
                        variant="flat" 
                        color="danger" 
                         aria-label={t('common.actions.delete', { defaultValue: 'Delete template' })}
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
                <h3 className="text-lg font-semibold text-gray-900">{t('admin.settings.securitySettings', { defaultValue: 'Security Configuration' })}</h3>
                <Shield className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">{t('admin.settings.authentication', { defaultValue: 'Authentication Settings' })}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={t('admin.settings.passwordMin', { defaultValue: 'Minimum Password Length' })}
                      type="number"
                      value={securitySettings.passwordMinLength?.toString() || '8'}
                      onChange={(e) => handleSecuritySettingChange('passwordMinLength', parseInt(e.target.value))}
                    />
                    
                    <Input
                      label={t('admin.settings.sessionTimeout', { defaultValue: 'Session Timeout (minutes)' })}
                      type="number"
                      value={securitySettings.sessionTimeout?.toString() || '60'}
                      onChange={(e) => handleSecuritySettingChange('sessionTimeout', parseInt(e.target.value))}
                    />
                    
                    <Input
                      label={t('admin.settings.maxLoginAttempts', { defaultValue: 'Max Login Attempts' })}
                      type="number"
                      value={securitySettings.maxLoginAttempts?.toString() || '5'}
                      onChange={(e) => handleSecuritySettingChange('maxLoginAttempts', parseInt(e.target.value))}
                    />
                    
                    <Input
                      label={t('admin.settings.apiRateLimit', { defaultValue: 'API Rate Limit (per hour)' })}
                      type="number"
                      value={securitySettings.apiRateLimit?.toString() || '1000'}
                      onChange={(e) => handleSecuritySettingChange('apiRateLimit', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <Divider />
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">{t('admin.settings.securityFeatures', { defaultValue: 'Security Features' })}</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{t('admin.settings.twoFactorRequired', { defaultValue: 'Two-Factor Authentication Required' })}</div>
                        <div className="text-sm text-gray-600">{t('admin.settings.twoFactorRequiredDesc', { defaultValue: 'Require 2FA for all admin accounts' })}</div>
                      </div>
                      <Switch
                        isSelected={securitySettings.twoFactorRequired || false}
                        onValueChange={(value) => handleSecuritySettingChange('twoFactorRequired', value)}
                        color="success"
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-success-500",
                          thumb: "group-data-[selected=true]:bg-white"
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{t('admin.settings.requireSpecialChars', { defaultValue: 'Require Special Characters' })}</div>
                        <div className="text-sm text-gray-600">{t('admin.settings.requireSpecialCharsDesc', { defaultValue: 'Passwords must contain special characters' })}</div>
                      </div>
                      <Switch
                        isSelected={securitySettings.passwordRequireSpecialChars || false}
                        onValueChange={(value) => handleSecuritySettingChange('passwordRequireSpecialChars', value)}
                        color="primary"
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-primary-500",
                          thumb: "group-data-[selected=true]:bg-white"
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{t('admin.settings.enableAuditLog', { defaultValue: 'Enable Audit Log' })}</div>
                        <div className="text-sm text-gray-600">{t('admin.settings.enableAuditLogDesc', { defaultValue: 'Log all admin actions and changes' })}</div>
                      </div>
                      <Switch
                        isSelected={securitySettings.enableAuditLog || false}
                        onValueChange={(value) => handleSecuritySettingChange('enableAuditLog', value)}
                        color="warning"
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-warning-500",
                          thumb: "group-data-[selected=true]:bg-white"
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{t('admin.settings.encryptUserData', { defaultValue: 'Encrypt User Data' })}</div>
                        <div className="text-sm text-gray-600">{t('admin.settings.encryptUserDataDesc', { defaultValue: 'Encrypt sensitive user information' })}</div>
                      </div>
                      <Switch
                        isSelected={securitySettings.encryptUserData || false}
                        onValueChange={(value) => handleSecuritySettingChange('encryptUserData', value)}
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
                  <h4 className="font-semibold text-gray-900 mb-4">{t('admin.settings.accessControl', { defaultValue: 'Access Control' })}</h4>
                  <div className="space-y-4">
                    <Textarea
                      label={t('admin.settings.ipWhitelist', { defaultValue: 'IP Whitelist' })}
                      placeholder={t('admin.settings.ipWhitelistPlaceholder', { defaultValue: 'Enter IP addresses (one per line)' })}
                      value={securitySettings.ipWhitelist || ''}
                      onChange={(e) => handleSecuritySettingChange('ipWhitelist', e.target.value)}
                      minRows={3}
                      description={t('admin.settings.ipWhitelistDesc', { defaultValue: 'Restrict admin access to specific IP addresses' })}
                    />
                    
                    <Input
                      label={t('admin.settings.dataRetention', { defaultValue: 'Data Retention Period (days)' })}
                      type="number"
                      value={securitySettings.dataRetentionPeriod?.toString() || '30'}
                      onChange={(e) => handleSecuritySettingChange('dataRetentionPeriod', parseInt(e.target.value))}
                      description={t('admin.settings.dataRetentionDesc', { defaultValue: 'How long to keep user data after account deletion' })}
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
                <h3 className="text-lg font-semibold text-gray-900">{t('admin.settings.contentSettings', { defaultValue: 'Content Management' })}</h3>
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-6">
                <Textarea
                  label={t('admin.settings.termsOfService', { defaultValue: 'Terms of Service' })}
                  placeholder={t('admin.settings.termsPlaceholder', { defaultValue: 'Enter terms of service content...' })}
                  minRows={6}
                  description="Legal terms and conditions for platform use"
                />
                
                <Textarea
                  label={t('admin.settings.privacyPolicy', { defaultValue: 'Privacy Policy' })}
                  placeholder={t('admin.settings.privacyPlaceholder', { defaultValue: 'Enter privacy policy content...' })}
                  minRows={6}
                  description="Privacy policy and data handling practices"
                />
                
                <Textarea
                  label={t('admin.settings.hostGuidelines', { defaultValue: 'Host Guidelines' })}
                  placeholder={t('admin.settings.hostGuidelinesPlaceholder', { defaultValue: 'Enter host guidelines...' })}
                  minRows={4}
                  description="Guidelines and rules for property hosts"
                />
                
                <Textarea
                  label={t('admin.settings.guestGuidelines', { defaultValue: 'Guest Guidelines' })}
                  placeholder={t('admin.settings.guestGuidelinesPlaceholder', { defaultValue: 'Enter guest guidelines...' })}
                  minRows={4}
                  description="Guidelines and rules for guests"
                />
                
                <Textarea
                  label={t('admin.settings.cancellationPolicy', { defaultValue: 'Cancellation Policy' })}
                  placeholder={t('admin.settings.cancellationPolicyPlaceholder', { defaultValue: 'Enter cancellation policy...' })}
                  minRows={4}
                  description="Default cancellation policy text"
                />
              </div>
            </CardBody>
          </Card>
        </div>
              )}

        {/* Cache Management Tab */}
        {selectedTab === 'cache' && (
          <div className="space-y-6">
            <Card className="shadow-sm border border-gray-200">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('admin.settings.cacheManagement', { defaultValue: 'Cache Management' })}</h3>
                    <p className="text-gray-600">{t('admin.settings.cacheManagementDesc', { defaultValue: 'Manage application cache to resolve loading issues and improve performance' })}</p>
                  </div>
                  <Database className="w-8 h-8 text-blue-500" />
                </div>

                {/* Cache Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-blue-50 border border-blue-200">
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-700">{t('admin.settings.browserCache', { defaultValue: 'Browser Cache' })}</p>
                          <p className="text-xs text-blue-600">{t('admin.settings.browserCacheDesc', { defaultValue: 'HTTP cache and service workers' })}</p>
                        </div>
                        <Activity className="w-5 h-5 text-blue-500" />
                      </div>
                    </CardBody>
                  </Card>

                  <Card className="bg-green-50 border border-green-200">
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-700">{t('admin.settings.appCache', { defaultValue: 'App Cache' })}</p>
                          <p className="text-xs text-green-600">{t('admin.settings.appCacheDesc', { defaultValue: 'Zustand stores and localStorage' })}</p>
                        </div>
                        <Database className="w-5 h-5 text-green-500" />
                      </div>
                    </CardBody>
                  </Card>

                  <Card className="bg-purple-50 border border-purple-200">
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-700">{t('admin.settings.supabaseCache', { defaultValue: 'Supabase Cache' })}</p>
                          <p className="text-xs text-purple-600">{t('admin.settings.supabaseCacheDesc', { defaultValue: 'API response cache' })}</p>
                        </div>
                        <Globe className="w-5 h-5 text-purple-500" />
                      </div>
                    </CardBody>
                  </Card>
                </div>

                {/* Cache Actions */}
                <div className="space-y-4">
                  <Divider />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      color="warning"
                      variant="flat"
                      size="lg"
                      startContent={<RefreshCw className="w-4 h-4" />}
                      onPress={handleClearCache}
                      className="h-16"
                    >
                       <div className="text-center">
                        <div className="font-semibold">{t('admin.settings.clearAppCache', { defaultValue: 'Clear App Cache' })}</div>
                        <div className="text-xs opacity-75">{t('admin.settings.clearAppCacheDesc', { defaultValue: 'Clear Zustand stores & localStorage' })}</div>
                      </div>
                    </Button>

                    <Button
                      color="danger"
                      variant="flat"
                      size="lg"
                      startContent={<Trash2 className="w-4 h-4" />}
                      onPress={handleClearAllCache}
                      className="h-16"
                    >
                       <div className="text-center">
                        <div className="font-semibold">{t('admin.settings.clearAllCache', { defaultValue: 'Clear All Cache' })}</div>
                        <div className="text-xs opacity-75">{t('admin.settings.clearAllCacheDesc', { defaultValue: 'Clear everything & restart' })}</div>
                      </div>
                    </Button>

                    <Button
                      color="primary"
                      variant="flat"
                      size="lg"
                      startContent={<AlertCircle className="w-4 h-4" />}
                      onPress={handleCheckCacheHealth}
                      className="h-16"
                    >
                       <div className="text-center">
                        <div className="font-semibold">{t('admin.settings.detectIssues', { defaultValue: 'Detect Issues' })}</div>
                        <div className="text-xs opacity-75">{t('admin.settings.detectIssuesDesc', { defaultValue: 'Check for cache problems' })}</div>
                      </div>
                    </Button>

                    <Button
                      color="secondary"
                      variant="flat"
                      size="lg"
                      startContent={<RotateCcw className="w-4 h-4" />}
                      onPress={handleForceRefresh}
                      className="h-16"
                    >
                       <div className="text-center">
                        <div className="font-semibold">{t('admin.settings.forceRefresh', { defaultValue: 'Force Refresh' })}</div>
                        <div className="text-xs opacity-75">{t('admin.settings.forceRefreshDesc', { defaultValue: 'Reload with cache busting' })}</div>
                      </div>
                    </Button>
                  </div>

                  <Divider />

                  {/* Cache Settings */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900">{t('admin.settings.cacheSettings', { defaultValue: 'Cache Settings' })}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">{t('admin.settings.cacheDuration', { defaultValue: 'Cache Duration (minutes)' })}</label>
                        <Slider
                          size="sm"
                          step={5}
                          minValue={0}
                          maxValue={60}
                          defaultValue={[5]}
                          className="max-w-md"
                          color="primary"
                        />
                        <p className="text-xs text-gray-500">{t('admin.settings.cacheDurationDesc', { defaultValue: 'How long to cache API responses' })}</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">{t('admin.settings.autoClearInterval', { defaultValue: 'Auto-clear interval (hours)' })}</label>
                        <Slider
                          size="sm"
                          step={1}
                          minValue={1}
                          maxValue={24}
                          defaultValue={[12]}
                          className="max-w-md"
                          color="secondary"
                        />
                        <p className="text-xs text-gray-500">{t('admin.settings.autoClearIntervalDesc', { defaultValue: 'Automatically clear stale cache' })}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Switch 
                        size="sm" 
                        color="success"
                        defaultSelected
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-success-500",
                          thumb: "group-data-[selected=true]:bg-white"
                        }}
                      />
                      <label className="text-sm text-gray-700">{t('admin.settings.enableCacheBusting', { defaultValue: 'Enable cache busting in development' })}</label>
                    </div>

                    <div className="flex items-center gap-4">
                      <Switch 
                        size="sm" 
                        color="warning"
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-warning-500",
                          thumb: "group-data-[selected=true]:bg-white"
                        }}
                      />
                      <label className="text-sm text-gray-700">{t('admin.settings.showCacheDebug', { defaultValue: 'Show cache debug information' })}</label>
                    </div>
                  </div>
                </div>

                {/* Cache Information */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">{t('admin.settings.whenToClear', { defaultValue: '💡 When to Clear Cache' })}</h5>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• {t('admin.settings.clearTip1', { defaultValue: 'GET requests not returning updated data' })}</li>
                    <li>• {t('admin.settings.clearTip2', { defaultValue: 'Properties or settings showing old values' })}</li>
                    <li>• {t('admin.settings.clearTip3', { defaultValue: 'App behaving unexpectedly after updates' })}</li>
                    <li>• {t('admin.settings.clearTip4', { defaultValue: "Before reporting bugs to ensure it's not cache-related" })}</li>
                  </ul>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button
          variant="flat"
          onPress={() => handleResetSettings()}
          startContent={<RotateCcw className="w-4 h-4" />}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0"
          size="lg"
        >
          {t('common.actions.reset', { defaultValue: 'Reset to Default' })}
        </Button>
        
        <div className="flex gap-4">
          <Button
            variant="flat"
            onPress={() => console.log('Test configuration')}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0"
            size="lg"
          >
            {t('admin.settings.testConfiguration', { defaultValue: 'Test Configuration' })}
          </Button>
          <Button
            color="primary"
            onPress={() => handleSaveSettings()}
            isDisabled={!hasUnsavedChanges || isLoading}
            isLoading={isLoading}
            startContent={!isLoading ? <Save className="w-4 h-4" /> : undefined}
            className={`font-semibold px-6 py-3 shadow-lg hover:shadow-xl transform transition-all duration-200 ${
              hasUnsavedChanges && !isLoading
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:scale-105' 
                : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed'
            }`}
            size="lg"
          >
            {t('common.actions.save', { defaultValue: 'Save Changes' })}
          </Button>
        </div>
      </div>

      {/* Change Log Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalContent>
          <ModalHeader>
            {t('admin.settings.changeLog', { defaultValue: 'Settings Change Log' })}
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
                          {t(`admin.settings.categories.${change.category.toLowerCase()}`, { defaultValue: change.category })}
                        </Chip>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                           <span className="font-medium">{t('common.labels.from', { defaultValue: 'From:' })}</span> {change.oldValue}
                        </div>
                        <div>
                           <span className="font-medium">{t('common.labels.to', { defaultValue: 'To:' })}</span> {change.newValue}
                        </div>
                        <div>
                           <span className="font-medium">{t('admin.settings.changedBy', { defaultValue: 'Changed by:' })}</span> {change.changedBy}
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
              {t('common.buttons.close')}
            </Button>
            <Button color="primary" startContent={<Download className="w-4 h-4" />}>
              {t('admin.settings.exportLog', { defaultValue: 'Export Log' })}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Template Modal */}
      <Modal isOpen={isTemplateOpen} onClose={onTemplateClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            {t('notifications.templates.create', { defaultValue: 'Create Email Template' })}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
                <Input
                 label={t('notifications.templates.name', { defaultValue: 'Template Name' })}
                 placeholder={t('notifications.templates.namePlaceholder', { defaultValue: 'Enter template name' })}
              />
              
               <Input
                 label={t('notifications.templates.subject', { defaultValue: 'Subject Line' })}
                 placeholder={t('notifications.templates.subjectPlaceholder', { defaultValue: 'Enter email subject' })}
              />
              
               <Select
                 label={t('notifications.templates.type', { defaultValue: 'Template Type' })}
                 placeholder={t('notifications.templates.typePlaceholder', { defaultValue: 'Select template type' })}
              >
                 <SelectItem key="email">{t('notifications.templates.types.email', { defaultValue: 'Email' })}</SelectItem>
                 <SelectItem key="sms">{t('notifications.templates.types.sms', { defaultValue: 'SMS' })}</SelectItem>
                 <SelectItem key="push">{t('notifications.templates.types.push', { defaultValue: 'Push Notification' })}</SelectItem>
              </Select>
              
               <Textarea
                 label={t('notifications.templates.content', { defaultValue: 'Template Content' })}
                 placeholder={t('notifications.templates.contentPlaceholder', { defaultValue: 'Enter template content with variables like {{name}}, {{property}}, etc.' })}
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
                   aria-label={t('notifications.templates.enableNow', { defaultValue: 'Enable template immediately' })}
                />
                 <label className="text-sm text-gray-700">{t('notifications.templates.enableNow', { defaultValue: 'Enable template immediately' })}</label>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onTemplateClose}>
              {t('common.actions.cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button color="primary" onPress={onTemplateClose}>
              {t('notifications.templates.create', { defaultValue: 'Create Template' })}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Template Modal */}
      <Modal isOpen={isEditTemplateOpen} onClose={onEditTemplateClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            {t('notifications.templates.edit', { defaultValue: 'Edit Template' })}: {editingTemplate?.name}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
               <Input
                 label={t('notifications.templates.name', { defaultValue: 'Template Name' })}
                value={templateForm.name}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
              />
              
               <Input
                 label={t('notifications.templates.subject', { defaultValue: 'Subject Line' })}
                value={templateForm.subject}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter email subject"
              />
              
               <Select
                 label={t('notifications.templates.type', { defaultValue: 'Template Type' })}
                selectedKeys={[templateForm.type]}
                onSelectionChange={(keys) => setTemplateForm(prev => ({ ...prev, type: Array.from(keys)[0] as 'email' | 'sms' | 'push' }))}
              >
                 <SelectItem key="email">{t('notifications.templates.types.email', { defaultValue: 'Email' })}</SelectItem>
                 <SelectItem key="sms">{t('notifications.templates.types.sms', { defaultValue: 'SMS' })}</SelectItem>
                 <SelectItem key="push">{t('notifications.templates.types.push', { defaultValue: 'Push Notification' })}</SelectItem>
              </Select>
              
               <Textarea
                 label={t('notifications.templates.content', { defaultValue: 'Template Content' })}
                 placeholder={t('notifications.templates.contentPlaceholder', { defaultValue: 'Enter template content with variables like {{name}}, {{property}}, etc.' })}
                minRows={6}
                 description={t('notifications.templates.contentDesc', { defaultValue: 'Use {{variable}} syntax for dynamic content' })}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onEditTemplateClose}>
              {t('common.actions.cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button color="primary" onPress={handleSaveTemplate}>
              {t('common.actions.save', { defaultValue: 'Save Changes' })}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
} 