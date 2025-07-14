import React from 'react'
import { PayoutRequest } from '../../../interfaces'
import { User } from '../../../interfaces/User'

export interface PayoutRequestsTableProps {
  requests: (PayoutRequest & { host?: User })[]
  isLoading: boolean
  error: string | null
  onApprove: (request: PayoutRequest) => void
  onReject: (request: PayoutRequest) => void
}

export const PayoutRequestsTable: React.FC<PayoutRequestsTableProps> = ({
  requests,
  isLoading,
  error,
  onApprove,
  onReject
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading ? (
            <tr><td colSpan={5} className="text-center py-4 text-gray-500">Loading...</td></tr>
          ) : error ? (
            <tr><td colSpan={5} className="text-center py-4 text-red-600">{error}</td></tr>
          ) : requests.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-4 text-gray-500">No payout requests found.</td></tr>
          ) : (
            requests.map((req) => (
              <tr key={req.id}>
                <td className="px-4 py-2 text-sm">{new Date(req.requested_at).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-sm flex items-center gap-2">
                  {req.host?.avatar_url && (
                    <img src={req.host.avatar_url} alt="avatar" className="w-6 h-6 rounded-full" />
                  )}
                  <span>{req.host?.display_name || req.user_id}</span>
                </td>
                <td className="px-4 py-2 text-sm">{req.currency} {req.amount.toFixed(2)}</td>
                <td className="px-4 py-2 text-sm capitalize">{req.status}</td>
                <td className="px-4 py-2 text-sm">
                  {req.status === 'pending' && (
                    <>
                      <button
                        className="px-2 py-1 bg-green-600 text-white rounded mr-2 hover:bg-green-700"
                        onClick={() => onApprove(req)}
                      >Approve</button>
                      <button
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        onClick={() => onReject(req)}
                      >Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
} 