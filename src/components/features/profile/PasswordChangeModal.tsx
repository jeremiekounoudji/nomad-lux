import React, { useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from '@heroui/react'
import { Lock, Eye, EyeOff, Shield } from 'lucide-react'
import { useTranslation } from '../../../lib/stores/translationStore'
import { usePasswordChange } from '../../../hooks/usePasswordChange'
import toast from 'react-hot-toast'

interface PasswordChangeModalProps {
  isOpen: boolean
  onClose: () => void
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useTranslation(['profile', 'common'])
  const { changePassword, isChanging } = usePasswordChange()
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const validateForm = (): boolean => {
    if (!formData.currentPassword.trim()) {
      toast.error(t('profile.password.errors.currentPasswordRequired'))
      return false
    }
    
    if (!formData.newPassword.trim()) {
      toast.error(t('profile.password.errors.newPasswordRequired'))
      return false
    }
    
    if (formData.newPassword.length < 6) {
      toast.error(t('profile.password.errors.passwordTooShort'))
      return false
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(t('profile.password.errors.passwordsDoNotMatch'))
      return false
    }
    
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      await changePassword(formData.currentPassword, formData.newPassword)
      toast.success(t('profile.messages.passwordChangeSuccess'))
      onClose()
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      console.error('❌ Error changing password:', error)
      toast.error(error.message || t('profile.password.errors.changeFailed'))
    }
  }

  const handleClose = () => {
    if (!isChanging) {
      onClose()
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="md"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <span>{t('profile.actions.changePassword')}</span>
          </div>
          <p className="text-sm text-gray-600 font-normal">
            {t('profile.password.description')}
          </p>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-4">
            {/* Current Password */}
            <Input
              label={t('profile.password.fields.currentPassword')}
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              startContent={<Lock className="w-4 h-4 text-gray-400" />}
              endContent={
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="focus:outline-none"
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              }
            />

            {/* New Password */}
            <Input
              label={t('profile.password.fields.newPassword')}
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              startContent={<Lock className="w-4 h-4 text-gray-400" />}
              endContent={
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="focus:outline-none"
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              }
            />

            {/* Confirm Password */}
            <Input
              label={t('profile.password.fields.confirmPassword')}
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              startContent={<Lock className="w-4 h-4 text-gray-400" />}
              endContent={
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="focus:outline-none"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              }
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button 
            variant="flat" 
            onPress={handleClose}
            disabled={isChanging}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            color="primary" 
            onPress={handleSubmit}
            isLoading={isChanging}
            disabled={isChanging}
          >
            {t('profile.actions.changePassword')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
