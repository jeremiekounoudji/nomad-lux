import React, { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Avatar,
  Textarea,
  Chip,
  Divider
} from '@heroui/react'
import { Ban, AlertTriangle } from 'lucide-react'
import { AdminUser } from '../../../../interfaces'
import { useTranslation } from '../../../../lib/stores/translationStore'

interface UserSuspensionModalProps {
  isOpen: boolean
  onClose: () => void
  user: AdminUser | null
  onConfirm: (reason: string) => void
}

export const UserSuspensionModal: React.FC<UserSuspensionModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirm
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const [reason, setReason] = useState('')

  const handleSubmit = () => {
    if (reason.trim()) {
      onConfirm(reason)
      setReason('')
      onClose()
    }
  }

  const handleClose = () => {
    setReason('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalContent>
        <ModalHeader className="flex items-center gap-3 rounded-t-lg bg-orange-50 text-orange-900">
          <div className="flex size-10 items-center justify-center rounded-full bg-orange-500">
            <Ban className="size-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{t('admin.users.suspension.title', { defaultValue: 'Suspend User Account' })}</h3>
            <p className="text-sm font-normal text-orange-700">{t('admin.users.suspension.subtitle', { defaultValue: 'This action will temporarily disable the user\'s access' })}</p>
          </div>
        </ModalHeader>
        
        <ModalBody className="space-y-6">
          {user && (
            <>
              {/* Warning Notice */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-5 text-amber-600" />
                  <div>
                    <h4 className="font-medium text-amber-800">{t('admin.users.suspension.notice.title', { defaultValue: 'Important Notice' })}</h4>
                    <p className="mt-1 text-sm text-amber-700">
                      {t('admin.users.suspension.notice.description', { defaultValue: 'Suspending this user will immediately restrict their access to the platform. They will not be able to make new bookings or list properties.' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-3 font-semibold text-gray-900">{t('admin.users.suspension.userDetails', { defaultValue: 'User Details' })}</h4>
                <div className="mb-4 flex items-center gap-3">
                  <Avatar src={user.avatar} name={user.name} size="md" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Chip
                        color="success"
                        size="sm"
                        variant="flat"
                        className="capitalize"
                      >
                        {user.status}
                      </Chip>
                      <Chip
                        color="secondary"
                        size="sm"
                        variant="flat"
                        className="capitalize"
                      >
                        {user.role}
                      </Chip>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>{t('admin.users.suspension.labels.totalBookings', { defaultValue: 'Total Bookings' })}:</strong> {user.totalBookings}</div>
                  <div><strong>{t('admin.users.suspension.labels.properties', { defaultValue: 'Properties' })}:</strong> {user.totalProperties}</div>
                  <div><strong>{t('admin.users.suspension.labels.memberSince', { defaultValue: 'Member Since' })}:</strong> {user.joinDate}</div>
                  <div><strong>{t('admin.users.suspension.labels.lastLogin', { defaultValue: 'Last Login' })}:</strong> {user.lastLogin}</div>
                </div>
              </div>

              <Divider />

              {/* Suspension Reason */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t('admin.users.suspension.reason.label', { defaultValue: 'Reason for Suspension' })} <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder={t('admin.users.suspension.reason.placeholder', { defaultValue: 'Please provide a detailed reason for suspending this user account...' })}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  minRows={4}
                  className="w-full"
                />
                <p className="mt-2 text-xs text-gray-500">
                  {t('admin.users.suspension.reason.help', { defaultValue: 'This reason will be logged and may be shared with the user upon request.' })}
                </p>
              </div>
            </>
          )}
        </ModalBody>
        
        <ModalFooter className="rounded-b-lg bg-gray-50">
          <Button variant="flat" onPress={handleClose}>
            {t('common.actions.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            color="warning"
            onPress={handleSubmit}
            isDisabled={!reason.trim()}
            className="bg-orange-600 text-white hover:bg-orange-700"
          >
            {t('admin.users.suspension.confirmButton', { defaultValue: 'Suspend User Account' })}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 