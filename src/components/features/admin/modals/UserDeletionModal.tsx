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
import { Trash2, AlertTriangle, XCircle } from 'lucide-react'
import { AdminUser } from '../../../../interfaces'

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
        <ModalHeader className="flex items-center gap-3 bg-red-50 text-red-900 rounded-t-lg">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Delete User Account</h3>
            <p className="text-sm font-normal text-red-700">This action cannot be undone</p>
          </div>
        </ModalHeader>
        
        <ModalBody className="space-y-6">
          {user && (
            <>
              {/* Danger Notice */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">Permanent Account Deletion</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This will permanently delete the user's account, all their data, bookings, and properties. This action cannot be reversed.
                    </p>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">User Details</h4>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar src={user.avatar} name={user.name} size="md" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
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
                  <div><strong>Total Bookings:</strong> {user.totalBookings}</div>
                  <div><strong>Properties:</strong> {user.totalProperties}</div>
                  <div><strong>Member Since:</strong> {user.joinDate}</div>
                  <div><strong>Last Login:</strong> {user.lastLogin}</div>
                  {user.revenue > 0 && <div><strong>Total Revenue:</strong> ${user.revenue.toLocaleString()}</div>}
                </div>
              </div>

              <Divider />

              {/* Data Impact Warning */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-red-700">Data That Will Be Permanently Deleted:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    User profile and personal information
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    All booking history and records
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Property listings and related data
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Payment history and financial records
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Reviews and ratings given/received
                  </li>
                </ul>
              </div>

              {/* Deletion Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Deletion <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Please provide a detailed reason for permanently deleting this user account..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  minRows={4}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This reason will be logged for audit purposes and legal compliance.
                </p>
              </div>

              {/* Confirmation Checkbox */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <Checkbox
                  isSelected={confirmDelete}
                  onValueChange={setConfirmDelete}
                  color="danger"
                  className="text-red-700"
                >
                  <span className="text-sm font-medium text-red-700">
                    I understand that this action is permanent and cannot be undone. All user data will be permanently deleted.
                  </span>
                </Checkbox>
              </div>
            </>
          )}
        </ModalBody>
        
        <ModalFooter className="bg-gray-50 rounded-b-lg">
          <Button variant="flat" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="danger"
            onPress={handleSubmit}
            isDisabled={!reason.trim() || !confirmDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Permanently Delete Account
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 