import React, { useCallback, useState } from 'react';
import { Button, Card, Chip } from '@heroui/react';
import { useTranslation } from '../../../../lib/stores/translationStore';
import type { PropertySubmissionData } from '../../../../interfaces';
import { useAdminSettingsStore } from '../../../../lib/stores/adminSettingsStore';
import { useProperty } from '../../../../hooks/useProperty';
import FileProgressCard from '../../../shared/FileProgressCard';
import { Video, X } from 'lucide-react';

interface MediaUploadStepProps {
  formData: PropertySubmissionData;
  setFormData: React.Dispatch<React.SetStateAction<PropertySubmissionData>>;
}

const MIN_IMAGES = 4;

const MediaUploadStep: React.FC<MediaUploadStepProps> = ({ formData, setFormData }) => {
  const { t } = useTranslation(['property', 'common']);
  // Track if video was intentionally removed to prevent old video from reappearing
  const [videoRemovedByUser, setVideoRemovedByUser] = useState(false);
  
  const { settings } = useAdminSettingsStore();
  const { uploadProgress } = useProperty();
  
  // Debug logging for upload progress
  React.useEffect(() => {
    if (uploadProgress.length > 0) {
      console.log('📊 MediaUploadStep - Upload Progress Updated:', uploadProgress);
    }
  }, [uploadProgress]);
  
  // Get settings with fallbacks
  const MAX_FILE_SIZE = (settings?.platform?.maxFileSize || 100) * 1024 * 1024; // Convert MB to bytes
  const allowedImageFormats = settings?.platform?.allowedImageFormats || ['jpg', 'jpeg', 'png', 'webp'];
  const allowedVideoFormats = settings?.platform?.allowedVideoFormats || ['mp4', 'webm', 'mov', 'avi'];
  
  console.log('📋 MediaUploadStep - Admin settings loaded:', {
    maxFileSize: settings?.platform?.maxFileSize,
    allowedImageFormats,
    allowedVideoFormats,
    hasSettings: !!settings,
    videoRemovedByUser
  });
  
  // Convert format arrays to MIME types
  const ACCEPTED_IMAGE_TYPES = allowedImageFormats.map(format => {
    switch(format.toLowerCase()) {
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'webp': return 'image/webp';
      default: return `image/${format}`;
    }
  });
  
  const ACCEPTED_VIDEO_TYPES = allowedVideoFormats.map(format => {
    switch(format.toLowerCase()) {
      case 'mp4': return 'video/mp4';
      case 'webm': return 'video/webm';
      case 'mov': return 'video/quicktime';
      case 'avi': return 'video/x-msvideo';
      default: return `video/${format}`;
    }
  });

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const validFiles = files.filter(
        (file) =>
          ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE
      );

      if (validFiles.length) {
        setFormData((prev: PropertySubmissionData) => ({
          ...prev,
          images: [...prev.images, ...validFiles],
        }));
      }
    },
    [setFormData, ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE]
  );

  const handleVideoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (
        file &&
        ACCEPTED_VIDEO_TYPES.includes(file.type) &&
        file.size <= MAX_FILE_SIZE
      ) {
        console.log('🎥 New video file selected:', file.name);
        setFormData((prev: PropertySubmissionData) => ({
          ...prev,
          videos: [file], // Store as array to match PropertySubmissionData interface
        }));
        setVideoRemovedByUser(false); // Reset removal flag when new video is added
      }
    },
    [setFormData, ACCEPTED_VIDEO_TYPES, MAX_FILE_SIZE]
  );

  const removeImage = useCallback(
    (index: number) => {
      setFormData((prev: PropertySubmissionData) => ({
        ...prev,
        images: prev.images.filter((_: File | string, i: number) => i !== index),
      }));
    },
    [setFormData]
  );

  const removeVideo = useCallback(() => {
    console.log('🗑️ User intentionally removed video');
    setVideoRemovedByUser(true); // Mark that user intentionally removed video
    setFormData((prev: PropertySubmissionData) => ({
      ...prev,
      videos: [], // Clear the videos array completely
    }));
  }, [setFormData]);

  // Check if we should show video upload card or current video
  const shouldShowVideoUploadCard = () => {
    const hasVideo = (formData.videos?.length ?? 0) > 0;
    return !hasVideo || videoRemovedByUser;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-2xl font-semibold">{t('property.mediaUpload.title')}</h2>
        <p className="mb-6 text-gray-600">
          {t('property.mediaUpload.description', { minImages: MIN_IMAGES, maxSize: (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0) })}
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-4 block text-sm font-medium">{t('property.mediaUpload.propertyImages')}</label>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {formData.images.map((image: File | string, index: number) => {
              const fileName = typeof image === 'string' ? image.split('/').pop() || 'Unknown' : image.name;
              const progress = uploadProgress.find(p => p.fileName === fileName);
              
              // Debug logging for each image
              console.log(`🖼️ Image ${index} [${fileName}]:`, {
                hasProgress: !!progress,
                progressStatus: progress?.status,
                progressValue: progress?.progress
              });
              
              return (
                <FileProgressCard
                  key={index}
                  file={image}
                  progress={progress}
                  onRemove={() => removeImage(index)}
                  type="image"
                />
              );
            })}
          </div>
          
          <Card className="border-2 border-dashed border-gray-300 transition-colors duration-200 hover:border-primary-400">
            <label className="group flex w-full cursor-pointer flex-col items-center justify-center px-6 py-8">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-secondary-100 transition-colors duration-200 group-hover:bg-secondary-200">
                <svg
                  className="size-8 text-secondary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">{t('property.mediaUpload.uploadImages')}</h3>
              <p className="text-center text-sm text-gray-500">
                {t('property.mediaUpload.uploadImagesDescription')}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                {t('property.mediaUpload.imageFormats', { formats: allowedImageFormats.map(f => f.toUpperCase()).join(', '), maxSize: (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0) })}
              </p>
              <input
                type="file"
                className="hidden"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                multiple
                onChange={handleImageUpload}
              />
            </label>
          </Card>
          
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {t('property.mediaUpload.imagesUploaded', { count: formData.images.length, min: MIN_IMAGES })}
            </p>
            {formData.images.length >= MIN_IMAGES && (
              <Chip 
                color="success" 
                variant="flat" 
                size="sm"
                startContent={
                  <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                }
              >
                {t('property.mediaUpload.minimumRequirementMet')}
              </Chip>
            )}
          </div>
        </div>

        <div>
          <label className="mb-4 block text-sm font-medium">{t('property.mediaUpload.propertyVideo')}</label>
          {shouldShowVideoUploadCard() ? (
            <Card className="border-2 border-dashed border-gray-300 transition-colors duration-200 hover:border-secondary-400">
              <label className="group flex w-full cursor-pointer flex-col items-center justify-center px-6 py-8">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-secondary-100 transition-colors duration-200 group-hover:bg-secondary-200">
                  <svg
                    className="size-8 text-secondary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">Upload Video</h3>
                <p className="text-center text-sm text-gray-500">
                  Click to browse or drag and drop your video here
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  {allowedVideoFormats.map(f => f.toUpperCase()).join(', ')} up to {MAX_FILE_SIZE / (1024 * 1024)}MB
                </p>
                <input
                  type="file"
                  className="hidden"
                  accept={ACCEPTED_VIDEO_TYPES.join(',')}
                  onChange={handleVideoUpload}
                />
              </label>
            </Card>
          ) : (
            <div className="mb-4 flex justify-start">
              {formData.videos && formData.videos.length > 0 && (() => {
                const video = formData.videos[0];
                const fileName = typeof video === 'string' ? video.split('/').pop() || 'Unknown' : video.name;
                const progress = uploadProgress.find(p => p.fileName === fileName);
                
                return (
                  <div key={fileName} className="relative">
                    <Card className="bg-gray-50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Video className="size-5 text-blue-500" />
                          <span className="max-w-[150px] truncate text-sm text-gray-700">
                            {fileName}
                          </span>
                        </div>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onClick={removeVideo}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                      {progress && (
                        <div className="mt-2">
                          <div className="mb-1 flex justify-between text-xs text-gray-600">
                            <span>{progress.status}</span>
                            <span>{progress.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-gray-200">
                            <div 
                              className="h-1.5 rounded-full bg-blue-500 transition-all duration-300" 
                              style={{ width: `${progress.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaUploadStep; 