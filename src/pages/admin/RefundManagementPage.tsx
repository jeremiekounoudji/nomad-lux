import React, { useState, useEffect } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Tabs,
  Tab,
  Chip,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  useDisclosure,
  Spinner,
  Divider
} from '@heroui/react'
import {
  DollarSign,
  Calendar,
  User,
  Home,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye
} from 'lucide-react'
import { useAdminBookings } from '../../hooks/useAdminBookings'
import { AdminRefundRequest } from '../../interfaces/PaymentRecord'
import { useTranslation } from '../../lib/stores/translationStore'
import { formatPrice } from '../../utils/currencyUtils'
import toast from 'react-hot-toast'

type RefundStatus = 'pending' | 'approved' | 'processed' | 'failed' | 'rejected'

const ITEMS_PER_PAGE = 10

const RefundManagementPage: React.FC = () => {
  const { t } = useTranslation(['admin', 'common'])
  const { loadRefundRequests, processRefund, error, clearError } = useAdminBookings()
  
  const [selectedTab, setSelectedTab] = useState<RefundStatus>('pending')
  const [refundRequests, setRefundRequests] = useState<AdminRefundRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRefund, setSelectedRefund] = useState<AdminRefundRequest | null>(null)
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isProcessing, setIsProcessing] = useState(false)
  const [approvedAmount, setApprovedAmount] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [action, setAction] = useState<'approve' | 'reject'>('approve')

  const statusTabs: { key: RefundStatus; label: string; color: string; icon: React.ReactNode }[] = [
    { key: 'pending', label: 'Pending', color: 'warning', icon: <Clock className="w-4 h-4" /> },
    { key: 'approved', label: 'Approved', color: 'success', icon: <CheckCircle className="w-4 h-4" /> },
    { key: 'processed', label: 'Processed', color: 'primary', icon: <DollarSign className="w-4 h-4" /> },
    { key: 'rejected', label: 'Rejected', color: 'danger', icon: <XCircle className="w-4 h-4" /> },
    { key: 'failed', label: 'Failed', color: 'danger', icon: <AlertTriangle className="w-4 h-4" /> }
  ]

  const loadRefunds = async (status: RefundStatus, page: number = 1) => {
    setIsLoading(true)
    try {
      const { data, count } = await loadRefundRequests(page, status)
      setRefundRequests(data)
      setTotalCount(count)
      setCurrentPage(page)
    } catch (error) {
      console.error('Failed to load refund requests:', error)
      toast.error('Failed to load refund requests')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRefunds(selectedTab, 1)
  }, [selectedTab])

  const handleTabChange = (key: string | number) => {
    setSelectedTab(key as RefundStatus)
    setCurrentPage(1)
  }

  const handleProcessRefund = (refund: AdminRefundRequest, action: 'approve' | 'reject') => {
    setSelectedRefund(refund)
    setAction(action)
    setApprovedAmount(refund.requested_amount.toString())
    setAdminNotes('')
    onOpen()
  }

  const handleConfirmProcess = async () => {
    if (!selectedRefund) return

    setIsProcessing(true)
    try {
      const amount = parseFloat(approvedAmount)
      if (isNaN(amount) || amount < 0) {
        toast.error('Please enter a valid amount')
        return
      }

      const status = action === 'approve' ? 'processed' : 'rejected'
      const notes = adminNotes.trim() || `${action === 'approve' ? 'Approved' : 'Rejected'} by admin`

      await processRefund(selectedRefund.id, amount, notes, status)
      
      toast.success(`Refund ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
      onClose()
      loadRefunds(selectedTab, currentPage) // Refresh the list
    } catch (error) {
      console.error('Failed to process refund:', error)
      toast.error('Failed to process refund')
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusColor = (status: RefundStatus) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'approved': return 'success'
      case 'processed': return 'primary'
      case 'rejected':
      case 'failed': return 'danger'
      default: return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Refund Management</h1>
        <p className="text-gray-600 mt-1">Manage and process refund requests from users</p>
      </div>

      {/* Status Tabs */}
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={handleTabChange}
        variant="underlined"
        classNames={{
          tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary-500",
          tab: "max-w-fit px-0 h-12",
          tabContent: "group-data-[selected=true]:text-primary-600"
        }}
      >
        {statusTabs.map((tab) => (
          <Tab
            key={tab.key}
            title={
              <div className="flex items-center gap-2">
                {tab.icon}
                <span>{tab.label}</span>
                <Chip size="sm" color={tab.color as any} variant="flat">
                  {refundRequests.filter(r => r.status === tab.key).length}
                </Chip>
              </div>
            }
          />
        ))}
      </Tabs>

      {/* Refund Requests List */}
      <div className="mt-6">
        {isLoading ? (
          <div className="text-center py-12">
            <Spinner size="lg" />
            <p className="text-gray-500 mt-2">Loading refund requests...</p>
          </div>
        ) : refundRequests.length > 0 ? (
          <div className="space-y-4">
            {refundRequests.map((refund) => (
              <Card key={refund.id} className="w-full">
                <CardBody className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Left side - Booking and Guest Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <img
                          src={refund.booking.properties.images[0] || ''}
                          alt={refund.booking.properties.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{refund.booking.properties.title}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{refund.booking.guest_user.display_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(refund.booking.cancelled_at)}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Reason: {refund.refund_reason}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Amount and Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Requested Amount</p>
                        <p className="text-lg font-semibold text-primary-600">
                          {formatPrice(refund.requested_amount, refund.currency || 'USD')}
                        </p>
                        {refund.approved_amount && (
                          <>
                            <p className="text-sm text-gray-600 mt-1">Approved Amount</p>
                            <p className="text-lg font-semibold text-success-600">
                              {formatPrice(refund.approved_amount, refund.currency || 'USD')}
                            </p>
                          </>
                        )}
                      </div>

                      <Chip
                        color={getStatusColor(refund.status)}
                        variant="solid"
                        size="sm"
                      >
                        {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                      </Chip>

                      {refund.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            color="success"
                            variant="flat"
                            onPress={() => handleProcessRefund(refund, 'approve')}
                            startContent={<CheckCircle className="w-4 h-4" />}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => handleProcessRefund(refund, 'reject')}
                            startContent={<XCircle className="w-4 h-4" />}
                          >
                            Reject
                          </Button>
                        </div>
                      )}

                      {refund.admin_notes && (
                        <div className="text-xs text-gray-500 max-w-xs text-right">
                          <p className="font-medium">Admin Notes:</p>
                          <p>{refund.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {selectedTab} refund requests
            </h3>
            <p className="text-gray-500">
              There are no {selectedTab} refund requests at the moment.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => loadRefunds(selectedTab, currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${currentPage === 1 || isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'}`}
            >
              Previous
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <button
              onClick={() => loadRefunds(selectedTab, currentPage + 1)}
              disabled={isLoading || currentPage >= totalPages}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${isLoading || currentPage >= totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'}`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Process Refund Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  {action === 'approve' ? (
                    <CheckCircle className="w-6 h-6 text-success-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-danger-500" />
                  )}
                  <h2 className="text-xl font-bold">
                    {action === 'approve' ? 'Approve' : 'Reject'} Refund
                  </h2>
                </div>
              </ModalHeader>
              <ModalBody>
                {selectedRefund && (
                  <div className="space-y-6">
                    {/* Booking Info */}
                    <Card>
                      <CardBody className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={selectedRefund.booking.properties.images[0] || ''}
                            alt={selectedRefund.booking.properties.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{selectedRefund.booking.properties.title}</h3>
                            <p className="text-sm text-gray-600">{selectedRefund.booking.guest_user.display_name}</p>
                            <p className="text-sm text-gray-500">Requested: {formatPrice(selectedRefund.requested_amount, selectedRefund.currency || 'USD')}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    <Divider />

                    {/* Amount Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {action === 'approve' ? 'Approved' : 'Rejected'} Amount
                      </label>
                      <Input
                        type="number"
                        value={approvedAmount}
                        onChange={(e) => setApprovedAmount(e.target.value)}
                        placeholder="Enter amount"
                        startContent={<DollarSign className="w-4 h-4 text-gray-400" />}
                        min="0"
                        max={selectedRefund.requested_amount}
                        step="0.01"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum: {formatPrice(selectedRefund.requested_amount, selectedRefund.currency || 'USD')}
                      </p>
                    </div>

                    {/* Admin Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admin Notes
                      </label>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder={`Add notes for ${action === 'approve' ? 'approval' : 'rejection'}...`}
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color={action === 'approve' ? 'success' : 'danger'}
                  onPress={handleConfirmProcess}
                  isLoading={isProcessing}
                  startContent={action === 'approve' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                >
                  {isProcessing ? 'Processing...' : action === 'approve' ? 'Approve Refund' : 'Reject Refund'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default RefundManagementPage
