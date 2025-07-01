import React from 'react'
import { Button } from '@heroui/react'
import { ArrowLeft } from 'lucide-react'

interface HelpPageProps {
  onPageChange?: (page: string) => void
}

const HelpPage: React.FC<HelpPageProps> = ({ onPageChange }) => {
  const handleBackToHome = () => {
    onPageChange?.('home')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Button
              isIconOnly
              variant="light"
              onPress={handleBackToHome}
              className="mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Getting Started */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-primary-600 hover:underline">How to create an account</a>
              </li>
              <li>
                <a href="#" className="text-primary-600 hover:underline">Booking your first stay</a>
              </li>
              <li>
                <a href="#" className="text-primary-600 hover:underline">Understanding pricing</a>
              </li>
            </ul>
          </div>

          {/* Booking Help */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Booking & Stays</h2>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-primary-600 hover:underline">Cancellation policy</a>
              </li>
              <li>
                <a href="#" className="text-primary-600 hover:underline">Payment methods</a>
              </li>
              <li>
                <a href="#" className="text-primary-600 hover:underline">Guest guidelines</a>
              </li>
            </ul>
          </div>

          {/* Host Information */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Hosting</h2>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-primary-600 hover:underline">Becoming a host</a>
              </li>
              <li>
                <a href="#" className="text-primary-600 hover:underline">Property requirements</a>
              </li>
              <li>
                <a href="#" className="text-primary-600 hover:underline">Host protection</a>
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Contact Support</h2>
            <p className="text-gray-600 mb-4">Need more help? Our support team is available 24/7.</p>
            <Button
              color="primary"
              className="w-full"
              onPress={() => window.location.href = 'mailto:support@nomadlux.com'}
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpPage 