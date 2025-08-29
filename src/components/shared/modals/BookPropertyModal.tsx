import React, { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Divider,
  Select,
  SelectItem,
  Card,
  CardBody,
  Avatar
} from '@heroui/react'
import { Calendar, Users, CreditCard, MapPin, Star, DollarSign } from 'lucide-react'
import { BookPropertyModalProps } from '../../../interfaces/Component'
import { useTranslation } from '../../../lib/stores/translationStore'
import { formatPrice } from '../../../utils/currencyUtils'

export const BookPropertyModal: React.FC<BookPropertyModalProps> = ({
  isOpen,
  onClose,
  property,
  onBookingConfirm
}) => {
  const { t } = useTranslation(['booking', 'property', 'common'])
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('1')
  const [specialRequests, setSpecialRequests] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut) return 0
    const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    const subtotal = days * property.price
    const serviceFee = subtotal * 0.1 // 10% service fee
    const taxes = subtotal * 0.08 // 8% taxes
    return subtotal + serviceFee + taxes
  }

  const handleBooking = async () => {
    setIsLoading(true)
    try {
      await onBookingConfirm({
        checkIn,
        checkOut,
        guests: parseInt(guests),
        totalPrice: calculateTotalPrice(),
        specialRequests: specialRequests || undefined
      })
      handleClose()
    } catch (error) {
      console.error('Booking failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setCheckIn('')
    setCheckOut('')
    setGuests('1')
    setSpecialRequests('')
    onClose()
  }

  const days = checkIn && checkOut ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 0
  const subtotal = days * property.price
  const serviceFee = subtotal * 0.1
  const taxes = subtotal * 0.08
  const totalPrice = calculateTotalPrice()

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
              <h2 className="text-xl font-bold">{t('booking.actions.bookNow', 'Book this Property')}</h2>
              <p className="text-sm text-gray-600">{t('booking.labels.completeDetails', 'Complete your booking details')}</p>
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
                        className="size-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{property.title}</h3>
                        <div className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="size-4" />
                          <span>{`${property.location.city}, ${property.location.country}`}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="size-4 fill-current text-yellow-500" />
                            <span className="text-sm font-medium">{property.rating}</span>
                          </div>
                          <span className="text-lg font-bold text-primary-600">
                            ${property.currency} ${property.price}/{t('property.labels.night', 'night')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Host Info */}
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                                          <Avatar src={property.host?.avatar_url} size="md" />
                                                <div>
                          <p className="font-medium">{t('property.labels.hostedBy', { name: property.host?.display_name || t('common.notProvided') })}</p>
                          <p className="text-sm text-gray-600">{t('booking.labels.superhost')} • {t('property.labels.yearsHosting', { years: property.host?.experience || 4 })}</p>
                        </div>
                </div>

                {/* Booking Form */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="date"
                      label={t('booking.labels.checkIn')}
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      startContent={<Calendar className="size-4 text-gray-400" />}
                      isRequired
                    />
                    <Input
                      type="date"
                      label={t('booking.labels.checkOut')}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      startContent={<Calendar className="size-4 text-gray-400" />}
                      isRequired
                    />
                  </div>

                  <Select
                    label={t('booking.labels.guests')}
                    selectedKeys={[guests]}
                    onSelectionChange={(keys) => setGuests(Array.from(keys)[0] as string)}
                    startContent={<Users className="size-4 text-gray-400" />}
                    isRequired
                  >
                    {Array.from({ length: property.max_guests }, (_, i) => (
                      <SelectItem key={`${i + 1}`} value={`${i + 1}`}>
                        {t('booking.labels.guestsCount', { count: i + 1 })}
                      </SelectItem>
                    ))}
                  </Select>

                  <Textarea
                    label={t('booking.labels.specialRequests', 'Special Requests (Optional)')}
                    placeholder={t('booking.labels.specialRequestsPlaceholder', 'Any special requests or notes for your host')}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    minRows={3}
                  />
                </div>

                {/* Price Breakdown */}
                {checkIn && checkOut && (
                  <>
                    <Divider />
                    <div className="space-y-3">
                      <h4 className="flex items-center gap-2 font-semibold">
                        <DollarSign className="size-5" />
                        {t('booking.labels.priceBreakdown', 'Price Breakdown')}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>{property.currency} {property.price} × {days} {days > 1 ? t('property.labels.nights', 'nights') : t('property.labels.night', 'night')}</span>
                          <span>{formatPrice(subtotal, property.currency || 'USD')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('booking.labels.serviceFee', 'Service fee')}</span>
                          <span>{formatPrice(serviceFee, property.currency || 'USD')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('booking.labels.taxes', 'Taxes')}</span>
                          <span>{formatPrice(taxes, property.currency || 'USD')}</span>
                        </div>
                        <Divider />
                        <div className="flex justify-between text-lg font-semibold">
                          <span>{t('booking.labels.total', 'Total')}</span>
                          <span>{property.currency} {totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={handleClose}>
                {t('common.buttons.cancel', 'Cancel')}
              </Button>
              <Button 
                color="primary" 
                onPress={handleBooking}
                isLoading={isLoading}
                isDisabled={!checkIn || !checkOut || !guests}
                startContent={!isLoading && <CreditCard className="size-4" />}
              >
                {isLoading ? t('common.messages.processing', 'Processing...') : t('booking.actions.bookForAmount', { amount: formatPrice(totalPrice, property.currency || 'USD'), defaultValue: 'Book for {{amount}}' })}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
} 