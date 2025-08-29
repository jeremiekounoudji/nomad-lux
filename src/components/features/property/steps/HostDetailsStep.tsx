import React from 'react';
import { Input } from '@heroui/react';
import { useTranslation } from '../../../../lib/stores/translationStore';
import type { PropertySubmissionData } from '../../../../interfaces';

interface HostDetailsStepProps {
  formData: PropertySubmissionData;
  setFormData: React.Dispatch<React.SetStateAction<PropertySubmissionData>>;
}

const HostDetailsStep: React.FC<HostDetailsStepProps> = ({ formData, setFormData }) => {
  const { t } = useTranslation(['property', 'common']);

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev: PropertySubmissionData) => ({
      ...prev,
      host: {
        ...prev.host,
        [field]: e.target.value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-2xl font-semibold">{t('property.hostDetails.title')}</h2>
        <p className="mb-6 text-gray-600">
          {t('property.hostDetails.description')}
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label={t('property.hostDetails.fullName')}
          placeholder={t('property.hostDetails.fullNamePlaceholder')}
          value={formData.host.display_name}
          onChange={handleInputChange('display_name')}
          required
        />

        <Input
          label={t('property.hostDetails.username')}
          placeholder={t('property.hostDetails.usernamePlaceholder')}
          value={formData.host.username}
          onChange={handleInputChange('username')}
          required
        />

        <Input
          label={t('common.labels.email')}
          type="email"
          placeholder={t('property.hostDetails.emailPlaceholder')}
          value={formData.host.email}
          onChange={handleInputChange('email')}
          required
        />

        <Input
          label={t('common.labels.phone')}
          type="tel"
          placeholder={t('property.hostDetails.phonePlaceholder')}
          value={formData.host.phone}
          onChange={handleInputChange('phone')}
          required
        />
      </div>
    </div>
  );
};

export default HostDetailsStep; 