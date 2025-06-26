import { supabase } from '../lib/supabase'

export interface UploadResult {
  url: string
  path: string
}

export interface UploadError {
  message: string
  code?: string
}

export interface UploadProgress {
  fileName: string
  progress: number // 0-100
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

export type ProgressCallback = (progress: UploadProgress) => void

/**
 * Upload a file to Supabase Storage with progress tracking and timeout handling
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param folder - Optional folder path within the bucket
 * @param onProgress - Optional progress callback
 * @param timeout - Upload timeout in milliseconds (default: 120 seconds)
 * @param retries - Number of retry attempts (default: 2)
 * @returns Promise with upload result or error
 */
export const uploadFile = async (
  file: File,
  bucket: string = 'properties',
  folder?: string,
  onProgress?: ProgressCallback,
  timeout: number = 120000, // Increased to 120 seconds (2 minutes) for larger files
  retries: number = 2 // Reduced retries to prevent long wait times
): Promise<UploadResult> => {
  console.log(`🔄 Starting upload for file: ${file.name}`);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Generate unique filename to avoid conflicts
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = folder ? `${folder}/${fileName}` : fileName

      console.log('📤 Uploading file (attempt ' + attempt + '):', {
        originalName: file.name,
        fileName,
        filePath,
        size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        type: file.type
      })

      // Report upload start
      if (onProgress) {
        onProgress({
          fileName: file.name,
          progress: 0,
          status: 'uploading'
        })
      }

      // Create a timeout promise to prevent hanging uploads
      const uploadPromise = supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600', // Keep long cache for uploaded files (they're immutable)
          upsert: false // Prevent overwrites to avoid conflicts
        })

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Upload timeout after ${timeout / 1000} seconds`))
        }, timeout)
      })

      // Race between upload and timeout
      const { data, error } = await Promise.race([uploadPromise, timeoutPromise])

      if (error) {
        console.error('❌ Upload error (attempt ' + attempt + '):', error)
        
        // Report error to progress callback
        if (onProgress) {
          onProgress({
            fileName: file.name,
            progress: 0,
            status: 'error',
            error: error.message
          })
        }

        // If it's the last attempt, throw the error
        if (attempt === retries) {
          throw new Error(`Upload failed after ${retries} attempts: ${error.message}`)
        }

        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000))
        continue
      }

      if (!data) {
        const errorMsg = 'No data returned from upload'
        console.error('❌ ' + errorMsg + ' (attempt ' + attempt + ')')
        
        if (onProgress) {
          onProgress({
            fileName: file.name,
            progress: 0,
            status: 'error',
            error: errorMsg
          })
        }

        if (attempt === retries) {
          throw new Error(errorMsg)
        }
        
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000))
        continue
      }

      // Get public URL with timeout
      const urlPromise = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      const urlTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Get URL timeout'))
        }, 10000) // 10 second timeout for URL generation
      })

      const { data: urlData } = await Promise.race([urlPromise, urlTimeoutPromise])

      if (!urlData?.publicUrl) {
        const errorMsg = 'Failed to get public URL'
        console.error('❌ ' + errorMsg + ' (attempt ' + attempt + ')')
        
        if (onProgress) {
          onProgress({
            fileName: file.name,
            progress: 0,
            status: 'error',
            error: errorMsg
          })
        }

        if (attempt === retries) {
          throw new Error(errorMsg)
        }
        
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000))
        continue
      }

      // Success! Report completion
      if (onProgress) {
        console.log('✅ Setting file upload to COMPLETED:', file.name)
        onProgress({
          fileName: file.name,
          progress: 100,
          status: 'completed'
        })
      }

      console.log('✅ File uploaded successfully:', {
        path: data.path,
        url: urlData.publicUrl,
        attempt
      })

      const result = {
        url: urlData.publicUrl,
        path: data.path
      };
      
      console.log(`✅ Upload complete for ${file.name}:`, result);
      return result;

    } catch (uploadError) {
      console.error('❌ File upload failed (attempt ' + attempt + '):', uploadError)
      
      if (onProgress) {
        onProgress({
          fileName: file.name,
          progress: 0,
          status: 'error',
          error: uploadError instanceof Error ? uploadError.message : 'Unknown error'
        })
      }

      // If it's the last attempt, throw the error
      if (attempt === retries) {
        throw uploadError
      }

      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000))
    }
  }

  // This should never be reached, but TypeScript requires it
  throw new Error('Upload failed after all retry attempts')
}

/**
 * Upload multiple files to Supabase Storage with controlled concurrency
 * @param files - Array of files to upload
 * @param bucket - The storage bucket name
 * @param folder - Optional folder path within the bucket
 * @param onProgress - Optional progress callback for each file
 * @param concurrency - Maximum number of concurrent uploads (default: 3)
 * @returns Promise with array of upload results
 */
export const uploadMultipleFiles = async (
  files: File[],
  bucket: string = 'properties',
  folder?: string,
  onProgress?: ProgressCallback,
  concurrency: number = 3 // Limit concurrent uploads to prevent overwhelming
): Promise<UploadResult[]> => {
  try {
    console.log('📤 Uploading multiple files:', {
      count: files.length,
      bucket,
      folder,
      concurrency,
      totalSize: `${(files.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024)).toFixed(2)}MB`
    })

    const results: UploadResult[] = []
    const errors: Error[] = []

    // Process files in batches to control concurrency
    for (let i = 0; i < files.length; i += concurrency) {
      const batch = files.slice(i, i + concurrency)
      
      console.log(`📦 Processing batch ${Math.floor(i / concurrency) + 1}/${Math.ceil(files.length / concurrency)}:`, 
        batch.map(f => f.name))

      const batchPromises = batch.map(async (file): Promise<{ success: true; result: UploadResult; file: File } | { success: false; error: Error; file: File }> => {
        try {
          const result = await uploadFile(file, bucket, folder, onProgress)
          console.log(`✅ Successfully uploaded ${file.name}`)
          return { success: true, result, file }
        } catch (error) {
          console.error(`❌ Failed to upload ${file.name}:`, error)
          const uploadError = error instanceof Error ? error : new Error('Unknown error')
          errors.push(uploadError)
          
          // Report error progress
          if (onProgress) {
            onProgress({
              fileName: file.name,
              progress: 0,
              status: 'error',
              error: uploadError.message
            })
          }
          
          return { success: false, error: uploadError, file }
        }
      })

      try {
        const batchResults = await Promise.allSettled(batchPromises)
        
        // Process batch results
        for (const settledResult of batchResults) {
          if (settledResult.status === 'fulfilled') {
            const uploadResult = settledResult.value
            if (uploadResult.success) {
              results.push(uploadResult.result)
            }
          } else {
            console.error('❌ Batch promise rejected:', settledResult.reason)
            errors.push(new Error('Batch upload failed'))
          }
        }
        
      } catch (batchError) {
        console.error('❌ Unexpected batch error:', batchError)
        errors.push(batchError instanceof Error ? batchError : new Error('Batch processing failed'))
      }
    }

    // Final validation
    if (results.length === 0 && files.length > 0) {
      const errorMessage = `All ${files.length} files failed to upload. Last error: ${errors[errors.length - 1]?.message || 'Unknown error'}`
      console.error('❌ Complete upload failure:', errorMessage)
      throw new Error(errorMessage)
    }

    if (errors.length > 0) {
      console.warn(`⚠️ Partial upload failure: ${errors.length} of ${files.length} files failed`)
      if (results.length < files.length / 2) { // If more than half failed
        throw new Error(`Too many files failed to upload: ${errors.length} of ${files.length} failed`)
      }
    }

    console.log('✅ Multiple files upload completed:', {
      successful: results.length,
      failed: errors.length,
      successRate: `${((results.length / files.length) * 100).toFixed(1)}%`,
      urls: results.map(r => r.url)
    })

    return results

  } catch (error) {
    console.error('❌ Multiple file upload failed:', error)
    throw error
  }
}

/**
 * Delete a file from Supabase Storage
 * @param path - The file path in storage
 * @param bucket - The storage bucket name
 */
export const deleteFile = async (
  path: string,
  bucket: string = 'properties'
): Promise<void> => {
  try {
    console.log('🗑️ Deleting file:', { path, bucket })

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('❌ Delete error:', error)
      throw new Error(`Delete failed: ${error.message}`)
    }

    console.log('✅ File deleted successfully:', path)

  } catch (error) {
    console.error('❌ File deletion failed:', error)
    throw error
  }
}

/**
 * Delete multiple files from Supabase Storage
 * @param paths - Array of file paths to delete
 * @param bucket - The storage bucket name
 */
export const deleteMultipleFiles = async (
  paths: string[],
  bucket: string = 'properties'
): Promise<void> => {
  try {
    console.log('🗑️ Deleting multiple files:', { count: paths.length, bucket })

    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths)

    if (error) {
      console.error('❌ Multiple delete error:', error)
      throw new Error(`Delete failed: ${error.message}`)
    }

    console.log('✅ All files deleted successfully:', paths.length)

  } catch (error) {
    console.error('❌ Multiple file deletion failed:', error)
    throw error
  }
} 