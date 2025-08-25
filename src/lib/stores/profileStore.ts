import { create } from 'zustand'
import { Profile, ProfileUpdateData, PrivacySettings, NotificationSettings } from '../../interfaces/Profile'

interface ProfileState {
  profile: Profile | null
  isLoading: boolean
  error: string | null
  isUpdating: boolean
}

interface ProfileActions {
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setUpdating: (updating: boolean) => void
  updateProfile: (updateData: ProfileUpdateData) => void
  updatePrivacySettings: (settings: PrivacySettings) => void
  updateNotificationSettings: (settings: NotificationSettings) => void
  reset: () => void
}

interface ProfileStore extends ProfileState, ProfileActions {}

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  error: null,
  isUpdating: false
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  ...initialState,

  setProfile: (profile) => {
    set({ profile })
  },

  setLoading: (isLoading) => {
    set({ isLoading })
  },

  setError: (error) => {
    set({ error })
  },

  setUpdating: (isUpdating) => {
    set({ isUpdating })
  },

  updateProfile: (updateData) => {
    const { profile } = get()
    if (!profile) return

    const updatedProfile: Profile = {
      ...profile,
      ...updateData,
      lastUpdated: new Date().toISOString()
    }

    set({ profile: updatedProfile })
  },

  updatePrivacySettings: (settings) => {
    const { profile } = get()
    if (!profile) return

    const updatedProfile: Profile = {
      ...profile,
      privacySettings: settings,
      lastUpdated: new Date().toISOString()
    }

    set({ profile: updatedProfile })
  },

  updateNotificationSettings: (settings) => {
    const { profile } = get()
    if (!profile) return

    const updatedProfile: Profile = {
      ...profile,
      notificationSettings: settings,
      lastUpdated: new Date().toISOString()
    }

    set({ profile: updatedProfile })
  },

  reset: () => {
    set(initialState)
  }
}))
