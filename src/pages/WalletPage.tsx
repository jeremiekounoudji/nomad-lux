import { FC, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
// removed unused MainLayout import
import { useWalletHistory } from '../hooks/useWalletHistory'
// removed unused LoadingSkeleton import
import { Skeleton } from '@heroui/react'
import { PaymentRecord } from '../interfaces/PaymentRecord'
import { useWalletMetrics } from '../hooks/useWalletMetrics'
import { RequestPayoutModal } from '../components/shared/modals'
import { usePayoutRequests } from '../hooks/usePayoutRequests'
import { useAdminSettings } from '../hooks/useAdminSettings'
import { PageBanner } from '../components/shared'
import { getBannerConfig } from '../utils/bannerConfig'
import { DollarSign, TrendingUp, Clock, CheckCircle, XCircle, CreditCard } from 'lucide-react'
import { useTranslation } from '../lib/stores/translationStore'
import { formatPrice } from '../utils/currencyUtils'

const WalletPage: FC = () => {
  const { t } = useTranslation(['wallet', 'common'])
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

  // Wallet metrics
  const {
    metrics,
    isMetricsLoading,
    metricsError,
    fetchWalletMetrics
  } = useWalletMetrics()

  // Payout requests hook
  const {
    requests: payoutRequests,
    fetchPayoutRequests,
    createPayoutRequest,
    isLoading: isPayoutLoading,
    error: payoutError
  } = usePayoutRequests()

  const [isPayoutModalOpen, setPayoutModalOpen] = useState(false)

  // Admin settings
  const { settings: adminSettings, fetchSettings, invalidateCache } = useAdminSettings()

  // Derive minimum payout amount from settings (falls back to 0)
  const minimumPayoutAmount = adminSettings?.payment?.minimumPayoutAmount ?? 0

  useEffect(() => {
    // Force fetch admin settings with cache invalidation
    invalidateCache()
    fetchSettings().catch(console.error)
    void loadWalletPayments()
    void fetchWalletMetrics()
    void fetchPayoutRequests()
  }, [loadWalletPayments, fetchWalletMetrics, fetchPayoutRequests])

  // Show error toasts when there are errors
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  useEffect(() => {
    if (metricsError) {
      toast.error(metricsError)
    }
  }, [metricsError])

  useEffect(() => {
    if (payoutError) {
      toast.error(payoutError)
    }
  }, [payoutError])

  // removed unused getStatusColor

  const getPayoutStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'text-green-400'
      case 'pending':
        return 'text-yellow-400'
      case 'failed':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="col-span-full h-full w-full pb-20 lg:pb-6">
      {/* Request Payout Modal */}
      {metrics && (
        <RequestPayoutModal
          isOpen={isPayoutModalOpen}
          onClose={() => setPayoutModalOpen(false)}
          payoutBalance={metrics.payoutBalance}
          minimumPayoutAmount={minimumPayoutAmount}
          onSubmit={async (amount) => {
            await createPayoutRequest(amount)
            await fetchWalletMetrics()
            await fetchPayoutRequests()
          }}
        />
      )}

      {/* Header */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Wallet Banner */}
        <div className="mb-8">
          <PageBanner
            backgroundImage={getBannerConfig('wallet').image}
            title={t('wallet.banner.title')}
            subtitle={t('wallet.banner.subtitle')}
            imageAlt={t('common.pageBanner.wallet')}
            overlayOpacity={getBannerConfig('wallet').overlayOpacity}
            height={getBannerConfig('wallet').height}
          />
        </div>

        {/* Summary Cards */}
        {isMetricsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {/* Total Balance Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">{t('wallet.cards.totalBalance')}</p>
                <h3 className="text-xl font-bold text-primary-600">{formatPrice(metrics.totalBalance, 'USD')}</h3>
              </div>
            </div>

            {/* Pending Amount & Count Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">{t('wallet.cards.pending')}</p>
                <h3 className="text-xl font-bold text-yellow-600">{formatPrice(metrics.pendingAmount, 'USD')}</h3>
                <p className="text-xs text-gray-400">{t('wallet.cards.transactions', { count: metrics.pendingCount })}</p>
              </div>
            </div>

            {/* Failed Amount & Count Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">{t('wallet.cards.failed')}</p>
                <h3 className="text-xl font-bold text-red-600">{formatPrice(metrics.failedAmount, 'USD')}</h3>
                <p className="text-xs text-gray-400">{t('wallet.cards.transactions', { count: metrics.failedCount })}</p>
              </div>
            </div>

            {/* Successful Amount & Count Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">{t('wallet.cards.successful')}</p>
                <h3 className="text-xl font-bold text-green-600">{formatPrice(metrics.successfulAmount, 'USD')}</h3>
                <p className="text-xs text-gray-400">{t('wallet.cards.transactions', { count: metrics.successfulCount })}</p>
              </div>
            </div>

            {/* Payout Balance Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">{t('wallet.cards.payoutBalance')}</p>
                <h3 className="text-xl font-bold text-blue-600">{formatPrice(metrics.payoutBalance, 'USD')}</h3>
              </div>
            </div>

            {/* Last Payout Date Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">{t('wallet.cards.lastPayout')}</p>
                <h3 className="text-sm font-bold text-gray-600">
                  {metrics.lastPayoutDate ? new Date(metrics.lastPayoutDate).toLocaleDateString() : t('wallet.cards.never')}
                </h3>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            {/* Payout Button Section */}
            {metrics && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('wallet.payout.available')}</h2>
                    <div className="text-3xl font-bold text-primary-600 mb-1">
                      {/* Assuming formatCurrency is defined elsewhere or will be added */}
                      {formatPrice(metrics.payoutBalance, 'USD')}
                    </div>
                    {metrics.nextPayoutAllowedAt && new Date(metrics.nextPayoutAllowedAt) > new Date() ? (
                      <p className="text-sm text-gray-500 mt-1">
                        {t('wallet.payout.nextPayout')} {new Date(metrics.nextPayoutAllowedAt).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 mt-1">{t('wallet.payout.ready')}</p>
                    )}
                  </div>
                  <button
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:text-gray-500"
                    onClick={() => setPayoutModalOpen(true)}
                  >
                    {t('wallet.actions.payout')}
                  </button>
                </div>
              </div>
            )}

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('wallet.transactions.title')}</h2>
            
              <div className="space-y-4">
                {isLoading && !payments.length ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {payments.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">{t('wallet.transactions.empty')}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {payments.map((payment: PaymentRecord) => (
                          <div key={payment.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                {payment.payment_status === 'completed' ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : payment.payment_status === 'pending' ? (
                                  <Clock className="w-5 h-5 text-yellow-600" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {(payment as any)?.bookings?.properties?.title || t('wallet.transactions.payment')}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(payment.created_at).toLocaleDateString()} • {new Date(payment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">+{payment.currency} {payment.amount.toFixed(2)}</p>
                              <p className={`text-xs capitalize ${
                                payment.payment_status === 'completed' ? 'text-green-600' : 
                                payment.payment_status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {t(`wallet.transactions.status.${payment.payment_status}`)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => void loadWalletPayments(pagination.pageSize)}
                        disabled={pagination.currentPage === 1 || isLoading}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                          ${pagination.currentPage === 1 || isLoading
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-primary-600 text-white hover:bg-primary-700'}`}
                      >
                        {t('wallet.pagination.previous')}
                      </button>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-700">
                          {t('wallet.pagination.pageOf', { current: pagination.currentPage, total: pagination.totalPages })}
                        </span>
                        <button
                          onClick={() => void refreshWalletPayments()}
                          disabled={isRefreshing}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                            bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {isRefreshing ? t('wallet.pagination.refreshing') : t('wallet.pagination.refresh')}
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
                        {t('wallet.pagination.next')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Payout Requests Panel */}
          <div className="col-span-1">
            <div className="bg-gray-900 text-white rounded-xl shadow-lg">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold">{t('wallet.requests.title')}</h2>
                <div className="mt-2 grid grid-cols-3 gap-4 text-xs text-gray-400">
                  <span>{t('wallet.requests.date')}</span>
                  <span>{t('wallet.requests.amount')}</span>
                  <span>{t('wallet.requests.status')}</span>
                </div>
              </div>
              <div className="p-6">
                {isPayoutLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full rounded bg-gray-800" />
                    ))}
                  </div>
                ) : payoutRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">{t('wallet.requests.empty')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payoutRequests.map((req) => (
                      <div key={req.id} className="grid grid-cols-3 gap-4 py-2 text-sm">
                        <span className="text-gray-300">
                          {new Date(req.requested_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                        </span>
                        <span className="text-gray-300">{req.amount.toFixed(2)}</span>
                        <span className={`${getPayoutStatusColor(req.status)} font-medium capitalize`}>
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer with current total if needed */}
                {payoutRequests.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{t('wallet.requests.totalRequested')}</span>
                      <span className="text-white font-semibold">
                        {formatPrice(payoutRequests.reduce((sum, req) => sum + req.amount, 0), 'USD')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletPage 