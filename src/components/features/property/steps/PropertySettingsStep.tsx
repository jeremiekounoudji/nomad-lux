import React, { useState, useEffect } from 'react'
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  Select, 
  SelectItem, 
  Input, 
  Switch, 
  Chip,
  Divider,
  Spinner
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
import { useTranslation } from '../../../../lib/stores/translationStore'
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
  checkin_time: '00:00:00',
  checkout_time: '00:00:00',
  cleaning_time_hours: 0,
  payment_timing: 'before_checkin',
  auto_approve_bookings: false,
  preferred_payment_methods: ['card'],
  blocked_dates: [],
  is_default: false
}

const PropertySettingsStep: React.FC<PropertySettingsStepProps> = ({ formData, setFormData }) => {
  const { t } = useTranslation(['property', 'common'])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newSettings, setNewSettings] = useState<PropertySettingsFormData>(DEFAULT_SETTINGS)
  const [selectedSettingsId, setSelectedSettingsId] = useState<string>('')

  // Hooks
  const { user } = useAuthStore()
  const { settings: adminSettings } = useAdminSettingsStore()
  void adminSettings; // Suppress unused variable warning
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
      toast.error(t('property.settings.errors.signInRequired'))
      return
    }

    if (!newSettings.settings_name.trim()) {
      toast.error(t('property.settings.errors.nameRequired'))
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
      
      toast.success(t('property.settings.success'))
      
    } catch (error) {
      console.error('❌ Error creating settings:', error)
      toast.error(t('property.settings.errors.createFailed'))
    }
  }



  const selectedSettings = hostSettings.find(s => s.id === selectedSettingsId)

  if (isLoadingHostSettings) {
    return (
      <div className="flex items-center justify-center py-12">
              <div className="text-center">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-gray-600">{t('property.settings.loading')}</p>
      </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 flex items-center gap-2 text-2xl font-semibold">
          <Settings className="size-6 text-primary-600" />
          {t('property.settings.title')}
        </h2>
        <p className="mb-6 text-gray-600">
          {t('property.settings.description')}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 text-danger-600" />
            <p className="font-medium text-danger-700">{error}</p>
          </div>
        </div>
      )}

      {/* Existing Settings Selection */}
      {!showCreateForm && (
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
                          <div className="flex w-full items-center justify-between">
                <h3 className="text-lg font-semibold">{t('property.settings.selectSettings')}</h3>
                <Button
                  color="primary"
                  variant="light"
                  startContent={<Plus className="size-4" />}
                  onPress={handleCreateNewSettings}
                  size="sm"
                >
                  {t('property.settings.createNew')}
                </Button>
              </div>
          </CardHeader>
          <CardBody className="pt-4">
            {hostSettings.length === 0 ? (
              <div className="py-8 text-center">
                <Settings className="mx-auto mb-4 size-12 text-gray-400" />
                <p className="mb-4 text-gray-600">{t('property.settings.noSettingsFound')}</p>
                <Button
                  color="primary"
                  startContent={<Plus className="size-4" />}
                  onPress={handleCreateNewSettings}
                >
                  {t('property.settings.createFirstSettings')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Select
                  label={t('property.settings.chooseSettingsProfile')}
                  placeholder={t('property.settings.selectExistingSettings')}
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
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{settings.settings_name}</span>
                          {settings.is_default && (
                            <Chip size="sm" color="primary" variant="flat">
                              <Star className="size-3" />
                              {t('property.settings.default')}
                            </Chip>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </Select>

                {/* Selected Settings Preview */}
                {selectedSettings && (
                  <Card className="border border-gray-200 bg-gray-50">
                    <CardBody className="p-4">
                      <h4 className="mb-3 flex items-center gap-2 font-semibold">
                        <CheckCircle className="size-4 text-success-600" />
                        {t('property.settings.settingsPreview')}: {selectedSettings.settings_name}
                      </h4>
                      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4 text-gray-500" />
                            <span>Stay: {selectedSettings.min_stay_nights}-{selectedSettings.max_stay_nights} nights</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="size-4 text-gray-500" />
                            <span>Check-in: {selectedSettings.checkin_time.slice(0, 5)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="size-4 text-gray-500" />
                            <span>Check-out: {selectedSettings.checkout_time.slice(0, 5)}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CreditCard className="size-4 text-gray-500" />
                            <span>Payment: {selectedSettings.payment_timing.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="size-4 text-gray-500" />
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
            <div className="flex w-full items-center justify-between">
              <h3 className="text-lg font-semibold text-primary-700">{t('property.settings.createNewSettings')}</h3>
              <Button
                variant="light"
                size="sm"
                onPress={handleCancelCreate}
              >
                {t('property.settings.cancel')}
              </Button>
            </div>
          </CardHeader>
          <CardBody className="pt-4">
            <div className="space-y-6">
              {/* Basic Settings */}
              <div className="space-y-4">
                <Input
                  label={t('property.settings.settingsName')}
                  placeholder={t('property.settings.settingsNamePlaceholder')}
                  value={newSettings.settings_name}
                  onChange={(e) => handleSettingsFormChange('settings_name', e.target.value)}
                  isRequired
                  description={t('property.settings.settingsNameDescription')}
                />

                <div className="flex items-center gap-4">
                  <Switch
                    isSelected={newSettings.is_default}
                    onValueChange={(checked) => handleSettingsFormChange('is_default', checked)}
                  >
                    {t('property.settings.setAsDefault')}
                  </Switch>
                  {newSettings.is_default && (
                    <Chip size="sm" color="primary" variant="flat">
                      <Star className="size-3" />
                      {t('property.settings.default')}
                    </Chip>
                  )}
                </div>
              </div>

              <Divider />

              {/* Booking Rules */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">{t('property.settings.bookingRules')}</h4>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    type="number"
                    label={t('property.settings.minimumStay')}
                    value={newSettings.min_stay_nights.toString()}
                    onChange={(e) => handleSettingsFormChange('min_stay_nights', parseInt(e.target.value) || 1)}
                    min={1}
                  />
                  <Input
                    type="number"
                    label={t('property.settings.maximumStay')}
                    value={newSettings.max_stay_nights.toString()}
                    onChange={(e) => handleSettingsFormChange('max_stay_nights', parseInt(e.target.value) || 30)}
                    min={1}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    type="number"
                    label={t('property.settings.minimumAdvanceBooking')}
                    value={newSettings.min_advance_booking.toString()}
                    onChange={(e) => handleSettingsFormChange('min_advance_booking', parseInt(e.target.value) || 1)}
                    min={1}
                    description={t('property.settings.advanceBookingRequired')}
                  />
                  <Input
                    type="number"
                    label={t('property.settings.maximumAdvanceBooking')}
                    value={newSettings.max_advance_booking.toString()}
                    onChange={(e) => handleSettingsFormChange('max_advance_booking', parseInt(e.target.value) || 365)}
                    min={1}
                    description={t('property.settings.advanceBookingAllowed')}
                  />
                </div>
              </div>

              <Divider />

              {/* Check-in/Check-out Times */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">{t('property.settings.checkinCheckout')}</h4>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Input
                    type="time"
                    label={t('property.settings.checkinTime')}
                    value={newSettings.checkin_time.slice(0, 5)}
                    onChange={(e) => handleSettingsFormChange('checkin_time', e.target.value + ':00')}
                  />
                  <Input
                    type="time"
                    label={t('property.settings.checkoutTime')}
                    value={newSettings.checkout_time.slice(0, 5)}
                    onChange={(e) => handleSettingsFormChange('checkout_time', e.target.value + ':00')}
                  />
                  <Input
                    type="number"
                    label={t('property.settings.cleaningTime')}
                    value={newSettings.cleaning_time_hours.toString()}
                    onChange={(e) => handleSettingsFormChange('cleaning_time_hours', parseInt(e.target.value) || 0)}
                    min={0}
                    max={24}
                    description={t('property.settings.cleaningTimeDescription')}
                  />
                </div>
              </div>

              <Divider />

              {/* Payment & Approval */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">{t('property.settings.paymentApproval')}</h4>
                
                <Select
                  label={t('property.settings.paymentTiming')}
                  selectedKeys={[newSettings.payment_timing]}
                  onSelectionChange={(keys) => {
                    const timing = Array.from(keys)[0] as PaymentTiming
                    handleSettingsFormChange('payment_timing', timing)
                  }}
                >
                  <SelectItem key="before_checkin">{t('property.settings.beforeCheckin')}</SelectItem>
                  <SelectItem key="after_checkin">{t('property.settings.afterCheckin')}</SelectItem>
                </Select>



                <Switch
                  isSelected={newSettings.auto_approve_bookings}
                  onValueChange={(checked) => handleSettingsFormChange('auto_approve_bookings', checked)}
                >
                  {t('property.settings.autoApproveBookings')}
                </Switch>
                {newSettings.auto_approve_bookings && (
                  <p className="ml-6 text-sm text-gray-600">
                    {t('property.settings.autoApproveDescription')}
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
                  startContent={!isCreatingSettings && <CheckCircle className="size-4" />}
                  className="flex-1"
                >
                  {isCreatingSettings ? t('property.settings.creating') : t('property.settings.createUseSettings')}
                </Button>
                <Button
                  variant="bordered"
                  onPress={handleCancelCreate}
                  disabled={isCreatingSettings}
                >
                  {t('property.settings.cancel')}
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