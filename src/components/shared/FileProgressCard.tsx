import React from 'react';
import { Card, Chip, Progress } from '@heroui/react';
import { UploadProgress } from '../../utils/fileUpload';
import { useTranslation } from '../../lib/stores/translationStore';

interface FileProgressCardProps {
  file: File | string;
  progress?: UploadProgress;
  onRemove?: () => void;
  type: 'image' | 'video';
}

const FileProgressCard: React.FC<FileProgressCardProps> = ({ 
  file, 
  progress, 
  onRemove, 
  type 
}) => {
  const { t } = useTranslation(['common', 'modals', 'property', 'upload']);
  const fileName = typeof file === 'string' ? file.split('/').pop() || t('common.upload.unknown') : file.name;
  const fileUrl = typeof file === 'string' ? file : URL.createObjectURL(file);
  
  const isUploading = progress?.status === 'uploading';
  const isCompleted = progress?.status === 'completed';
  const hasError = progress?.status === 'error';
  const progressValue = progress?.progress || 0;

  // Debug logging to track progress
  React.useEffect(() => {
    if (progress) {
      console.log(`📊 FileProgressCard [${fileName}]:`, {
        status: progress.status,
        progress: progress.progress,
        isUploading,
        isCompleted,
        hasError,
        progressValue
      });
    }
  }, [progress, fileName, isUploading, isCompleted, hasError, progressValue]);

  return (
    <Card className="group relative size-32 overflow-hidden border-2 border-gray-200 transition-all duration-200 hover:border-gray-300">
      {/* Media Preview */}
      <div className="relative aspect-square size-full">
        {type === 'image' ? (
          <img
            src={fileUrl}
            alt={fileName}
            className="size-full object-cover"
          />
        ) : (
          <video
            src={fileUrl}
            className="size-full object-cover"
            muted
            preload="metadata"
          />
        )}
        
        {/* PROMINENT UPLOAD PROGRESS OVERLAY - Always visible during upload */}
        {progress && !isCompleted && !hasError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black bg-opacity-75">
            <div className="text-center text-white">
              {/* Large Spinning Loader */}
              <div className="mb-3 size-16 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
              
              {/* Large Progress Percentage */}
              <div className="mb-2 text-2xl font-bold">{Math.round(progressValue)}%</div>
              
              {/* Progress Text */}
              <div className="text-sm opacity-90">{t('common.messages.uploading', 'Uploading...')}</div>
              
              {/* Progress Bar */}
              <div className="mt-3 w-20">
                <Progress 
                  value={progressValue} 
                  color="primary"
                  size="sm"
                  classNames={{
                    track: "bg-white bg-opacity-30",
                    indicator: "bg-white"
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* COMPLETED STATE OVERLAY */}
        {isCompleted && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-green-500 bg-opacity-20">
            <div className="rounded-full bg-green-500 p-3 shadow-lg">
              <svg className="size-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}

        {/* ERROR STATE OVERLAY */}
        {hasError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-red-500 bg-opacity-20">
            <div className="rounded-full bg-red-500 p-3 shadow-lg">
              <svg className="size-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}

        {/* Progress Status Badge - Always visible when there's progress */}
        {progress && (
          <div className={`absolute left-2 top-2 z-30 rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg ${
            isCompleted ? 'bg-green-500' : 
            hasError ? 'bg-red-500' : 
            'bg-blue-500'
          }`}>
            {isCompleted ? t('common.upload.uploaded', '✓ UPLOADED') : 
             hasError ? t('common.upload.failed', '✗ FAILED') : 
             `${Math.round(progressValue)}%`}
          </div>
        )}

        {/* File Type Badge */}
        <div className="absolute right-2 top-2 z-30">
          <Chip 
            size="sm" 
            variant="flat" 
            className="bg-black bg-opacity-60 text-xs font-medium text-white"
          >
            {type.toUpperCase()}
          </Chip>
        </div>

        {/* Remove Button - Only show when not uploading */}
        {!isUploading && onRemove && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-0 transition-all duration-200 group-hover:bg-opacity-40">
            <button
              onClick={onRemove}
              className="rounded-full bg-red-600 p-3 text-white opacity-0 shadow-lg transition-opacity duration-200 hover:bg-red-700 group-hover:opacity-100"
              disabled={isUploading}
            >
              <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* File Name - At the bottom */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent p-2">
          <div className="truncate text-xs font-medium text-white" title={fileName}>
            {fileName}
          </div>
        </div>

        {/* Error Message - Prominent display */}
        {hasError && progress?.error && (
          <div className="absolute inset-x-0 bottom-0 z-30 bg-red-600 p-2 text-center text-xs font-medium text-white">
            {t('common.upload.uploadFailedWithReason', { reason: progress.error, defaultValue: 'Upload Failed: {{reason}}' })}
          </div>
        )}
      </div>
    </Card>
  );
};

export default FileProgressCard; 