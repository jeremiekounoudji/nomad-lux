import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Spinner,
  Card,
  CardBody,
  Divider
} from '@heroui/react'
import { DollarSign, Clock, AlertTriangle } from 'lucide-react'
import { useTranslation } from '../../../../lib/stores/translationStore'
import { AdminBooking } from '../../../../interfaces'
import { useRefundCalculation } from '../../../../hooks/useRefundCalculation'
import { formatPrice } from '../../../../utils/currencyUtils'
import { RefundCalculation } from '../../../../interfaces/PaymentRecord'

interface RefundModalProps {
  isOpen: boolean
  onClose: () => void
  booking: AdminBooking | null
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
  const { t } = useTranslation('admin')
  const [refundReason, setRefundReason] = useState('')
  const [calculatedRefund, setCalculatedRefund] = useState<RefundCalculation | null>(null)
  
  const { calculateRefund, isLoading: isCalculating, error: refundError } = useRefundCalculation()

  // Calculate refund when modal opens
  useEffect(() => {
    if (isOpen && booking?.id) {
      const fetchRefund = async () => {
        const result = await calculateRefund(booking.id)
        setCalculatedRefund(result)
        if (result?.net_refund) {
          onRefundAmountChange(result.net_refund.toString())
        }
      }
      fetchRefund()
    }
  }, [isOpen, booking?.id, calculateRefund, onRefundAmountChange])

  const handleClose = () => {
    setRefundReason('')
    setCalculatedRefund(null)
    onRefundAmountChange('')
    onClose()
  }

  const handleProcessRefund = () => {
    if (refundReason.trim()) {
      onProcessRefund()
    }
  }

  const maxRefundAmount = calculatedRefund?.net_refund || booking?.totalAmount || 0

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="lg"
      classNames={{
        wrapper: "z-[9999]",
        backdrop: "z-[9998]",
        base: "z-[9999]"
      }}
    >
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary-500" />
            <h2 className="text-xl font-bold">{t('refundModal.title', { id: booking?.id?.slice(0, 8) })}</h2>
          </div>
        </ModalHeader>
        <ModalBody>
          {booking && (
            <div className="space-y-6">
              {/* Booking Info */}
              <Card>
                <CardBody className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={booking.propertyImage || 'https://via.placeholder.com/80x80?text=Property'}
                      alt={booking.propertyName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{booking.propertyName}</h3>
                      <p className="text-sm text-gray-600">{booking.location}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <span>Check-in: {new Date(booking.checkInDate).toLocaleDateString()}</span>
                        <span>Total: {formatPrice(booking.totalAmount, booking.currency || 'USD')}</span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Refund Calculation */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Refund Calculation
                </h4>

                {isCalculating ? (
                  <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                    <Spinner size="sm" />
                    <span className="text-sm text-gray-600">Calculating refund amount...</span>
                  </div>
                ) : refundError ? (
                  <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-danger-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-danger-700">{refundError}</p>
                        <p className="text-xs text-danger-600 mt-1">Using manual refund amount</p>
                      </div>
                    </div>
                  </div>
                ) : calculatedRefund ? (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Original Payment:</span>
                      <span>{formatPrice(calculatedRefund.total_paid, booking.currency || 'USD')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Processing Fee:</span>
                      <span>-{formatPrice(calculatedRefund.processing_fee, booking.currency || 'USD')}</span>
                    </div>
                    <Divider />
                    <div className="flex justify-between font-semibold">
                      <span>Maximum Refund:</span>
                      <span className="text-success-600">{formatPrice(calculatedRefund.net_refund, booking.currency || 'USD')}</span>
                    </div>
                    {calculatedRefund.policy_applied && (
                      <div className="text-xs text-gray-500 mt-1">
                        Policy: {calculatedRefund.policy_applied} ({calculatedRefund.refund_percentage}%)
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Unable to calculate refund</p>
                  </div>
                )}
              </div>

              {/* Refund Amount Input */}
              <div className="space-y-2">
                <Input
                  label="Refund Amount"
                  placeholder="Enter refund amount"
                  value={refundAmount}
                  onChange={(e) => onRefundAmountChange(e.target.value)}
                  startContent={<DollarSign className="w-4 h-4" />}
                  type="number"
                  min="0"
                  max={maxRefundAmount}
                  step="0.01"
                  description={`Maximum: ${formatPrice(maxRefundAmount, booking.currency || 'USD')}`}
                />
              </div>

              {/* Refund Reason */}
              <div className="space-y-2">
                <Textarea
                  label="Refund Reason"
                  placeholder="Enter reason for refund..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  minRows={3}
                  isRequired
                />
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleProcessRefund}
            isDisabled={!refundAmount || !refundReason.trim() || parseFloat(refundAmount) > maxRefundAmount}
          >
            Process Refund
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 