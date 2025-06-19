import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea
} from '@heroui/react'
import { Ban } from 'lucide-react'
import { Property } from './types'

interface PropertySuspensionModalProps {
  isOpen: boolean
  onClose: () => void
  property: Property | null
  suspensionReason: string
  onReasonChange: (reason: string) => void
  onSuspend: () => void
}

export const PropertySuspensionModal: React.FC<PropertySuspensionModalProps> = ({
  isOpen,
  onClose,
  property,
  suspensionReason,
  onReasonChange,
  onSuspend
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Ban className="w-5 h-5 text-warning-500" />
          Suspend Property
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
                <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Ban className="w-5 h-5 text-warning-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-warning-800">Suspend this property?</p>
                      <p className="text-sm text-warning-700 mt-1">
                        This will temporarily hide the property from guests and prevent new bookings.
                        Existing bookings will remain active. The host will be notified.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">
                Reason for suspension <span className="text-danger-500">*</span>
              </label>
              <Textarea
                placeholder="Please provide a reason for suspending this property..."
                value={suspensionReason}
                onChange={(e) => onReasonChange(e.target.value)}
                minRows={3}
                variant="bordered"
                description="This reason will be sent to the host and recorded in the property history."
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="warning"
            onPress={onSuspend}
            isDisabled={!suspensionReason.trim()}
            startContent={<Ban className="w-4 h-4" />}
          >
            Suspend Property
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 