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
    <Card className="w-full min-w-0 overflow-hidden">
      <CardBody className="p-3 sm:p-4">
        {/* Property Image */}
        <div className="relative mb-3 h-32 w-full overflow-hidden rounded-lg sm:h-40">
          <img
            src={request.property_images[0]}
            alt={request.property_title}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-x-2 bottom-2">
            <h4 className="line-clamp-1 text-sm font-medium text-white">
              {request.property_title}
            </h4>
          </div>
        </div>

        {/* Guest Info */}
        <div className="mb-3 flex items-center gap-2 sm:gap-3">
          <Avatar
            src={request.guest_avatar_url}
            name={request.guest_display_name}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {request.guest_display_name}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Star className="size-3 fill-current text-yellow-500" />
              <span>{request.guest_rating} ({t('booking.reviews.count', { count: request.total_guest_reviews })})</span>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="mb-3 space-y-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="size-3 shrink-0 sm:size-4" />
            <span className="truncate">
              {new Date(request.check_in_date).toLocaleDateString()} - {new Date(request.check_out_date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="size-3 sm:size-4" />
              <span>{t('booking.labels.guests')}: {request.guest_count}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CreditCard className="size-3 sm:size-4" />
              <span className="font-medium">{request.currency} {request.total_amount}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="size-3 shrink-0 sm:size-4" />
            <span className="truncate">
              {request.check_in_time} - {request.check_out_time}
            </span>
          </div>
        </div>

        {/* Contact Info - Mobile Optimized */}
        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <Button
            size="sm"
            variant="light"
            color="primary"
            startContent={<Mail className="size-3 sm:size-4" />}
            onClick={() => window.location.href = `mailto:${request.guest_email}`}
            className="min-w-0 justify-start text-xs sm:text-sm"
          >
            <span className="truncate">{request.guest_email}</span>
          </Button>
          {request.guest_phone && (
            <Button
              size="sm"
              variant="light"
              color="primary"
              startContent={<Phone className="size-3 sm:size-4" />}
              onClick={() => window.location.href = `tel:${request.guest_phone}`}
              className="justify-start text-xs sm:text-sm"
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
                startContent={<X className="size-4" />}
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
                startContent={<Check className="size-4" />}
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
              startContent={<Eye className="size-4" />}
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
            startContent={<Eye className="size-4" />}
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

