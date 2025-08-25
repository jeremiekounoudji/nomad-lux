import React, { useState, useRef, useCallback } from 'react'
import { Card, CardBody, Button, Progress, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react'
import { Upload, Camera, X, Crop, RotateCw, Download, Trash2 } from 'lucide-react'
import { useTranslation } from '../../../lib/stores/translationStore'
import { ProfileImageData } from '../../../interfaces/Profile'

interface ProfileImageUploadProps {
  currentImageUrl?: string
  onImageUpload: (imageData: ProfileImageData) => Promise<void>
  onImageRemove: () => Promise<void>
  isUploading?: boolean
  maxFileSize?: number // in MB
  acceptedFormats?: string[]
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImageUrl,
  onImageUpload,
  onImageRemove,
  isUploading = false,
  maxFileSize = 5, // 5MB default
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showCropModal, setShowCropModal] = useState(false)
  const [cropData, setCropData] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { t } = useTranslation(['profile', 'common'])

  // File validation
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return t('profile.image.errors.fileTooLarge', { maxSize: maxFileSize })
    }

    // Check file format
    if (!acceptedFormats.includes(file.type)) {
      return t('profile.image.errors.invalidFormat', { formats: acceptedFormats.join(', ') })
    }

    return null
  }

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setSelectedFile(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [maxFileSize, acceptedFormats, t])

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile || !previewUrl) return

    try {
      setUploadProgress(0)
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const imageData: ProfileImageData = {
        file: selectedFile,
        previewUrl,
        croppedData: cropData || undefined
      }

      await onImageUpload(imageData)
      
      setUploadProgress(100)
      setTimeout(() => {
        setUploadProgress(0)
        setSelectedFile(null)
        setPreviewUrl(null)
        setCropData(null)
        setError(null)
      }, 1000)

    } catch (err: any) {
      setError(err.message || t('profile.image.errors.uploadFailed'))
      setUploadProgress(0)
    }
  }

  // Handle image removal
  const handleRemove = async () => {
    try {
      await onImageRemove()
      setSelectedFile(null)
      setPreviewUrl(null)
      setCropData(null)
      setError(null)
    } catch (err: any) {
      setError(err.message || t('profile.image.errors.removeFailed'))
    }
  }

  // Handle crop
  const handleCrop = () => {
    if (!canvasRef.current || !previewUrl) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      // Set canvas size to desired crop dimensions
      const cropSize = Math.min(img.width, img.height)
      canvas.width = cropSize
      canvas.height = cropSize

      // Calculate crop position (center crop)
      const offsetX = (img.width - cropSize) / 2
      const offsetY = (img.height - cropSize) / 2

      // Draw cropped image
      ctx.drawImage(img, offsetX, offsetY, cropSize, cropSize, 0, 0, cropSize, cropSize)

      // Get cropped data URL
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setCropData(croppedDataUrl)
      setShowCropModal(false)
    }
    img.src = previewUrl
  }

  // Handle rotate
  const handleRotate = () => {
    if (!canvasRef.current || !previewUrl) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      // Swap width and height for rotation
      canvas.width = img.height
      canvas.height = img.width

      // Rotate 90 degrees clockwise
      ctx.translate(canvas.width, 0)
      ctx.rotate(Math.PI / 2)
      ctx.drawImage(img, 0, 0)

      // Update preview
      const rotatedDataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setPreviewUrl(rotatedDataUrl)
    }
    img.src = previewUrl
  }

  // Handle download
  const handleDownload = () => {
    if (!previewUrl) return

    const link = document.createElement('a')
    link.href = previewUrl
    link.download = selectedFile?.name || 'profile-image.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <Card className="w-full transition-all duration-200 hover:shadow-md">
        <CardBody className="p-4 sm:p-6">
          <div className="text-center" role="region" aria-label={t('profile.image.uploadSection')}>
            {/* Current Image Display */}
            {currentImageUrl && !selectedFile && (
              <div className="mb-4 sm:mb-6">
                <div className="relative inline-block">
                  <img
                    src={currentImageUrl}
                    alt={t('profile.image.currentProfileImage')}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mx-auto border-4 border-gray-200"
                  />
                  <Button
                    isIconOnly
                    size="sm"
                    color="danger"
                    variant="solid"
                    className="absolute -top-2 -right-2 min-h-[44px] min-w-[44px]"
                    onPress={handleRemove}
                    disabled={isUploading}
                    aria-label={t('profile.image.actions.removeImage')}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  {t('profile.image.currentImage')}
                </p>
              </div>
            )}

            {/* Upload Area */}
            {!currentImageUrl || selectedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-4 sm:p-8 transition-colors ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                aria-label={t('profile.image.dragDropArea')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
              >
                {/* Preview Image */}
                {previewUrl ? (
                  <div className="space-y-3 sm:space-y-4">
                    <img
                      src={previewUrl}
                      alt={t('profile.image.previewImage')}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mx-auto border-4 border-gray-200"
                    />
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<Crop className="w-4 h-4" aria-hidden="true" />}
                        onPress={() => setShowCropModal(true)}
                        className="min-h-[44px] touch-manipulation"
                        aria-label={t('profile.image.actions.cropImage')}
                      >
                        {t('profile.image.actions.crop')}
                      </Button>
                      <Button
                        size="sm"
                        color="secondary"
                        variant="flat"
                        startContent={<RotateCw className="w-4 h-4" aria-hidden="true" />}
                        onPress={handleRotate}
                        className="min-h-[44px] touch-manipulation"
                        aria-label={t('profile.image.actions.rotateImage')}
                      >
                        {t('profile.image.actions.rotate')}
                      </Button>
                      <Button
                        size="sm"
                        color="default"
                        variant="flat"
                        startContent={<Download className="w-4 h-4" aria-hidden="true" />}
                        onPress={handleDownload}
                        className="min-h-[44px] touch-manipulation"
                        aria-label={t('profile.image.actions.downloadImage')}
                      >
                        {t('profile.image.actions.download')}
                      </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center gap-2">
                      <Button
                        color="success"
                        variant="flat"
                        onPress={handleUpload}
                        isLoading={isUploading}
                        disabled={isUploading}
                        className="min-h-[44px] touch-manipulation"
                        aria-label={t('profile.image.actions.uploadImage')}
                      >
                        {t('profile.image.actions.upload')}
                      </Button>
                      <Button
                        color="default"
                        variant="flat"
                        onPress={() => {
                          setSelectedFile(null)
                          setPreviewUrl(null)
                          setCropData(null)
                          setError(null)
                        }}
                        disabled={isUploading}
                        className="min-h-[44px] touch-manipulation"
                        aria-label={t('profile.image.actions.cancelUpload')}
                      >
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-medium text-gray-900">
                        {t('profile.image.uploadTitle')}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {t('profile.image.uploadDescription')}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                      <Button
                        color="primary"
                        variant="flat"
                        startContent={<Upload className="w-4 h-4" aria-hidden="true" />}
                        onPress={() => fileInputRef.current?.click()}
                        className="min-h-[44px] touch-manipulation"
                        aria-label={t('profile.image.actions.selectFile')}
                      >
                        {t('profile.image.actions.selectFile')}
                      </Button>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {t('profile.image.orDragDrop')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500" role="note" aria-label={t('profile.image.fileRequirements')}>
                      <p>{t('profile.image.supportedFormats', { formats: acceptedFormats.join(', ') })}</p>
                      <p>{t('profile.image.maxFileSize', { size: maxFileSize })}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8">
                <div className="space-y-3 sm:space-y-4">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-medium text-gray-900">
                      {t('profile.image.changeImage')}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {t('profile.image.changeDescription')}
                    </p>
                  </div>
                  <Button
                    color="primary"
                    variant="flat"
                    startContent={<Upload className="w-4 h-4" aria-hidden="true" />}
                    onPress={() => fileInputRef.current?.click()}
                    className="min-h-[44px] touch-manipulation"
                    aria-label={t('profile.image.actions.selectNewImage')}
                  >
                    {t('profile.image.actions.selectNewImage')}
                  </Button>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploadProgress > 0 && (
              <div className="mt-4" role="status" aria-live="polite" aria-label={t('profile.image.uploadProgress')}>
                <Progress
                  value={uploadProgress}
                  className="w-full"
                  color="primary"
                  showValueLabel
                  aria-label={`${t('profile.image.uploading')} ${uploadProgress}%`}
                />
                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  {t('profile.image.uploading')}... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert" aria-live="assertive">
                <p className="text-xs sm:text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats.join(',')}
              onChange={handleFileInputChange}
              className="hidden"
              aria-label={t('profile.image.fileInput')}
            />
          </div>
        </CardBody>
      </Card>

      {/* Crop Modal */}
      <Modal isOpen={showCropModal} onClose={() => setShowCropModal(false)} size="lg">
        <ModalContent>
          <ModalHeader>
            {t('profile.image.cropTitle')}
          </ModalHeader>
          <ModalBody>
            <div className="text-center">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto border border-gray-300 rounded-lg"
                style={{ maxHeight: '400px' }}
                aria-label={t('profile.image.cropCanvas')}
              />
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                {t('profile.image.cropDescription')}
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="flat"
              onPress={() => setShowCropModal(false)}
              className="min-h-[44px] touch-manipulation"
              aria-label={t('profile.image.actions.cancelCrop')}
            >
              {t('common.cancel')}
            </Button>
            <Button
              color="primary"
              variant="flat"
              onPress={handleCrop}
              className="min-h-[44px] touch-manipulation"
              aria-label={t('profile.image.actions.applyCrop')}
            >
              {t('profile.image.actions.crop')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ProfileImageUpload
