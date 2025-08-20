import React from 'react';
import { Star, Users, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Divider } from '@heroui/react';
import { useTranslation } from '../../lib/stores/translationStore';
import { BookingCalendar } from './BookingCalendar';
import { Property } from '../../interfaces/Property';
import toast from 'react-hot-toast';

interface PropertyBookingCardProps {
  property: Property;
  checkIn: string;
  setCheckIn: (date: string) => void;
  checkOut: string;
  setCheckOut: (date: string) => void;
  checkInTime: string;
  setCheckInTime: (time: string) => void;
  checkOutTime: string;
  setCheckOutTime: (time: string) => void;
  guests: number;
  setGuests: (guests: number) => void;
  specialRequests: string;
  setSpecialRequests: (requests: string) => void;
  validationError: string;
  setValidationError: (error: string) => void;
  billingNights: number;
  basePrice: number;
  cleaningFee: number;
  serviceFee: number;
  totalAmount: number;
  isCheckingAvailability: boolean;
  isCreatingBooking: boolean;
  onReserveClick: () => void;
}

const PropertyBookingCard: React.FC<PropertyBookingCardProps> = ({
  property,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  checkInTime,
  setCheckInTime,
  checkOutTime,
  setCheckOutTime,
  guests,
  setGuests,
  specialRequests,
  setSpecialRequests,
  validationError,
  setValidationError,
  billingNights,
  basePrice,
  cleaningFee,
  serviceFee,
  totalAmount,
  isCheckingAvailability,
  isCreatingBooking,
  onReserveClick
}) => {
  const { t } = useTranslation(['booking', 'property']);

  return (
    <div className="lg:sticky lg:top-6 lg:h-fit">
      <Card className="shadow-lg border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <div>
              <span className="text-2xl font-bold text-gray-900">${property.price}</span>
              <span className="ml-1 text-gray-600">{t('night')}</span>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-gray-900">{property.rating}</span>
              <span className="text-gray-600 text-sm">({property.review_count} reviews)</span>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-6">
          {/* Visual Calendar with Availability */}
          <div className="mb-4">
            <BookingCalendar
              propertyId={property.id}
              unavailableDates={property.unavailable_dates}
              timezone={property.timezone}
              city={property.location.city}
              country={property.location.country}
              selectedCheckIn={checkIn}
              selectedCheckOut={checkOut}
              onDateChange={(checkInDate, checkOutDate) => {
                console.log('📅 Date change:', { checkInDate, checkOutDate })
                if (checkInDate !== checkIn || checkOutDate !== checkOut) {
                  setCheckIn(checkInDate)
                  setCheckOut(checkOutDate)
                  setValidationError('')
                  // Show toast for date selection
                  if (checkInDate && !checkOutDate) {
                    toast.success(t('booking.messages.checkInSelected'))
                  } else if (checkInDate && checkOutDate) {
                    toast.success(t('booking.messages.checkOutSelected'))
                  }
                }
              }}
              onTimeChange={(checkInTimeNew, checkOutTimeNew) => {
                console.log('🕒 Time change:', { checkInTimeNew, checkOutTimeNew })
                if (checkInTimeNew !== checkInTime || checkOutTimeNew !== checkOutTime) {
                  setCheckInTime(checkInTimeNew)
                  setCheckOutTime(checkOutTimeNew)
                  toast.success(t('booking.messages.timeUpdated'))
                }
              }}
            />
          </div>

          {/* Time Selection (Manual Override) */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="border-2 border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-all focus-within:border-primary-500">
              <label className="block text-xs font-semibold text-gray-700 mb-1">CHECK-IN TIME</label>
              <input
                type="time"
                value={checkInTime}
                onChange={(e) => {
                  const newTime = e.target.value;
                  const [hours, minutes] = newTime.split(':').map(Number);
                  const timeInMinutes = hours * 60 + minutes;
                  
                  // Validate check-in time (6:00 AM - 10:00 PM)
                  if (timeInMinutes < 360 || timeInMinutes > 1320) {
                    toast.error(t('booking.validation.checkInTimeRange'));
                    return;
                  }
                  
                  console.log('🕒 Setting check-in time:', newTime);
                  setCheckInTime(newTime);
                  toast.success(t('booking.messages.checkInTimeUpdated'));
                }}
                min="06:00"
                max="22:00"
                step="1800"
                className="w-full text-sm focus:outline-none bg-transparent text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">{t('booking.policies.checkInAvailable')}</p>
            </div>
            <div className="border-2 border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-all focus-within:border-primary-500">
              <label className="block text-xs font-semibold text-gray-700 mb-1">CHECK-OUT TIME</label>
              <input
                type="time"
                value={checkOutTime}
                onChange={(e) => {
                  const newTime = e.target.value;
                  const [hours, minutes] = newTime.split(':').map(Number);
                  const timeInMinutes = hours * 60 + minutes;
                  
                  // Validate check-out time (6:00 AM - 12:00 PM)
                  if (timeInMinutes < 360 || timeInMinutes > 720) {
                    toast.error(t('booking.validation.checkOutTimeRange'));
                    return;
                  }
                  
                  console.log('🕒 Setting check-out time:', newTime);
                  setCheckOutTime(newTime);
                  toast.success(t('booking.messages.checkOutTimeUpdated'));
                }}
                min="06:00"
                max="12:00"
                step="1800"
                className="w-full text-sm focus:outline-none bg-transparent text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">{t('booking.policies.checkOutRequired')}</p>
            </div>
          </div>

          {/* Guests */}
          <div className="border-2 border-gray-200 rounded-lg p-3 mb-4 hover:border-gray-300 transition-all focus-within:border-primary-500">
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('guests').toUpperCase()}</label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">{guests} {guests > 1 ? t('guests') : t('guest')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => {
                    if (guests > 1) {
                      console.log('Decreasing guests from', guests, 'to', guests - 1)
                      setGuests(prev => Math.max(1, prev - 1))
                    }
                  }}
                  isDisabled={guests <= 1}
                >
                  <span className="text-2xl font-bold">-</span>
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => {
                    if (guests < property.max_guests) {
                      console.log('Increasing guests from', guests, 'to', guests + 1)
                      setGuests(prev => Math.min(property.max_guests, prev + 1))
                    }
                  }}
                  isDisabled={guests >= property.max_guests}
                >
                  <span className="text-2xl font-bold">+</span>
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('maxGuests', { count: property.max_guests })}</p>
          </div>

          {/* Special Requests */}
          <div className="border-2 border-gray-200 rounded-lg p-3 mb-4 hover:border-gray-300 transition-all focus-within:border-primary-500">
            <label className="block text-xs font-semibold text-gray-700 mb-1">SPECIAL REQUESTS (OPTIONAL)</label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder={t('booking.labels.specialRequestsPlaceholder')}
              rows={3}
              maxLength={500}
              className="w-full text-sm focus:outline-none bg-transparent text-gray-900 resize-none placeholder-gray-500"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">{t('booking.labels.specialRequestsHelper')}</span>
              <span className="text-xs text-gray-400">{specialRequests.length}/500</span>
            </div>
          </div>

          {/* Reserve Button */}
          <div className="mb-4">
            <Button 
              color="primary" 
              size="lg" 
              className="w-full font-bold text-lg py-4 bg-primary-600 hover:bg-primary-700"
              radius="lg"
              onPress={onReserveClick}
              startContent={<Calendar className="w-5 h-5" />}
              isLoading={isCheckingAvailability || isCreatingBooking}
              disabled={isCheckingAvailability || isCreatingBooking || !checkIn || !checkOut}
            >
              {isCheckingAvailability ? t('booking.actions.checkingAvailability') : 
               isCreatingBooking ? t('booking.actions.creatingBooking') : 
               !checkIn || !checkOut ? t('booking.actions.selectDates') : t('booking.actions.reserveNow')}
            </Button>
          </div>

          {/* Validation Error Message */}
          {validationError && (
            <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-danger-600" />
                <p className="text-sm text-danger-700 font-medium">{validationError}</p>
              </div>
            </div>
          )}

          {/* Booking Status */}
          {(checkIn && checkOut) && (
            <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-600" />
                <p className="text-sm text-primary-700">
                  {billingNights} night{billingNights > 1 ? 's' : ''} · {guests} guest{guests > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-gray-600 mb-4">
            {t('booking.messages.noChargeYet')}
          </p>

          <Divider className="my-4" />

          {/* Price Breakdown */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">${property.price} x {billingNights} nights</span>
              <span className="font-medium text-gray-900">${basePrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">{t('booking.labels.cleaningFee')}</span>
              <span className="font-medium text-gray-900">${cleaningFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">{t('booking.labels.serviceFee')}</span>
              <span className="font-medium text-gray-900">${serviceFee}</span>
            </div>
            <Divider className="my-3" />
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-bold text-gray-900">{t('booking.labels.totalBeforeTaxes')}</span>
              <span className="font-bold text-gray-900 text-lg">${totalAmount}</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default PropertyBookingCard;
