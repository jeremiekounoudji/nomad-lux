import React from 'react'
import { Card, CardBody, Button, Progress } from '@heroui/react'
import { useAuthStore } from '../../lib/stores/authStore'
import { UploadProgress } from '../../utils/fileUpload'

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
  const authStore = useAuthStore()

  if (!isLoading && uploadProgress.length === 0 && !error) {
    return null;
  }

  const completedUploads = uploadProgress.filter(upload => upload.status === 'completed').length;
  const failedUploads = uploadProgress.filter(upload => upload.status === 'error').length;
  const totalUploads = uploadProgress.length;
  const overallProgress = totalUploads > 0 ? (completedUploads / totalUploads) * 100 : 0;

  return (
    <Card className={`bg-yellow-50 border-yellow-200 ${className}`}>
      <CardBody className="p-4">
        <h3 className="text-sm font-semibold text-yellow-800 mb-3">🔧 Debug Info</h3>
        
        {/* Upload Progress Section */}
        {totalUploads > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium">Upload Progress</span>
              <span className="text-xs text-gray-600">
                {completedUploads}/{totalUploads} completed
              </span>
            </div>
            
            <Progress 
              value={overallProgress}
              className="mb-2"
              color={failedUploads > 0 ? "danger" : "success"}
            />
            
            <div className="space-y-1">
              {uploadProgress.map((upload, index) => (
                <div key={index} className="text-xs flex justify-between items-center">
                  <span className="truncate flex-1 mr-2">{upload.fileName}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-1 rounded text-xs ${
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
                    <div className="text-xs text-red-600 mt-1">{upload.error}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded">
            <div className="text-xs font-medium text-red-800">❌ Error</div>
            <div className="text-xs text-red-600 mt-1">{error}</div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
            <div className="text-xs font-medium text-blue-800">⏳ Loading...</div>
          </div>
        )}

        {/* Auth Debug Info */}
        <div className="text-xs space-y-1">
          <div>
            <strong>User Auth Status:</strong>
            <div className="ml-2">
              • isLoading: {authStore.isLoading ? '⏳ true' : '✅ false'}
              • isAuthenticated: {authStore.isAuthenticated ? '✅ true' : '❌ false'}
              • isAdmin: {authStore.isAdmin ? '✅ true' : '❌ false'}
              • user: {authStore.user ? `✅ ${authStore.user.email}` : '❌ null'}
              • userId: {authStore.user?.id ? `✅ ${authStore.user.id}` : '❌ null'}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default LoadingDebug 