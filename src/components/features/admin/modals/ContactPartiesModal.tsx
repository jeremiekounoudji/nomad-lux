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
          <Phone className="size-5 text-primary-500" />
          {t('contactPartiesModal.title', { id: booking?.id })}
        </ModalHeader>
        <ModalBody>
          {booking && (
            <div className="space-y-6">
              {/* Property Information */}
              <div className="flex items-start gap-4 rounded-lg bg-gray-50 p-4">
                <img
                  src={booking.propertyImage}
                  alt={booking.propertyTitle}
                  className="size-16 rounded-lg object-cover"
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Guest Contact */}
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardBody className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-blue-500">
                        <User className="size-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-blue-900">{t('contactPartiesModal.guest.title')}</h3>
                        <p className="text-sm text-blue-700">{t('contactPartiesModal.guest.subtitle')}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium uppercase tracking-wide text-blue-600">{t('contactPartiesModal.guest.labels.name')}</label>
                        <p className="font-semibold text-blue-900">{booking.guestName}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium uppercase tracking-wide text-blue-600">{t('contactPartiesModal.guest.labels.phone')}</label>
                        <div className="flex items-center gap-2">
                          <Phone className="size-4 text-blue-600" />
                          <a 
                            href={`tel:${booking.guestPhone}`}
                            className="font-semibold text-blue-900 transition-colors hover:text-blue-700"
                          >
                            {booking.guestPhone}
                          </a>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium uppercase tracking-wide text-blue-600">{t('contactPartiesModal.guest.labels.email')}</label>
                        <div className="flex items-center gap-2">
                          <Mail className="size-4 text-blue-600" />
                          <a 
                            href={`mailto:${booking.guestEmail}`}
                            className="truncate font-semibold text-blue-900 transition-colors hover:text-blue-700"
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
                        startContent={<Phone className="size-4" />}
                        onPress={() => window.open(`tel:${booking.guestPhone}`)}
                        className="flex-1"
                      >
                        {t('contactPartiesModal.guest.buttons.call')}
                      </Button>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<Mail className="size-4" />}
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
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-green-500">
                        <Home className="size-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-green-900">{t('contactPartiesModal.host.title')}</h3>
                        <p className="text-sm text-green-700">{t('contactPartiesModal.host.subtitle')}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium uppercase tracking-wide text-green-600">{t('contactPartiesModal.host.labels.name')}</label>
                        <p className="font-semibold text-green-900">{booking.hostName}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium uppercase tracking-wide text-green-600">{t('contactPartiesModal.host.labels.phone')}</label>
                        <div className="flex items-center gap-2">
                          <Phone className="size-4 text-green-600" />
                          <a 
                            href={`tel:${booking.hostPhone}`}
                            className="font-semibold text-green-900 transition-colors hover:text-green-700"
                          >
                            {booking.hostPhone}
                          </a>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium uppercase tracking-wide text-green-600">{t('contactPartiesModal.host.labels.email')}</label>
                        <div className="flex items-center gap-2">
                          <Mail className="size-4 text-green-600" />
                          <a 
                            href={`mailto:${booking.hostEmail}`}
                            className="truncate font-semibold text-green-900 transition-colors hover:text-green-700"
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
                        startContent={<Phone className="size-4" />}
                        onPress={() => window.open(`tel:${booking.hostPhone}`)}
                        className="flex-1"
                      >
                        {t('contactPartiesModal.host.buttons.call')}
                      </Button>
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        startContent={<Mail className="size-4" />}
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
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Shield className="size-5 text-amber-600" />
                  <h4 className="font-semibold text-amber-900">{t('contactPartiesModal.guidelines.title')}</h4>
                </div>
                <div className="text-sm text-amber-800">
                  <p className="mb-2">• {t('contactPartiesModal.guidelines.points.professional')}</p>
                  <p className="mb-2">• {t('contactPartiesModal.guidelines.points.document')}</p>
                  <p>• {t('contactPartiesModal.guidelines.points.urgent')}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-3 font-semibold text-gray-900">{t('contactPartiesModal.quickActions.title')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<MessageSquare className="size-4" />}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    {t('contactPartiesModal.quickActions.buttons.sendEmailTemplate')}
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<Phone className="size-4" />}
                    className="border-green-200 text-green-600 hover:bg-green-50"
                  >
                    {t('contactPartiesModal.quickActions.buttons.scheduleCall')}
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<Shield className="size-4" />}
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    {t('contactPartiesModal.quickActions.buttons.emergencyContact')}
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<MessageSquare className="size-4" />}
                    className="border-amber-200 text-amber-600 hover:bg-amber-50"
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
          <Button color="primary" startContent={<MessageSquare className="size-4" />}>
            {t('contactPartiesModal.buttons.openMessageCenter')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 