import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Textarea
} from '@heroui/react'
import { Dispute } from '../../../../interfaces'

interface DisputeManagementModalProps {
  isOpen: boolean
  onClose: () => void
  dispute: Dispute | null
  disputeMessage: string
  onDisputeMessageChange: (message: string) => void
  onSendMessage: () => void
  getDisputePriorityColor: (priority: string) => 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
}

export const DisputeManagementModal: React.FC<DisputeManagementModalProps> = ({
  isOpen,
  onClose,
  dispute,
  disputeMessage,
  onDisputeMessageChange,
  onSendMessage,
  getDisputePriorityColor
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalContent>
        <ModalHeader>
          Dispute Management - #{dispute?.id}
        </ModalHeader>
        <ModalBody>
          {dispute && (
            <div className="space-y-6">
              {/* Dispute Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Dispute Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Type:</strong> {dispute.type.replace('_', ' ')}</div>
                    <div><strong>Priority:</strong> 
                      <Chip 
                        color={getDisputePriorityColor(dispute.priority)} 
                        variant="flat" 
                        size="sm" 
                        className="ml-2"
                      >
                        {dispute.priority}
                      </Chip>
                    </div>
                    <div><strong>Reporter:</strong> {dispute.reporter}</div>
                    <div><strong>Status:</strong> {dispute.status}</div>
                    <div><strong>Created:</strong> {dispute.createdDate}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Assignment</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Assigned to:</strong> {dispute.assignedTo || 'Unassigned'}</div>
                    <div><strong>Booking ID:</strong> {dispute.bookingId}</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{dispute.description}</p>
                </div>
              </div>

              {/* Messages Thread */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Communication Thread</h4>
                <div className="max-h-64 overflow-y-auto space-y-3 border border-gray-200 rounded-lg p-4">
                  {dispute.messages.map((message) => (
                    <div key={message.id} className={`p-3 rounded-lg ${message.isAdmin ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">{message.sender}</span>
                        <span className="text-xs text-gray-500">{message.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-700">{message.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response Input */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Add Response</h4>
                <Textarea
                  value={disputeMessage}
                  onChange={(e) => onDisputeMessageChange(e.target.value)}
                  placeholder="Type your response..."
                  minRows={3}
                />
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Close
          </Button>
          <Button 
            color="primary" 
            onPress={onSendMessage}
            isDisabled={!disputeMessage.trim()}
          >
            Send Response
          </Button>
          <Button color="success">
            Resolve Dispute
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 