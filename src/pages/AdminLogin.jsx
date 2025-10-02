import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLogin from '../components/admin/AdminLogin'
import useAuth from '../hooks/useAuth'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null
  }

  return <AdminLogin />
}
