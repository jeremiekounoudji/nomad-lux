import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Avatar,
  Card,
  CardBody,
} from '@heroui/react'
import { MessageCircle, Star, MapPin, Phone, Mail, MessageSquare } from 'lucide-react'
import { ContactHostModalProps } from '../../../interfaces/Component'

export const ContactHostModal: React.FC<ContactHostModalProps> = ({
  isOpen,
  onClose,
  property
}) => {
  const handleCall = () => {
    window.location.href = `tel:${property.host.phone}`
  }

  const handleEmail = () => {
    window.location.href = `mailto:${property.host.email}`
  }

  const handleWhatsApp = () => {
    // Remove any non-numeric characters from phone number
    const phone = property.host.phone.replace(/\D/g, '')
    window.open(`https://wa.me/${phone}`, '_blank')
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="lg"
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
              <p className="text-sm text-gray-600">Choose how you'd like to contact the host</p>
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
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{property.host.rating.toFixed(1)} host rating</span>
                      <span className="text-sm text-gray-500">• {property.host.response_time} avg. response</span>
                    </div>
                  </div>
                </div>

                {/* Contact Options */}
                <div className="grid gap-4">
                  {property.host.phone && (
                    <Button
                      size="lg"
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                      onClick={handleCall}
                      startContent={<Phone className="w-5 h-5" />}
                    >
                      Call Host
                    </Button>
                  )}
                  
                  {property.host.email && (
                    <Button
                      size="lg"
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={handleEmail}
                      startContent={<Mail className="w-5 h-5" />}
                    >
                      Email Host
                    </Button>
                  )}

                  {property.host.phone && (
                    <Button
                      size="lg"
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                      onClick={handleWhatsApp}
                      startContent={<MessageSquare className="w-5 h-5" />}
                    >
                      WhatsApp
                    </Button>
                  )}
                </div>

                {/* Note */}
                <p className="text-sm text-gray-600 text-center">
                  Response time: {property.host.response_time}
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose} className="w-full">
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
} 