import React from 'react';
import { Progress, Card } from '@heroui/react';
import { UploadProgress } from '../../utils/fileUpload';
import { useTranslation } from '../../lib/stores/translationStore';

interface UploadProgressIndicatorProps {
  uploads: UploadProgress[];
  className?: string;
}

const UploadProgressIndicator: React.FC<UploadProgressIndicatorProps> = ({ 
  uploads, 
  className = '' 
}) => {
  const { t } = useTranslation(['common']);
  if (uploads.length === 0) return null;

  const completedUploads = uploads.filter(upload => upload.status === 'completed').length;
  const totalUploads = uploads.length;
  const overallProgress = totalUploads > 0 ? (completedUploads / totalUploads) * 100 : 0;

  return (
    <Card className={`p-4 bg-blue-50 border border-blue-200 ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-blue-900">
            {t('common.upload.header', { completed: completedUploads, total: totalUploads, defaultValue: 'Uploading Files ({{completed}}/{{total}})' })}
          </h4>
          <span className="text-xs text-blue-700">
            {Math.round(overallProgress)}%
          </span>
        </div>
        
        {/* Overall Progress */}
        <Progress
          value={overallProgress}
          color="primary"
          size="sm"
          className="w-full"
          aria-label="Overall upload progress"
        />

        {/* Individual File Progress */}
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {uploads.map((upload, index) => (
            <div key={`${upload.fileName}-${index}`} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-700 truncate max-w-[200px]" title={upload.fileName}>
                  {upload.fileName}
                </span>
                <div className="flex items-center space-x-2">
                  {upload.status === 'completed' && (
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {upload.status === 'error' && (
                    <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                  {upload.status === 'uploading' && (
                    <div className="w-3 h-3">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  <span className={`text-xs ${
                    upload.status === 'completed' ? 'text-green-600' :
                    upload.status === 'error' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {upload.status === 'completed' ? '100%' : 
                     upload.status === 'error' ? t('common.upload.error', 'Error') :
                     `${Math.round(upload.progress)}%`}
                  </span>
                </div>
              </div>
              
              {upload.status !== 'completed' && (
                <Progress
                  value={upload.progress}
                  color={upload.status === 'error' ? 'danger' : 'primary'}
                  size="sm"
                  className="w-full"
                  aria-label={t('common.upload.progressAria', { fileName: upload.fileName, defaultValue: 'Upload progress for {{fileName}}' })}
                />
              )}
              
              {upload.status === 'error' && upload.error && (
                <p className="text-xs text-red-600 mt-1">
                  {t('common.upload.errorWithReason', { reason: upload.error, defaultValue: 'Error: {{reason}}' })}
                </p>
              )}
            </div>
          ))}
        </div>
        
        {/* Upload Status Summary */}
        <div className="text-xs text-blue-700 pt-2 border-t border-blue-200">
          {completedUploads === totalUploads ? (
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {t('common.upload.allUploaded', 'All files uploaded successfully')}
            </span>
          ) : uploads.some(u => u.status === 'error') ? (
            <span className="flex items-center text-red-600">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {t('common.upload.someFailed', 'Some uploads failed')}
            </span>
          ) : (
            <span>{t('common.upload.uploadingFiles', 'Uploading files...')}</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default UploadProgressIndicator; 