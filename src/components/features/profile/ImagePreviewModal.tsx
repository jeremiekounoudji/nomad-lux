import React, { useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Progress } from '@heroui/react'
import { Camera, X, Check, RotateCw } from 'lucide-react'
import { useTranslation } from '../../../lib/stores/translationStore'
import { ProfileImageData } from '../../../interfaces/Profile'
import toast from 'react-hot-toast'

interface ImagePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  imageData: ProfileImageData | null
  onConfirm: (imageData: ProfileImageData) => Promise<void>
  isUploading: boolean
  uploadProgress: number
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  imageData,
  onConfirm,
  isUploading,
  uploadProgress
}) => {
  const { t } = useTranslation(['profile', 'common'])
  const [rotation, setRotation] = useState(0)

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleConfirm = async () => {
    if (!imageData) return
    
    try {
      await onConfirm(imageData)
      onClose()
      setRotation(0)
    } catch (error) {
      console.error('❌ Error confirming image upload:', error)
    }
  }

  const handleClose = () => {
    if (!isUploading) {
      onClose()
      setRotation(0)
    }
  }

  if (!imageData) return null

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="2xl"
      isDismissable={!isUploading}
      hideCloseButton={isUploading}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary-600" />
            <span>{t('profile:image.preview')}</span>
          </div>
          <p className="text-sm text-gray-600 font-normal">
            {t('profile:image.cropDescription')}
          </p>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="flex justify-center">
              <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100">
                <img
                  src={imageData.previewUrl}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: 'transform 0.3s ease'
                  }}
                />
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('profile:image.uploading')}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress 
                  value={uploadProgress} 
                  className="w-full"
                  color="primary"
                />
              </div>
            )}

            {/* Image Info */}
            <div className="text-center text-sm text-gray-600">
              <p>{imageData.file.name}</p>
              <p>{(imageData.file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button 
            variant="flat" 
            onPress={handleClose}
            disabled={isUploading}
            startContent={<X className="w-4 h-4" />}
          >
            {t('common:buttons.cancel')}
          </Button>
          
          <Button 
            variant="flat"
            onPress={handleRotate}
            disabled={isUploading}
            startContent={<RotateCw className="w-4 h-4" />}
          >
            {t('profile:image.actions.rotate')}
          </Button>
          
          <Button 
            className="bg-main text-white hover:bg-main/90"
            onPress={handleConfirm}
            isLoading={isUploading}
            disabled={isUploading}
            startContent={<Check className="w-4 h-4" />}
          >
            {t('profile:image.actions.upload')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
