import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../lib/stores/authStore'
import { usePropertyStore } from '../lib/stores/propertyStore'
import { useAdminSettingsStore } from '../lib/stores/adminSettingsStore'
import { Property, PropertySubmissionData } from '../interfaces'
import { uploadMultipleFiles, uploadFile, UploadProgress } from '../utils/fileUpload'
import toast from 'react-hot-toast'

export const useProperty = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  
  const { user } = useAuthStore()
  const { addProperty, updateProperty: updatePropertyInStore, setProperties } = usePropertyStore()
  const { settings } = useAdminSettingsStore()

  console.log('🏠 useProperty hook initialized')

  // Transform database data to frontend format (used in multiple places)
  const transformDatabaseToProperty = (data: any): Property => ({
    id: data.id,
    title: data.title,
    description: data.description,
    price: data.price,
    currency: data.currency,
    location: data.location,
    images: data.images,
    videos: data.videos,
    host: {
      id: data.host.id,
      name: data.host.name,
      username: data.host.username,
      avatar_url: data.host.avatar_url,
      display_name: data.host.display_name,
      is_identity_verified: data.host.is_identity_verified,
      is_email_verified: data.host.is_email_verified,
      email: data.host.email,
      phone: data.host.phone,
      rating: data.host.rating,
      response_rate: data.host.response_rate,
      response_time: data.host.response_time,
      bio: data.host.bio,
      experience: data.host.experience
    },
    rating: data.rating || 0,
    review_count: data.review_count || 0,
    view_count: data.view_count || 0,
    booking_count: data.booking_count || 0,
    total_revenue: data.total_revenue || 0,
    amenities: data.amenities,
    max_guests: data.max_guests,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    property_type: data.property_type,
    status: data.status,
    is_liked: data.is_liked,
    created_at: data.created_at,
    cleaning_fee: data.cleaning_fee,
    service_fee: data.service_fee,
    instant_book: data.instant_book || false,
    additional_fees: data.additional_fees || [],
    distance: data.distance || '0 km away'
  })

  // Submit a new property
  const submitProperty = async (propertyData: PropertySubmissionData): Promise<Property | null> => {
    if (!user) {
      console.error('❌ User not authenticated for property submission')
      toast.error('Please sign in to submit a property')
      return null
    }

    console.log('📤 Submitting property:', propertyData.title)
    setIsLoading(true)
    setError(null)

    try {
      // Log admin settings for reference (commission rate is for platform, not service fee)
      const commissionRate = settings?.booking?.commissionRate || 6
      const paymentProcessingFee = settings?.booking?.paymentProcessingFee || 2.4

      console.log('📋 Admin settings (for reference):', {
        commissionRate: `${commissionRate}% (platform commission)`,
        paymentProcessingFee: `${paymentProcessingFee}%`,
        note: 'Service fee is manually set by host'
      })

      // Step 1: Upload files to Supabase Storage
      console.log('📤 Step 1: Uploading files to storage...')
      setUploadProgress([]) // Clear previous progress
      
      // Progress tracking callback
      const handleProgress = (progress: UploadProgress) => {
        console.log(`📊 Progress update for ${progress.fileName}: ${progress.progress}% (${progress.status})`)
        
        setUploadProgress(prev => {
          const existingIndex = prev.findIndex(p => p.fileName === progress.fileName)
          
          // If file is completed, make sure it shows 100%
          if (progress.status === 'completed') {
            progress.progress = 100
          }
          
          if (existingIndex >= 0) {
            // Update existing progress
            const updated = [...prev]
            updated[existingIndex] = progress
            return updated
          } else {
            // Add new progress
            return [...prev, progress]
          }
        })
      }
      
      // Upload images with validation
      let imageUrls: string[] = []
      if (propertyData.images && propertyData.images.length > 0) {
        // Separate existing URLs from new files
        const existingImageUrls = propertyData.images.filter(img => typeof img === 'string') as string[]
        const newImageFiles = propertyData.images.filter(img => img instanceof File) as File[]
        
        console.log(`📸 Images to process: ${existingImageUrls.length} existing URLs, ${newImageFiles.length} new files`)
        
        // Start with existing URLs
        imageUrls = [...existingImageUrls]
        
        // Upload new files if any
        if (newImageFiles.length > 0) {
          console.log(`📤 Uploading ${newImageFiles.length} new images...`)
          try {
            // Use limited parallel uploads for better speed (concurrency = 2)
            const imageResults = await uploadMultipleFiles(newImageFiles, 'properties', 'images', handleProgress, 2)
            const newImageUrls = imageResults.map(result => result.url)
            imageUrls = [...imageUrls, ...newImageUrls]
            console.log('✅ New images uploaded successfully:', newImageUrls.length)
            
            // Validate that all new images were uploaded
            if (newImageUrls.length !== newImageFiles.length) {
              throw new Error(`Only ${newImageUrls.length} of ${newImageFiles.length} new images were uploaded successfully`)
            }
          } catch (error) {
            console.error('❌ Image upload failed:', error)
            throw new Error(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }
      }

      // Upload video with validation
      let videoUrl: string | null = null
      if (propertyData.videos && propertyData.videos.length > 0) {
        const video = propertyData.videos[0]
        
        if (typeof video === 'string') {
          // Existing video URL - keep it as is
          videoUrl = video
          console.log('📹 Using existing video URL:', videoUrl)
        } else if (video instanceof File) {
          // New video file - upload it
          console.log('🎥 Uploading new video file...')
          try {
            const videoResult = await uploadFile(video, 'properties', 'videos', handleProgress)
            videoUrl = videoResult.url
            console.log('✅ New video uploaded successfully:', videoUrl)
          } catch (error) {
            console.error('❌ Video upload failed:', error)
            throw new Error(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }
      }

      // Validate required uploads
      if (imageUrls.length === 0) {
        throw new Error('No images were uploaded successfully')
      }

      if (!videoUrl) {
        throw new Error('Video upload failed')
      }

      // Step 2: Prepare property data for database with uploaded URLs
      const dbPropertyData = {
        host_id: user.id,
        title: propertyData.title,
        description: propertyData.description,
        price: propertyData.price,
        currency: propertyData.currency || 'USD',
        location: {
          city: propertyData.location.city,
          country: propertyData.location.country,
          address: propertyData.location.address || '',
          coordinates: {
            lat: propertyData.location.coordinates.lat,
            lng: propertyData.location.coordinates.lng
          }
        },
        images: imageUrls, // Use uploaded URLs instead of File objects
        videos: videoUrl, // Use uploaded URL instead of File object
        property_type: propertyData.property_type,
        max_guests: propertyData.max_guests,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        amenities: propertyData.amenities,
        cleaning_fee: propertyData.cleaning_fee || 0,
        service_fee: propertyData.service_fee || 0,
        status: 'pending'
      }

      console.log('💾 Step 3: Inserting property data into database:', {
        title: dbPropertyData.title,
        imageCount: dbPropertyData.images.length,
        hasVideo: !!dbPropertyData.videos,
        propertyType: dbPropertyData.property_type
      })

      const { data, error } = await supabase
        .from('properties')
        .insert(dbPropertyData)
        .select(`
          *,
          host:properties_host_id_fkey(
            id,
            display_name,
            username,
            avatar_url,
            host_rating,
            response_rate,
            response_time,
            is_identity_verified
          )
        `)
        .single()

      if (error) {
        console.error('❌ Supabase error submitting property:', error)
        throw new Error(`Failed to submit property: ${error.message}`)
      }

      if (!data) {
        throw new Error('No data returned from property submission')
      }

      console.log('✅ Property submitted successfully:', data.id)

      // Transform database data to frontend format
      const transformedProperty = transformDatabaseToProperty(data)

      // Add to store
      addProperty(transformedProperty)

      toast.success('Property submitted successfully! It will be reviewed by our team.')
      setIsLoading(false)
      // Force clear upload progress immediately
      console.log('🧹 Clearing upload progress after successful submission')
      setUploadProgress([])
      return transformedProperty

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('❌ Error submitting property:', error)
      setError(errorMessage)
      toast.error(`Failed to submit property: ${errorMessage}`)
      setIsLoading(false)
      setUploadProgress([]) // Clear progress on error
      return null
    }
  }

  // Update a pending property
  const updateProperty = async (propertyId: string, updates: Partial<PropertySubmissionData>): Promise<Property | null> => {
    if (!user) {
      console.error('❌ User not authenticated for property update')
      toast.error('Please sign in to update property')
      return null
    }

    console.log('📝 Updating property:', propertyId)
    setIsLoading(true)
    setError(null)

    try {
      // Prepare updates for database format
      const dbUpdates: any = {}
      
      if (updates.title) dbUpdates.title = updates.title
      if (updates.description) dbUpdates.description = updates.description
      if (updates.price) dbUpdates.price = updates.price
      if (updates.currency) dbUpdates.currency = updates.currency
      if (updates.location) dbUpdates.location = updates.location
      if (updates.images) dbUpdates.images = updates.images
      if (updates.videos) dbUpdates.videos = updates.videos
      if (updates.property_type) dbUpdates.property_type = updates.property_type
      if (updates.max_guests) dbUpdates.max_guests = updates.max_guests
      if (updates.bedrooms) dbUpdates.bedrooms = updates.bedrooms
      if (updates.bathrooms) dbUpdates.bathrooms = updates.bathrooms
      if (updates.amenities) dbUpdates.amenities = updates.amenities
      if (updates.cleaning_fee !== undefined) dbUpdates.cleaning_fee = updates.cleaning_fee
      if (updates.service_fee !== undefined) dbUpdates.service_fee = updates.service_fee

      const { data, error } = await supabase
        .from('properties')
        .update(dbUpdates)
        .eq('id', propertyId)
        .eq('status', 'pending') // Only allow updates to pending properties
        .select(`
          *,
          host:properties_host_id_fkey(
            id,
            display_name,
            username,
            avatar_url,
            host_rating,
            response_rate,
            response_time,
            is_identity_verified
          )
        `)
        .single()

      if (error) {
        console.error('❌ Supabase error updating property:', error)
        throw new Error(`Failed to update property: ${error.message}`)
      }

      if (!data) {
        throw new Error('No data returned from property update')
      }

      console.log('✅ Property updated successfully:', data.id)

      // Transform database data to frontend format
      const transformedProperty = transformDatabaseToProperty(data)

      // Update in store
      updatePropertyInStore(transformedProperty)
      toast.success('Property updated successfully!')
      setIsLoading(false)
      return transformedProperty

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('❌ Error updating property:', error)
      setError(errorMessage)
      toast.error(`Failed to update property: ${errorMessage}`)
      setIsLoading(false)
      return null
    }
  }

  // Get property details
  const getProperty = async (propertyId: string): Promise<Property | null> => {
    console.log('🔍 Fetching property details:', propertyId)
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          host:properties_host_id_fkey(
            id,
            display_name,
            username,
            avatar_url,
            host_rating,
            response_rate,
            response_time,
            is_identity_verified
          )
        `)
        .eq('id', propertyId)
        .single()

      if (error) {
        console.error('❌ Supabase error fetching property:', error)
        throw new Error(`Failed to fetch property: ${error.message}`)
      }

      if (!data) {
        throw new Error('Property not found')
      }

      console.log('✅ Property fetched successfully:', data.id)

      // Transform database data to frontend format
      const transformedProperty = transformDatabaseToProperty(data)

      setIsLoading(false)
      return transformedProperty

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('❌ Error fetching property:', error)
      setError(errorMessage)
      setIsLoading(false)
      return null
    }
  }

  // Search properties using RPC function
  const searchProperties = async (searchParams: {
    searchTerm?: string
    filters?: {
      priceRange?: { min: number; max: number }
      location?: { lat: number; lng: number; radius: number }
      amenities?: string[]
      propertyType?: string
      maxGuests?: number
      bedrooms?: number
      bathrooms?: number
    }
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    page?: number
    perPage?: number
  }): Promise<{ properties: Property[]; totalCount: number; totalPages: number } | null> => {
    console.log('🔍 Searching properties with params:', searchParams)
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .rpc('search_properties', {
          p_search_term: searchParams.searchTerm || null,
          p_filters: searchParams.filters ? JSON.stringify(searchParams.filters) : null,
          p_sort_by: searchParams.sortBy || 'created_at',
          p_sort_order: searchParams.sortOrder || 'desc',
          p_page: searchParams.page || 1,
          p_per_page: searchParams.perPage || 20
        })

      if (error) {
        console.error('❌ Supabase error searching properties:', error)
        throw new Error(`Failed to search properties: ${error.message}`)
      }

      if (!data) {
        throw new Error('No search results returned')
      }

      console.log('✅ Properties search completed:', data.total_count, 'results')

      // Transform search results
      const transformedProperties: Property[] = data.data.map((item: any) => transformDatabaseToProperty(item))

      // Update store with search results
      setProperties(transformedProperties)

      setIsLoading(false)
      return {
        properties: transformedProperties,
        totalCount: data.total_count,
        totalPages: data.total_pages
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('❌ Error searching properties:', error)
      setError(errorMessage)
      setIsLoading(false)
      return null
    }
  }

  // Get host's properties
  const getHostProperties = async (hostId?: string): Promise<Property[] | null> => {
    const targetHostId = hostId || user?.id
    if (!targetHostId) {
      console.error('❌ No host ID provided for property fetch')
      return null
    }

    console.log('🏠 Fetching host properties for:', targetHostId)
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          host:properties_host_id_fkey(
            id,
            display_name,
            username,
            avatar_url,
            host_rating,
            response_rate,
            response_time,
            is_identity_verified
          )
        `)
        .eq('host_id', targetHostId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Supabase error fetching host properties:', error)
        throw new Error(`Failed to fetch host properties: ${error.message}`)
      }

      console.log('✅ Host properties fetched successfully:', data?.length || 0, 'properties')

      // Transform database data to frontend format
      const transformedProperties: Property[] = (data || []).map((item: any) => transformDatabaseToProperty(item))

      setIsLoading(false)
      return transformedProperties

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('❌ Error fetching host properties:', error)
      setError(errorMessage)
      setIsLoading(false)
      return null
    }
  }

  return {
    // State
    isLoading,
    error,
    uploadProgress,
    
    // Actions
    submitProperty,
    updateProperty,
    getProperty,
    searchProperties,
    getHostProperties,
    
    // Utilities
    clearError: () => setError(null)
  }
} 