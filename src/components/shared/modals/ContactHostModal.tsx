import React, { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Avatar,
  Chip,
  Card,
  CardBody,
  RadioGroup,
  Radio
} from '@heroui/react'
import { MessageCircle, Star, Send, MapPin } from 'lucide-react'
import { ContactHostModalProps } from '../../../interfaces/Component'

export const ContactHostModal: React.FC<ContactHostModalProps> = ({
  isOpen,
  onClose,
  property,
  onSendMessage
}) => {
  const [messageType, setMessageType] = useState('general')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const messageTypes = [
    { value: 'general', label: 'General inquiry' },
    { value: 'booking', label: 'Booking question' },
    { value: 'amenities', label: 'Ask about amenities' },
    { value: 'location', label: 'Location and directions' },
    { value: 'checkin', label: 'Check-in process' },
    { value: 'house_rules', label: 'House rules' }
  ]

  const getPrefilledMessage = (type: string) => {
    switch (type) {
      case 'booking':
        return "Hi! I'm interested in booking your property. Could you please provide more details about availability and the booking process?"
      case 'amenities':
        return "Hello! I'd like to know more about the amenities available at your property. Are there any additional facilities not mentioned in the listing?"
      case 'location':
        return "Hi! Could you please provide more information about the location and how to get to your property? Are there any specific landmarks nearby?"
      case 'checkin':
        return "Hello! I'd like to understand the check-in process. What time can I check in, and how will I receive the keys?"
      case 'house_rules':
        return "Hi! Could you please clarify the house rules for your property? I want to make sure I understand all the guidelines."
      default:
        return ''
    }
  }

  const handleTypeChange = (type: string) => {
    setMessageType(type)
    const prefilledMessage = getPrefilledMessage(type)
    if (prefilledMessage && !message) {
      setMessage(prefilledMessage)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return

    setIsLoading(true)
    try {
      await onSendMessage(message)
      handleClose()
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setMessageType('general')
    setMessage('')
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
                <MessageCircle className="w-6 h-6 text-primary-500" />
                <h2 className="text-xl font-bold">Contact Host</h2>
              </div>
              <p className="text-sm text-gray-600">Send a message about this property</p>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* Property Info */}
                <Card>
                  <CardBody className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{property.title}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{`${property.location.city}, ${property.location.country}`}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{property.rating}</span>
                          <span className="text-lg font-bold text-primary-600 ml-2">
                            ${property.price}/night
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Host Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                  <Avatar src={property.host?.avatar_url} size="lg" />
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{property.host?.display_name}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <Chip size="sm" color="success" variant="flat">
                      Superhost
                    </Chip>
                    <span className="text-sm text-gray-600">
                      {property.host?.experience || 4} years hosting
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">4.9 host rating</span>
                      <span className="text-sm text-gray-500">• Usually responds within a few hours</span>
                    </div>
                  </div>
                </div>

                {/* Message Type */}
                <div className="space-y-4">
                  <h4 className="font-semibold">What would you like to ask about?</h4>
                  <RadioGroup
                    value={messageType}
                    onValueChange={handleTypeChange}
                    classNames={{
                      wrapper: "space-y-2"
                    }}
                  >
                    {messageTypes.map((type) => (
                      <Radio key={type.value} value={type.value}>
                        {type.label}
                      </Radio>
                    ))}
                  </RadioGroup>
                </div>

                {/* Message Input */}
                <div className="space-y-2">
                  <label className="font-semibold">Your message</label>
                  <Textarea
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    minRows={6}
                    maxRows={10}
                    isRequired
                  />
                  <p className="text-xs text-gray-500">
                    Be specific about your needs and questions. The host will get back to you soon!
                  </p>
                </div>

                {/* Guidelines */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Message Guidelines</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Be respectful and courteous in your communication</li>
                    <li>• Include specific dates if asking about availability</li>
                    <li>• Mention the number of guests if relevant</li>
                    <li>• Ask one question at a time for clarity</li>
                  </ul>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={handleClose}>
                Cancel
              </Button>
              <Button 
                color="primary" 
                onPress={handleSendMessage}
                isLoading={isLoading}
                isDisabled={!message.trim()}
                startContent={!isLoading && <Send className="w-4 h-4" />}
              >
                {isLoading ? 'Sending...' : 'Send Message'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
} 