import React from 'react';
import { MapPin, Star, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardBody, Button, Chip } from '@heroui/react';
import { PaymentButton } from './';
import { useTranslation } from '../../lib/stores/translationStore';

interface MyBookingCardProps {
  booking: any;
  onClick: (booking: any) => void;
  getStatusColor: (status: string) => "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  getStatusActions: (booking: any) => React.ReactNode;
  onPayNow?: (booking: any) => void;
  onCancelBooking?: (booking: any) => void;
}

const MyBookingCard: React.FC<MyBookingCardProps> = ({ booking, onClick, getStatusColor, getStatusActions, onPayNow, onCancelBooking }) => {
  const { t } = useTranslation(['booking', 'common']);

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending':
        return t('booking.status.pending');
      case 'confirmed':
        return t('booking.status.confirmed');
      case 'cancelled':
        return t('booking.status.cancelled');
      case 'completed':
        return t('booking.status.completed');
      case 'no-show':
        return t('booking.status.noShow');
      case 'accepted-and-waiting-for-payment':
        return t('booking.status.acceptedWaitingPayment');
      case 'payment-failed':
        return t('booking.status.paymentFailed');
      case 'rejected':
        return t('booking.status.rejected');
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  return (
    <div className="h-full">
      <Card className="h-full rounded-xl bg-white shadow transition-shadow duration-200 hover:shadow-lg">
        {/* Property Image with Status */}
        <div
          className="relative cursor-pointer"
          onClick={() => onClick(booking)}
        >
          <img
            src={booking.properties?.images?.[0] || ''}
            alt={booking.properties?.title || ''}
            className="h-40 w-full rounded-t-xl object-cover"
          />
          <div className="absolute left-3 top-3">
            <Chip
              color={getStatusColor(booking.status)}
              variant="solid"
              size="sm"
              className="font-medium text-white"
            >
              {getStatusLabel(booking.status)}
            </Chip>
          </div>
        </div>
        <CardBody className="flex flex-1 flex-col p-4">
          {/* Property Info */}
          <div className="flex-1 space-y-2">
            <div
              className="cursor-pointer"
              onClick={() => onClick(booking)}
            >
              <h3 className="line-clamp-2 min-h-9 text-sm font-semibold leading-tight text-gray-900">
                {booking.properties?.title || t('booking.labels.property')}
              </h3>
              <div className="mt-1 flex items-start gap-1 text-xs text-gray-600">
                <MapPin className="mt-0.5 size-3 shrink-0" />
                <span className="line-clamp-1 break-words">
                  {booking.properties?.location?.city && booking.properties?.location?.country
                    ? `${booking.properties.location.city}, ${booking.properties.location.country}`
                    : t('booking.labels.locationNotAvailable')}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <Star className="size-3 shrink-0 fill-current text-yellow-500" />
                <span className="text-xs font-medium">{booking.properties?.rating}</span>
              </div>
            </div>
            {/* Dates */}
            <div className="flex items-start gap-1 text-xs text-gray-600">
              <Calendar className="mt-0.5 size-3 shrink-0" />
              <span className="break-words leading-tight">
                {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
              </span>
            </div>
            {/* Price */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-base font-bold text-primary-600">
                {booking.currency} {booking.total_amount}
              </span>
              <span className="text-xs text-gray-500">
                {t('booking.labels.guestsCount', { count: booking.guest_count })}
              </span>
            </div>
            {/* Reject Reason */}
            {booking.status === 'rejected' && booking.reject_reason && (
              <div className="mt-2 rounded-lg bg-red-50 p-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
                  <div>
                    <p className="text-xs font-medium text-red-700">{t('booking.labels.rejectionReason')}</p>
                    <p className="mt-0.5 text-xs text-red-600">{booking.reject_reason}</p>
                  </div>
                </div>
              </div>
            )}
            {/* Actions */}
            <div className="space-y-2 pt-2">
              {/* Status-specific actions */}
              {booking.status === 'accepted-and-waiting-for-payment' && (
                <>
                  <PaymentButton
                    booking={booking}
                    onPaymentSuccess={(booking) => {
                      onPayNow?.(booking);
                      console.log('Payment successful for booking:', booking.id);
                    }}
                    onPaymentError={(error) => {
                      console.error('Payment error:', error);
                    }}
                    className="mb-2"
                  >
                    {t('booking.actions.payNow')}
                  </PaymentButton>
                  <Button
                    color="danger"
                    variant="flat"
                    fullWidth
                    size="lg"
                    className="font-medium shadow-sm"
                    onPress={() => onCancelBooking?.(booking)}
                  >
                    {t('booking.actions.cancelBooking')}
                  </Button>
                </>
              )}
              {booking.status === 'payment-failed' && (
                <div className="space-y-2">
                  <PaymentButton
                    booking={booking}
                    onPaymentSuccess={(booking) => {
                      onPayNow?.(booking);
                      console.log('Payment retry successful for booking:', booking.id);
                    }}
                    onPaymentError={(error) => {
                      console.error('Payment retry error:', error);
                    }}
                  >
                    {t('booking.actions.retryPayment')}
                  </PaymentButton>
                  <Button
                    color="danger"
                    variant="flat"
                    fullWidth
                    size="lg"
                    className="font-medium shadow-sm"
                    onPress={() => onCancelBooking?.(booking)}
                  >
                    {t('booking.actions.cancelBooking')}
                  </Button>
                </div>
              )}
              {/* Render other status actions */}
              {getStatusActions(booking)}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default MyBookingCard; 