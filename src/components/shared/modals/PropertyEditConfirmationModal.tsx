import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip } from '@heroui/react'
import { AlertTriangle, Edit } from 'lucide-react'
import { PropertyEditConfirmation } from '../../../interfaces'

interface PropertyEditConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  confirmation: PropertyEditConfirmation | null
  isLoading?: boolean
}

const PropertyEditConfirmationModal: React.FC<PropertyEditConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  confirmation,
  isLoading = false
}) => {
  if (!confirmation) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success'
      case 'pending': return 'warning'
      case 'paused': return 'secondary'
      case 'rejected': return 'danger'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Approved'
      case 'pending': return 'Pending'
      case 'paused': return 'Paused'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning-500" />
                <h2 className="text-xl font-bold">Confirm Property Edit</h2>
              </div>
              <p className="text-sm text-gray-600 font-normal">
                This action will affect your property's approval status
              </p>
            </ModalHeader>
            
            <ModalBody>
              <div className="space-y-4">
                {/* Property Info */}
                <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={confirmation.property.images[0]}
                    alt={confirmation.property.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {confirmation.property.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {confirmation.property.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-gray-500">Current Status:</span>
                      <Chip 
                        color={getStatusColor(confirmation.currentStatus)}
                        variant="solid"
                        size="sm"
                        className="text-white"
                      >
                        {getStatusLabel(confirmation.currentStatus)}
                      </Chip>
                    </div>
                  </div>
                </div>

                {/* Warning Message */}
                {confirmation.willResetToPending ? (
                  <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-warning-800 mb-1">
                          Status Will Change to Pending
                        </h4>
                        <p className="text-sm text-warning-700">
                          Since this property is currently <strong>{getStatusLabel(confirmation.currentStatus)}</strong>, 
                          making changes will reset its status to <strong>Pending</strong> for admin review.
                        </p>
                        <p className="text-sm text-warning-700 mt-2">
                          Your property will need to be re-approved by an administrator before it becomes visible to guests again.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Edit className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-1">
                          Safe to Edit
                        </h4>
                        <p className="text-sm text-blue-700">
                          Your property is currently <strong>{getStatusLabel(confirmation.currentStatus)}</strong>, 
                          so you can make changes without affecting its approval status.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  <p>Are you sure you want to proceed with editing this property?</p>
                </div>
              </div>
            </ModalBody>
            
            <ModalFooter>
              <Button 
                color="default" 
                variant="light" 
                onPress={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                color={confirmation.willResetToPending ? "warning" : "primary"}
                onPress={onConfirm}
                isLoading={isLoading}
                startContent={!isLoading && <Edit className="w-4 h-4" />}
              >
                {confirmation.willResetToPending ? "Edit & Reset Status" : "Edit Property"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default PropertyEditConfirmationModal 