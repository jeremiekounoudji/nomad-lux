import React from 'react';
import { MapPin, Star, Calendar } from 'lucide-react';
import { Card, CardBody, Button, Chip } from '@heroui/react';

interface MyBookingCardProps {
  booking: any;
  onClick: (booking: any) => void;
  getStatusColor: (status: string) => string;
  getStatusActions: (booking: any) => React.ReactNode;
}

const MyBookingCard: React.FC<MyBookingCardProps> = ({ booking, onClick, getStatusColor, getStatusActions }) => {
  return (
    <Card className="w-[320px] flex-shrink-0 flex flex-col h-full border border-gray-100 bg-white rounded-xl shadow hover:shadow-lg transition-shadow duration-200">
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
          {/* Actions */}
          <div className="pt-2 space-y-2">
            {/* Show Pay Now button if status is accepted-and-waiting-for-payment */}
            {booking.status === 'accepted-and-waiting-for-payment' && (
              <Button color="primary" fullWidth>
                Pay Now
              </Button>
            )}
            {/* Other status actions (for reference, not rendered here):
                - pending: Cancel booking
                - confirmed: Cancel booking, Contact host
                - cancelled: (no action)
                - completed: Leave review
                - rejected: (no action)
                - payment-failed: Retry payment
            */}
            {/* Optionally render other actions here if needed:
            {getStatusActions(booking)}
            */}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default MyBookingCard; 