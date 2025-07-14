/// <reference types="vite/client" />
/// <reference types="leaflet" />
/// <reference types="leaflet.markercluster" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_PROJECT_ID: string
  readonly VITE_ADMIN_TEST_EMAIL: string
  readonly VITE_ADMIN_TEST_PASSWORD: string
  readonly NODE_ENV: 'development' | 'production'
  readonly MODE: 'development' | 'production'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 