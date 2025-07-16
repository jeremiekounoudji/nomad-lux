import React from 'react';
import { XCircle } from 'lucide-react';
import { PaymentRecord } from '../../../../interfaces/PaymentRecord';
import { Divider, Chip, Button } from '@heroui/react';

interface PaymentRecordDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentRecord: PaymentRecord | null;
}

const labelClass = 'font-medium text-gray-700';
const valueClass = 'text-gray-900 break-all';

const PaymentRecordDetailsModal: React.FC<PaymentRecordDetailsModalProps> = ({ isOpen, onClose, paymentRecord }) => {
  if (!isOpen || !paymentRecord) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 mx-auto">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={onClose} aria-label="Close">
          <XCircle className="w-6 h-6" />
        </button>
        <div className="text-2xl font-bold mb-2 text-center">Payment Record Details</div>
        <Divider className="mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-4">
          <div><span className={labelClass}>ID:</span> <span className={valueClass}>{paymentRecord.id}</span></div>
          <div><span className={labelClass}>Booking ID:</span> <span className={valueClass}>{paymentRecord.booking_id}</span></div>
          <div><span className={labelClass}>Amount:</span> <span className="font-semibold text-green-700">{paymentRecord.amount} {paymentRecord.currency}</span></div>
          <div><span className={labelClass}>Status:</span> <Chip color={paymentRecord.payment_status === 'completed' ? 'success' : paymentRecord.payment_status === 'pending' ? 'warning' : paymentRecord.payment_status === 'failed' ? 'danger' : 'default'} size="sm">{paymentRecord.payment_status.toUpperCase()}</Chip></div>
          <div><span className={labelClass}>Method:</span> <Chip size="sm">{paymentRecord.payment_method}</Chip></div>
          <div><span className={labelClass}>Provider:</span> <span className={valueClass}>{paymentRecord.payment_provider}</span></div>
          <div><span className={labelClass}>Intent ID:</span> <span className={valueClass}>{paymentRecord.payment_intent_id || '-'}</span></div>
          <div><span className={labelClass}>Processing Fee:</span> <span className={valueClass}>{paymentRecord.processing_fee}</span></div>
          <div><span className={labelClass}>Platform Fee:</span> <span className={valueClass}>{paymentRecord.platform_fee}</span></div>
          <div><span className={labelClass}>Net Amount:</span> <span className={valueClass}>{paymentRecord.net_amount}</span></div>
          <div><span className={labelClass}>Payout Status:</span> <Chip size="sm">{paymentRecord.payout_status}</Chip></div>
          <div><span className={labelClass}>Payout Date:</span> <span className={valueClass}>{paymentRecord.payout_date || '-'}</span></div>
          <div><span className={labelClass}>Payout Reference:</span> <span className={valueClass}>{paymentRecord.payout_reference || '-'}</span></div>
          <div><span className={labelClass}>Failure Reason:</span> <span className={valueClass}>{paymentRecord.failure_reason || '-'}</span></div>
          <div><span className={labelClass}>Refund Amount:</span> <span className={valueClass}>{paymentRecord.refund_amount}</span></div>
          <div><span className={labelClass}>Refund Reason:</span> <span className={valueClass}>{paymentRecord.refund_reason || '-'}</span></div>
          <div><span className={labelClass}>Initiated At:</span> <span className={valueClass}>{paymentRecord.initiated_at}</span></div>
          <div><span className={labelClass}>Completed At:</span> <span className={valueClass}>{paymentRecord.completed_at || '-'}</span></div>
          <div><span className={labelClass}>Refunded At:</span> <span className={valueClass}>{paymentRecord.refunded_at || '-'}</span></div>
          <div><span className={labelClass}>Created At:</span> <span className={valueClass}>{paymentRecord.created_at}</span></div>
          <div><span className={labelClass}>Updated At:</span> <span className={valueClass}>{paymentRecord.updated_at}</span></div>
        </div>
        <Divider className="my-4" />
        <div>
          <span className={labelClass}>Metadata:</span>
          <pre className="bg-gray-100 rounded p-2 overflow-x-auto text-xs mt-2 whitespace-pre-wrap">{JSON.stringify(paymentRecord.payment_metadata, null, 2)}</pre>
        </div>
        <div className="flex justify-end mt-6">
          <Button color="primary" onPress={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentRecordDetailsModal; 