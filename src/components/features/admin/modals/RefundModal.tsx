import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea
} from '@heroui/react'
import { DollarSign } from 'lucide-react'
import { Booking } from './bookingTypes'

interface RefundModalProps {
  isOpen: boolean
  onClose: () => void
  booking: Booking | null
  refundAmount: string
  onRefundAmountChange: (amount: string) => void
  onProcessRefund: () => void
}

export const RefundModal: React.FC<RefundModalProps> = ({
  isOpen,
  onClose,
  booking,
  refundAmount,
  onRefundAmountChange,
  onProcessRefund
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          Process Refund - {booking?.id}
        </ModalHeader>
        <ModalBody>
          {booking && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Original Payment</div>
                <div className="text-2xl font-bold">${booking.totalAmount.toLocaleString()}</div>
              </div>
              
              <Input
                label="Refund Amount"
                placeholder="Enter refund amount"
                value={refundAmount}
                onChange={(e) => onRefundAmountChange(e.target.value)}
                startContent={<DollarSign className="w-4 h-4" />}
              />
              
              <Textarea
                label="Refund Reason"
                placeholder="Reason for refund..."
                minRows={3}
              />
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={onProcessRefund}
            isDisabled={!refundAmount}
          >
            Process Refund
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 