import React, { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  RadioGroup,
  Radio,
  Card,
  CardBody,
  Divider,
  Chip
} from '@heroui/react'
import { XCircle, AlertTriangle, Calendar, DollarSign } from 'lucide-react'
import { CancelBookingModalProps } from '../../../interfaces/Component'

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onConfirmCancel
}) => {
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const cancellationReasons = [
    'Change of plans',
    'Found alternative accommodation',
    'Emergency situation',
    'Property not as described',
    'Host unavailable/unresponsive',
    'Other'
  ]

  const calculateRefund = () => {
    const checkInDate = new Date(booking.checkIn)
    const today = new Date()
    const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilCheckIn >= 7) {
      return booking.totalPrice * 0.9 // 90% refund for 7+ days
    } else if (daysUntilCheckIn >= 3) {
      return booking.totalPrice * 0.5 // 50% refund for 3-6 days
    } else {
      return 0 // No refund for less than 3 days
    }
  }

  const refundAmount = calculateRefund()
  const serviceFee = booking.totalPrice * 0.1

  const handleCancel = async () => {
    const finalReason = reason === 'Other' ? customReason : reason
    if (!finalReason.trim()) return

    setIsLoading(true)
    try {
      await onConfirmCancel(finalReason)
      handleClose()
    } catch (error) {
      console.error('Cancellation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setReason('')
    setCustomReason('')
    onClose()
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <XCircle className="w-6 h-6 text-danger-500" />
                <h2 className="text-xl font-bold">Cancel Booking</h2>
              </div>
              <p className="text-sm text-gray-600">We're sorry to see you cancel your booking</p>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* Booking Info */}
                <Card>
                  <CardBody className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={booking.propertyImage}
                        alt={booking.propertyName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{booking.propertyName}</h3>
                        <p className="text-sm text-gray-600">{booking.location}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</span>
                          </div>
                          <Chip size="sm" color="primary" variant="flat">
                            {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                          </Chip>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Cancellation Policy */}
                <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-warning-800">Cancellation Policy</h4>
                      <p className="text-sm text-warning-700 mt-1">
                        Your refund amount depends on when you cancel:
                      </p>
                      <ul className="text-sm text-warning-700 mt-2 space-y-1">
                        <li>• 7+ days before check-in: 90% refund</li>
                        <li>• 3-6 days before check-in: 50% refund</li>
                        <li>• Less than 3 days: No refund</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Refund Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Refund Breakdown
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Original booking total</span>
                      <span>${booking.totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-danger-600">
                      <span>Service fee (non-refundable)</span>
                      <span>-${serviceFee.toFixed(2)}</span>
                    </div>
                    <Divider />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Refund amount</span>
                      <span className={refundAmount > 0 ? 'text-success-600' : 'text-danger-600'}>
                        ${refundAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cancellation Reason */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Why are you cancelling?</h4>
                  <RadioGroup
                    value={reason}
                    onValueChange={setReason}
                    classNames={{
                      wrapper: "space-y-2"
                    }}
                  >
                    {cancellationReasons.map((reasonOption) => (
                      <Radio key={reasonOption} value={reasonOption}>
                        {reasonOption}
                      </Radio>
                    ))}
                  </RadioGroup>

                  {reason === 'Other' && (
                    <Textarea
                      label="Please specify"
                      placeholder="Tell us more about your reason for cancelling"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      minRows={3}
                      isRequired
                    />
                  )}
                </div>

                {/* Warning */}
                <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-danger-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-danger-800">Important</h4>
                      <p className="text-sm text-danger-700 mt-1">
                        Once you cancel this booking, it cannot be undone. You'll need to make a new booking if you change your mind.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={handleClose}>
                Keep Booking
              </Button>
              <Button 
                color="danger" 
                onPress={handleCancel}
                isLoading={isLoading}
                isDisabled={!reason || (reason === 'Other' && !customReason.trim())}
              >
                {isLoading ? 'Cancelling...' : 'Cancel Booking'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
} 