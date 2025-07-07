import { FC, useEffect } from 'react'
import { MainLayout } from '../components/layout'
import { useWalletHistory } from '../hooks/useWalletHistory'
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton'
import { PaymentRecord } from '../interfaces/PaymentRecord'

const WalletPage: FC = () => {
  const { 
    payments, 
    isLoading,
    isRefreshing, 
    error,
    pagination,
    loadWalletPayments,
    loadMoreWalletPayments,
    refreshWalletPayments
  } = useWalletHistory()

  useEffect(() => {
    void loadWalletPayments()
  }, [loadWalletPayments])

  const getStatusColor = (status: PaymentRecord['payment_status']): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
      case 'partial_refund':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <MainLayout>
      {/* Page Banner */}
      <div className="relative bg-primary-600 text-white rounded-lg shadow mb-8">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold">My Wallet</h1>
          <p className="mt-2 text-sm text-white/80">Track your transactions and payouts in one place.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Content */}
          <div className="px-6 py-4">
            {isLoading && !payments.length ? (
              <LoadingSkeleton />
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <>
                {/* Transaction Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Property
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment: PaymentRecord) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-pink-600 font-medium max-w-xs truncate">
                            {(payment as any)?.bookings?.properties?.title ?? '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.currency} {payment.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.payment_status)}`}>
                              {payment.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                  <div className="flex justify-between w-full">
                    <button
                      onClick={() => void loadWalletPayments(pagination.pageSize)}
                      disabled={pagination.currentPage === 1 || isLoading}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                        ${pagination.currentPage === 1 || isLoading
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-primary-600 text-white hover:bg-primary-700'}`}
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center">
                      <span className="text-sm text-gray-700">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => void refreshWalletPayments()}
                        disabled={isRefreshing}
                        className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                          bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                      </button>
                    </div>

                    <button
                      onClick={() => void loadMoreWalletPayments()}
                      disabled={isLoading || (pagination.totalPages !== 1 && pagination.currentPage >= pagination.totalPages)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                        ${isLoading || (pagination.totalPages !== 1 && pagination.currentPage >= pagination.totalPages)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-primary-600 text-white hover:bg-primary-700'}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default WalletPage 