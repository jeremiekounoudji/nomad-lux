import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from '@heroui/react'
import { CheckCircle } from 'lucide-react'
import { Property } from './types'

interface PropertyApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  property: Property | null
  onApprove: () => void
}

export const PropertyApprovalModal: React.FC<PropertyApprovalModalProps> = ({
  isOpen,
  onClose,
  property,
  onApprove
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-success-500" />
          Approve Property
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {property && (
              <>
                <div className="flex items-start gap-4">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{property.title}</h4>
                    <p className="text-sm text-gray-600">{property.location}</p>
                    <p className="text-sm text-gray-600">Host: {property.host.display_name}</p>
                  </div>
                </div>
                <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-success-800">Ready to approve this property?</p>
                      <p className="text-sm text-success-700 mt-1">
                        This will make the property visible to guests and allow bookings to be made.
                        The host will be notified of the approval.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="success"
            onPress={onApprove}
            startContent={<CheckCircle className="w-4 h-4" />}
          >
            Confirm Approval
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 