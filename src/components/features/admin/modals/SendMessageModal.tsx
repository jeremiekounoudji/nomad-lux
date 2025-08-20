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
import { AdminUser } from '../../../../interfaces'
import { useTranslation } from '../../../../lib/stores/translationStore'

interface SendMessageModalProps {
  isOpen: boolean
  onClose: () => void
  user: AdminUser | null
  users?: AdminUser[] // For bulk messaging
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
  const { t } = useTranslation(['admin', 'common']);
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
        return t('admin.messages.placeholders.email', { defaultValue: 'Enter your email message here...\n\nThis email will be sent to the selected user(s) with your admin signature.' })
      case 'sms':
        return t('admin.messages.placeholders.sms', { defaultValue: 'Enter your SMS message here (160 characters max)...' })
      case 'push':
        return t('admin.messages.placeholders.push', { defaultValue: 'Enter your push notification message here...' })
      default:
        return t('admin.messages.placeholders.default', { defaultValue: 'Enter your message here...' })
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
    <Modal isOpen={isOpen} onClose={handleClose} size="3xl">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary-500" />
          {isMultiple 
            ? t('admin.messages.sendToMultiple', { defaultValue: `Send Message to ${recipientList.length} Users` })
            : t('admin.messages.sendToUser', { defaultValue: `Send Message to ${user?.name}` })
          }
        </ModalHeader>
        <ModalBody className="gap-6">
          {/* Recipients Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {isMultiple ? t('admin.messages.recipients', { defaultValue: 'Recipients' }) : t('admin.messages.recipient', { defaultValue: 'Recipient' })}
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {recipientList.map((recipient) => (
                <div key={recipient.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <Avatar
                    src={recipient.avatar}
                    name={recipient.name}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{recipient.name}</p>
                    <p className="text-xs text-gray-500 truncate">{recipient.email}</p>
                  </div>
                  <div className="flex gap-1">
                    <Chip
                      color={recipient.status === 'active' ? 'success' : 'warning'}
                      size="sm"
                      variant="flat"
                      className="capitalize"
                    >
                      {recipient.status}
                    </Chip>
                    <Chip
                      color="secondary"
                      size="sm"
                      variant="flat"
                      className="capitalize"
                    >
                      {recipient.role}
                    </Chip>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Divider />

          {/* Message Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('admin.messages.messageType', { defaultValue: 'Message Type' })}
            </label>
            <Tabs
              selectedKey={messageType}
              onSelectionChange={(key) => setMessageType(key as 'email' | 'sms' | 'push')}
              variant="bordered"
            >
              <Tab key="email" title={
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t('admin.messages.types.email', { defaultValue: 'Email' })}
                </div>
              } />
              <Tab key="sms" title={
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  {t('admin.messages.types.sms', { defaultValue: 'SMS' })}
                </div>
              } />
              <Tab key="push" title={
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  {t('admin.messages.types.push', { defaultValue: 'Push Notification' })}
                </div>
              } />
            </Tabs>
          </div>

          {/* Subject Field (Email only) */}
          {messageType === 'email' && (
            <div>
              <Input
                label={t('admin.messages.subject', { defaultValue: 'Subject' })}
                placeholder={t('admin.messages.subjectPlaceholder', { defaultValue: 'Enter email subject...' })}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                startContent={<Mail className="w-4 h-4 text-gray-400" />}
                isRequired
              />
            </div>
          )}

          {/* Message Content */}
          <div>
            <Textarea
              label={t('admin.messages.message', { defaultValue: 'Message' })}
              placeholder={getPlaceholderText()}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              minRows={4}
              maxRows={8}
              maxLength={getMaxLength()}
              description={t('admin.messages.characterCount', { defaultValue: `${message.length}/${getMaxLength()} characters` })}
              isRequired
            />
          </div>

          {/* Message Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">{t('admin.messages.preview', { defaultValue: 'Preview' })}</label>
            <Card className="bg-gray-50 border-dashed border-2 border-gray-200">
              <CardBody className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {getMessageTypeIcon(messageType)}
                  <span className="text-sm font-medium text-gray-700">{t('admin.messages.preview', { defaultValue: 'Preview' })}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {messageType === 'email' && subject && (
                    <div className="mb-2">
                      <strong>{t('admin.messages.subject', { defaultValue: 'Subject' })}:</strong> {subject}
                    </div>
                  )}
                  <div>
                    {message || t('admin.messages.previewPlaceholder', { defaultValue: 'Your message will appear here...' })}
                  </div>
                  {messageType === 'email' && (
                    <div className="mt-3 pt-3 border-t border-gray-300 text-xs text-gray-500">
                      <p>{t('admin.messages.signature.bestRegards', { defaultValue: 'Best regards,' })}</p>
                      <p>{t('admin.messages.signature.team', { defaultValue: 'Nomad Lux Admin Team' })}</p>
                      <p>{t('admin.messages.signature.email', { defaultValue: 'admin@nomadlux.com' })}</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </ModalBody>
        
        <ModalFooter className="bg-gray-50 rounded-b-lg">
          <Button variant="flat" onPress={handleClose}>
            {t('common.actions.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isDisabled={!message.trim() || (messageType === 'email' && !subject.trim())}
            startContent={<Send className="w-4 h-4" />}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {messageType === 'email' 
              ? t('admin.messages.sendEmail', { defaultValue: 'Send Email' })
              : messageType === 'sms' 
              ? t('admin.messages.sendSMS', { defaultValue: 'Send SMS' })
              : t('admin.messages.sendNotification', { defaultValue: 'Send Notification' })
            }
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 