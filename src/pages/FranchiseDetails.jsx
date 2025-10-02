import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import SimpleNavbar from '../components/common/SimpleNavbar'
import Footer from '../components/common/Footer'
import FranchiseDetail from '../components/franchise/FranchiseDetail'
import { getFranchiseById } from '../services/franchiseService'

export default function FranchiseDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [franchise, setFranchise] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchFranchise() {
      if (!id) return
      
      try {
        setLoading(true)
        setError(null)
        const data = await getFranchiseById(id)
        setFranchise(data)
      } catch (err) {
        console.error('Failed to fetch franchise:', err)
        setError(err.message || 'Failed to load franchise details')
      } finally {
        setLoading(false)
      }
    }

    fetchFranchise()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
  <SimpleNavbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-brand-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading franchise details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
  <SimpleNavbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-red-500 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-slate-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-brand-blue-600 text-white px-4 py-2 rounded-lg hover:bg-brand-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!franchise) {
    return (
      <div className="flex min-h-screen flex-col">
  <SimpleNavbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-slate-400 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33M15 19.128v-.037c0-.332-.277-.605-.62-.605H9.62c-.343 0-.62.273-.62.605v.037c0 .332.277.605.62.605h4.76c.343 0 .62-.273.62-.605z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Franchise not found</h1>
            <p className="text-slate-600 mb-6">The franchise you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-brand-blue-600 text-white px-6 py-2 rounded-lg hover:bg-brand-blue-700 transition-colors"
            >
              Browse All Franchises
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SimpleNavbar showBackButton={true} backButtonText="Back to search results" />
      <main className="flex-1">
        <FranchiseDetail franchise={franchise} />
      </main>
      <Footer />
    </div>
  )
}
