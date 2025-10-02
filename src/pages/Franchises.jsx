import { useState, useEffect } from 'react'
import SimpleNavbar from '../components/common/SimpleNavbar'
import Footer from '../components/common/Footer'
import FranchiseGrid from '../components/home/FranchiseGrid'
import { getAllFranchises } from '../services/franchiseService'

export default function Franchises() {
  const [franchises, setFranchises] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 12

  useEffect(() => {
    const loadFranchises = async () => {
      setLoading(true)
      try {
        const allFranchises = await getAllFranchises()
        const offset = (page - 1) * pageSize
        const paginatedFranchises = allFranchises.slice(offset, offset + pageSize)
        setFranchises(paginatedFranchises)
        setTotal(allFranchises.length)
      } catch (error) {
        console.error('Failed to load franchises:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadFranchises()
  }, [page, pageSize])

  const handlePageChange = (newPage) => {
    setPage(newPage)
    window.scrollTo(0, 0)
  }

  return (
    <div className="flex min-h-full flex-col">
  <SimpleNavbar />
      <main className="flex-1 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Franchises</h1>
            <p className="mt-2 text-slate-600">Explore available franchise opportunities.</p>
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <FranchiseGrid 
              items={franchises}
              loading={loading}
              page={page}
              pageSize={pageSize}
              total={Math.max(franchises.length, total)}
              onPageChange={handlePageChange}
              emptyMessage="No franchises available at the moment"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}


