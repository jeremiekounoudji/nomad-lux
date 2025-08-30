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
        return <Calendar className="size-5 text-primary-500" />
      case 'message':
        return <MessageCircle className="size-5 text-secondary-500" />
      case 'property':
        return <Home className="size-5 text-success-500" />
      case 'payment':
        return <CreditCard className="size-5 text-warning-500" />
      case 'alert':
        return <AlertTriangle className="size-5 text-danger-500" />
      default:
        return <Bell className="size-5 text-gray-500" />
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
    if (!notification.is_read && onMarkAsRead) {
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
        {(/* onClose */) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                {getNotificationIcon(notification.type)}
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{notification.title}</h2>
                  <div className="mt-1 flex items-center gap-2">
                    <Chip 
                      size="sm" 
                      color={getTypeColor(notification.type) as any}
                      variant="flat"
                      className="capitalize"
                    >
                      {t(`notifications.types.${notification.type}`, { defaultValue: notification.type })}
                    </Chip>
                    {!notification.is_read && (
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
                  {t('notifications.labels.timestamp', { ts: new Date(notification.created_at).toLocaleString() })}
                </div>

                <Divider />

                {/* Notification Content */}
                <div className="space-y-4">
                  <p className="whitespace-pre-line text-gray-700">
                    {notification.message}
                  </p>

                  {/* Additional Details */}
                  {(notification.metadata as any)?.propertyName && (
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h4 className="mb-2 font-semibold">{t('notifications.details.relatedProperty')}</h4>
                      <div className="flex items-center gap-3">
                        {(notification.metadata as any)?.propertyImage && (
                          <img
                            src={(notification.metadata as any).propertyImage}
                            alt={(notification.metadata as any).propertyName}
                            className="size-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{(notification.metadata as any).propertyName}</p>
                          {(notification.metadata as any)?.propertyLocation && (
                            <p className="text-sm text-gray-600">{(notification.metadata as any).propertyLocation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Guest/Host Information */}
                  {(notification.metadata as any)?.guestName && (
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h4 className="mb-2 font-semibold">{t('notifications.details.guestInformation')}</h4>
                      <div className="flex items-center gap-3">
                        <Avatar src={(notification.metadata as any)?.guestAvatar} size="md" />
                        <div>
                          <p className="font-medium">{(notification.metadata as any).guestName}</p>
                          <p className="text-sm text-gray-600">{(notification.metadata as any)?.guestEmail}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Booking Details */}
                  {(notification.metadata as any)?.bookingDetails && (
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h4 className="mb-2 font-semibold">{t('notifications.details.bookingDetails')}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {(notification.metadata as any)?.bookingDetails?.checkIn && (
                          <div>
                            <p className="text-gray-600">{t('booking.labels.checkIn')}</p>
                            <p className="font-medium">
                              {new Date((notification.metadata as any).bookingDetails.checkIn).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {(notification.metadata as any)?.bookingDetails?.checkOut && (
                          <div>
                            <p className="text-gray-600">{t('booking.labels.checkOut')}</p>
                            <p className="font-medium">
                              {new Date((notification.metadata as any).bookingDetails.checkOut).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {(notification.metadata as any)?.bookingDetails?.guests && (
                          <div>
                            <p className="text-gray-600">{t('booking.labels.guests')}</p>
                            <p className="font-medium">{(notification.metadata as any).bookingDetails.guests}</p>
                          </div>
                        )}
                        {(notification.metadata as any)?.bookingDetails?.totalPrice && (
                          <div>
                            <p className="text-gray-600">{t('booking.labels.totalPrice')}</p>
                            <p className="font-medium">${(notification.metadata as any).bookingDetails.totalPrice}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Information */}
                  {(notification.metadata as any)?.paymentAmount && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <h4 className="mb-2 font-semibold text-green-800">{t('notifications.details.paymentInformation')}</h4>
                      <div className="text-sm text-green-700">
                        <p>{t('notifications.details.amount', { amount: (notification.metadata as any).paymentAmount })}</p>
                        {(notification.metadata as any)?.paymentMethod && (
                          <p>{t('notifications.details.method', { method: (notification.metadata as any).paymentMethod })}</p>
                        )}
                        {(notification.metadata as any)?.paymentDate && (
                          <p>{t('notifications.details.date', { date: new Date((notification.metadata as any).paymentDate).toLocaleDateString() })}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Items */}
                  {(notification.metadata as any)?.actionRequired && (
                    <div className="rounded-lg border border-warning-200 bg-warning-50 p-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 size-5 text-warning-600" />
                        <div>
                          <h4 className="font-semibold text-warning-800">{t('notifications.details.actionRequired')}</h4>
                          <p className="mt-1 text-sm text-warning-700">
                            {(notification.metadata as any)?.actionDescription || t('notifications.details.defaultActionDescription')}
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
              {(notification.metadata as any)?.actionRequired && (
                <Button color="primary">
                  {t('notifications.actions.takeAction')}
                </Button>
              )}
              {(notification.type === 'booking_request_created' || 
                notification.type === 'new_booking_request' ||
                notification.type === 'booking_approved' ||
                notification.type === 'booking_rejected' ||
                notification.type === 'booking_cancelled') && (
                <Button color="secondary" variant="flat">
                  {t('booking.actions.viewBooking')}
                </Button>
              )}
              {(notification.type === 'property_approved' ||
                notification.type === 'property_rejected' ||
                notification.type === 'property_suspended') && (
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