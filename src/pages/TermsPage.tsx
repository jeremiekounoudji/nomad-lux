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
    <div className="bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Button
              isIconOnly
              variant="light"
              onPress={handleBackToHome}
              className="mr-4"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{t('terms:title')}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {/* Last Updated */}
          <p className="mb-8 text-sm text-gray-500">{t('terms:lastUpdated', { date: 'March 2024' })}</p>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">{t('terms:sections.introduction.title')}</h2>
            <p className="mb-4 text-gray-600">
              {t('terms:sections.introduction.content')}
            </p>
          </section>

          {/* Definitions */}
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">{t('terms:sections.definitions.title')}</h2>
            <ul className="list-inside list-disc space-y-2 text-gray-600">
              <li>{t('terms:sections.definitions.items.platform')}</li>
              <li>{t('terms:sections.definitions.items.user')}</li>
              <li>{t('terms:sections.definitions.items.host')}</li>
              <li>{t('terms:sections.definitions.items.guest')}</li>
            </ul>
          </section>

          {/* User Responsibilities */}
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">{t('terms:sections.responsibilities.title')}</h2>
            <p className="mb-4 text-gray-600">
              {t('terms:sections.responsibilities.content')}
            </p>
          </section>

          {/* Booking and Payments */}
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">{t('terms:sections.booking.title')}</h2>
            <p className="mb-4 text-gray-600">
              {t('terms:sections.booking.content')}
            </p>
          </section>

          {/* Cancellation Policy */}
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">{t('terms:sections.cancellation.title')}</h2>
            <p className="mb-4 text-gray-600">
              {t('terms:sections.cancellation.content')}
            </p>
          </section>

          {/* Privacy */}
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">{t('terms:sections.privacy.title')}</h2>
            <p className="mb-4 text-gray-600">
              {t('terms:sections.privacy.content')}
            </p>
          </section>

          {/* Contact Information */}
          <section className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="mb-4 text-xl font-semibold">{t('terms:sections.contact.title')}</h2>
            <p className="mb-4 text-gray-600">
              {t('terms:sections.contact.description')}
            </p>
            <p className="text-gray-900">
              {t('terms:sections.contact.email')}: {t('terms:sections.contact.emailAddress')}<br />
              {t('terms:sections.contact.address')}: {t('terms:sections.contact.streetAddress')}<br />
              {t('terms:sections.contact.phone')}: {t('terms:sections.contact.phoneNumber')}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default TermsPage 