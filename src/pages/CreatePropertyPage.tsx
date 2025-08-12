import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import PropertySubmissionForm from '../components/features/property/PropertySubmissionForm';
import { PageBanner } from '../components/shared';
import { getBannerConfig } from '../utils/bannerConfig';
import { useTranslation } from 'react-i18next';

import { CreatePropertyPageProps } from '../interfaces'

const CreatePropertyPage: React.FC<CreatePropertyPageProps> = ({ onPageChange }) => {
  const { t } = useTranslation(['property'])
  return (
    <>
      <div className="col-span-1 md:col-span-2 lg:col-span-3 min-h-screen">
        {/* Mobile-first responsive container */}
        <div className="w-full max-w-none lg:max-w-6xl mx-auto">
          {/* Header Banner */}
          <PageBanner
            backgroundImage={getBannerConfig('createProperty').image}
            title={t('property.submitYourProperty')}
            subtitle={t('property.shareWithTravelers')}
            imageAlt={getBannerConfig('createProperty').alt}
            overlayOpacity={getBannerConfig('createProperty').overlayOpacity}
            height={getBannerConfig('createProperty').height}
            className="mb-4 sm:mb-6"
          />

          {/* Form Container - Responsive */}
          <div className="bg-white rounded-none sm:rounded-xl border-0 sm:border border-gray-200 shadow-none sm:shadow-lg">
            <PropertySubmissionForm />
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePropertyPage; 