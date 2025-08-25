import { ProfileImageData } from '../interfaces/Profile'

export interface ImageDimensions {
  width: number
  height: number
}

export interface ImageValidationResult {
  isValid: boolean
  error?: string
  dimensions?: ImageDimensions
}

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

/**
 * Validates image file format and dimensions
 */
export const validateImage = async (file: File): Promise<ImageValidationResult> => {
  return new Promise((resolve) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    
    if (!validTypes.includes(file.type)) {
      resolve({
        isValid: false,
        error: 'Invalid file format. Please use JPEG, PNG, or WebP.'
      })
      return
    }

    const img = new Image()
    img.onload = () => {
      resolve({
        isValid: true,
        dimensions: {
          width: img.width,
          height: img.height
        }
      })
    }
    img.onerror = () => {
      resolve({
        isValid: false,
        error: 'Failed to load image. Please try another file.'
      })
    }
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Compresses an image file to reduce size
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.8,
    format = 'jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'))
      return
    }

    const img = new Image()
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: `image/${format}`,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        `image/${format}`,
        quality
      )
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Crops an image to a square format
 */
export const cropImageToSquare = async (
  file: File,
  size: number = 512
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'))
      return
    }

    const img = new Image()
    img.onload = () => {
      canvas.width = size
      canvas.height = size

      // Calculate crop dimensions (center crop)
      const cropSize = Math.min(img.width, img.height)
      const offsetX = (img.width - cropSize) / 2
      const offsetY = (img.height - cropSize) / 2

      // Draw cropped image
      ctx.drawImage(
        img,
        offsetX, offsetY, cropSize, cropSize,
        0, 0, size, size
      )

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const croppedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(croppedFile)
          } else {
            reject(new Error('Failed to crop image'))
          }
        },
        'image/jpeg',
        0.9
      )
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Rotates an image by specified degrees
 */
export const rotateImage = async (
  file: File,
  degrees: number = 90
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'))
      return
    }

    const img = new Image()
    img.onload = () => {
      // Calculate new dimensions for rotation
      const radians = (degrees * Math.PI) / 180
      const cos = Math.abs(Math.cos(radians))
      const sin = Math.abs(Math.sin(radians))
      
      const newWidth = img.width * cos + img.height * sin
      const newHeight = img.width * sin + img.height * cos

      canvas.width = newWidth
      canvas.height = newHeight

      // Move to center and rotate
      ctx.translate(newWidth / 2, newHeight / 2)
      ctx.rotate(radians)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const rotatedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(rotatedFile)
          } else {
            reject(new Error('Failed to rotate image'))
          }
        },
        'image/jpeg',
        0.9
      )
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Converts image to base64 data URL
 */
export const imageToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        resolve(result)
      } else {
        reject(new Error('Failed to convert image to data URL'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Gets image dimensions from a file
 */
export const getImageDimensions = (file: File): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      })
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Formats file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Checks if file size is within limits
 */
export const isFileSizeValid = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * Creates a thumbnail from an image
 */
export const createThumbnail = async (
  file: File,
  size: number = 150
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'))
      return
    }

    const img = new Image()
    img.onload = () => {
      canvas.width = size
      canvas.height = size

      // Calculate thumbnail dimensions (maintain aspect ratio)
      const aspectRatio = img.width / img.height
      let thumbWidth = size
      let thumbHeight = size

      if (aspectRatio > 1) {
        thumbHeight = size / aspectRatio
      } else {
        thumbWidth = size * aspectRatio
      }

      // Center the thumbnail
      const offsetX = (size - thumbWidth) / 2
      const offsetY = (size - thumbHeight) / 2

      ctx.drawImage(img, offsetX, offsetY, thumbWidth, thumbHeight)

      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Processes image data for upload
 */
export const processImageForUpload = async (
  file: File,
  options: {
    compress?: boolean
    cropToSquare?: boolean
    maxSize?: number
  } = {}
): Promise<ProfileImageData> => {
  let processedFile = file

  // Validate image
  const validation = await validateImage(file)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }

  // Compress if needed
  if (options.compress && file.size > (options.maxSize || 2 * 1024 * 1024)) {
    processedFile = await compressImage(file, {
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.8
    })
  }

  // Crop to square if requested
  if (options.cropToSquare) {
    processedFile = await cropImageToSquare(processedFile, 512)
  }

  // Create preview URL
  const previewUrl = await imageToDataURL(processedFile)

  return {
    file: processedFile,
    previewUrl,
    croppedData: undefined
  }
}
