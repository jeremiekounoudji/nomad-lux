import React from 'react'
import { Button } from '@heroui/react'
import { ArrowLeft } from 'lucide-react'

interface TermsPageProps {
  onPageChange?: (page: string) => void
}

const TermsPage: React.FC<TermsPageProps> = ({ onPageChange }) => {
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
            <h1 className="text-2xl font-bold text-gray-900">Terms & Conditions</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          {/* Last Updated */}
          <p className="text-sm text-gray-500 mb-8">Last updated: March 2024</p>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              Welcome to NomadLux. By accessing or using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully.
            </p>
          </section>

          {/* Definitions */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Definitions</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>"Platform" refers to the NomadLux website and services</li>
              <li>"User" refers to any person who accesses or uses the Platform</li>
              <li>"Host" refers to users who list properties on the Platform</li>
              <li>"Guest" refers to users who book properties through the Platform</li>
            </ul>
          </section>

          {/* User Responsibilities */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. User Responsibilities</h2>
            <p className="text-gray-600 mb-4">
              Users are responsible for maintaining the confidentiality of their account information and for all activities under their account.
            </p>
          </section>

          {/* Booking and Payments */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Booking and Payments</h2>
            <p className="text-gray-600 mb-4">
              All bookings and payments are processed through our secure platform. Users agree to pay all fees and applicable taxes.
            </p>
          </section>

          {/* Cancellation Policy */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Cancellation Policy</h2>
            <p className="text-gray-600 mb-4">
              Cancellation policies vary by property. Users should review the specific cancellation policy before making a booking.
            </p>
          </section>

          {/* Privacy */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Privacy</h2>
            <p className="text-gray-600 mb-4">
              Our privacy practices are governed by our Privacy Policy, which is incorporated into these Terms and Conditions.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <p className="text-gray-900">
              Email: legal@nomadlux.com<br />
              Address: 123 Luxury Street, Suite 100<br />
              Phone: +1 (555) 123-4567
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default TermsPage 