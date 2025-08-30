import React from 'react';
import { useTranslation } from '../../lib/stores/translationStore';

interface BookingLoadingOverlayProps {
  isVisible: boolean;
}

const BookingLoadingOverlay: React.FC<BookingLoadingOverlayProps> = ({ isVisible }) => {
  const { t } = useTranslation('booking');

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-white p-8 text-center">
        <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        <p className="text-gray-600">{t('booking.messages.processingReservation')}</p>
      </div>
    </div>
  );
};

export default BookingLoadingOverlay;
