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
      
      // RPC now returns full property objects, not just IDs
      const fullProperties = data || []
      const likedIds = fullProperties.map((property: any) => property.id)
      
      console.log('Processed liked properties:', { fullProperties, likedIds })
      setLikedPropertyIds(likedIds)
      setLikedProperties(fullProperties)
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