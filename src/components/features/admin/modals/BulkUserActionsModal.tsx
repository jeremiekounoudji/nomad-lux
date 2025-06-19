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
import { Users, Ban, UserCheck, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { User } from './userTypes'

interface BulkUserActionsModalProps {
  isOpen: boolean
  onClose: () => void
  users: User[]
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
  const [reason, setReason] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSubmit = () => {
    if (action === 'delete') {
      if (reason.trim() && confirmDelete) {
        onConfirm(reason)
        handleClose()
      }
    } else if (action === 'suspend') {
      if (reason.trim()) {
        onConfirm(reason)
        handleClose()
      }
    } else {
      onConfirm()
      handleClose()
    }
  }

  const handleClose = () => {
    setReason('')
    setConfirmDelete(false)
    onClose()
  }

  const getActionConfig = () => {
    switch (action) {
      case 'suspend':
        return {
          title: 'Suspend Multiple Users',
          description: 'Temporarily disable access for selected users',
          icon: <Ban className="w-5 h-5 text-white" />,
          color: 'orange',
          bgColor: 'bg-orange-500',
          headerBg: 'bg-orange-50',
          headerText: 'text-orange-900',
          buttonColor: 'bg-orange-600 hover:bg-orange-700',
          requiresReason: true
        }
      case 'activate':
        return {
          title: 'Activate Multiple Users',
          description: 'Restore platform access for selected users',
          icon: <UserCheck className="w-5 h-5 text-white" />,
          color: 'green',
          bgColor: 'bg-green-500',
          headerBg: 'bg-green-50',
          headerText: 'text-green-900',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          requiresReason: false
        }
      case 'delete':
        return {
          title: 'Delete Multiple Users',
          description: 'Permanently remove selected user accounts',
          icon: <Trash2 className="w-5 h-5 text-white" />,
          color: 'red',
          bgColor: 'bg-red-500',
          headerBg: 'bg-red-50',
          headerText: 'text-red-900',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          requiresReason: true
        }
      default:
        return {
          title: 'Bulk Action',
          description: 'Perform action on selected users',
          icon: <Users className="w-5 h-5 text-white" />,
          color: 'gray',
          bgColor: 'bg-gray-500',
          headerBg: 'bg-gray-50',
          headerText: 'text-gray-900',
          buttonColor: 'bg-gray-600 hover:bg-gray-700',
          requiresReason: false
        }
    }
  }

  const config = getActionConfig()

  if (!action) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" scrollBehavior="inside">
      <ModalContent className="max-h-[85vh]">
        <ModalHeader className={`flex items-center gap-3 ${config.headerBg} ${config.headerText} rounded-t-lg`}>
          <div className={`w-10 h-10 ${config.bgColor} rounded-full flex items-center justify-center`}>
            {config.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold">{config.title}</h3>
            <p className="text-sm font-normal">{config.description}</p>
          </div>
        </ModalHeader>
        
        <ModalBody className="space-y-6">
          {/* Warning/Info Notice */}
          {action === 'delete' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Permanent Deletion Warning</h4>
                  <p className="text-sm text-red-700 mt-1">
                    This will permanently delete {users.length} user accounts and all their associated data. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          )}

          {action === 'suspend' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Suspension Notice</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    {users.length} user(s) will lose access to the platform immediately. They won't be able to make bookings or list properties.
                  </p>
                </div>
              </div>
            </div>
          )}

          {action === 'activate' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Account Activation</h4>
                  <p className="text-sm text-green-700 mt-1">
                    {users.length} user(s) will regain full platform access including booking and listing capabilities.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Selected Users List */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              Selected Users ({users.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-2 bg-white rounded border">
                  <Avatar src={user.avatar_url} name={user.display_name} size="sm" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{user.display_name}</h3>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
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
              ))}
            </div>
          </div>

          <Divider />

          {/* Reason Input (if required) */}
          {config.requiresReason && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for {action === 'delete' ? 'Deletion' : 'Suspension'} <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder={`Please provide a detailed reason for ${action === 'delete' ? 'deleting' : 'suspending'} these user accounts...`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                minRows={4}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                This reason will be logged for audit purposes{action === 'delete' ? ' and legal compliance' : ' and may be shared with users upon request'}.
              </p>
            </div>
          )}

          {/* Confirmation Checkbox (for delete) */}
          {action === 'delete' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <Checkbox
                isSelected={confirmDelete}
                onValueChange={setConfirmDelete}
                color="danger"
                className="text-red-700"
              >
                <span className="text-sm font-medium text-red-700">
                  I understand that this action is permanent and will delete {users.length} user account(s) and all their data.
                </span>
              </Checkbox>
            </div>
          )}
        </ModalBody>
        
        <ModalFooter className="bg-gray-50 rounded-b-lg">
          <Button variant="flat" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            onPress={handleSubmit}
            isDisabled={
              (config.requiresReason && !reason.trim()) || 
              (action === 'delete' && !confirmDelete)
            }
            className={`${config.buttonColor} text-white`}
          >
            {action === 'delete' ? 'Delete' : action === 'suspend' ? 'Suspend' : 'Activate'} {users.length} User{users.length > 1 ? 's' : ''}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 