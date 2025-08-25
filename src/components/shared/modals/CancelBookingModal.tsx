import React, { useState, useEffect } from 'react'
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
  Chip,
  Spinner
} from '@heroui/react'
import { XCircle, AlertTriangle, Calendar, DollarSign, Clock } from 'lucide-react'
import { CancelBookingModalProps } from '../../../interfaces/Component'
import { useTranslation } from '../../../lib/stores/translationStore'
import { useRefundCalculation } from '../../../hooks/useRefundCalculation'
import { useCancellationSettings } from '../../../hooks/useCancellationSettings'
import { RefundCalculation } from '../../../interfaces/PaymentRecord'
import { formatPrice } from '../../../utils/currencyUtils'

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onConfirmCancel
}) => {
  const { t } = useTranslation(['booking', 'common'])
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [refundData, setRefundData] = useState<RefundCalculation | null>(null)

  // Hooks for refund calculation and settings
  const { calculateRefund, isLoading: isCalculatingRefund, error: refundError } = useRefundCalculation()
  const { settings: cancellationSettings, isLoading: isLoadingSettings } = useCancellationSettings()

  const cancellationReasonKeys = [
    'changePlans',
    'foundAlternative',
    'emergency',
    'notAsDescribed',
    'hostUnavailable',
    'other'
  ] as const

  // Calculate refund when modal opens
  useEffect(() => {
    if (isOpen && booking.id) {
      const fetchRefund = async () => {
        const result = await calculateRefund(booking.id)
        setRefundData(result)
      }
      fetchRefund()
    }
  }, [isOpen, booking.id, calculateRefund])

  const handleCancel = async () => {
    const finalReason = reason === 'other' ? customReason : t(`booking.cancel.reason.${reason}`)
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
    setRefundData(null)
    onClose()
  }

  // Helper function to format hours into readable text
  const formatHoursToText = (hours: number): string => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24)
      return `${days} day${days > 1 ? 's' : ''}`
    }
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }

  // Get refund amount from RPC result or fallback to 0
  const refundAmount = refundData?.net_refund || 0
  const totalPaid = refundData?.total_paid || booking.totalPrice
  const processingFee = refundData?.processing_fee || 0

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        wrapper: "z-[9999]",
        backdrop: "z-[9998]",
        base: "z-[9999]"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <XCircle className="w-6 h-6 text-danger-500" />
                <h2 className="text-xl font-bold">{t('booking.cancel.title')}</h2>
              </div>
              <p className="text-sm text-gray-600">{t('booking.cancel.subtitle')}</p>
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
                          <Chip size="sm" color="primary" variant="flat">{t('booking.labels.guestsCount', { count: booking.guests })}</Chip>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Cancellation Policy - Updated for booking-based logic */}
                <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-warning-800">{t('booking.cancel.policy.title')}</h4>
                      <p className="text-sm text-warning-700 mt-1">{t('booking.cancel.policy.description')}</p>
                      
                      {isLoadingSettings ? (
                        <div className="flex items-center gap-2 mt-2">
                          <Spinner size="sm" />
                          <span className="text-sm text-warning-700">{t('common.messages.loading')}</span>
                        </div>
                      ) : cancellationSettings ? (
                        <ul className="text-sm text-warning-700 mt-2 space-y-1">
                          <li>• {t('booking.cancel.policy.rule24h')}</li>
                          <li>• {t('booking.cancel.policy.rule7d')}</li>
                          <li>• {t('booking.cancel.policy.rule14d')}</li>
                        </ul>
                      ) : (
                        <ul className="text-sm text-warning-700 mt-2 space-y-1">
                          <li>• {t('booking.cancel.policy.rule24h')}</li>
                          <li>• {t('booking.cancel.policy.rule7d')}</li>
                          <li>• {t('booking.cancel.policy.rule14d')}</li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* Refund Breakdown - Now Dynamic */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    {t('booking.cancel.refund.title')}
                  </h4>
                  
                  {isCalculatingRefund ? (
                    <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                      <Spinner size="sm" />
                      <span className="text-sm text-gray-600">{t('booking.messages.cancelling')}</span>
                    </div>
                  ) : refundError ? (
                    <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
                      <p className="text-sm text-danger-700">{refundError}</p>
                      <p className="text-xs text-danger-600 mt-1">{t('common.messages.error')}</p>
                    </div>
                  ) : refundData ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>{t('booking.cancel.refund.originalTotal')}</span>
                        <span>{formatPrice(totalPaid, booking.currency)}</span>
                      </div>
                      {processingFee > 0 && (
                        <div className="flex justify-between text-danger-600">
                          <span>{t('booking.cancel.refund.serviceFeeNonRefundable')}</span>
                          <span>-{formatPrice(processingFee, booking.currency)}</span>
                        </div>
                      )}
                      <Divider />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>{t('booking.cancel.refund.refundAmount')}</span>
                        <span className={refundAmount > 0 ? 'text-success-600' : 'text-danger-600'}>
                          {formatPrice(refundAmount, booking.currency)}
                        </span>
                      </div>
                      {refundData.policy_applied && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{t('booking.labels.cancellationPolicy')}: {refundData.policy_applied}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{t('common.messages.error')}</p>
                    </div>
                  )}
                </div>

                {/* Cancellation Reason */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900">{t('booking.cancel.reason.title')}</h5>
                  
                  <RadioGroup
                    value={reason}
                    onValueChange={setReason}
                    orientation="vertical"
                  >
                    {cancellationReasonKeys.map((reasonKey) => (
                      <Radio key={reasonKey} value={reasonKey}>
                        {t(`booking.cancel.reason.${reasonKey}`)}
                      </Radio>
                    ))}
                  </RadioGroup>

                  {reason === 'other' && (
                    <Textarea
                      placeholder={t('booking.cancel.reason.placeholder')}
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      minRows={3}
                    />
                  )}
                </div>

                {/* Warning */}
                <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-danger-600 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-danger-800">{t('booking.cancel.warning.title')}</h5>
                      <p className="text-sm text-danger-700 mt-1">{t('booking.cancel.warning.message')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button 
                color="default" 
                variant="light" 
                onPress={handleClose}
                isDisabled={isLoading}
              >
                {t('common.buttons.cancel')}
              </Button>
              <Button 
                color="danger" 
                onPress={handleCancel}
                isLoading={isLoading}
                isDisabled={!reason.trim() || (reason === 'other' && !customReason.trim())}
              >
                {isLoading ? t('booking.actions.cancelling') : t('booking.actions.confirmCancellation')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
} 