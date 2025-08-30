import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react'
import { MessageCircle, Phone, Mail, MessageSquare, AlertCircle } from 'lucide-react'
import { ContactHostModalProps } from '../../../interfaces/Component'
import { useTranslation } from '../../../lib/stores/translationStore'
import toast from 'react-hot-toast'

export const ContactHostModal: React.FC<ContactHostModalProps> = ({
  isOpen,
  onClose,
  property
}) => {
  const { t } = useTranslation(['property', 'common'])

  // Ensure property and host data exists
  if (!property || !property.host) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-6 text-red-500" />
                  <h2 className="text-xl font-bold">{t('property.modal.contactHost.error')}</h2>
                </div>
              </ModalHeader>
              <ModalBody>
                <p className="text-gray-600">{t('property.modal.contactHost.noHostData')}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  {t('common.buttons.close')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    )
  }

  const handleCall = () => {
    if (!property.host.phone) {
      toast.error(t('property.modal.contactHost.noPhone'))
      return
    }
    try {
      window.location.href = `tel:${property.host.phone}`
    } catch (error) {
      toast.error(t('property.modal.contactHost.callError'))
    }
  }

  const handleEmail = () => {
    if (!property.host.email) {
      toast.error(t('property.modal.contactHost.noEmail'))
      return
    }
    try {
      window.location.href = `mailto:${property.host.email}`
    } catch (error) {
      toast.error(t('property.modal.contactHost.emailError'))
    }
  }

  const handleWhatsApp = () => {
    if (!property.host.phone) {
      toast.error(t('property.modal.contactHost.noPhone'))
      return
    }
    try {
      // Remove any non-numeric characters from phone number
      const phone = property.host.phone.replace(/\D/g, '')
      const message = encodeURIComponent(`Hi ${property.host.display_name}, I'm interested in your property "${property.title}". Can you provide more information?`)
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    } catch (error) {
      toast.error(t('property.modal.contactHost.whatsappError'))
    }
  }

  // Check available contact methods
  const hasPhone = !!property.host.phone
  const hasEmail = !!property.host.email
  const availableMethods = [hasPhone, hasEmail, hasPhone].filter(Boolean).length

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="lg"
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
                <MessageCircle className="size-6 text-primary-500" />
                <h2 className="text-xl font-bold">{t('property.modal.contactHost.title')}</h2>
              </div>
              <p className="text-sm text-gray-600">{t('property.modal.contactHost.subtitle')}</p>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                

                {/* Contact Options */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900">{t('property.modal.contactHost.chooseMethod')}</h5>
                  
                  <div className="grid gap-3">
                    {hasPhone && (
                      <Button
                        size="lg"
                        className="w-full bg-green-500 text-white hover:bg-green-600"
                        onClick={handleCall}
                        startContent={<Phone className="size-5" />}
                      >
                        {t('property.actions.callHost')}
                        <span className="ml-2 text-sm opacity-90">{property.host.phone}</span>
                      </Button>
                    )}
                    
                    {hasEmail && (
                      <Button
                        size="lg"
                        className="w-full bg-blue-500 text-white hover:bg-blue-600"
                        onClick={handleEmail}
                        startContent={<Mail className="size-5" />}
                      >
                        {t('property.actions.emailHost')}
                        <span className="ml-2 text-sm opacity-90">{property.host.email}</span>
                      </Button>
                    )}

                    {hasPhone && (
                      <Button
                        size="lg"
                        className="w-full bg-[#25D366] text-white hover:bg-[#128C7E]"
                        onClick={handleWhatsApp}
                        startContent={<MessageSquare className="size-5" />}
                      >
                        {t('property.actions.whatsapp')}
                        <span className="ml-2 text-sm opacity-90">{property.host.phone}</span>
                      </Button>
                    )}
                  </div>

                  {availableMethods === 0 && (
                    <div className="py-4 text-center">
                      <AlertCircle className="mx-auto mb-2 size-8 text-gray-400" />
                      <p className="text-gray-600">{t('property.modal.contactHost.noContactMethods')}</p>
                    </div>
                  )}
                </div>

              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose} className="w-full">
                {t('common.buttons.close')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
} 