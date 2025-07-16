import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Avatar,
  Chip,
  Divider
} from '@heroui/react'
import { UserCheck, CheckCircle } from 'lucide-react'
import { AdminUser } from '../../../../interfaces'

interface UserActivationModalProps {
  isOpen: boolean
  onClose: () => void
  user: AdminUser | null
  onConfirm: () => void
}

export const UserActivationModal: React.FC<UserActivationModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirm
}) => {
  const handleSubmit = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader className="flex items-center gap-3 bg-green-50 text-green-900 rounded-t-lg">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Activate User Account</h3>
            <p className="text-sm font-normal text-green-700">Restore full platform access for this user</p>
          </div>
        </ModalHeader>
        
        <ModalBody className="space-y-6">
          {user && (
            <>
              {/* Success Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">Account Activation</h4>
                    <p className="text-sm text-green-700 mt-1">
                      This user will regain full access to the platform including booking properties and listing new accommodations.
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
                        color={user.status === 'suspended' ? 'danger' : 'warning'}
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

              {/* Activation Effects */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">What happens when you activate this account:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    User can log in and access their dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Booking and property listing capabilities restored
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    All platform features become available
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    User status changes to "Active"
                  </li>
                </ul>
              </div>
            </>
          )}
        </ModalBody>
        
        <ModalFooter className="bg-gray-50 rounded-b-lg">
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="success"
            onPress={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Activate User Account
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 