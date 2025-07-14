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
      setError('Please enter a valid amount.')
      return
    }
    if (numericAmount > payoutBalance) {
      setError('Amount exceeds available payout balance.')
      return
    }
    if (numericAmount < minimumPayoutAmount) {
      setError(`Minimum payout amount is ${minimumPayoutAmount.toFixed(2)}.`)
      return
    }

    try {
      setIsLoading(true)
      await onSubmit(numericAmount)
      onClose()
    } catch (err: any) {
      console.error('Payout request failed:', err)
      setError(err?.message ?? 'Payout request failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>
          <h2 className="text-lg font-bold">Request Payout</h2>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-gray-600 mb-4">
            Your current payout balance is <span className="font-semibold">{payoutBalance.toFixed(2)}</span>.
            Minimum payout amount is {minimumPayoutAmount.toFixed(2)}.
          </p>
          <Input
            type="number"
            label="Amount"
            startContent={<DollarSign className="w-4 h-4 text-gray-400" />}
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            isRequired
          />
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            className="bg-primary-600 hover:bg-primary-700 text-white"
            onClick={handleRequest}
            disabled={isLoading}
            startContent={isLoading ? <Spinner size="sm" /> : undefined}
          >
            {isLoading ? 'Submitting...' : 'Request Payout'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 