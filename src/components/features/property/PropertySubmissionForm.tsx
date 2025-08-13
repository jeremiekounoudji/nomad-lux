import React, { useState, useEffect } from 'react';
import { Button, Progress } from '@heroui/react';
import PropertySettingsStep from './steps/PropertySettingsStep';
import HostDetailsStep from './steps/HostDetailsStep';
import PropertyDetailsStep from './steps/PropertyDetailsStep';
import MediaUploadStep from './steps/MediaUploadStep';

import { HostSubmissionData, PropertySubmissionData, PropertySubmissionFormProps } from '../../../interfaces';
import { useProperty } from '../../../hooks/useProperty';
import { useAuthStore } from '../../../lib/stores/authStore';
import { useAdminSettingsStore } from '../../../lib/stores/adminSettingsStore';
import toast from 'react-hot-toast';
import { useTranslation } from '../../../lib/stores/translationStore';

const INITIAL_FORM_DATA: PropertySubmissionData = {
  title: '',
  description: '',
  price: 0,
  currency: 'USD',
  location: {
    city: '',
    country: '',
    address: '',
    coordinates: { lat: 0, lng: 0 }
  },
  images: [],
  videos: [],
  property_type: '',
  amenities: [],
  max_guests: 1,
  bedrooms: 1,
  bathrooms: 1,
  cleaning_fee: 0,
  service_fee: 0,
  instant_book: false,
  additional_fees: [],
  host: {
    id: '',
    name: '',
    username: '',
    avatar_url: '',
    display_name: '',
    is_identity_verified: false,
    is_email_verified: false,
    email: '',
    phone: '',
    rating: 0,
    response_rate: 0,
    response_time: '',
    bio: '',
    experience: 0
  }
};

