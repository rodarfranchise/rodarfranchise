import { supabase, isSupabaseInitialized, testSupabaseConnection } from './supabase'
import { mockLogin, mockLogout, mockGetCurrentAdmin, isMockAuthActive } from './mockAuth'

// Login admin with email and password
export async function login(email, password) {
  try {
    // Check for development mode flag to use mock auth
    const useMockAuth = localStorage.getItem('use_mock_auth') === 'true';
    
    if (useMockAuth) {
      return await mockLogin(email, password)
    }
    
    // Check if Supabase client is initialized
    if (!isSupabaseInitialized()) {
      throw new Error('Database connection unavailable. Please try again later.')
    }
    
    // Add network error handling
    if (!navigator.onLine) {
      throw new Error('Network connection unavailable. Please check your internet connection and try again.')
    }
    
    // Test connection before attempting login
    const connectionTest = await testSupabaseConnection().catch(() => ({ success: false }));
    if (!connectionTest.success) {
      throw new Error('Database connection failed. Please try again later.')
    }
    
    // Attempt login without artificial timeout
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message || 'Authentication failed')
    }
    
    if (!data || !data.user) {
      throw new Error('No user data returned')
    }

    // Verify this is an admin user by checking the admins table
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id, name, email')
      .eq('email', data.user.email)
      .single()

    if (adminError || !adminData) {
      // User exists in auth but not in admins table - log them out
      await supabase.auth.signOut()
      throw new Error('Access denied. Admin privileges required.')
    }

    return {
      user: data.user,
      admin: adminData,
      session: data.session
    }
  } catch (error) {
    throw new Error(error.message || 'Login failed')
  }
}

// Logout current admin
export async function logout() {
  try {
    // Check if using mock auth
    if (localStorage.getItem('use_mock_auth') === 'true' || isMockAuthActive()) {
      return await mockLogout()
    }
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
    return true
  } catch (error) {
    throw new Error(error.message || 'Logout failed')
  }
}

// Get current admin user
export async function getCurrentAdmin() {
  try {
    // Check if using mock auth
    if (localStorage.getItem('use_mock_auth') === 'true' || isMockAuthActive()) {
      return await mockGetCurrentAdmin()
    }
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return null
    }

    // Get admin details from admins table
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id, name, email')
      .eq('email', user.email)
      .single()

    if (adminError || !adminData) {
      return null
    }

    return {
      user,
      admin: adminData
    }
  } catch (error) {
    return null
  }
}

// Check authentication status
export async function checkAuthStatus() {
  try {
    // Check if using mock auth
    if (localStorage.getItem('use_mock_auth') === 'true' || isMockAuthActive()) {
      const admin = await mockGetCurrentAdmin()
      return { 
        isAuthenticated: !!admin, 
        admin: admin || null 
      }
    }
    
    // Check if Supabase is available
    if (!isSupabaseInitialized()) {
      return { isAuthenticated: false, admin: null }
    }
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { isAuthenticated: false, admin: null }
    }

    // Verify admin status
    const admin = await getCurrentAdmin()
    if (!admin) {
      return { isAuthenticated: false, admin: null }
    }

    return { isAuthenticated: true, admin }
  } catch (error) {
    return { isAuthenticated: false, admin: null }
  }
}

// Subscribe to auth state changes
export function subscribeToAuthChanges(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    // Use a micro-delay to ensure Supabase session/storage is fully settled
    if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && session?.user) {
      setTimeout(async () => {
        const admin = await getCurrentAdmin()
        callback({ isAuthenticated: !!admin, admin: admin || null })
      }, 0)
    } else if (event === 'SIGNED_OUT') {
      // No delay needed when signing out
      callback({ isAuthenticated: false, admin: null })
    }
  })

  // Return the same shape that callers expect
  return { data: { subscription } }
}

// Clear all authentication data (useful for debugging)
export function clearAuthData() {
  try {
    // Clear Supabase session
    if (isSupabaseInitialized()) {
      supabase.auth.signOut()
    }
    
    // Clear mock auth data
    localStorage.removeItem('mock_auth_token')
    localStorage.removeItem('mock_auth_user')
    localStorage.removeItem('use_mock_auth')
  } catch (error) {
    console.error('Error clearing auth data:', error)
  }
}

// Create admin user (for initial setup - should be removed in production)
export async function createAdmin(email, password, name) {
  try {
    // First create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      throw new Error(authError.message)
    }

    // Then add to admins table
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .insert([
        {
          email,
          name,
          // Note: In production, you'd want to hash the password before storing
          // For now, we'll store a placeholder since Supabase Auth handles the actual password
          password_hash: 'managed_by_supabase_auth'
        }
      ])
      .select()
      .single()

    if (adminError) {
      throw new Error(adminError.message)
    }

    return adminData
  } catch (error) {
    throw new Error(error.message || 'Failed to create admin')
  }
}
