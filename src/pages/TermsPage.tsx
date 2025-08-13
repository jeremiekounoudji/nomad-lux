import React from 'react'
import { Button } from '@heroui/react'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from '../lib/stores/translationStore'

interface TermsPageProps {
  onPageChange?: (page: string) => void
}

const TermsPage: React.FC<TermsPageProps> = ({ onPageChange }) => {
  const { t } = useTranslation(['terms', 'common'])
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
            <h1 className="text-2xl font-bold text-gray-900">{t('terms.title')}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          {/* Last Updated */}
          <p className="text-sm text-gray-500 mb-8">{t('terms.lastUpdated', { date: 'March 2024' })}</p>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('terms.sections.introduction.title')}</h2>
            <p className="text-gray-600 mb-4">
              {t('terms.sections.introduction.content')}
            </p>
          </section>

          {/* Definitions */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('terms.sections.definitions.title')}</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>{t('terms.sections.definitions.items.platform')}</li>
              <li>{t('terms.sections.definitions.items.user')}</li>
              <li>{t('terms.sections.definitions.items.host')}</li>
              <li>{t('terms.sections.definitions.items.guest')}</li>
            </ul>
          </section>

          {/* User Responsibilities */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('terms.sections.responsibilities.title')}</h2>
            <p className="text-gray-600 mb-4">
              {t('terms.sections.responsibilities.content')}
            </p>
          </section>

          {/* Booking and Payments */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('terms.sections.booking.title')}</h2>
            <p className="text-gray-600 mb-4">
              {t('terms.sections.booking.content')}
            </p>
          </section>

          {/* Cancellation Policy */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('terms.sections.cancellation.title')}</h2>
            <p className="text-gray-600 mb-4">
              {t('terms.sections.cancellation.content')}
            </p>
          </section>

          {/* Privacy */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('terms.sections.privacy.title')}</h2>
            <p className="text-gray-600 mb-4">
              {t('terms.sections.privacy.content')}
            </p>
          </section>

          {/* Contact Information */}
          <section className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">{t('terms.sections.contact.title')}</h2>
            <p className="text-gray-600 mb-4">
              {t('terms.sections.contact.description')}
            </p>
            <p className="text-gray-900">
              {t('terms.sections.contact.email', 'Email')}: legal@nomadlux.com<br />
              {t('terms.sections.contact.address', 'Address')}: 123 Luxury Street, Suite 100<br />
              {t('terms.sections.contact.phone', 'Phone')}: +1 (555) 123-4567
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default TermsPage 