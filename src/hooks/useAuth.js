import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, logout, getCurrentAdmin, subscribeToAuthChanges } from '../services/authService'

export default function useAuth() {
  const [admin, setAdmin] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Check initial auth status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        const adminData = await getCurrentAdmin()
        
        if (adminData) {
          setAdmin(adminData.admin)
          setIsAuthenticated(true)
        } else {
          setAdmin(null)
          setIsAuthenticated(false)
        }
      } catch (err) {
        console.error('Auth check error:', err)
        setAdmin(null)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Subscribe to auth state changes
    const { data: { subscription } } = subscribeToAuthChanges(({ isAuthenticated: authStatus, admin: adminData }) => {
      setIsAuthenticated(authStatus)
      setAdmin(adminData)
      setLoading(false)
    })

    return () => subscription?.unsubscribe()
  }, [])

  // Login function
  const loginAdmin = useCallback(async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await login(email, password)
      
      if (!result || !result.admin) {
        throw new Error('Invalid login response')
      }
      
      setAdmin(result.admin)
      setIsAuthenticated(true)
      
      // Navigate after state is updated
      navigate('/admin/dashboard')
      
      return result
    } catch (err) {
      console.error('Login error in useAuth:', err)
      setError(err.message || 'Login failed. Please try again.')
      throw err
    } finally {
      setLoading(false)
    }
  }, [navigate])

  // Logout function
  const logoutAdmin = useCallback(async () => {
    try {
      setLoading(true)
      await logout()
      
      setAdmin(null)
      setIsAuthenticated(false)
      
      // Redirect to login page
      navigate('/admin/login')
    } catch (err) {
      console.error('Logout error:', err)
      // Even if logout fails, clear local state
      setAdmin(null)
      setIsAuthenticated(false)
      navigate('/admin/login')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    admin,
    isAuthenticated,
    loading,
    error,
    login: loginAdmin,
    logout: logoutAdmin,
    clearError
  }
}
