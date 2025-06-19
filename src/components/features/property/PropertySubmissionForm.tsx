import React, { useState, useEffect } from 'react';
import { Button, Card, Progress } from '@heroui/react';
import HostDetailsStep from './steps/HostDetailsStep';
import PropertyDetailsStep from './steps/PropertyDetailsStep';
import MediaUploadStep from './steps/MediaUploadStep';
import { Property, User, HostSubmissionData, PropertySubmissionData, PropertySubmissionFormProps } from '../../../interfaces';

const INITIAL_FORM_DATA: PropertySubmissionData = {
  title: '',
  description: '',
  price: 0,
  currency: 'USD',
  location: {
    city: '',
    country: '',
    address: '',
    coordinates: {
      lat: 0,
      lng: 0,
    },
  },
  images: [],
  videos: [],
  host: {
    id: '', // Will be set from auth context
    name: '',
    username: '',
    avatar: '',
    isVerified: false,
    email: '',
    phone: '',
  },
  propertyType: '',
  amenities: [],
  maxGuests: 1,
  bedrooms: 1,
  bathrooms: 1,
  cleaningFee: 0,
  serviceFee: 0,
};

// Custom Stepper Component
const CustomStepper: React.FC<{
  currentStep: number;
  steps: Array<{ title: string; description: string }>;
}> = ({ currentStep, steps }) => {
  const progressValue = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex flex-col items-center flex-1 ${
              index < steps.length - 1 ? 'relative' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                index <= currentStep
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index + 1}
            </div>
            <div className="text-center">
              <div
                className={`text-sm font-medium ${
                  index <= currentStep ? 'text-primary-600' : 'text-gray-500'
                }`}
              >
                {step.title}
              </div>
              <div className="text-xs text-gray-400">{step.description}</div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`absolute top-4 left-1/2 w-full h-0.5 -z-10 ${
                  index < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                }`}
                style={{ transform: 'translateX(50%)' }}
              />
            )}
          </div>
        ))}
      </div>
      <Progress
        value={progressValue}
        color="primary"
        className="mb-4"
        aria-label="Form progress"
      />
    </div>
  );
};

const PropertySubmissionForm: React.FC<PropertySubmissionFormProps> = ({ initialData, isEditMode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PropertySubmissionData>(INITIAL_FORM_DATA);

  const steps = [
    {
      title: 'Host Details',
      description: 'Provide contact information',
      component: <HostDetailsStep formData={formData} setFormData={setFormData} />,
    },
    {
      title: 'Property Details',
      description: 'Describe your property',
      component: <PropertyDetailsStep formData={formData} setFormData={setFormData} />,
    },
    {
      title: 'Media Upload',
      description: 'Add photos and video',
      component: <MediaUploadStep formData={formData} setFormData={setFormData} />,
    },
  ];

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    try {
      // TODO: Implement submission logic to Firebase
      // 1. Upload images and videos to Firebase Storage
      // 2. Get the download URLs
      // 3. Create the property document in Firestore
      console.log('Form submitted:', formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData(initialData as PropertySubmissionData);
    }
  }, [initialData]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="p-6">
        <CustomStepper currentStep={currentStep} steps={steps} />

        <div className="mb-8 min-h-[400px]">{steps[currentStep].component}</div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-8 bg-white relative z-10">
          <Button
            variant="bordered"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="min-w-[100px] border-secondary-300 text-secondary-600 hover:bg-secondary-50"
          >
            Previous
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button color="primary" onClick={handleSubmit} className="min-w-[140px] bg-primary-600 hover:bg-primary-700">
              {isEditMode ? 'Update Property' : 'Submit Property'}
            </Button>
          ) : (
            <Button color="primary" onClick={handleNext} className="min-w-[100px] bg-primary-600 hover:bg-primary-700">
              Next Step
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PropertySubmissionForm; 