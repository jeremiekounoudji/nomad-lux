import React, { useState, useRef, useCallback } from 'react'
import { Card, CardBody, Button, Progress, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Chip } from '@heroui/react'
import { Upload, Camera, X, Crop, RotateCw, Download, Trash2, AlertCircle } from 'lucide-react'
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
    if (!selectedFile) return

    try {
      setUploadProgress(0)
      setError(null)

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

      // Create image data
      const imageData: ProfileImageData = {
        file: selectedFile,
        previewUrl: previewUrl || '',
        croppedData: cropData || undefined
      }

      await onImageUpload(imageData)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Reset state
      setTimeout(() => {
        setSelectedFile(null)
        setPreviewUrl(null)
        setCropData(null)
        setUploadProgress(0)
      }, 1000)

    } catch (err: any) {
      console.error('❌ Error uploading image:', err)
      setError(err.message || t('profile.image.errors.uploadFailed'))
    }
  }

  // Handle remove
  const handleRemove = async () => {
    try {
      await onImageRemove()
      setSelectedFile(null)
      setPreviewUrl(null)
      setCropData(null)
      setError(null)
    } catch (err: any) {
      console.error('❌ Error removing image:', err)
      setError(err.message || t('profile.image.errors.removeFailed'))
    }
  }

  // Handle crop
  const handleCrop = () => {
    if (!canvasRef.current || !previewUrl) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new (window as any).Image()
    img.onload = () => {
      // Set canvas size for square crop
      const size = Math.min(img.width, img.height)
      canvas.width = size
      canvas.height = size

      // Calculate crop position (center crop)
      const offsetX = (img.width - size) / 2
      const offsetY = (img.height - size) / 2

      // Draw cropped image
      ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size)

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

    const img = new (window as any).Image()
    img.onload = () => {
      // Swap dimensions for rotation
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
    <Card className="w-full border-0 bg-white/80 shadow-lg backdrop-blur-sm" role="region" aria-label={t('profile.image.title')}>
      <CardBody className="p-6 sm:p-8">
        <div className="mb-6 flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-purple-100">
              <Camera className="size-5 text-purple-600" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
              {t('profile.image.title')}
            </h3>
          </div>
        </div>

        <div className="space-y-6">
          {/* Current Image Display */}
          {currentImageUrl && !selectedFile && (
            <div className="text-center">
              <div className="relative inline-block">
                <div className="mx-auto flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg sm:size-32">
                  <img 
                    src={currentImageUrl} 
                    alt={t('profile.image.currentImage')}
                    className="size-full rounded-full object-cover"
                    loading="lazy"
                  />
                </div>
                <Button
                  isIconOnly
                  size="sm"
                  color="danger"
                  variant="solid"
                  className="absolute -right-2 -top-2 shadow-lg"
                  onPress={handleRemove}
                  aria-label={t('profile.image.actions.remove')}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                {t('profile.image.currentImageDescription')}
              </p>
            </div>
          )}

          {/* Preview Image */}
          {previewUrl && (
            <div className="text-center">
              <div className="relative inline-block">
                <div className="mx-auto flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-blue-100 to-purple-100 shadow-lg sm:size-32">
                  <img 
                    src={cropData || previewUrl} 
                    alt={t('profile.image.preview')}
                    className="size-full rounded-full object-cover"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center space-x-2">
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  startContent={<Crop className="size-4" />}
                  onPress={() => setShowCropModal(true)}
                  className="font-semibold"
                  aria-label={t('profile.image.actions.crop')}
                >
                  {t('profile.image.actions.crop')}
                </Button>
                <Button
                  size="sm"
                  color="secondary"
                  variant="flat"
                  startContent={<RotateCw className="size-4" />}
                  onPress={handleRotate}
                  className="font-semibold"
                  aria-label={t('profile.image.actions.rotate')}
                >
                  {t('profile.image.actions.rotate')}
                </Button>
                <Button
                  size="sm"
                  color="success"
                  variant="flat"
                  startContent={<Download className="size-4" />}
                  onPress={handleDownload}
                  className="font-semibold"
                  aria-label={t('profile.image.actions.download')}
                >
                  {t('profile.image.actions.download')}
                </Button>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress > 0 && (
            <div className="space-y-2" role="status" aria-live="polite" aria-label={t('profile.image.uploadProgress')}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">
                  {t('profile.image.uploading')}
                </span>
                <span className="text-gray-500">{uploadProgress}%</span>
              </div>
              <Progress 
                value={uploadProgress} 
                color="primary" 
                className="w-full"
                aria-label={`${uploadProgress}% complete`}
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 p-3" role="alert" aria-live="assertive">
              <AlertCircle className="size-5 text-red-600" aria-hidden="true" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Upload Actions */}
          {!currentImageUrl && !selectedFile && (
            <div className="space-y-4">
              <div
                className={`rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200 ${
                  isDragOver 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
                role="button"
                tabIndex={0}
                aria-label={t('profile.image.dragDropArea')}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
              >
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-100">
                  <Upload className="size-8 text-blue-600" aria-hidden="true" />
                </div>
                <h4 className="mb-2 text-lg font-semibold text-gray-900">
                  {t('profile.image.uploadTitle')}
                </h4>
                <p className="mb-4 text-sm text-gray-600">
                  {t('profile.image.uploadDescription')}
                </p>
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<Camera className="size-4" />}
                  onPress={() => fileInputRef.current?.click()}
                  className="font-semibold"
                >
                  {t('profile.image.actions.selectFile')}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedFormats.join(',')}
                  onChange={handleFileInputChange}
                  className="hidden"
                  aria-label={t('profile.image.fileInput')}
                />
              </div>
              
              <div className="text-center">
                <Chip size="sm" variant="flat" color="default">
                  {t('profile.image.supportedFormats', { formats: acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ') })}
                </Chip>
                <Chip size="sm" variant="flat" color="default" className="ml-2">
                  {t('profile.image.maxSize', { size: maxFileSize })}
                </Chip>
              </div>
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && !isUploading && (
            <div className="flex items-center justify-center space-x-3">
              <Button
                color="success"
                variant="solid"
                startContent={<Upload className="size-4" />}
                onPress={handleUpload}
                className="font-semibold"
                aria-label={t('profile.image.actions.upload')}
              >
                {t('profile.image.actions.upload')}
              </Button>
              <Button
                color="danger"
                variant="light"
                startContent={<X className="size-4" />}
                onPress={() => {
                  setSelectedFile(null)
                  setPreviewUrl(null)
                  setCropData(null)
                  setError(null)
                }}
                className="font-semibold"
                aria-label={t('profile.image.actions.cancel')}
              >
                {t('profile.image.actions.cancel')}
              </Button>
            </div>
          )}
        </div>

        {/* Crop Modal */}
        <Modal isOpen={showCropModal} onClose={() => setShowCropModal(false)} size="2xl">
          <ModalContent>
            <ModalHeader>
              <h3 className="text-lg font-semibold">{t('profile.image.cropTitle')}</h3>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {t('profile.image.cropDescription')}
                </p>
                <div className="flex justify-center">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full rounded-lg border border-gray-300"
                    aria-label={t('profile.image.cropCanvas')}
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                variant="flat"
                onPress={handleCrop}
                className="font-semibold"
              >
                {t('profile.image.actions.applyCrop')}
              </Button>
              <Button
                color="danger"
                variant="light"
                onPress={() => setShowCropModal(false)}
                className="font-semibold"
              >
                {t('common.cancel')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </CardBody>
    </Card>
  )
}

export default ProfileImageUpload
