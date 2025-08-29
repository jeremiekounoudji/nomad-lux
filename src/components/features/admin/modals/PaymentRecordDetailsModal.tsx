import React from 'react';
import { XCircle } from 'lucide-react';
import { PaymentRecord } from '../../../../interfaces/PaymentRecord';
import { Divider, Chip, Button } from '@heroui/react';
import { useTranslation } from '../../../../lib/stores/translationStore';

interface PaymentRecordDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentRecord: PaymentRecord | null;
}

const labelClass = 'font-medium text-gray-700';
const valueClass = 'text-gray-900 break-all';

const PaymentRecordDetailsModal: React.FC<PaymentRecordDetailsModalProps> = ({ isOpen, onClose, paymentRecord }) => {
  const { t } = useTranslation(['admin', 'common']);
  
  if (!isOpen || !paymentRecord) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative mx-auto w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <button className="absolute right-3 top-3 text-gray-400 hover:text-gray-700" onClick={onClose} aria-label={t('common.actions.close', { defaultValue: 'Close' })}>
          <XCircle className="size-6" />
        </button>
        <div className="mb-2 text-center text-2xl font-bold">{t('admin.payments.recordDetails', { defaultValue: 'Payment Record Details' })}</div>
        <Divider className="mb-4" />
        <div className="mb-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
          <div><span className={labelClass}>{t('admin.payments.labels.id', { defaultValue: 'ID' })}:</span> <span className={valueClass}>{paymentRecord.id}</span></div>
          <div><span className={labelClass}>{t('admin.payments.labels.bookingId', { defaultValue: 'Booking ID' })}:</span> <span className={valueClass}>{paymentRecord.booking_id}</span></div>
          <div><span className={labelClass}>{t('admin.payments.labels.amount', { defaultValue: 'Amount' })}:</span> <span className="font-semibold text-green-700">{paymentRecord.amount} {paymentRecord.currency}</span></div>
          <div><span className={labelClass}>{t('admin.payments.labels.status', { defaultValue: 'Status' })}:</span> <Chip color={paymentRecord.payment_status === 'completed' ? 'success' : paymentRecord.payment_status === 'pending' ? 'warning' : paymentRecord.payment_status === 'failed' ? 'danger' : 'default'} size="sm">{paymentRecord.payment_status.toUpperCase()}</Chip></div>
          <div><span className={labelClass}>{t('admin.payments.labels.method', { defaultValue: 'Method' })}:</span> <Chip size="sm">{paymentRecord.payment_method}</Chip></div>
          <div><span className={labelClass}>{t('admin.payments.labels.provider', { defaultValue: 'Provider' })}:</span> <span className={valueClass}>{paymentRecord.payment_provider}</span></div>
          <div><span className={labelClass}>{t('admin.payments.labels.intentId', { defaultValue: 'Intent ID' })}:</span> <span className={valueClass}>{paymentRecord.payment_intent_id || '-'}</span></div>
          <div><span className={labelClass}>{t('admin.payments.labels.processingFee', { defaultValue: 'Processing Fee' })}:</span> <span className={valueClass}>{paymentRecord.processing_fee}</span></div>
          <div><span className={labelClass}>{t('admin.payments.labels.platformFee', { defaultValue: 'Platform Fee' })}:</span> <span className={valueClass}>{paymentRecord.platform_fee}</span></div>
          <div><span className={labelClass}>{t('admin.payments.labels.netAmount', { defaultValue: 'Net Amount' })}:</span> <span className={valueClass}>{paymentRecord.net_amount}</span></div>
          <div><span className={labelClass}>{t('admin.payments.labels.payoutStatus', { defaultValue: 'Payout Status' })}:</span> <Chip size="sm">{paymentRecord.payout_status}</Chip></div>
          <div><span className={labelClass}>{t('admin.payments.labels.payoutDate', { defaultValue: 'Payout Date' })}:</span> <span className={valueClass}>{paymentRecord.payout_date || '-'}</span></div>
          <div><span className={labelClass}>{t('admin.payments.labels.payoutReference', { defaultValue: 'Payout Reference' })}:</span> <span className={valueClass}>{paymentRecord.payout_reference || '-'}</span></div>
          <div><span className={labelClass}>{t('admin.payments.labels.failureReason', { defaultValue: 'Failure Reason' })}:</span> <span className={valueClass}>{paymentRecord.failure_reason || '-'}</span></div>
          <div><span className={labelClass}>{t('admin.payments.labels.refundAmount', { defaultValue: 'Refund Amount' })}:</span> <span className={valueClass}>{paymentRecord.refund_amount}</span></div>
          <div><span className={labelClass}>{t('admin.payments.labels.refundReason', { defaultValue: 'Refund Reason' })}:</span> <span className={valueClass}>{paymentRecord.refund_reason || '-'}</span></div>
          <div><span className={labelClass}>{t('admin.payments.labels.initiatedAt', { defaultValue: 'Initiated At' })}:</span> <span className={valueClass}>{paymentRecord.initiated_at}</span></div>
          <div><span className={labelClass}>{t('admin.payments.labels.completedAt', { defaultValue: 'Completed At' })}:</span> <span className={valueClass}>{paymentRecord.completed_at || '-'}</span></div>
          <div><span className={labelClass}>{t('admin.payments.labels.refundedAt', { defaultValue: 'Refunded At' })}:</span> <span className={valueClass}>{paymentRecord.refunded_at || '-'}</span></div>
          <div><span className={labelClass}>{t('admin.payments.labels.createdAt', { defaultValue: 'Created At' })}:</span> <span className={valueClass}>{paymentRecord.created_at}</span></div>
          <div><span className={labelClass}>{t('admin.payments.labels.updatedAt', { defaultValue: 'Updated At' })}:</span> <span className={valueClass}>{paymentRecord.updated_at}</span></div>
        </div>
        <Divider className="my-4" />
        <div>
          <span className={labelClass}>{t('admin.payments.labels.metadata', { defaultValue: 'Metadata' })}:</span>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded bg-gray-100 p-2 text-xs">{JSON.stringify(paymentRecord.payment_metadata, null, 2)}</pre>
        </div>
        <div className="mt-6 flex justify-end">
          <Button color="primary" onPress={onClose}>{t('common.actions.close', { defaultValue: 'Close' })}</Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentRecordDetailsModal; 