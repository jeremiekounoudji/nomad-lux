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
  Divider,
  Checkbox
} from '@heroui/react'
import { Trash2, XCircle } from 'lucide-react'
import { AdminUser } from '../../../../interfaces'
import { useTranslation } from '../../../../lib/stores/translationStore'

interface UserDeletionModalProps {
  isOpen: boolean
  onClose: () => void
  user: AdminUser | null
  onConfirm: (reason: string) => void
}

export const UserDeletionModal: React.FC<UserDeletionModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirm
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const [reason, setReason] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSubmit = () => {
    if (reason.trim() && confirmDelete) {
      onConfirm(reason)
      setReason('')
      setConfirmDelete(false)
      onClose()
    }
  }

  const handleClose = () => {
    setReason('')
    setConfirmDelete(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" scrollBehavior="inside">
      <ModalContent className="max-h-[80vh]">
        <ModalHeader className="flex items-center gap-3 rounded-t-lg bg-red-50 text-red-900">
          <div className="flex size-10 items-center justify-center rounded-full bg-red-500">
            <Trash2 className="size-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{t('admin.users.deletion.title', { defaultValue: 'Delete User Account' })}</h3>
            <p className="text-sm font-normal text-red-700">{t('admin.users.deletion.subtitle', { defaultValue: 'This action cannot be undone' })}</p>
          </div>
        </ModalHeader>
        
        <ModalBody className="space-y-6">
          {user && (
            <>
              {/* Danger Notice */}
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 size-5 text-red-600" />
                  <div>
                    <h4 className="font-medium text-red-800">{t('admin.users.deletion.notice.title', { defaultValue: 'Permanent Account Deletion' })}</h4>
                    <p className="mt-1 text-sm text-red-700">
                      {t('admin.users.deletion.notice.description', { defaultValue: 'This will permanently delete the user\'s account, all their data, bookings, and properties. This action cannot be reversed.' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-3 font-semibold text-gray-900">{t('admin.users.deletion.userDetails', { defaultValue: 'User Details' })}</h4>
                <div className="mb-4 flex items-center gap-3">
                  <Avatar src={user.avatar} name={user.name} size="md" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Chip
                        color={user.status === 'active' ? 'success' : user.status === 'suspended' ? 'danger' : 'warning'}
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
                  <div><strong>{t('admin.users.deletion.labels.totalBookings', { defaultValue: 'Total Bookings' })}:</strong> {user.totalBookings}</div>
                  <div><strong>{t('admin.users.deletion.labels.properties', { defaultValue: 'Properties' })}:</strong> {user.totalProperties}</div>
                  <div><strong>{t('admin.users.deletion.labels.memberSince', { defaultValue: 'Member Since' })}:</strong> {user.joinDate}</div>
                  <div><strong>{t('admin.users.deletion.labels.lastLogin', { defaultValue: 'Last Login' })}:</strong> {user.lastLogin}</div>
                  {user.revenue > 0 && <div><strong>{t('admin.users.deletion.labels.totalRevenue', { defaultValue: 'Total Revenue' })}:</strong> ${user.revenue.toLocaleString()}</div>}
                </div>
              </div>

              <Divider />

              {/* Data Impact Warning */}
              <div>
                <h4 className="mb-3 font-semibold text-gray-900 text-red-700">{t('admin.users.deletion.dataImpact.title', { defaultValue: 'Data That Will Be Permanently Deleted:' })}</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <XCircle className="size-4 text-red-500" />
                    {t('admin.users.deletion.dataImpact.profile', { defaultValue: 'User profile and personal information' })}
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="size-4 text-red-500" />
                    {t('admin.users.deletion.dataImpact.bookings', { defaultValue: 'All booking history and records' })}
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="size-4 text-red-500" />
                    {t('admin.users.deletion.dataImpact.properties', { defaultValue: 'Property listings and related data' })}
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="size-4 text-red-500" />
                    {t('admin.users.deletion.dataImpact.payments', { defaultValue: 'Payment history and financial records' })}
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="size-4 text-red-500" />
                    {t('admin.users.deletion.dataImpact.reviews', { defaultValue: 'Reviews and ratings given/received' })}
                  </li>
                </ul>
              </div>

              {/* Deletion Reason */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t('admin.users.deletion.reason.label', { defaultValue: 'Reason for Deletion' })} <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder={t('admin.users.deletion.reason.placeholder', { defaultValue: 'Please provide a detailed reason for permanently deleting this user account...' })}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  minRows={4}
                  className="w-full"
                />
                <p className="mt-2 text-xs text-gray-500">
                  {t('admin.users.deletion.reason.help', { defaultValue: 'This reason will be logged for audit purposes and legal compliance.' })}
                </p>
              </div>

              {/* Confirmation Checkbox */}
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <Checkbox
                  isSelected={confirmDelete}
                  onValueChange={setConfirmDelete}
                  color="danger"
                  className="text-red-700"
                >
                  <span className="text-sm font-medium text-red-700">
                    {t('admin.users.deletion.confirmation.text', { defaultValue: 'I understand that this action is permanent and cannot be undone. All user data will be permanently deleted.' })}
                  </span>
                </Checkbox>
              </div>
            </>
          )}
        </ModalBody>
        
        <ModalFooter className="rounded-b-lg bg-gray-50">
          <Button variant="flat" onPress={handleClose}>
            {t('common.actions.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            color="danger"
            onPress={handleSubmit}
            isDisabled={!reason.trim() || !confirmDelete}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {t('admin.users.deletion.confirmButton', { defaultValue: 'Permanently Delete Account' })}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 