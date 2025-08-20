import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody
} from '@heroui/react'
import { Phone, Mail, User, Home, Shield, MessageSquare } from 'lucide-react'
import { useTranslation } from '../../../../lib/stores/translationStore'
import { AdminBooking } from '../../../../interfaces'

interface ContactPartiesModalProps {
  isOpen: boolean
  onClose: () => void
  booking: AdminBooking | null
}

export const ContactPartiesModal: React.FC<ContactPartiesModalProps> = ({
  isOpen,
  onClose,
  booking
}) => {
  const { t } = useTranslation('admin')

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary-500" />
          {t('contactPartiesModal.title', { id: booking?.id })}
        </ModalHeader>
        <ModalBody>
          {booking && (
            <div className="space-y-6">
              {/* Property Information */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={booking.propertyImage}
                  alt={booking.propertyTitle}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{booking.propertyTitle}</h4>
                  <p className="text-sm text-gray-600">
                    {booking.checkIn} → {booking.checkOut} • {booking.nights} {t('contactPartiesModal.propertyInfo.nights')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {booking.guests} {t('contactPartiesModal.propertyInfo.guests')} • ${booking.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Contact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Guest Contact */}
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardBody className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-blue-900">{t('contactPartiesModal.guest.title')}</h3>
                        <p className="text-sm text-blue-700">{t('contactPartiesModal.guest.subtitle')}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-blue-600 uppercase tracking-wide">{t('contactPartiesModal.guest.labels.name')}</label>
                        <p className="font-semibold text-blue-900">{booking.guestName}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-blue-600 uppercase tracking-wide">{t('contactPartiesModal.guest.labels.phone')}</label>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-600" />
                          <a 
                            href={`tel:${booking.guestPhone}`}
                            className="font-semibold text-blue-900 hover:text-blue-700 transition-colors"
                          >
                            {booking.guestPhone}
                          </a>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-blue-600 uppercase tracking-wide">{t('contactPartiesModal.guest.labels.email')}</label>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <a 
                            href={`mailto:${booking.guestEmail}`}
                            className="font-semibold text-blue-900 hover:text-blue-700 transition-colors truncate"
                          >
                            {booking.guestEmail}
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<Phone className="w-4 h-4" />}
                        onPress={() => window.open(`tel:${booking.guestPhone}`)}
                        className="flex-1"
                      >
                        {t('contactPartiesModal.guest.buttons.call')}
                      </Button>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<Mail className="w-4 h-4" />}
                        onPress={() => window.open(`mailto:${booking.guestEmail}`)}
                        className="flex-1"
                      >
                        {t('contactPartiesModal.guest.buttons.email')}
                      </Button>
                    </div>
                  </CardBody>
                </Card>

                {/* Host Contact */}
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardBody className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Home className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-green-900">{t('contactPartiesModal.host.title')}</h3>
                        <p className="text-sm text-green-700">{t('contactPartiesModal.host.subtitle')}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-green-600 uppercase tracking-wide">{t('contactPartiesModal.host.labels.name')}</label>
                        <p className="font-semibold text-green-900">{booking.hostName}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-green-600 uppercase tracking-wide">{t('contactPartiesModal.host.labels.phone')}</label>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-green-600" />
                          <a 
                            href={`tel:${booking.hostPhone}`}
                            className="font-semibold text-green-900 hover:text-green-700 transition-colors"
                          >
                            {booking.hostPhone}
                          </a>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-green-600 uppercase tracking-wide">{t('contactPartiesModal.host.labels.email')}</label>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-green-600" />
                          <a 
                            href={`mailto:${booking.hostEmail}`}
                            className="font-semibold text-green-900 hover:text-green-700 transition-colors truncate"
                          >
                            {booking.hostEmail}
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex gap-2">
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        startContent={<Phone className="w-4 h-4" />}
                        onPress={() => window.open(`tel:${booking.hostPhone}`)}
                        className="flex-1"
                      >
                        {t('contactPartiesModal.host.buttons.call')}
                      </Button>
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        startContent={<Mail className="w-4 h-4" />}
                        onPress={() => window.open(`mailto:${booking.hostEmail}`)}
                        className="flex-1"
                      >
                        {t('contactPartiesModal.host.buttons.email')}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Emergency Contact Notice */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-amber-600" />
                  <h4 className="font-semibold text-amber-900">{t('contactPartiesModal.guidelines.title')}</h4>
                </div>
                <div className="text-sm text-amber-800">
                  <p className="mb-2">• {t('contactPartiesModal.guidelines.points.professional')}</p>
                  <p className="mb-2">• {t('contactPartiesModal.guidelines.points.document')}</p>
                  <p>• {t('contactPartiesModal.guidelines.points.urgent')}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">{t('contactPartiesModal.quickActions.title')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<MessageSquare className="w-4 h-4" />}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    {t('contactPartiesModal.quickActions.buttons.sendEmailTemplate')}
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<Phone className="w-4 h-4" />}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    {t('contactPartiesModal.quickActions.buttons.scheduleCall')}
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<Shield className="w-4 h-4" />}
                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                  >
                    {t('contactPartiesModal.quickActions.buttons.emergencyContact')}
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<MessageSquare className="w-4 h-4" />}
                    className="text-amber-600 border-amber-200 hover:bg-amber-50"
                  >
                    {t('contactPartiesModal.quickActions.buttons.documentCall')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            {t('contactPartiesModal.buttons.close')}
          </Button>
          <Button color="primary" startContent={<MessageSquare className="w-4 h-4" />}>
            {t('contactPartiesModal.buttons.openMessageCenter')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 