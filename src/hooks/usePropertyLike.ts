import { useEffect, useCallback } from 'react'
import { usePropertyStore } from '../lib/stores/propertyStore'
import { useAuthStore } from '../lib/stores/authStore'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export const usePropertyLike = () => {
  const { user } = useAuthStore()
  const {
    likedPropertyIds,
    likedProperties,
    setLikedPropertyIds,
    setLikedProperties,
    setIsLikeLoading,
    isLikeLoading,
    isPropertyLiked,
  } = usePropertyStore()

  // Fetch liked properties when user logs in
  const fetchLikedProperties = useCallback(async () => {
    if (!user) return
    console.log('Fetching liked properties for user:', user.auth_id)
    console.log('Full user object:', user)
    try {
      setIsLikeLoading(true)
      const { data, error } = await supabase.rpc('get_user_liked_properties_paginated', {
        p_user_id: user.auth_id,
        p_page: 1,
        p_page_size: 100,
      })
      console.log('RPC response:', { data, error })
      console.log('Query params used:', { p_user_id: user.auth_id, p_page: 1, p_page_size: 100 })
      if (error) throw error
      
      // Transform the RPC response to match Property interface
      const transformedProperties = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price_per_night,
        price_per_night: item.price_per_night,
        currency: item.currency,
        location: item.location,
        images: item.images || [],
        videos: item.video ? [item.video] : [],
        host: item.host, // This is now a JSON object from the RPC
        rating: item.rating || 0,
        review_count: item.rating_count || 0,
        view_count: item.view_count || 0,
        booking_count: item.booking_count || 0,
        total_revenue: item.total_revenue || 0,
        property_type: item.property_type,
        amenities: item.amenities || [],
        max_guests: item.max_guests,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        cleaning_fee: item.cleaning_fee || 0,
        service_fee: item.service_fee || 0,
        is_liked: true, // These are liked properties
        instant_book: false, // Default value
        additional_fees: [],
        distance: '',
        created_at: item.created_at,
        status: item.status,
        unavailable_dates: item.unavailable_dates || [],
        timezone: item.timezone,
        like_count: item.like_count || 0,
        suspended_at: item.suspended_at,
        suspended_by: item.suspended_by,
        suspension_reason: item.suspension_reason
      }))
      
      const likedIds = transformedProperties.map((property: any) => property.id)
      
      console.log('Processed liked properties:', { transformedProperties, likedIds })
      setLikedPropertyIds(likedIds)
      setLikedProperties(transformedProperties)
    } catch (err: any) {
      console.error('Failed to fetch liked properties:', err)
      toast.error('Failed to load favorites')
    } finally {
      setIsLikeLoading(false)
    }
  }, [user, setIsLikeLoading, setLikedPropertyIds, setLikedProperties])

  useEffect(() => {
    if (user) {
      fetchLikedProperties()
    } else {
      setLikedPropertyIds([])
      setLikedProperties([])
    }
  }, [user?.id, fetchLikedProperties, setLikedPropertyIds, setLikedProperties])

  // Toggle like
  const toggleLike = useCallback(async (propertyId: string) => {
    if (!user) {
      toast.error('Please sign in to save properties')
      return
    }
    try {
      setIsLikeLoading(true)
      const alreadyLiked = likedPropertyIds.includes(propertyId)
      if (!alreadyLiked) {
        const { error } = await supabase.from('property_likes').insert({ property_id: propertyId, user_id: user.id })
        if (error) throw error
        setLikedPropertyIds([...likedPropertyIds, propertyId])
      } else {
        const { error } = await supabase.from('property_likes').delete().eq('property_id', propertyId).eq('user_id', user.id)
        if (error) throw error
        setLikedPropertyIds(likedPropertyIds.filter((id) => id !== propertyId))
      }
      // Refresh full liked properties list quickly
      fetchLikedProperties()
    } catch (err: any) {
      console.error('Failed to update favorite:', err)
      toast.error('Failed to update favorite')
    } finally {
      setIsLikeLoading(false)
    }
  }, [user, likedPropertyIds, setIsLikeLoading, setLikedPropertyIds, fetchLikedProperties])

  return {
    likedPropertyIds,
    likedProperties,
    isLoading: isLikeLoading,
    isLiked: isPropertyLiked,
    toggleLike,
    fetchLikedProperties,
  }
} 