// Custom Stepper Component - Enhanced for Mobile
const CustomStepper: React.FC<{
  currentStep: number;
  steps: Array<{ title: string; description: string }>;
}> = ({ currentStep, steps }) => {
  const { t } = useTranslation(['property']);
  const progressValue = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="mb-6 sm:mb-8">
      {/* Mobile: Vertical stepper for small screens */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('property.submission.progress.mobileTitle', { current: currentStep + 1, total: steps.length })}
          </h3>
          <div className="text-sm text-gray-500">
            {t('property.submission.progress.completeLabel', { percent: Math.round(progressValue) })}
          </div>
        </div>
        
        <div className="bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressValue}%` }}
          />
        </div>

        <div className="bg-primary-50 rounded-lg p-4 border-l-4 border-primary-500">
          <h4 className="font-semibold text-primary-900 mb-1">
            {steps[currentStep].title}
          </h4>
          <p className="text-sm text-primary-700">
            {steps[currentStep].description}
          </p>
        </div>
      </div>

      {/* Desktop: Horizontal stepper for larger screens */}
      <div className="hidden sm:block">
        <div className="flex justify-between items-center mb-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col items-center flex-1 ${
                index < steps.length - 1 ? 'relative' : ''
              }`}
            >
              <div
                className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-sm lg:text-base font-medium mb-3 transition-all duration-300 ${
                  index <= currentStep
                    ? 'bg-primary-600 text-white shadow-lg scale-110'
                    : 'bg-gray-200 text-gray-500'
                } ${index === currentStep ? 'ring-4 ring-primary-200' : ''}`}
              >
                {index + 1}
              </div>
              <div className="text-center max-w-[120px]">
                <div
                  className={`text-sm lg:text-base font-medium mb-1 ${
                    index <= currentStep ? 'text-primary-600' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-xs lg:text-sm text-gray-400 leading-tight">
                  {step.description}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-5 lg:top-6 left-1/2 w-full h-0.5 -z-10 transition-all duration-300 ${
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
          className="mb-4 h-1.5"
          aria-label={t('property.submission.progress.aria')}
        />
      </div>
    </div>
  );
};

const PropertySubmissionForm: React.FC<PropertySubmissionFormProps> = ({ initialData, isEditMode, onSubmitSuccess, externalLoading }) => {
  const { t } = useTranslation(['property', 'common']);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PropertySubmissionData>(INITIAL_FORM_DATA);
  
  // Hooks
  const { submitProperty, isLoading, uploadProgress } = useProperty();
  const { user } = useAuthStore();
  const { settings } = useAdminSettingsStore();

  console.log('📋 PropertySubmissionForm rendered', { 
    isEditMode, 
    currentStep, 
    hasUser: !!user,
    hasSettings: !!settings 
  });

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const steps = [
    {
      title: t('property.submission.steps.settings.title'),
      description: t('property.submission.steps.settings.description'),
      component: <PropertySettingsStep formData={formData} setFormData={setFormData} />,
    },
    {
      title: t('property.submission.steps.host.title'),
      description: t('property.submission.steps.host.description'),
      component: <HostDetailsStep formData={formData} setFormData={setFormData} />,
    },
    {
      title: t('property.submission.steps.details.title'),
      description: t('property.submission.steps.details.description'),
      component: <PropertyDetailsStep formData={formData} setFormData={setFormData} />,
    },
    {
      title: t('property.submission.steps.media.title'),
      description: t('property.submission.steps.media.description'),
      component: <MediaUploadStep formData={formData} setFormData={setFormData} />,
    },
  ];

  const handleSubmit = async () => {
    console.log('🚀 Submit button clicked', { isEditMode })
    
    if (!user) {
      toast.error(t('property.submission.errors.signInRequired'));
      return;
    }
    
    // Debug current upload progress
    console.log('📊 Current upload progress:', uploadProgress)

    // Validate property settings (new first step)
    if (!formData.existing_settings_id && !formData.create_new_settings) {
      toast.error(t('property.submission.errors.selectOrCreateSettings'));
      return;
    }

    if (formData.create_new_settings && (!formData.property_settings?.settings_name?.trim())) {
      toast.error(t('property.submission.errors.completeSettingsForm'));
      return;
    }

    // Validate form data
    if (!formData.title.trim()) {
      toast.error(t('property.submission.errors.titleRequired'));
      return;
    }

    if (!formData.description.trim()) {
      toast.error(t('property.submission.errors.descriptionRequired'));
      return;
    }

    if (formData.price <= 0) {
      toast.error(t('property.submission.errors.validPriceRequired'));
      return;
    }

    if (!formData.location.city.trim() || !formData.location.country.trim()) {
      toast.error(t('property.submission.errors.locationRequired'));
      return;
    }

    if (formData.images.length < 4) {
      toast.error(t('property.submission.errors.minImages'));
      return;
    }

    if (!formData.videos || formData.videos.length === 0) {
      toast.error(t('property.submission.errors.videoRequired'));
      return;
    }

    if (!formData.property_type) {
      toast.error(t('property.submission.errors.propertyTypeRequired'));
      return;
    }

    // Validate file formats against admin settings
    const allowedImageFormats = settings?.platform?.allowedImageFormats || ['jpg', 'jpeg', 'png', 'webp'];
    const allowedVideoFormats = settings?.platform?.allowedVideoFormats || ['mp4', 'webm', 'mov', 'avi'];
    const maxFileSize = settings?.platform?.maxFileSize || 50; // MB

    // Validate video format if uploaded
    if (formData.videos && formData.videos.length > 0) {
      const videoFile = formData.videos[0];
      if (videoFile instanceof File) {
        const videoExtension = videoFile.name.split('.').pop()?.toLowerCase();
        const isValidVideoFormat = allowedVideoFormats.includes(videoExtension || '') || 
                                 allowedVideoFormats.some(format => videoFile.type.includes(format));
        
        if (!isValidVideoFormat) {
          toast.error(t('property.submission.errors.videoFormatNotSupported', { formats: allowedVideoFormats.join(', ') }));
          return;
        }

        console.log('✅ Video format validation passed:', {
          fileName: videoFile.name,
          fileType: videoFile.type,
          fileSize: `${(videoFile.size / (1024 * 1024)).toFixed(2)}MB`
        });
      }
    }

    console.log('🔍 Validating files against admin settings:', {
      allowedImageFormats,
      allowedVideoFormats,
      maxFileSize,
      imageCount: formData.images.length,
      videoCount: formData.videos.length
    });

    try {
      console.log('📤 Submitting property with data:', formData);
      
      const submissionData: PropertySubmissionData = {
        ...formData,
      };

      if (isEditMode && onSubmitSuccess) {
        // Edit mode - call the callback instead of submitting new property
        console.log('📝 Edit mode: calling onSubmitSuccess callback');
        onSubmitSuccess(submissionData);
        return;
      }

      // Create mode - submit new property
      console.log('➕ Create mode: submitting new property');
      
      // Add timeout to prevent hanging submissions
      const submissionTimeout = 5 * 60 * 1000; // 5 minutes
      const submissionPromise = submitProperty(submissionData);
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Submission timeout - please try again'))
        }, submissionTimeout)
      });

      const result = await Promise.race([submissionPromise, timeoutPromise]);
      
      if (result) {
        console.log('✅ Property submission successful:', result.id);
        toast.success(t('property.submission.success'));
        // Reset form after successful submission
        setFormData(INITIAL_FORM_DATA);
        setCurrentStep(0);
      }
    } catch (error) {
      console.error('❌ Error submitting property:', error);
      
      // Provide more specific error messages
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('timeout')) {
        toast.error(t('property.submission.errors.timeout'));
      } else if (errorMessage.includes('upload')) {
        toast.error(t('property.submission.errors.uploadFailed'));
      } else if (errorMessage.includes('network')) {
        toast.error(t('common.messages.networkError'));
      } else {
        toast.error(t('property.submission.errors.generic', { error: errorMessage }));
      }
    }
  };

  // Effect to handle initial data and admin settings
  useEffect(() => {
    if (initialData && isEditMode) {
      // Convert Property to PropertySubmissionData for edit mode
      const submissionData: PropertySubmissionData = {
        title: initialData.title,
        description: initialData.description,
        price: initialData.price,
        currency: initialData.currency,
        location: initialData.location,
        images: initialData.images,
        videos: initialData.videos || [],
        property_type: initialData.property_type,
        amenities: initialData.amenities,
        max_guests: initialData.max_guests,
        bedrooms: initialData.bedrooms,
        bathrooms: initialData.bathrooms,
        cleaning_fee: initialData.cleaning_fee || 0,
        service_fee: initialData.service_fee || 0,
        instant_book: initialData.instant_book,
        additional_fees: initialData.additional_fees,
        host: {} as HostSubmissionData // Will be set when user is available
      };
      setFormData(submissionData);
    }
  }, [initialData, isEditMode]);

  // Effect to log admin settings (for reference, but no auto-calculation)
  useEffect(() => {
    if (settings && user) {
      const commissionRate = settings.booking?.commissionRate || 6;
      const paymentProcessingFee = settings.booking?.paymentProcessingFee || 2.4;

      console.log('📋 Admin settings available for reference:', {
        commissionRate: `${commissionRate}%`,
        paymentProcessingFee: `${paymentProcessingFee}%`,
        note: 'Service fee will be manually set by host'
      });
    }
  }, [settings, user]);

  // Effect to set user information when user is available
  useEffect(() => {
    if (user && formData.host.id === '') {
      console.log('👤 Setting user information in form data');
      setFormData(prev => ({
        ...prev,
        host: {
          id: user.id,
          name: user.display_name || '',
          username: user.username || '',
          avatar_url: user.avatar_url || '',
          display_name: user.display_name || '',
          is_identity_verified: user.is_identity_verified || false,
          is_email_verified: user.is_email_verified || false,
          email: user.email || '',
          phone: user.phone || '',
          rating: user.host_rating || 0,
          response_rate: user.response_rate || 0,
          response_time: user.response_time || '',
          bio: user.bio || '',
          experience: 0
        }
      }));
    }
  }, [user, formData.host.id]);

  return (
    <div className="w-full">
      {/* Responsive container with proper padding */}
      <div className="p-4 sm:p-6 lg:p-8">
        <CustomStepper currentStep={currentStep} steps={steps} />

        {/* Form content with responsive min-height */}
        <div className="mb-6 sm:mb-8 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
          <div className="bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none p-4 sm:p-0">
            {steps[currentStep].component}
          </div>
        </div>

        {/* Navigation buttons - Responsive layout */}
        <div className="border-t border-gray-200 pt-4 sm:pt-6 bg-white sticky bottom-0 sm:relative z-10">
          {/* Mobile: Stack buttons vertically */}
          <div className="flex flex-col sm:hidden gap-3">
            {currentStep === steps.length - 1 ? (
              <Button 
                color="primary" 
                onClick={handleSubmit} 
                size="lg"
                className="w-full bg-primary-600 hover:bg-primary-700 font-semibold"
                isLoading={isEditMode ? externalLoading : isLoading}
                disabled={isEditMode ? externalLoading : isLoading}
              >
                {(isEditMode ? externalLoading : isLoading) ? t('property.submission.buttons.submitting') : (isEditMode ? t('property.submission.buttons.updateProperty') : t('property.submission.buttons.submitProperty'))}
              </Button>
            ) : (
              <Button 
                color="primary" 
                onClick={handleNext} 
                size="lg"
                className="w-full bg-primary-600 hover:bg-primary-700 font-semibold"
                disabled={isEditMode ? externalLoading : isLoading}
              >
                {t('property.submission.buttons.continue')}
              </Button>
            )}
            
            {currentStep > 0 && (
              <Button
                variant="bordered"
                onClick={handlePrevious}
                size="lg"
                className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                {t('common.buttons.back')}
              </Button>
            )}
          </div>

          {/* Desktop: Horizontal layout */}
          <div className="hidden sm:flex justify-between items-center">
            <Button
              variant="bordered"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              size="lg"
              className="min-w-[120px] border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              {t('common.buttons.back')}
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button 
                color="primary" 
                onClick={handleSubmit} 
                size="lg"
                className="min-w-[160px] bg-primary-600 hover:bg-primary-700 font-semibold shadow-lg hover:shadow-xl transition-all"
                isLoading={isEditMode ? externalLoading : isLoading}
                disabled={isEditMode ? externalLoading : isLoading}
              >
                {(isEditMode ? externalLoading : isLoading) ? t('property.submission.buttons.submitting') : (isEditMode ? t('property.submission.buttons.updateProperty') : t('property.submission.buttons.submitProperty'))}
              </Button>
            ) : (
              <Button 
                color="primary" 
                onClick={handleNext} 
                size="lg"
                className="min-w-[120px] bg-primary-600 hover:bg-primary-700 font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={isEditMode ? externalLoading : isLoading}
              >
                {t('property.submission.buttons.nextStep')}
              </Button>
            )}
          </div>

          {/* Step indicator for mobile */}
          <div className="flex sm:hidden justify-center mt-4 space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index <= currentStep ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySubmissionForm; 