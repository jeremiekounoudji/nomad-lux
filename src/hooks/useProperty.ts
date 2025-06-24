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
        const imageFiles = propertyData.images.filter(img => img instanceof File) as File[]
        if (imageFiles.length > 0) {
          console.log(`📸 Uploading ${imageFiles.length} images...`)
          try {
            // Use limited parallel uploads for better speed (concurrency = 2)
            const imageResults = await uploadMultipleFiles(imageFiles, 'properties', 'images', handleProgress, 2)
            imageUrls = imageResults.map(result => result.url)
            console.log('✅ Images uploaded successfully:', imageUrls.length)
            
            // Validate that all images were uploaded
            if (imageUrls.length !== imageFiles.length) {
              throw new Error(`Only ${imageUrls.length} of ${imageFiles.length} images were uploaded successfully`)
            }
          } catch (error) {
            console.error('❌ Image upload failed:', error)
            throw new Error(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }
      }

      // Upload video with validation
      let videoUrl: string | null = null
      if (propertyData.videos && propertyData.videos.length > 0 && propertyData.videos[0] instanceof File) {
        console.log('🎥 Uploading video...')
        try {
          const videoResult = await uploadFile(propertyData.videos[0] as File, 'properties', 'videos', handleProgress)
          videoUrl = videoResult.url
          console.log('✅ Video uploaded successfully:', videoUrl)
        } catch (error) {
          console.error('❌ Video upload failed:', error)
          throw new Error(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
        price_per_night: propertyData.price,
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
        amenities: propertyData.amenities,
        images: imageUrls, // Use uploaded URLs instead of File objects
        video: videoUrl, // Use uploaded URL instead of File object
        property_type: propertyData.propertyType,
        max_guests: propertyData.maxGuests,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        cleaning_fee: propertyData.cleaningFee || 0,
        service_fee: propertyData.serviceFee || 0,
        status: 'pending'
      }

      console.log('💾 Step 3: Inserting property data into database:', {
        title: dbPropertyData.title,
        imageCount: dbPropertyData.images.length,
        hasVideo: !!dbPropertyData.video,
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
      const transformedProperty: Property = {
        id: data.id,
        title: data.title,
        description: data.description,
        price: data.price_per_night,
        currency: data.currency,
        location: data.location,
        images: data.images,
        videos: data.video ? [data.video] : [],
        host: {
          id: data.host.id,
          name: data.host.display_name,
          username: data.host.username || '',
          avatar: data.host.avatar_url || '',
          isVerified: data.host.is_identity_verified || false,
          email: '', // Not exposed for privacy
          phone: '', // Not exposed for privacy
          rating: data.host.host_rating || 0,
          responseRate: data.host.response_rate || 0,
          responseTime: data.host.response_time || 'Unknown'
        },
        rating: 0, // New property, no ratings yet
        reviewCount: 0, // New property, no reviews yet
        propertyType: data.property_type,
        amenities: data.amenities,
        maxGuests: data.max_guests,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        isLiked: false,
        createdAt: data.created_at,
        cleaningFee: data.cleaning_fee,
        serviceFee: data.service_fee,
        totalBeforeTaxes: data.price_per_night + (data.cleaning_fee || 0) + (data.service_fee || 0)
      }

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
      if (updates.price) dbUpdates.price_per_night = updates.price
      if (updates.currency) dbUpdates.currency = updates.currency
      if (updates.location) dbUpdates.location = updates.location
      if (updates.amenities) dbUpdates.amenities = updates.amenities
      if (updates.images) dbUpdates.images = updates.images
      if (updates.videos && updates.videos.length > 0) dbUpdates.video = updates.videos[0]
      if (updates.propertyType) dbUpdates.property_type = updates.propertyType
      if (updates.maxGuests) dbUpdates.max_guests = updates.maxGuests
      if (updates.bedrooms) dbUpdates.bedrooms = updates.bedrooms
      if (updates.bathrooms) dbUpdates.bathrooms = updates.bathrooms
      if (updates.cleaningFee !== undefined) dbUpdates.cleaning_fee = updates.cleaningFee
      if (updates.serviceFee !== undefined) dbUpdates.service_fee = updates.serviceFee

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

      // Transform and update in store
      const transformedProperty: Property = {
        id: data.id,
        title: data.title,
        description: data.description,
        price: data.price_per_night,
        currency: data.currency,
        location: data.location,
        images: data.images,
        videos: data.video ? [data.video] : [],
        host: {
          id: data.host.id,
          name: data.host.display_name,
          username: data.host.username || '',
          avatar: data.host.avatar_url || '',
          isVerified: data.host.is_identity_verified || false,
          email: '',
          phone: '',
          rating: data.host.host_rating || 0,
          responseRate: data.host.response_rate || 0,
          responseTime: data.host.response_time || 'Unknown'
        },
        rating: 0,
        reviewCount: 0,
        propertyType: data.property_type,
        amenities: data.amenities,
        maxGuests: data.max_guests,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        isLiked: false,
        createdAt: data.created_at,
        cleaningFee: data.cleaning_fee,
        serviceFee: data.service_fee,
        totalBeforeTaxes: data.price_per_night + (data.cleaning_fee || 0) + (data.service_fee || 0)
      }

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
      const transformedProperty: Property = {
        id: data.id,
        title: data.title,
        description: data.description,
        price: data.price_per_night,
        currency: data.currency,
        location: data.location,
        images: data.images,
        videos: data.video ? [data.video] : [],
        host: {
          id: data.host.id,
          name: data.host.display_name,
          username: data.host.username || '',
          avatar: data.host.avatar_url || '',
          isVerified: data.host.is_identity_verified || false,
          email: '',
          phone: '',
          rating: data.host.host_rating || 0,
          responseRate: data.host.response_rate || 0,
          responseTime: data.host.response_time || 'Unknown'
        },
        rating: 0,
        reviewCount: 0,
        propertyType: data.property_type,
        amenities: data.amenities,
        maxGuests: data.max_guests,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        isLiked: false,
        createdAt: data.created_at,
        cleaningFee: data.cleaning_fee,
        serviceFee: data.service_fee,
        totalBeforeTaxes: data.price_per_night + (data.cleaning_fee || 0) + (data.service_fee || 0)
      }

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
      const transformedProperties: Property[] = data.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price_per_night,
        currency: item.currency,
        location: item.location,
        images: item.images,
        videos: item.video ? [item.video] : [],
        host: {
          id: item.host_id,
          name: item.host_name,
          username: '',
          avatar: item.host_avatar || '',
          isVerified: false,
          email: '',
          phone: '',
          rating: item.host_rating || 0,
          responseRate: item.host_response_rate || 0,
          responseTime: item.host_response_time || 'Unknown'
        },
        rating: 0,
        reviewCount: 0,
        propertyType: item.property_type,
        amenities: item.amenities,
        maxGuests: item.max_guests,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        isLiked: false,
        createdAt: item.created_at,
        cleaningFee: item.cleaning_fee,
        serviceFee: item.service_fee,
        totalBeforeTaxes: item.price_per_night + (item.cleaning_fee || 0) + (item.service_fee || 0)
      }))

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
      const transformedProperties: Property[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price_per_night,
        currency: item.currency,
        location: item.location,
        images: item.images,
        videos: item.video ? [item.video] : [],
        host: {
          id: item.host.id,
          name: item.host.display_name,
          username: item.host.username || '',
          avatar: item.host.avatar_url || '',
          isVerified: item.host.is_identity_verified || false,
          email: '',
          phone: '',
          rating: item.host.host_rating || 0,
          responseRate: item.host.response_rate || 0,
          responseTime: item.host.response_time || 'Unknown'
        },
        rating: 0,
        reviewCount: 0,
        propertyType: item.property_type,
        amenities: item.amenities,
        maxGuests: item.max_guests,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        isLiked: false,
        createdAt: item.created_at,
        cleaningFee: item.cleaning_fee,
        serviceFee: item.service_fee,
        totalBeforeTaxes: item.price_per_night + (item.cleaning_fee || 0) + (item.service_fee || 0)
      }))

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