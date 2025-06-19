import React, { useCallback } from 'react';
import { Button, Card } from '@heroui/react';
import type { PropertySubmissionData } from '../PropertySubmissionForm';

interface MediaUploadStepProps {
  formData: PropertySubmissionData;
  setFormData: React.Dispatch<React.SetStateAction<PropertySubmissionData>>;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MIN_IMAGES = 4;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const MediaUploadStep: React.FC<MediaUploadStepProps> = ({ formData, setFormData }) => {
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const validFiles = files.filter(
        (file) =>
          ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE
      );

      if (validFiles.length) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...validFiles],
        }));
      }
    },
    [setFormData]
  );

  const handleVideoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (
        file &&
        ACCEPTED_VIDEO_TYPES.includes(file.type) &&
        file.size <= MAX_FILE_SIZE
      ) {
        setFormData((prev) => ({
          ...prev,
          video: file,
        }));
      }
    },
    [setFormData]
  );

  const removeImage = useCallback(
    (index: number) => {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    },
    [setFormData]
  );

  const removeVideo = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      video: null,
    }));
  }, [setFormData]);

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {formData.images.map((image, index) => (
              <Card
                key={index}
                className="relative aspect-square overflow-hidden group"
              >
                <img
                  src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <Button
                    color="danger"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={() => removeImage(index)}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
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
                PNG, JPG, WEBP up to {MAX_FILE_SIZE / (1024 * 1024)}MB
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
              <div className="flex items-center text-green-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Minimum requirement met</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-4">Property Video</label>
          {formData.video ? (
            <Card className="relative aspect-video overflow-hidden group">
              <video
                src={typeof formData.video === 'string' ? formData.video : URL.createObjectURL(formData.video)}
                controls
                className="w-full h-full object-contain bg-black"
              />
              <div className="absolute top-4 right-4">
                <Button
                  color="danger"
                  size="sm"
                  onClick={removeVideo}
                >
                  Remove
                </Button>
              </div>
            </Card>
          ) : (
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
                  MP4, WEBM, MOV up to {MAX_FILE_SIZE / (1024 * 1024)}MB
                </p>
                <input
                  type="file"
                  className="hidden"
                  accept={ACCEPTED_VIDEO_TYPES.join(',')}
                  onChange={handleVideoUpload}
                />
              </label>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaUploadStep; 