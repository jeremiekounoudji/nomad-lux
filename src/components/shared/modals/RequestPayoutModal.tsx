import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner
} from '@heroui/react'
import { DollarSign } from 'lucide-react'
import { useTranslation } from '../../../lib/stores/translationStore'

export interface RequestPayoutModalProps {
  isOpen: boolean
  onClose: () => void
  payoutBalance: number
  minimumPayoutAmount: number
  onSubmit: (amount: number) => Promise<void>
}

export const RequestPayoutModal: React.FC<RequestPayoutModalProps> = ({
  isOpen,
  onClose,
  payoutBalance,
  minimumPayoutAmount,
  onSubmit
}) => {
  const { t } = useTranslation(['wallet', 'common'])
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setAmount(payoutBalance.toFixed(2))
      setError(null)
    }
  }, [isOpen, payoutBalance])

  const handleRequest = async () => {
    setError(null)
    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError(t('wallet.requestPayout.errors.invalidAmount'))
      return
    }
    if (numericAmount > payoutBalance) {
      setError(t('wallet.requestPayout.errors.exceedsBalance'))
      return
    }
    if (numericAmount < minimumPayoutAmount) {
      setError(t('wallet.requestPayout.errors.minimumAmount', { amount: minimumPayoutAmount.toFixed(2) }))
      return
    }

    try {
      setIsLoading(true)
      await onSubmit(numericAmount)
      onClose()
    } catch (err: any) {
      console.error('Payout request failed:', err)
      setError(err?.message ?? t('wallet.requestPayout.errors.requestFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>
          <h2 className="text-lg font-bold">{t('wallet.requestPayout.title')}</h2>
        </ModalHeader>
        <ModalBody>
          <p className="mb-4 text-sm text-gray-600">
            {t('wallet.requestPayout.subtitle', { balance: payoutBalance.toFixed(2), min: minimumPayoutAmount.toFixed(2) })}
          </p>
          <Input
            type="number"
            label={t('wallet.requestPayout.amountLabel')}
            startContent={<DollarSign className="size-4 text-gray-400" />}
            placeholder={t('wallet.requestPayout.amountPlaceholder')}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            isRequired
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {t('common.buttons.cancel')}
          </Button>
          <Button
            className="bg-primary-600 text-white hover:bg-primary-700"
            onClick={handleRequest}
            disabled={isLoading}
            startContent={isLoading ? <Spinner size="sm" /> : undefined}
          >
            {isLoading ? t('wallet.requestPayout.submitting') : t('wallet.requestPayout.submit')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 