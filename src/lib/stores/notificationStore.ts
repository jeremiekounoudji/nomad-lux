import { create } from 'zustand'
import { Notification } from '../../interfaces/Notification'

interface NotificationState {
  // State
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  filter: 'all' | 'unread' | 'read'
  hasMore: boolean
  
  // Actions
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilter: (filter: 'all' | 'unread' | 'read') => void
  setHasMore: (hasMore: boolean) => void
  clearNotifications: () => void
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  filter: 'all',
  hasMore: true,

  // Actions
  setNotifications: (notifications) => {
    console.log('🔔 NotificationStore: Setting notifications:', notifications.length)
    const unreadCount = notifications.filter(n => !n.is_read).length
    set({
      notifications,
      unreadCount,
      error: null
    })
  },

  addNotification: (notification) => {
    console.log('🔔 NotificationStore: Adding notification:', notification.id)
    const { notifications } = get()
    const updatedNotifications = [notification, ...notifications]
    const unreadCount = updatedNotifications.filter(n => !n.is_read).length
    set({
      notifications: updatedNotifications,
      unreadCount
    })
  },

  markAsRead: (notificationId) => {
    console.log('🔔 NotificationStore: Marking as read:', notificationId)
    const { notifications } = get()
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, is_read: true } : n
    )
    const unreadCount = updatedNotifications.filter(n => !n.is_read).length
    set({
      notifications: updatedNotifications,
      unreadCount
    })
  },

  markAllAsRead: () => {
    console.log('🔔 NotificationStore: Marking all as read')
    const { notifications } = get()
    const updatedNotifications = notifications.map(n => ({ ...n, is_read: true }))
    set({
      notifications: updatedNotifications,
      unreadCount: 0
    })
  },

  setLoading: (isLoading) => {
    console.log('🔔 NotificationStore: Setting loading:', isLoading)
    set({ isLoading })
  },

  setError: (error) => {
    console.log('🔔 NotificationStore: Setting error:', error)
    set({ error })
  },

  setFilter: (filter) => {
    console.log('🔔 NotificationStore: Setting filter:', filter)
    set({ filter })
  },

  setHasMore: (hasMore) => {
    console.log('🔔 NotificationStore: Setting hasMore:', hasMore)
    set({ hasMore })
  },

  clearNotifications: () => {
    console.log('🔔 NotificationStore: Clearing notifications')
    set({
      notifications: [],
      unreadCount: 0,
      error: null,
      hasMore: true
    })
  }
}))