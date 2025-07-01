import React, { useState, useEffect, useMemo } from 'react'
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  Select, 
  SelectItem, 
  Input, 
  Textarea, 
  Switch, 
  Chip,
  Divider,
  Spinner,
  Badge
} from '@heroui/react'
import { 
  Settings, 
  Plus, 
  Clock, 
  CreditCard, 
  Shield, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react'
import { PropertySubmissionData, PropertySettingsFormData, PaymentTiming } from '../../../../interfaces'
import { usePropertySettings } from '../../../../hooks/usePropertySettings'
import { usePropertySettingsStore } from '../../../../lib/stores/propertySettingsStore'
import { useAuthStore } from '../../../../lib/stores/authStore'
import { useAdminSettingsStore } from '../../../../lib/stores/adminSettingsStore'
import toast from 'react-hot-toast'

interface PropertySettingsStepProps {
  formData: PropertySubmissionData
  setFormData: (data: PropertySubmissionData) => void
}

const DEFAULT_SETTINGS: PropertySettingsFormData = {
  settings_name: '',
  min_advance_booking: 1,
  max_advance_booking: 365,
  min_stay_nights: 1,
  max_stay_nights: 30,
  checkin_time: '15:00:00',
  checkout_time: '11:00:00',
  cleaning_time_hours: 2,
  payment_timing: 'before_checkin',
  auto_approve_bookings: false,
  preferred_payment_methods: ['card'],
  blocked_dates: [],
  is_default: false
}

const PropertySettingsStep: React.FC<PropertySettingsStepProps> = ({ formData, setFormData }) => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newSettings, setNewSettings] = useState<PropertySettingsFormData>(DEFAULT_SETTINGS)
  const [selectedSettingsId, setSelectedSettingsId] = useState<string>('')

  // Hooks
  const { user } = useAuthStore()
  const { settings: adminSettings } = useAdminSettingsStore()
  const { 
    hostSettings, 
    isLoadingHostSettings, 
    isCreatingSettings, 
    error 
  } = usePropertySettingsStore()
  
  const { 
    loadHostSettingsProfiles, 
    createPropertySettings 
  } = usePropertySettings()

  // Load host settings on component mount
  useEffect(() => {
    if (user?.id && hostSettings.length === 0) {
      console.log('🔄 Loading host property settings...')
      loadHostSettingsProfiles(user.id).catch(console.error)
    }
  }, [user?.id, hostSettings.length, loadHostSettingsProfiles])

  // Initialize selected settings from form data
  useEffect(() => {
    if (formData.existing_settings_id && !selectedSettingsId) {
      setSelectedSettingsId(formData.existing_settings_id)
    }
  }, [formData.existing_settings_id, selectedSettingsId])

  // Available payment methods from admin settings
  const availablePaymentMethods = useMemo(() => {
    const methods = adminSettings?.booking?.supportedPaymentMethods || ['card']
    return methods.map(method => ({
      value: method,
      label: method === 'card' ? 'Credit/Debit Card' : 
             method === 'paypal' ? 'PayPal' : 
             method === 'bank_transfer' ? 'Bank Transfer' : method
    }))
  }, [adminSettings?.booking?.supportedPaymentMethods])

  const handleSelectExistingSettings = (settingsId: string) => {
    setSelectedSettingsId(settingsId)
    setFormData({
      ...formData,
      existing_settings_id: settingsId,
      create_new_settings: false,
      property_settings: undefined
    })
    setShowCreateForm(false)
  }

  const handleCreateNewSettings = () => {
    setShowCreateForm(true)
    setSelectedSettingsId('')
    setFormData({
      ...formData,
      existing_settings_id: undefined,
      create_new_settings: true,
      property_settings: newSettings
    })
  }

  const handleCancelCreate = () => {
    setShowCreateForm(false)
    setNewSettings(DEFAULT_SETTINGS)
    
    // Revert to default or first available settings
    const defaultSettings = hostSettings.find(s => s.is_default)
    const firstSettings = hostSettings[0]
    const fallbackSettings = defaultSettings || firstSettings
    
    if (fallbackSettings) {
      handleSelectExistingSettings(fallbackSettings.id)
    } else {
      setFormData({
        ...formData,
        existing_settings_id: undefined,
        create_new_settings: false,
        property_settings: undefined
      })
    }
  }

  const handleSettingsFormChange = (field: keyof PropertySettingsFormData, value: any) => {
    const updatedSettings = { ...newSettings, [field]: value }
    setNewSettings(updatedSettings)
    setFormData({
      ...formData,
      property_settings: updatedSettings
    })
  }

  const handleCreateAndSaveSettings = async () => {
    if (!user?.id) {
      toast.error('Please sign in to create property settings')
      return
    }

    if (!newSettings.settings_name.trim()) {
      toast.error('Please enter a name for your settings')
      return
    }

    try {
      console.log('🔄 Creating new property settings...')
      const createdSettings = await createPropertySettings(user.id, newSettings)
      
      // Update form data with the created settings ID
      setFormData({
        ...formData,
        existing_settings_id: createdSettings.id,
        create_new_settings: false,
        property_settings: undefined
      })
      
      setSelectedSettingsId(createdSettings.id)
      setShowCreateForm(false)
      setNewSettings(DEFAULT_SETTINGS)
      
      toast.success('Property settings created successfully!')
      
    } catch (error) {
      console.error('❌ Error creating settings:', error)
      toast.error('Failed to create property settings')
    }
  }

  const handlePaymentMethodToggle = (method: string, checked: boolean) => {
    const currentMethods = newSettings.preferred_payment_methods
    let updatedMethods: string[]
    
    if (checked) {
      updatedMethods = [...currentMethods, method]
    } else {
      updatedMethods = currentMethods.filter(m => m !== method)
    }
    
    // Ensure at least one payment method is selected
    if (updatedMethods.length === 0) {
      toast.error('At least one payment method must be selected')
      return
    }
    
    handleSettingsFormChange('preferred_payment_methods', updatedMethods)
  }

  const selectedSettings = hostSettings.find(s => s.id === selectedSettingsId)

  if (isLoadingHostSettings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-gray-600 mt-4">Loading your property settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary-600" />
          Property Settings
        </h2>
        <p className="text-gray-600 mb-6">
          Choose existing property settings or create new ones. These settings will control booking rules, 
          payment preferences, and availability for your property.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-danger-600" />
            <p className="text-danger-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Existing Settings Selection */}
      {!showCreateForm && (
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold">Select Property Settings</h3>
              <Button
                color="primary"
                variant="light"
                startContent={<Plus className="w-4 h-4" />}
                onPress={handleCreateNewSettings}
                size="sm"
              >
                Create New
              </Button>
            </div>
          </CardHeader>
          <CardBody className="pt-4">
            {hostSettings.length === 0 ? (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No property settings found</p>
                <Button
                  color="primary"
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={handleCreateNewSettings}
                >
                  Create Your First Settings
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Select
                  label="Choose Settings Profile"
                  placeholder="Select existing property settings"
                  selectedKeys={selectedSettingsId ? [selectedSettingsId] : []}
                  onSelectionChange={(keys) => {
                    const settingsId = Array.from(keys)[0] as string
                    if (settingsId) {
                      handleSelectExistingSettings(settingsId)
                    }
                  }}
                  classNames={{
                    trigger: "min-h-12",
                  }}
                >
                  {hostSettings.map((settings) => (
                    <SelectItem key={settings.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span>{settings.settings_name}</span>
                          {settings.is_default && (
                            <Chip size="sm" color="primary" variant="flat">
                              <Star className="w-3 h-3" />
                              Default
                            </Chip>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </Select>

                {/* Selected Settings Preview */}
                {selectedSettings && (
                  <Card className="bg-gray-50 border border-gray-200">
                    <CardBody className="p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success-600" />
                        Settings Preview: {selectedSettings.settings_name}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>Stay: {selectedSettings.min_stay_nights}-{selectedSettings.max_stay_nights} nights</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>Check-in: {selectedSettings.checkin_time.slice(0, 5)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>Check-out: {selectedSettings.checkout_time.slice(0, 5)}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-500" />
                            <span>Payment: {selectedSettings.payment_timing.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-gray-500" />
                            <span>Auto-approve: {selectedSettings.auto_approve_bookings ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Create New Settings Form */}
      {showCreateForm && (
        <Card className="border border-primary-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold text-primary-700">Create New Property Settings</h3>
              <Button
                variant="light"
                size="sm"
                onPress={handleCancelCreate}
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardBody className="pt-4">
            <div className="space-y-6">
              {/* Basic Settings */}
              <div className="space-y-4">
                <Input
                  label="Settings Name"
                  placeholder="e.g., Standard Booking Rules, Quick Stay Settings"
                  value={newSettings.settings_name}
                  onChange={(e) => handleSettingsFormChange('settings_name', e.target.value)}
                  isRequired
                  description="Give this settings profile a memorable name"
                />

                <div className="flex items-center gap-4">
                  <Switch
                    isSelected={newSettings.is_default}
                    onValueChange={(checked) => handleSettingsFormChange('is_default', checked)}
                  >
                    Set as default settings
                  </Switch>
                  {newSettings.is_default && (
                    <Chip size="sm" color="primary" variant="flat">
                      <Star className="w-3 h-3" />
                      Default
                    </Chip>
                  )}
                </div>
              </div>

              <Divider />

              {/* Booking Rules */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Booking Rules</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="Minimum Stay (nights)"
                    value={newSettings.min_stay_nights.toString()}
                    onChange={(e) => handleSettingsFormChange('min_stay_nights', parseInt(e.target.value) || 1)}
                    min={1}
                  />
                  <Input
                    type="number"
                    label="Maximum Stay (nights)"
                    value={newSettings.max_stay_nights.toString()}
                    onChange={(e) => handleSettingsFormChange('max_stay_nights', parseInt(e.target.value) || 30)}
                    min={1}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="Minimum Advance Booking (days)"
                    value={newSettings.min_advance_booking.toString()}
                    onChange={(e) => handleSettingsFormChange('min_advance_booking', parseInt(e.target.value) || 1)}
                    min={1}
                    description="How far in advance bookings are required"
                  />
                  <Input
                    type="number"
                    label="Maximum Advance Booking (days)"
                    value={newSettings.max_advance_booking.toString()}
                    onChange={(e) => handleSettingsFormChange('max_advance_booking', parseInt(e.target.value) || 365)}
                    min={1}
                    description="How far in advance bookings are allowed"
                  />
                </div>
              </div>

              <Divider />

              {/* Check-in/Check-out Times */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Check-in & Check-out</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    type="time"
                    label="Check-in Time"
                    value={newSettings.checkin_time.slice(0, 5)}
                    onChange={(e) => handleSettingsFormChange('checkin_time', e.target.value + ':00')}
                  />
                  <Input
                    type="time"
                    label="Check-out Time"
                    value={newSettings.checkout_time.slice(0, 5)}
                    onChange={(e) => handleSettingsFormChange('checkout_time', e.target.value + ':00')}
                  />
                  <Input
                    type="number"
                    label="Cleaning Time (hours)"
                    value={newSettings.cleaning_time_hours.toString()}
                    onChange={(e) => handleSettingsFormChange('cleaning_time_hours', parseInt(e.target.value) || 2)}
                    min={0}
                    max={24}
                    description="Time needed between bookings"
                  />
                </div>
              </div>

              <Divider />

              {/* Payment & Approval */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Payment & Approval</h4>
                
                <Select
                  label="Payment Timing"
                  selectedKeys={[newSettings.payment_timing]}
                  onSelectionChange={(keys) => {
                    const timing = Array.from(keys)[0] as PaymentTiming
                    handleSettingsFormChange('payment_timing', timing)
                  }}
                >
                  <SelectItem key="before_checkin">Before Check-in</SelectItem>
                  <SelectItem key="after_checkin">After Check-in</SelectItem>
                </Select>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Preferred Payment Methods</label>
                  <div className="flex flex-wrap gap-3">
                    {availablePaymentMethods.map((method) => (
                      <Switch
                        key={method.value}
                        size="sm"
                        isSelected={newSettings.preferred_payment_methods.includes(method.value)}
                        onValueChange={(checked) => handlePaymentMethodToggle(method.value, checked)}
                      >
                        {method.label}
                      </Switch>
                    ))}
                  </div>
                </div>

                <Switch
                  isSelected={newSettings.auto_approve_bookings}
                  onValueChange={(checked) => handleSettingsFormChange('auto_approve_bookings', checked)}
                >
                  Auto-approve bookings
                </Switch>
                {newSettings.auto_approve_bookings && (
                  <p className="text-sm text-gray-600 ml-6">
                    Bookings will be automatically approved without manual review
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  color="primary"
                  onPress={handleCreateAndSaveSettings}
                  isLoading={isCreatingSettings}
                  disabled={!newSettings.settings_name.trim()}
                  startContent={!isCreatingSettings && <CheckCircle className="w-4 h-4" />}
                  className="flex-1"
                >
                  {isCreatingSettings ? 'Creating...' : 'Create & Use Settings'}
                </Button>
                <Button
                  variant="bordered"
                  onPress={handleCancelCreate}
                  disabled={isCreatingSettings}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

export default PropertySettingsStep 