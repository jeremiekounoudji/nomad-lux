import React from 'react';
import { MapPin, Star, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardBody, Button, Chip } from '@heroui/react';
import { PaymentButton } from './';

interface MyBookingCardProps {
  booking: any;
  onClick: (booking: any) => void;
  getStatusColor: (status: string) => "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  getStatusActions: (booking: any) => React.ReactNode;
  onPayNow?: (booking: any) => void;
  onCancelBooking?: (booking: any) => void;
}

const MyBookingCard: React.FC<MyBookingCardProps> = ({ booking, onClick, getStatusColor, getStatusActions, onPayNow, onCancelBooking }) => {
  return (
    <div className="h-full">
      <Card className="h-full bg-white rounded-xl shadow hover:shadow-lg transition-shadow duration-200">
        {/* Property Image with Status */}
        <div
          className="relative cursor-pointer"
          onClick={() => onClick(booking)}
        >
          <img
            src={booking.properties?.images?.[0] || ''}
            alt={booking.properties?.title || ''}
            className="w-full h-40 object-cover rounded-t-xl"
          />
          <div className="absolute top-3 left-3">
            <Chip
              color={getStatusColor(booking.status)}
              variant="solid"
              size="sm"
              className="text-white font-medium"
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Chip>
          </div>
        </div>
        <CardBody className="p-4 flex-1 flex flex-col">
          {/* Property Info */}
          <div className="space-y-2 flex-1">
            <div
              className="cursor-pointer"
              onClick={() => onClick(booking)}
            >
              <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 min-h-[2.25rem] leading-tight">
                {booking.properties?.title || 'Property'}
              </h3>
              <div className="flex items-start gap-1 text-xs text-gray-600 mt-1">
                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1 break-words">
                  {booking.properties?.location?.city && booking.properties?.location?.country
                    ? `${booking.properties.location.city}, ${booking.properties.location.country}`
                    : 'Location not available'}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                <span className="text-xs font-medium">{booking.properties?.rating}</span>
              </div>
            </div>
            {/* Dates */}
            <div className="flex items-start gap-1 text-xs text-gray-600">
              <Calendar className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span className="break-words leading-tight">
                {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
              </span>
            </div>
            {/* Price */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-base font-bold text-primary-600">
                ${booking.total_amount}
              </span>
              <span className="text-xs text-gray-500">
                {booking.guest_count} guest{booking.guest_count > 1 ? 's' : ''}
              </span>
            </div>
            {/* Reject Reason */}
            {booking.status === 'rejected' && booking.reject_reason && (
              <div className="mt-2 p-2 bg-red-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-red-700">Rejection Reason:</p>
                    <p className="text-xs text-red-600 mt-0.5">{booking.reject_reason}</p>
                  </div>
                </div>
              </div>
            )}
            {/* Actions */}
            <div className="pt-2 space-y-2">
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
                    Pay Now
                  </PaymentButton>
                  <Button
                    color="danger"
                    variant="flat"
                    fullWidth
                    size="lg"
                    className="font-medium shadow-sm"
                    onPress={() => onCancelBooking?.(booking)}
                  >
                    Cancel
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
                    Retry Payment
                  </PaymentButton>
                  <Button
                    color="danger"
                    variant="flat"
                    fullWidth
                    size="lg"
                    className="font-medium shadow-sm"
                    onPress={() => onCancelBooking?.(booking)}
                  >
                    Cancel Booking
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