import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Avatar,
  Chip,
  Divider
} from '@heroui/react'
import { Bell, Calendar, MessageCircle, Home, CreditCard, AlertTriangle } from 'lucide-react'
import { NotificationDetailsModalProps } from '../../../interfaces/Component'
import { useTranslation } from '../../../lib/stores/translationStore'

export const NotificationDetailsModal: React.FC<NotificationDetailsModalProps> = ({
  isOpen,
  onClose,
  notification,
  onMarkAsRead
}) => {
  const { t } = useTranslation(['notifications', 'booking', 'common'])
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-5 h-5 text-primary-500" />
      case 'message':
        return <MessageCircle className="w-5 h-5 text-secondary-500" />
      case 'property':
        return <Home className="w-5 h-5 text-success-500" />
      case 'payment':
        return <CreditCard className="w-5 h-5 text-warning-500" />
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-danger-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'primary'
      case 'message':
        return 'secondary'
      case 'property':
        return 'success'
      case 'payment':
        return 'warning'
      case 'alert':
        return 'danger'
      default:
        return 'default'
    }
  }

  const handleClose = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead()
    }
    onClose()
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                {getNotificationIcon(notification.type)}
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{notification.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Chip 
                      size="sm" 
                      color={getTypeColor(notification.type) as any}
                      variant="flat"
                      className="capitalize"
                    >
                      {t(`notifications.types.${notification.type}`, { defaultValue: notification.type })}
                    </Chip>
                    {!notification.read && (
                      <Chip size="sm" color="primary" variant="solid">
                        {t('notifications.labels.new')}
                      </Chip>
                    )}
                  </div>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {/* Timestamp */}
                <div className="text-sm text-gray-600">
                  {t('notifications.labels.timestamp', { ts: new Date(notification.timestamp).toLocaleString() })}
                </div>

                <Divider />

                {/* Notification Content */}
                <div className="space-y-4">
                  <p className="text-gray-700 whitespace-pre-line">
                    {notification.message}
                  </p>

                  {/* Additional Details */}
                  {notification.propertyName && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">{t('notifications.details.relatedProperty')}</h4>
                      <div className="flex items-center gap-3">
                        {notification.propertyImage && (
                          <img
                            src={notification.propertyImage}
                            alt={notification.propertyName}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <p className="font-medium">{notification.propertyName}</p>
                          {notification.propertyLocation && (
                            <p className="text-sm text-gray-600">{notification.propertyLocation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Guest/Host Information */}
                  {notification.guestName && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">{t('notifications.details.guestInformation')}</h4>
                      <div className="flex items-center gap-3">
                        <Avatar src={notification.guestAvatar} size="md" />
                        <div>
                          <p className="font-medium">{notification.guestName}</p>
                          <p className="text-sm text-gray-600">{notification.guestEmail}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Booking Details */}
                  {notification.bookingDetails && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">{t('notifications.details.bookingDetails')}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {notification.bookingDetails.checkIn && (
                          <div>
                            <p className="text-gray-600">{t('booking.labels.checkIn')}</p>
                            <p className="font-medium">
                              {new Date(notification.bookingDetails.checkIn).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {notification.bookingDetails.checkOut && (
                          <div>
                            <p className="text-gray-600">{t('booking.labels.checkOut')}</p>
                            <p className="font-medium">
                              {new Date(notification.bookingDetails.checkOut).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {notification.bookingDetails.guests && (
                          <div>
                            <p className="text-gray-600">{t('booking.labels.guests')}</p>
                            <p className="font-medium">{notification.bookingDetails.guests}</p>
                          </div>
                        )}
                        {notification.bookingDetails.totalPrice && (
                          <div>
                            <p className="text-gray-600">{t('booking.labels.totalPrice')}</p>
                            <p className="font-medium">${notification.bookingDetails.totalPrice}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Information */}
                  {notification.paymentAmount && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">{t('notifications.details.paymentInformation')}</h4>
                      <div className="text-sm text-green-700">
                        <p>{t('notifications.details.amount', { amount: notification.paymentAmount })}</p>
                        {notification.paymentMethod && (
                          <p>{t('notifications.details.method', { method: notification.paymentMethod })}</p>
                        )}
                        {notification.paymentDate && (
                          <p>{t('notifications.details.date', { date: new Date(notification.paymentDate).toLocaleDateString() })}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Items */}
                  {notification.actionRequired && (
                    <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-warning-800">{t('notifications.details.actionRequired')}</h4>
                          <p className="text-sm text-warning-700 mt-1">
                            {notification.actionDescription || t('notifications.details.defaultActionDescription')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={handleClose}>
                {t('common.buttons.close')}
              </Button>
              {notification.actionRequired && (
                <Button color="primary">
                  {t('notifications.actions.takeAction')}
                </Button>
              )}
              {notification.type === 'booking' && (
                <Button color="secondary" variant="flat">
                  {t('booking.actions.viewBooking')}
                </Button>
              )}
              {notification.type === 'message' && (
                <Button color="secondary" variant="flat">
                  {t('notifications.actions.reply')}
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
} 