import React, { useEffect } from 'react';
import { Star, Users, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Divider } from '@heroui/react';
import { useTranslation } from '../../lib/stores/translationStore';
import BookingCalendar from './BookingCalendar';
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
  // Property settings for time-based booking
  propertySettings?: any; // TODO: Type this properly with PropertySettings interface
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
  onReserveClick,
  propertySettings
}) => {
  const { t } = useTranslation(['booking', 'property']);

  // Add logging for property data received by PropertyBookingCard
  useEffect(() => {
    console.log('🎯 PropertyBookingCard - Received property data:', {
      id: property?.id,
      title: property?.title,
      unavailable_dates: property?.unavailable_dates,
      unavailable_dates_count: property?.unavailable_dates?.length || 0,
      timezone: property?.timezone,
      has_unavailable_dates: Boolean(property?.unavailable_dates && property.unavailable_dates.length > 0)
    });

    if (property?.unavailable_dates && property.unavailable_dates.length > 0) {
      console.log('📅 PropertyBookingCard - Unavailable dates being passed to BookingCalendar:');
      property.unavailable_dates.forEach((date, index) => {
        const dateOnly = date.split('T')[0];
        console.log(`  ${index + 1}. ${date} → ${dateOnly}`);
      });
    } else {
      console.log('📅 PropertyBookingCard - No unavailable dates to pass to BookingCalendar');
    }
  }, [property]);

  return (
    <div className="lg:sticky lg:top-6 lg:h-fit">
      <Card className="border border-gray-200 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex w-full items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">{property.currency} {property.price}</span>
              <span className="ml-1 text-gray-600">{t('booking.labels.night')}</span>
            </div>
            <div className="flex items-center gap-1 rounded-full px-1 py-1">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-black">{property.rating}</span>
              <span className="text-sm text-black">({property.review_count} {t('booking.labels.reviews')})</span>
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
              // Time-based booking props
              showTimeSlots={true}
              timeSlotDuration={60}
              checkinTime={propertySettings?.checkin_time || '15:00:00'}
              checkoutTime={propertySettings?.checkout_time || '11:00:00'}
            />
          </div>

          {/* Time Selection (Manual Override) */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border-2 border-gray-200 p-3 transition-all focus-within:border-primary-500 hover:border-gray-300">
              <label className="mb-1 block text-xs font-semibold text-gray-700">{t('booking.labels.checkInTime')}</label>
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
                className="w-full bg-transparent text-sm text-gray-900 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">{t('booking.policies.checkInAvailable')}</p>
            </div>
            <div className="rounded-lg border-2 border-gray-200 p-3 transition-all focus-within:border-primary-500 hover:border-gray-300">
              <label className="mb-1 block text-xs font-semibold text-gray-700">{t('booking.labels.checkOutTime')}</label>
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
                className="w-full bg-transparent text-sm text-gray-900 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">{t('booking.policies.checkOutRequired')}</p>
            </div>
          </div>

          {/* Guests */}
          <div className="mb-4 rounded-lg border-2 border-gray-200 p-3 transition-all focus-within:border-primary-500 hover:border-gray-300">
            <label className="mb-1 block text-xs font-semibold text-gray-700">{t('booking.labels.guests').toUpperCase()}</label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-gray-500" />
                <span className="text-gray-900">{guests} {guests > 1 ? t('booking.labels.guests') : t('booking.labels.guest')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => {
                    if (guests > 1) {
                      console.log('Decreasing guests from', guests, 'to', guests - 1)
                      setGuests(Math.max(1, guests - 1))
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
                      setGuests(Math.min(property.max_guests, guests + 1))
                    }
                  }}
                  isDisabled={guests >= property.max_guests}
                >
                  <span className="text-2xl font-bold">+</span>
                </Button>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">{t('booking.labels.maxGuests', { guests: property.max_guests })}</p>
          </div>

          {/* Special Requests */}
          <div className="mb-4 rounded-lg border-2 border-gray-200 p-3 transition-all focus-within:border-primary-500 hover:border-gray-300">
            <label className="mb-1 block text-xs font-semibold text-gray-700">{t('booking.labels.specialRequestsOptional')}</label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder={t('booking.labels.specialRequestsPlaceholder')}
              rows={3}
              maxLength={500}
              className="w-full resize-none bg-transparent text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none"
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-gray-500">{t('booking.labels.specialRequestsHelper')}</span>
              <span className="text-xs text-gray-400">{specialRequests.length}/500</span>
            </div>
          </div>

          {/* Reserve Button */}
          <div className="mb-4">
            <Button 
              color="primary" 
              size="lg" 
              className="w-full bg-primary-600 py-4 text-lg font-bold hover:bg-primary-700"
              radius="lg"
              onPress={onReserveClick}
              startContent={<Calendar className="size-5" />}
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
            <div className="mb-4 rounded-lg border border-danger-200 bg-danger-50 p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 text-danger-600" />
                <p className="text-sm font-medium text-danger-700">{validationError}</p>
              </div>
            </div>
          )}

          {/* Booking Status */}
          {(checkIn && checkOut) && (
            <div className="mb-4 rounded-lg border border-primary-200 bg-primary-50 p-3">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-primary-600" />
                <p className="text-sm text-primary-700">
                  {billingNights} {billingNights > 1 ? t('booking.labels.nights') : t('booking.labels.night')} {t('common.symbols.middleDot', '·')} {guests} {guests > 1 ? t('booking.labels.guests') : t('booking.labels.guest')}
                </p>
              </div>
            </div>
          )}

          <p className="mb-4 text-center text-sm text-gray-600">
            {t('booking.messages.noChargeYet')}
          </p>

          <Divider className="my-4" />

          {/* Price Breakdown */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">{property.currency} {property.price} x {billingNights} {t('booking.labels.nights')}</span>
              <span className="font-medium text-gray-900">{property.currency} {basePrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">{t('booking.labels.cleaningFee')}</span>
              <span className="font-medium text-gray-900">{property.currency} {cleaningFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">{t('booking.labels.serviceFee')}</span>
              <span className="font-medium text-gray-900">{property.currency} {serviceFee}</span>
            </div>
            <Divider className="my-3" />
            <div className="flex justify-between rounded-lg bg-gray-50 p-3">
              <span className="font-bold text-gray-900">{t('booking.labels.totalBeforeTaxes')}</span>
              <span className="text-lg font-bold text-gray-900">{property.currency} {totalAmount}</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default PropertyBookingCard;
