import React from 'react';
import { Input } from '@heroui/react';
import type { PropertySubmissionData } from '../../../../interfaces';

interface HostDetailsStepProps {
  formData: PropertySubmissionData;
  setFormData: React.Dispatch<React.SetStateAction<PropertySubmissionData>>;
}

const HostDetailsStep: React.FC<HostDetailsStepProps> = ({ formData, setFormData }) => {
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
        <h2 className="text-2xl font-semibold mb-4">Host Information</h2>
        <p className="text-gray-600 mb-6">
          Please provide your contact details. This information will be used for property verification
          and communication.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={formData.host.display_name}
          onChange={handleInputChange('display_name')}
          required
        />

        <Input
          label="Username"
          placeholder="Enter your username"
          value={formData.host.username}
          onChange={handleInputChange('username')}
          required
        />

        <Input
          label="Email"
          type="email"
          placeholder="Enter your email address"
          value={formData.host.email}
          onChange={handleInputChange('email')}
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="Enter your phone number"
          value={formData.host.phone}
          onChange={handleInputChange('phone')}
          required
        />
      </div>
    </div>
  );
};

export default HostDetailsStep; 