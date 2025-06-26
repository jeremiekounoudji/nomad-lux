import { createClient } from '@supabase/supabase-js'
import { config } from './config'

// Create Supabase client using configuration
export const supabase = createClient(config.supabase.url, config.supabase.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Debug logging for development
console.log('🔧 Supabase client initialized:', {
  url: config.supabase.url,
  keyPrefix: config.supabase.anonKey.substring(0, 20) + '...',
  projectId: config.supabase.projectId,
  isDevelopment: config.isDevelopment,
  timestamp: new Date().toISOString()
}) 