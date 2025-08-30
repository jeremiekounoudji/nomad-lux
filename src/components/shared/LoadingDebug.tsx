import React from 'react'
import { Card, CardBody, Progress } from '@heroui/react'
import { useAuthStore } from '../../lib/stores/authStore'
import { UploadProgress } from '../../utils/fileUpload'
import { useTranslation } from '../../lib/stores/translationStore'

interface LoadingDebugProps {
  isLoading?: boolean;
  uploadProgress?: UploadProgress[];
  error?: string | null;
  className?: string;
}

const LoadingDebug: React.FC<LoadingDebugProps> = ({ 
  isLoading = false, 
  uploadProgress = [], 
  error = null,
  className = '' 
}) => {
  const { t } = useTranslation(['common'])
  const authStore = useAuthStore()

  if (!isLoading && uploadProgress.length === 0 && !error) {
    return null;
  }

  const completedUploads = uploadProgress.filter(upload => upload.status === 'completed').length;
  const failedUploads = uploadProgress.filter(upload => upload.status === 'error').length;
  const totalUploads = uploadProgress.length;
  const overallProgress = totalUploads > 0 ? (completedUploads / totalUploads) * 100 : 0;

  return (
    <Card className={`border-yellow-200 bg-yellow-50 ${className}`}>
      <CardBody className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-yellow-800">🔧 {t('common.debug.info', 'Debug Info')}</h3>
        
        {/* Upload Progress Section */}
        {totalUploads > 0 && (
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium">{t('common.upload.progress', 'Upload Progress')}</span>
              <span className="text-xs text-gray-600">
                {t('common.upload.completedOfTotal', { completed: completedUploads, total: totalUploads, defaultValue: '{{completed}}/{{total}} completed' })}
              </span>
            </div>
            
            <Progress 
              value={overallProgress}
              className="mb-2"
              color={failedUploads > 0 ? "danger" : "success"}
            />
            
            <div className="space-y-1">
              {uploadProgress.map((upload, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="mr-2 flex-1 truncate">{upload.fileName}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`rounded px-1 text-xs ${
                      upload.status === 'completed' ? 'bg-green-100 text-green-800' :
                      upload.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {upload.status === 'completed' ? '✅' :
                       upload.status === 'error' ? '❌' : '⏳'}
                    </span>
                    <span className="w-10 text-right">{upload.progress}%</span>
                  </div>
                  {upload.error && (
                    <div className="mt-1 text-xs text-red-600">{upload.error}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Section */}
        {error && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 p-2">
              <div className="text-xs font-medium text-red-800">❌ {t('common.messages.error')}</div>
              <div className="mt-1 text-xs text-red-600">{error}</div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
            <div className="mb-4 rounded border border-blue-200 bg-blue-50 p-2">
              <div className="text-xs font-medium text-blue-800">⏳ {t('common.messages.loading')}</div>
          </div>
        )}

        {/* Auth Debug Info */}
        <div className="space-y-1 text-xs">
          <div>
            <strong>{t('common.debug.userAuthStatus', 'User Auth Status')}:</strong>
            <div className="ml-2">
              • {t('common.debug.isLoading', 'isLoading')}: {authStore.isLoading ? '⏳ true' : '✅ false'}
              • {t('common.debug.isAuthenticated', 'isAuthenticated')}: {authStore.isAuthenticated ? '✅ true' : '❌ false'}
              • {t('common.debug.isAdmin', 'isAdmin')}: {authStore.isAdmin ? '✅ true' : '❌ false'}
              • {t('common.debug.user', 'user')}: {authStore.user ? `✅ ${authStore.user.email}` : '❌ null'}
              • {t('common.debug.userId', 'userId')}: {authStore.user?.id ? `✅ ${authStore.user.id}` : '❌ null'}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default LoadingDebug 