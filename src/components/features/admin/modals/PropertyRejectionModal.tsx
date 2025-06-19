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
import { XCircle } from 'lucide-react'
import { Property } from './types'

interface PropertyRejectionModalProps {
  isOpen: boolean
  onClose: () => void
  property: Property | null
  rejectionReason: string
  onReasonChange: (reason: string) => void
  onReject: () => void
}

export const PropertyRejectionModal: React.FC<PropertyRejectionModalProps> = ({
  isOpen,
  onClose,
  property,
  rejectionReason,
  onReasonChange,
  onReject
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-danger-500" />
          Reject Property
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please provide a reason for rejecting this property. This will be sent to the host.
            </p>
            <Textarea
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChange={(e) => onReasonChange(e.target.value)}
              minRows={3}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="danger"
            onPress={onReject}
            isDisabled={!rejectionReason.trim()}
            startContent={<XCircle className="w-4 h-4" />}
          >
            Reject Property
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 