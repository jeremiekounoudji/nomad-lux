import React from 'react'
import { PayoutRequest } from '../../../interfaces'
import { User } from '../../../interfaces/User'
import { useTranslation } from '../../../lib/stores/translationStore'


export interface PayoutRequestsTableProps {
  requests: (PayoutRequest & { host?: User })[]
  isLoading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  totalCount: number
  itemsPerPage: number
  onApprove: (request: PayoutRequest) => void
  onReject: (request: PayoutRequest) => void
  onPageChange: (page: number) => void
}

export const PayoutRequestsTable: React.FC<PayoutRequestsTableProps> = ({
  requests,
  isLoading,
  error,
  currentPage,
  totalPages,
  totalCount,
  itemsPerPage,
  onApprove,
  onReject,
  onPageChange
}) => {
  const { t } = useTranslation(['admin', 'common'])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{t('notifications.details.date', { defaultValue: 'Date' })}</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{t('admin.properties.hostInformation', { defaultValue: 'Host' })}</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{t('admin.payments.paymentAmount')}</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{t('common.labels.status', { defaultValue: 'Status' })}</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{t('admin.actions.view', { defaultValue: 'Actions' })}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr><td colSpan={5} className="py-4 text-center text-gray-500">{t('common.messages.loading', { defaultValue: 'Loading...' })}</td></tr>
            ) : error ? (
              <tr><td colSpan={5} className="py-4 text-center text-red-600">{error}</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={5} className="py-4 text-center text-gray-500">{t('admin.payments.noRequests', { defaultValue: 'No payout requests found.' })}</td></tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id}>
                  <td className="px-4 py-2 text-sm">{new Date(req.requested_at).toLocaleDateString()}</td>
                  <td className="flex items-center gap-2 px-4 py-2 text-sm">
                    {req.host?.avatar_url && (
                      <img src={req.host.avatar_url} alt="avatar" className="size-6 rounded-full" />
                    )}
                    <span>{req.host?.display_name || req.user_id}</span>
                  </td>
                  <td className="px-4 py-2 text-sm">{req.currency} {req.amount.toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm capitalize">{t(`admin.payments.status.${req.status}`, { defaultValue: req.status })}</td>
                  <td className="px-4 py-2 text-sm">
                    {req.status === 'pending' && (
                      <>
                        <button
                          className="mr-2 rounded bg-green-600 px-2 py-1 text-white hover:bg-green-700"
                          onClick={() => onApprove(req)}
                        >{t('admin.actions.approve')}</button>
                        <button
                          className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
                          onClick={() => onReject(req)}
                        >{t('admin.actions.reject')}</button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors
              ${currentPage === 1
                ? 'cursor-not-allowed bg-gray-100 text-gray-400' 
                : 'bg-primary-600 text-white hover:bg-primary-700'}`}
          >
            {t('common.pagination.previous', { defaultValue: 'Previous' })}
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {t('common.pagination.pageOf', { defaultValue: 'Page {{current}} of {{total}}', current: currentPage, total: totalPages })}
            </span>
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors
              ${currentPage >= totalPages
                ? 'cursor-not-allowed bg-gray-100 text-gray-400' 
                : 'bg-primary-600 text-white hover:bg-primary-700'}`}
          >
            {t('common.pagination.next', { defaultValue: 'Next' })}
          </button>
        </div>
      )}
    </div>
  )
} 