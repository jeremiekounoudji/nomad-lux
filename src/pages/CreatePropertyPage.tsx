import React from 'react';
import PropertySubmissionForm from '../components/features/property/PropertySubmissionForm';
import { PageBanner } from '../components/shared';
import { getBannerConfig } from '../utils/bannerConfig';
import { useTranslation } from '../lib/stores/translationStore';

import { CreatePropertyPageProps } from '../interfaces';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CreatePropertyPage: React.FC<CreatePropertyPageProps> = ({ onPageChange: _onPageChange }) => {
  const { t } = useTranslation(['property', 'common']);
  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-1 min-h-screen md:col-span-2 lg:col-span-3">
          {/* Mobile-first responsive container */}
          <div className="mx-auto w-full max-w-none lg:max-w-6xl">
            {/* Header Banner */}
            <PageBanner
              backgroundImage={getBannerConfig('createProperty').image}
              title={t('property.submitYourProperty')}
              subtitle={t('property.shareWithTravelers')}
              imageAlt={t('common.pageBanner.createProperty')}
              overlayOpacity={getBannerConfig('createProperty').overlayOpacity}
              height={getBannerConfig('createProperty').height}
              className="mb-4 sm:mb-6"
            />

            {/* Form Container - Responsive */}
            <div className="rounded-none border-0 border-gray-200 bg-white shadow-none sm:rounded-xl sm:border sm:shadow-lg">
              <PropertySubmissionForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePropertyPage;
