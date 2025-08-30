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
  Checkbox
} from '@heroui/react'
import { Ban, UserCheck, Trash2, AlertTriangle } from 'lucide-react'
import { AdminUser } from '../../../../interfaces'
import { useTranslation } from '../../../../lib/stores/translationStore'

interface BulkUserActionsModalProps {
  isOpen: boolean
  onClose: () => void
  users: AdminUser[]
  action: 'suspend' | 'activate' | 'delete' | null
  onConfirm: (reason?: string) => void
}

export const BulkUserActionsModal: React.FC<BulkUserActionsModalProps> = ({
  isOpen,
  onClose,
  users,
  action,
  onConfirm
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const [reason, setReason] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleConfirm = () => {
    if (action === 'delete' && !confirmDelete) return
    if ((action === 'suspend' || action === 'delete') && !reason.trim()) return
    
    onConfirm(reason.trim() || undefined)
    setReason('')
    setConfirmDelete(false)
    onClose()
  }

  const getActionConfig = () => {
    switch (action) {
      case 'suspend':
        return {
          title: t('admin.users.bulkActions.suspend.title', { defaultValue: 'Suspend Users' }),
          color: 'warning' as const,
          icon: <Ban className="size-5" />,
          description: t('admin.users.bulkActions.suspend.description', { defaultValue: `You are about to suspend ${users.length} users. This will prevent them from accessing the platform.` }),
          requiresReason: true,
          destructive: false
        }
      case 'activate':
        return {
          title: t('admin.users.bulkActions.activate.title', { defaultValue: 'Activate Users' }),
          color: 'success' as const,
          icon: <UserCheck className="size-5" />,
          description: t('admin.users.bulkActions.activate.description', { defaultValue: `You are about to activate ${users.length} users. This will restore their platform access.` }),
          requiresReason: false,
          destructive: false
        }
      case 'delete':
        return {
          title: t('admin.users.bulkActions.delete.title', { defaultValue: 'Delete Users' }),
          color: 'danger' as const,
          icon: <Trash2 className="size-5" />,
          description: t('admin.users.bulkActions.delete.description', { defaultValue: `You are about to permanently delete ${users.length} users and all their data. This action cannot be undone.` }),
          requiresReason: true,
          destructive: true
        }
      default:
        return null
    }
  }

  const config = getActionConfig()
  if (!config) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          {config.icon}
          {config.title}
        </ModalHeader>
        <ModalBody className="space-y-6">
          {/* Action Description */}
          <div className={`rounded-lg border p-4 ${
            config.destructive 
              ? 'border-red-200 bg-red-50' 
              : action === 'suspend' 
              ? 'border-yellow-200 bg-yellow-50' 
              : 'border-green-200 bg-green-50'
          }`}>
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className={`size-5 ${
                config.destructive 
                  ? 'text-red-600' 
                  : action === 'suspend' 
                  ? 'text-yellow-600' 
                  : 'text-green-600'
              }`} />
              <h4 className={`font-semibold ${
                config.destructive 
                  ? 'text-red-900' 
                  : action === 'suspend' 
                  ? 'text-yellow-900' 
                  : 'text-green-900'
              }`}>
                {config.destructive ? t('admin.users.bulkActions.destructiveAction', { defaultValue: 'Destructive Action' }) : t('admin.users.bulkActions.bulkAction', { defaultValue: 'Bulk Action' })}
              </h4>
            </div>
            <p className={`text-sm ${
              config.destructive 
                ? 'text-red-800' 
                : action === 'suspend' 
                ? 'text-yellow-800' 
                : 'text-green-800'
            }`}>
              {config.description}
            </p>
          </div>

          {/* Users List */}
          <div>
            <h4 className="mb-3 font-semibold text-gray-900">
              {t('admin.users.bulkActions.selectedUsers', { defaultValue: `Selected Users (${users.length})` })}
            </h4>
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-2">
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="truncate text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex gap-1">
                    <Chip
                      color={user.status === 'active' ? 'success' : 'warning'}
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
              ))}
            </div>
          </div>

          {/* Reason Input */}
          {config.requiresReason && (
            <div>
              <Textarea
                label={t('admin.users.bulkActions.reason.label', { defaultValue: `Reason for ${action}${action === 'delete' ? 'ion' : 'ing'}` })}
                placeholder={t('admin.users.bulkActions.reason.placeholder', { defaultValue: `Provide a reason for ${action === 'delete' ? 'deleting' : action === 'suspend' ? 'suspending' : ''} these users...` })}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                minRows={3}
                isRequired
              />
            </div>
          )}

          {/* Delete Confirmation */}
          {action === 'delete' && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <Checkbox
                isSelected={confirmDelete}
                onValueChange={setConfirmDelete}
                color="danger"
              >
                <span className="text-sm text-red-800">
                  {t('admin.users.bulkActions.deleteConfirmation', { defaultValue: 'I understand that this action is permanent and cannot be undone. All user data, including bookings, properties, and payment history will be permanently deleted.' })}
                </span>
              </Checkbox>
            </div>
          )}

          {/* Summary */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="mb-2 font-semibold text-gray-900">{t('admin.users.bulkActions.summary.title', { defaultValue: 'Action Summary' })}</h4>
            <div className="space-y-1 text-sm text-gray-700">
              <div>• {t('admin.users.bulkActions.summary.usersAffected', { defaultValue: `${users.length} users will be ${action === 'delete' ? 'deleted' : action}d` })}</div>
              {action === 'suspend' && <div>• {t('admin.users.bulkActions.summary.suspendEffect', { defaultValue: 'Users will lose platform access immediately' })}</div>}
              {action === 'activate' && <div>• {t('admin.users.bulkActions.summary.activateEffect', { defaultValue: 'Users will regain platform access immediately' })}</div>}
              {action === 'delete' && (
                <>
                  <div>• {t('admin.users.bulkActions.summary.deleteEffect1', { defaultValue: 'All user data will be permanently removed' })}</div>
                  <div>• {t('admin.users.bulkActions.summary.deleteEffect2', { defaultValue: 'Associated bookings and properties will be affected' })}</div>
                </>
              )}
              <div>• {t('admin.users.bulkActions.summary.auditTrail', { defaultValue: 'Action will be logged in the audit trail' })}</div>
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            {t('common.actions.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            color={config.color}
            onPress={handleConfirm}
            isDisabled={
              (config.requiresReason && !reason.trim()) || 
              (action === 'delete' && !confirmDelete)
            }
            startContent={config.icon}
          >
            {config.title}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 