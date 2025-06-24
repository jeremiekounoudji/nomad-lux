import React, { useState, useEffect } from 'react';
import { Button, Card, Progress } from '@heroui/react';
import HostDetailsStep from './steps/HostDetailsStep';
import PropertyDetailsStep from './steps/PropertyDetailsStep';
import MediaUploadStep from './steps/MediaUploadStep';

import { HostSubmissionData, PropertySubmissionData, PropertySubmissionFormProps } from '../../../interfaces';
import { useProperty } from '../../../hooks/useProperty';
import { useAuthStore } from '../../../lib/stores/authStore';
import { useAdminSettingsStore } from '../../../lib/stores/adminSettingsStore';
import toast from 'react-hot-toast';

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

const PropertySubmissionForm: React.FC<PropertySubmissionFormProps> = ({ initialData, isEditMode, onSubmitSuccess, externalLoading }) => {
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
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

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

  const handleSubmit = async () => {
    console.log('🚀 Submit button clicked', { isEditMode })
    
    if (!user) {
      toast.error('Please sign in to submit a property');
      return;
    }
    
    // Debug current upload progress
    console.log('📊 Current upload progress:', uploadProgress)

    // Validate form data
    if (!formData.title.trim()) {
      toast.error('Please enter a property title');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a property description');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (!formData.location.city.trim() || !formData.location.country.trim()) {
      toast.error('Please enter complete location information');
      return;
    }

    if (formData.images.length < 4) {
      toast.error('Please upload at least 4 images');
      return;
    }

    if (!formData.videos || formData.videos.length === 0) {
      toast.error('Please upload a video');
      return;
    }

    if (!formData.property_type) {
      toast.error('Please select a property type');
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
          toast.error(`Video format not supported. Please upload: ${allowedVideoFormats.join(', ')}`);
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
        toast.success('Property submitted successfully! 🎉');
        // Reset form after successful submission
        setFormData(INITIAL_FORM_DATA);
        setCurrentStep(0);
      }
    } catch (error) {
      console.error('❌ Error submitting property:', error);
      
      // Provide more specific error messages
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('timeout')) {
        toast.error('Submission took too long. Please check your internet connection and try again.');
      } else if (errorMessage.includes('upload')) {
        toast.error('File upload failed. Please check your files and try again.');
      } else if (errorMessage.includes('network')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error(`Submission failed: ${errorMessage}`);
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
            <Button 
              color="primary" 
              onClick={handleSubmit} 
              className="min-w-[140px] bg-primary-600 hover:bg-primary-700"
              isLoading={isEditMode ? externalLoading : isLoading}
              disabled={isEditMode ? externalLoading : isLoading}
            >
              {(isEditMode ? externalLoading : isLoading) ? 'Submitting...' : (isEditMode ? 'Update Property' : 'Submit Property')}
            </Button>
          ) : (
            <Button 
              color="primary" 
              onClick={handleNext} 
              className="min-w-[100px] bg-primary-600 hover:bg-primary-700"
              disabled={isEditMode ? externalLoading : isLoading}
            >
              Next Step
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PropertySubmissionForm; 