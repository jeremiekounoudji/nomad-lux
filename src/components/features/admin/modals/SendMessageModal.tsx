import React, { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Avatar,
  Textarea,
  Chip,
  Divider,
  Tabs,
  Tab,
  Input,
  Select,
  SelectItem,
  Card,
  CardBody
} from '@heroui/react'
import { MessageSquare, Mail, Smartphone, Bell, Send } from 'lucide-react'
import { User } from './userTypes'

interface SendMessageModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  users?: User[] // For bulk messaging
  onSend: (messageData: MessageData) => void
}

interface MessageData {
  type: 'email' | 'sms' | 'push'
  subject?: string
  message: string
  recipients: string[]
}

export const SendMessageModal: React.FC<SendMessageModalProps> = ({
  isOpen,
  onClose,
  user,
  users = [],
  onSend
}) => {
  const [messageType, setMessageType] = useState<'email' | 'sms' | 'push'>('email')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const recipientList = user ? [user] : users
  const isMultiple = recipientList.length > 1

  const handleSubmit = () => {
    if (message.trim() && (messageType !== 'email' || subject.trim())) {
      const messageData: MessageData = {
        type: messageType,
        subject: messageType === 'email' ? subject : undefined,
        message,
        recipients: recipientList.map(u => u.email)
      }
      onSend(messageData)
      handleClose()
    }
  }

  const handleClose = () => {
    setMessageType('email')
    setSubject('')
    setMessage('')
    onClose()
  }

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />
      case 'sms': return <Smartphone className="w-4 h-4" />
      case 'push': return <Bell className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  const getPlaceholderText = () => {
    switch (messageType) {
      case 'email':
        return 'Enter your email message here...\n\nThis email will be sent to the selected user(s) with your admin signature.'
      case 'sms':
        return 'Enter your SMS message here (160 characters max)...'
      case 'push':
        return 'Enter your push notification message here...'
      default:
        return 'Enter your message here...'
    }
  }

  const getMaxLength = () => {
    switch (messageType) {
      case 'sms': return 160
      case 'push': return 100
      default: return 1000
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalContent>
        <ModalHeader className="flex items-center gap-3 bg-blue-50 text-blue-900 rounded-t-lg">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">
              Send Message {isMultiple ? `to ${recipientList.length} Users` : `to ${user?.display_name}`}
            </h3>
            <p className="text-sm font-normal text-blue-700">
              Communicate directly with platform users
            </p>
          </div>
        </ModalHeader>
        
        <ModalBody className="space-y-6">
          {/* Recipients Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              {isMultiple ? 'Recipients' : 'Recipient'}
            </h4>
            
            {isMultiple ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {recipientList.map((recipient) => (
                  <div key={recipient.id} className="flex items-center gap-2 text-sm">
                    <Avatar src={recipient.avatar_url} name={recipient.display_name} size="sm" />
                    <span className="font-medium">{recipient.display_name}</span>
                    <span className="text-gray-500">({recipient.email})</span>
                    <Chip
                      color={recipient.status === 'active' ? 'success' : 'warning'}
                      size="sm"
                      variant="flat"
                    >
                      {recipient.status}
                    </Chip>
                  </div>
                ))}
              </div>
            ) : user && (
              <div className="flex items-center gap-3">
                <Avatar src={user.avatar_url} name={user.display_name} size="md" />
                <div>
                  <h3 className="font-semibold text-gray-900">{user.display_name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-400">{user.phone}</p>
                </div>
              </div>
            )}
          </div>

          <Divider />

          {/* Message Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Message Type
            </label>
            <Tabs
              selectedKey={messageType}
              onSelectionChange={(key) => setMessageType(key as 'email' | 'sms' | 'push')}
              variant="bordered"
            >
              <Tab key="email" title={
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </div>
              } />
              <Tab key="sms" title={
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  SMS
                </div>
              } />
              <Tab key="push" title={
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Push Notification
                </div>
              } />
            </Tabs>
          </div>

          {/* Subject Field (Email only) */}
          {messageType === 'email' && (
            <div>
              <Input
                label="Subject"
                placeholder="Enter email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                startContent={<Mail className="w-4 h-4 text-gray-400" />}
                isRequired
              />
            </div>
          )}

          {/* Message Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Content <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder={getPlaceholderText()}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              minRows={messageType === 'email' ? 6 : 4}
              maxRows={messageType === 'email' ? 10 : 6}
              maxLength={getMaxLength()}
              className="w-full"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                {messageType === 'email' 
                  ? 'Professional email with admin signature will be sent'
                  : messageType === 'sms'
                  ? 'SMS charges may apply'
                  : 'Push notification will appear in user\'s app'
                }
              </p>
              <p className="text-xs text-gray-400">
                {message.length}/{getMaxLength()}
              </p>
            </div>
          </div>

          {/* Message Preview */}
          <Card className="bg-gray-50 border-dashed border-2 border-gray-200">
            <CardBody className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {getMessageTypeIcon(messageType)}
                <span className="text-sm font-medium text-gray-700">Preview</span>
              </div>
              <div className="text-sm text-gray-600">
                {messageType === 'email' && subject && (
                  <div className="mb-2">
                    <strong>Subject:</strong> {subject}
                  </div>
                )}
                <div>
                  {message || 'Your message will appear here...'}
                </div>
                {messageType === 'email' && (
                  <div className="mt-3 pt-3 border-t border-gray-300 text-xs text-gray-500">
                    <p>Best regards,</p>
                    <p>Nomad Lux Admin Team</p>
                    <p>admin@nomadlux.com</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </ModalBody>
        
        <ModalFooter className="bg-gray-50 rounded-b-lg">
          <Button variant="flat" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isDisabled={!message.trim() || (messageType === 'email' && !subject.trim())}
            startContent={<Send className="w-4 h-4" />}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Send {messageType === 'email' ? 'Email' : messageType === 'sms' ? 'SMS' : 'Notification'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 