// Configuration for environment variables
// All values are now required from environment variables - no fallbacks

function getRequiredEnvVar(name: string): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

function getOptionalEnvVar(name: string): string {
  return import.meta.env[name] || '';
}

export const config = {
  // Supabase Configuration
  supabase: {
    url: getRequiredEnvVar('VITE_SUPABASE_URL'),
    anonKey: getRequiredEnvVar('VITE_SUPABASE_ANON_KEY'),
    projectId: getRequiredEnvVar('VITE_PROJECT_ID'),
  },

  // FedaPay Configuration
  fedapay: {
    // Sandbox keys (for development/staging)
    sandbox: {
      publicKey: getRequiredEnvVar('VITE_FEDAPAY_SANDBOX_PUBLIC_KEY'),
      secretKey: getRequiredEnvVar('VITE_FEDAPAY_SANDBOX_SECRET_KEY'),
      webhookSecret: getOptionalEnvVar('VITE_FEDAPAY_SANDBOX_WEBHOOK_SECRET'),
    },
    // Production keys
    production: {
      publicKey: getOptionalEnvVar('VITE_FEDAPAY_PRODUCTION_PUBLIC_KEY'),
      secretKey: getOptionalEnvVar('VITE_FEDAPAY_PRODUCTION_SECRET_KEY'),
      webhookSecret: getOptionalEnvVar('VITE_FEDAPAY_PRODUCTION_WEBHOOK_SECRET'),
    },
    // Current environment keys
    get current() {
      return config.isProduction ? this.production : this.sandbox;
    },
    // API Base URL
    apiUrl: 'https://api.fedapay.com/v1',
  },

  // Development Settings
  isDevelopment:
    import.meta.env.NODE_ENV === 'development' || import.meta.env.MODE === 'development',
  isProduction: import.meta.env.NODE_ENV === 'production' || import.meta.env.MODE === 'production',

  // Admin Test Credentials (for development only)
  adminTest: {
    email: getRequiredEnvVar('VITE_ADMIN_TEST_EMAIL'),
    password: getRequiredEnvVar('VITE_ADMIN_TEST_PASSWORD'),
  },

  // App Configuration
  app: {
    name: 'Nomad Lux',
    description: 'Premium property rental platform',
    version: '1.0.0',
  },
};

// Debug logging for development
if (config.isDevelopment) {
  console.log('🔧 Config loaded:', {
    supabaseUrl: config.supabase.url,
    projectId: config.supabase.projectId,
    isDevelopment: config.isDevelopment,
    adminTestEmail: config.adminTest.email,
    fedapayPublicKey: config.fedapay.current.publicKey,
    timestamp: new Date().toISOString(),
  });
}
