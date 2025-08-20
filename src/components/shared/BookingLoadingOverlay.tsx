import React from 'react';
import { useTranslation } from '../../lib/stores/translationStore';

interface BookingLoadingOverlayProps {
  isVisible: boolean;
}

const BookingLoadingOverlay: React.FC<BookingLoadingOverlayProps> = ({ isVisible }) => {
  const { t } = useTranslation('booking');

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">{t('booking.messages.processingReservation')}</p>
      </div>
    </div>
  );
};

export default BookingLoadingOverlay;
