import React from 'react';
import { Card, CardBody, Button, Avatar, Chip } from '@heroui/react';
import { Calendar, Star, Clock, CreditCard, Phone, Mail, User, Eye, Check, X } from 'lucide-react';
import { BookingRequest, BookingStatus } from '../../interfaces';
import { useTranslation } from '../../lib/stores/translationStore';

interface BookingRequestCardProps {
  request: BookingRequest;
  onRequestClick: (request: BookingRequest) => void;
  onApprove: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  onConfirmModalOpen: () => void;
  onDeclineModalOpen: () => void;
  updatingBookingId: string | null;
  updatingAction: 'approve' | 'decline' | null;
  getStatusColor: (status: BookingStatus | 'no_shows') => "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  mapStatusKey: (status: BookingStatus | 'no_shows') => string;
}

const BookingRequestCard: React.FC<BookingRequestCardProps> = ({
  request,
  onRequestClick,
  onApprove,
  onDecline,
  onConfirmModalOpen,
  onDeclineModalOpen,
  updatingBookingId,
  updatingAction,
  getStatusColor,
  mapStatusKey
}) => {
  const { t } = useTranslation(['booking']);

  return (
    <Card className="overflow-hidden w-full min-w-0">
      <CardBody className="p-3 sm:p-4">
        {/* Property Image */}
        <div className="relative w-full h-32 sm:h-40 rounded-lg overflow-hidden mb-3">
          <img
            src={request.property_images[0]}
            alt={request.property_title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <h4 className="text-white text-sm font-medium line-clamp-1">
              {request.property_title}
            </h4>
          </div>
        </div>

        {/* Guest Info */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3">
          <Avatar
            src={request.guest_avatar_url}
            name={request.guest_display_name}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 text-sm truncate">
              {request.guest_display_name}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span>{request.guest_rating} ({t('booking.reviews.count', { count: request.total_guest_reviews })})</span>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="space-y-2 text-xs sm:text-sm mb-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">
              {new Date(request.check_in_date).toLocaleDateString()} - {new Date(request.check_out_date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{t('booking.labels.guests')}: {request.guest_count}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-medium">{request.currency} {request.total_amount}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">
              {request.check_in_time} - {request.check_out_time}
            </span>
          </div>
        </div>

        {/* Contact Info - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <Button
            size="sm"
            variant="light"
            color="primary"
            startContent={<Mail className="w-3 h-3 sm:w-4 sm:h-4" />}
            onClick={() => window.location.href = `mailto:${request.guest_email}`}
            className="text-xs sm:text-sm justify-start min-w-0"
          >
            <span className="truncate">{request.guest_email}</span>
          </Button>
          {request.guest_phone && (
            <Button
              size="sm"
              variant="light"
              color="primary"
              startContent={<Phone className="w-3 h-3 sm:w-4 sm:h-4" />}
              onClick={() => window.location.href = `tel:${request.guest_phone}`}
              className="text-xs sm:text-sm justify-start"
            >
              {request.guest_phone}
            </Button>
          )}
        </div>

        {/* Status Badge */}
        <div className="mb-3">
          <Chip
            color={getStatusColor(request.status as BookingStatus | 'no_shows')}
            variant="flat"
            size="sm"
            className="text-xs"
          >
            {t(`booking.status.${mapStatusKey(request.status as BookingStatus)}`)}
          </Chip>
        </div>

        {/* Actions */}
        {request.status === 'pending' && (
          <div className="space-y-2">
            {/* Primary Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                color="danger"
                variant="flat"
                startContent={<X className="w-4 h-4" />}
                onPress={() => {
                  onDeclineModalOpen();
                }}
                className="flex-1 font-medium"
                isLoading={updatingBookingId === request.id && updatingAction === 'decline'}
                disabled={updatingBookingId === request.id}
              >
                {t('booking.actions.decline')}
              </Button>
              <Button
                size="sm"
                color="success"
                startContent={<Check className="w-4 h-4" />}
                onPress={() => {
                  onConfirmModalOpen();
                }}
                className="flex-1 font-medium"
                isLoading={updatingBookingId === request.id && updatingAction === 'approve'}
                disabled={updatingBookingId === request.id}
              >
                {t('booking.actions.approve')}
              </Button>
            </div>
            {/* Secondary Action */}
            <Button
              size="sm"
              variant="bordered"
              color="default"
              startContent={<Eye className="w-4 h-4" />}
              onPress={() => onRequestClick(request)}
              disabled={updatingBookingId === request.id}
              className="w-full font-medium"
            >
              {t('booking.actions.viewDetails')}
            </Button>
          </div>
        )}

        {/* View Details for non-pending requests */}
        {request.status !== 'pending' && (
          <Button
            size="sm"
            variant="bordered"
            color="default"
            startContent={<Eye className="w-4 h-4" />}
            onPress={() => onRequestClick(request)}
            className="w-full font-medium"
          >
            {t('booking.actions.viewDetails')}
          </Button>
        )}
      </CardBody>
    </Card>
  );
};

export default BookingRequestCard;

