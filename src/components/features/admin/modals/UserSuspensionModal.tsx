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
import { User } from './userTypes'

interface UserSuspensionModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onConfirm: (reason: string) => void
}

export const UserSuspensionModal: React.FC<UserSuspensionModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirm
}) => {
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
        <ModalHeader className="flex items-center gap-3 bg-orange-50 text-orange-900 rounded-t-lg">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <Ban className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Suspend User Account</h3>
            <p className="text-sm font-normal text-orange-700">This action will temporarily disable the user's access</p>
          </div>
        </ModalHeader>
        
        <ModalBody className="space-y-6">
          {user && (
            <>
              {/* Warning Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Important Notice</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Suspending this user will immediately restrict their access to the platform. They will not be able to make new bookings or list properties.
                    </p>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">User Details</h4>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar src={user.avatar_url} name={user.display_name} size="md" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.display_name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
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
                  <div><strong>Total Bookings:</strong> {user.totalBookings}</div>
                  <div><strong>Properties:</strong> {user.totalProperties}</div>
                  <div><strong>Member Since:</strong> {user.joinDate}</div>
                  <div><strong>Last Login:</strong> {user.lastLogin}</div>
                </div>
              </div>

              <Divider />

              {/* Suspension Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Suspension <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Please provide a detailed reason for suspending this user account..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  minRows={4}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This reason will be logged and may be shared with the user upon request.
                </p>
              </div>
            </>
          )}
        </ModalBody>
        
        <ModalFooter className="bg-gray-50 rounded-b-lg">
          <Button variant="flat" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="warning"
            onPress={handleSubmit}
            isDisabled={!reason.trim()}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Suspend User Account
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 