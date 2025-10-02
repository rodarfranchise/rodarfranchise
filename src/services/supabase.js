import { createClient } from '@supabase/supabase-js'

// Singleton pattern for Supabase client
class SupabaseClient {
  constructor() {
    if (SupabaseClient.instance) {
      return SupabaseClient.instance
    }

    // Load configuration from environment variables
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    this.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    this.supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY
    this.client = null
    this.storageClient = null

    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      // Fail fast during startup if env vars are missing
      console.error('[Supabase] Missing required environment variables:')
      if (!this.supabaseUrl) console.error('  - VITE_SUPABASE_URL')
      if (!this.supabaseAnonKey) console.error('  - VITE_SUPABASE_ANON_KEY')
      console.error('Please create a .env file with the required Supabase configuration.')
      console.error('See ENVIRONMENT_SETUP.md for details.')
      return
    }

    this.initialize()
    SupabaseClient.instance = this
  }

  initialize() {
    try {
      if (this.supabaseUrl && this.supabaseAnonKey) {
        
        // Create database client with anon key
        this.client = createClient(this.supabaseUrl, this.supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storageKey: 'supabase_auth_token',
          },
          global: {
            headers: {
              'X-Client-Info': 'franchise-admin-portal',
            },
          },
        })
        
        // Create storage client with service key (bypasses RLS)
        if (this.supabaseServiceKey) {
          this.storageClient = createClient(this.supabaseUrl, this.supabaseServiceKey, {
            global: {
              headers: {
                'X-Client-Info': 'franchise-admin-portal-storage',
              },
            },
          })
        } else {
          this.storageClient = this.client
        }
        
        // Test the connection immediately
        this.testConnection()
      } else {
        console.error('[Supabase] Cannot initialize client: missing configuration')
        this.client = null
        this.storageClient = null
      }
    } catch (error) {
      console.error('[Supabase] Failed to initialize client:', error)
      this.client = null
      this.storageClient = null
    }
  }
  
  async testConnection() {
    if (!this.client) return { success: false, error: 'Client not initialized' }
    
    try {
      const start = performance.now()
      const { error } = await this.client.from('admins').select('count', { count: 'exact', head: true })
      const end = performance.now()
      
      if (error) {
        console.error('❌ Supabase connection test failed:', error)
        return { success: false, error: error.message, latency: end - start }
      }
      
      return { success: true, latency: Math.round(end - start) }
    } catch (err) {
      console.error('❌ Supabase connection test error:', err)
      return { success: false, error: err.message }
    }
  }

  getClient() {
    return this.client
  }

  getStorageClient() {
    return this.storageClient
  }

  isInitialized() {
    return !!this.client
  }
}

// Create a single instance
const supabaseClientInstance = new SupabaseClient()

// Export the clients directly for easier usage
export const supabase = supabaseClientInstance.getClient()
export const storageClient = supabaseClientInstance.getStorageClient()

// Helper function to check if supabase is properly initialized
export function isSupabaseInitialized() {
  return supabaseClientInstance.isInitialized()
}

// Debug function to test Supabase connection
export async function testSupabaseConnection() {
  if (!isSupabaseInitialized()) {
    console.error('Cannot test connection: Supabase client not initialized')
    return { success: false, error: 'Client not initialized' }
  }
  
  try {
    // Try a simple query to test the connection
    const start = performance.now()
    const { error } = await supabase.from('admins').select('count', { count: 'exact', head: true })
    const end = performance.now()
    
    if (error) {
      console.error('Supabase connection test failed:', error)
      return { success: false, error: error.message, latency: end - start }
    }
    
    return { success: true, latency: Math.round(end - start) }
  } catch (err) {
    console.error('Supabase connection test error:', err)
    return { success: false, error: err.message }
  }
}

