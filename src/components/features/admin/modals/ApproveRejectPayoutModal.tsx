import React, { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Spinner
} from '@heroui/react'
import { PayoutRequest } from '../../../../interfaces'

export interface ApproveRejectPayoutModalProps {
  isOpen: boolean
  onClose: () => void
  request: PayoutRequest | null
  action: 'approve' | 'reject' | null
  onSubmit: (note: string) => Promise<void>
}

export const ApproveRejectPayoutModal: React.FC<ApproveRejectPayoutModalProps> = ({
  isOpen,
  onClose,
  request,
  action,
  onSubmit
}) => {
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!request || !action) return null

  const handleSubmit = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await onSubmit(note)
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Action failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>
          <h2 className="text-lg font-bold">
            {action === 'approve' ? 'Approve' : 'Reject'} Payout Request
          </h2>
        </ModalHeader>
        <ModalBody>
          <div className="mb-2">
            <div className="text-sm text-gray-600 mb-1">Amount:</div>
            <div className="font-semibold">{request.currency} {request.amount.toFixed(2)}</div>
          </div>
          <div className="mb-2">
            <div className="text-sm text-gray-600 mb-1">Host:</div>
            <div className="font-semibold">{request.user_id}</div>
          </div>
          <Textarea
            label="Note (optional)"
            placeholder={action === 'approve' ? 'Add a note for approval...' : 'Reason for rejection...'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            minRows={3}
          />
          {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button
            color={action === 'approve' ? 'primary' : 'danger'}
            onClick={handleSubmit}
            disabled={isLoading}
            startContent={isLoading ? <Spinner size="sm" /> : undefined}
          >
            {isLoading ? (action === 'approve' ? 'Approving...' : 'Rejecting...') : (action === 'approve' ? 'Approve' : 'Reject')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 