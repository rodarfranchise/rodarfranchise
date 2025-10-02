import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { checkAuthStatus } from '../../services/authService'

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        const { isAuthenticated: authStatus } = await checkAuthStatus()
        setIsAuthenticated(authStatus)
      } catch (error) {
        console.error('Auth check error:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect to login page, but save the attempted location
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children
}
