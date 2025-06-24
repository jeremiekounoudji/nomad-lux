import React, { useCallback, useState, useRef } from 'react';
import { Button, Card, Chip } from '@heroui/react';
import type { PropertySubmissionData } from '../../../../interfaces';
import { useAdminSettingsStore } from '../../../../lib/stores/adminSettingsStore';
import { useProperty } from '../../../../hooks/useProperty';
import FileProgressCard from '../../../shared/FileProgressCard';
import { Upload, Image, Video, X } from 'lucide-react';

interface MediaUploadStepProps {
  formData: PropertySubmissionData;
  setFormData: React.Dispatch<React.SetStateAction<PropertySubmissionData>>;
}

const MIN_IMAGES = 4;

const MediaUploadStep: React.FC<MediaUploadStepProps> = ({ formData, setFormData }) => {
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
        <h2 className="text-2xl font-semibold mb-4">Media Upload</h2>
        <p className="text-gray-600 mb-6">
          Upload at least {MIN_IMAGES} images and 1 video of your property. Each file should not exceed{' '}
          {MAX_FILE_SIZE / (1024 * 1024)}MB.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-4">Property Images</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
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
          
          <Card className="border-2 border-dashed border-gray-300 hover:border-primary-400 transition-colors duration-200">
            <label className="w-full flex flex-col items-center justify-center px-6 py-8 cursor-pointer group">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-secondary-200 transition-colors duration-200">
                <svg
                  className="w-8 h-8 text-secondary-600"
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Images</h3>
              <p className="text-sm text-gray-500 text-center">
                Click to browse or drag and drop your images here
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {allowedImageFormats.map(f => f.toUpperCase()).join(', ')} up to {MAX_FILE_SIZE / (1024 * 1024)}MB
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
          
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-gray-500">
              {formData.images.length} of {MIN_IMAGES} images uploaded
            </p>
            {formData.images.length >= MIN_IMAGES && (
              <Chip 
                color="success" 
                variant="flat" 
                size="sm"
                startContent={
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                }
              >
                Minimum requirement met
              </Chip>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-4">Property Video</label>
          {shouldShowVideoUploadCard() ? (
            <Card className="border-2 border-dashed border-gray-300 hover:border-secondary-400 transition-colors duration-200">
              <label className="w-full flex flex-col items-center justify-center px-6 py-8 cursor-pointer group">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-secondary-200 transition-colors duration-200">
                  <svg
                    className="w-8 h-8 text-secondary-600"
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Video</h3>
                <p className="text-sm text-gray-500 text-center">
                  Click to browse or drag and drop your video here
                </p>
                <p className="text-xs text-gray-400 mt-2">
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
            <div className="flex justify-start mb-4">
              {formData.videos && formData.videos.length > 0 && (() => {
                const video = formData.videos[0];
                const fileName = typeof video === 'string' ? video.split('/').pop() || 'Unknown' : video.name;
                const progress = uploadProgress.find(p => p.fileName === fileName);
                
                return (
                  <div key={fileName} className="relative">
                    <Card className="p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Video className="w-5 h-5 text-blue-500" />
                          <span className="text-sm text-gray-700 truncate max-w-[150px]">
                            {fileName}
                          </span>
                        </div>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onClick={removeVideo}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      {progress && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>{progress.status}</span>
                            <span>{progress.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
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