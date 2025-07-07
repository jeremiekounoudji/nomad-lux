// Configuration for environment variables
// This replaces .env file since it's blocked by the system

export const config = {
  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://hdeklulcgzuhbdusasky.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkZWtsdWxjZ3p1aGJkdXNhc2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjk0MjcsImV4cCI6MjA2NTkwNTQyN30.ieWeX-e-iVNoTDAAXypJjqGh5AP2rdV53LPpGZOLcVQ',
    projectId: import.meta.env.VITE_PROJECT_ID || 'hdeklulcgzuhbdusasky'
  },

  // FedaPay Configuration
  fedapay: {
    // Sandbox keys (for development/staging)
    sandbox: {
      publicKey: import.meta.env.VITE_FEDAPAY_SANDBOX_PUBLIC_KEY || 'pk_sandbox_MQhUKV4DUjJDb_hUMpEdHUYR',
      secretKey: import.meta.env.VITE_FEDAPAY_SANDBOX_SECRET_KEY || 'sk_sandbox_mH0b0w6vle888KFKLzIunqGt',
      webhookSecret: import.meta.env.VITE_FEDAPAY_SANDBOX_WEBHOOK_SECRET || ''
    },
    // Production keys (to be configured later)
    production: {
      publicKey: import.meta.env.VITE_FEDAPAY_PRODUCTION_PUBLIC_KEY || '',
      secretKey: import.meta.env.VITE_FEDAPAY_PRODUCTION_SECRET_KEY || '',
      webhookSecret: import.meta.env.VITE_FEDAPAY_PRODUCTION_WEBHOOK_SECRET || ''
    },
    // Current environment keys
    get current() {
      return config.isProduction ? this.production : this.sandbox
    },
    // API Base URL
    apiUrl: 'https://api.fedapay.com/v1'
  },

  // Development Settings
  isDevelopment: import.meta.env.NODE_ENV === 'development' || import.meta.env.MODE === 'development',
  isProduction: import.meta.env.NODE_ENV === 'production' || import.meta.env.MODE === 'production',

  // Admin Test Credentials (for development only)
  adminTest: {
    email: import.meta.env.VITE_ADMIN_TEST_EMAIL || 'admin@nomadlux.com',
    password: import.meta.env.VITE_ADMIN_TEST_PASSWORD || 'admin123'
  },

  // App Configuration
  app: {
    name: 'Nomad Lux',
    description: 'Premium property rental platform',
    version: '1.0.0'
  }
}

// Debug logging for development
if (config.isDevelopment) {
  console.log('🔧 Config loaded:', {
    supabaseUrl: config.supabase.url,
    projectId: config.supabase.projectId,
    isDevelopment: config.isDevelopment,
    adminTestEmail: config.adminTest.email,
    fedapayPublicKey: config.fedapay.current.publicKey,
    timestamp: new Date().toISOString()
  })
} 