import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
import SimpleNavbar from '../components/common/SimpleNavbar'
import Footer from '../components/common/Footer'
import FranchiseGrid from '../components/home/FranchiseGrid'
import {
  getIndustries,
  getStates,
  getCitiesByState,
  searchFranchises,
  getAllFranchises,
} from '../services/franchiseService'

const PAGE_SIZE = 12
const INR_LAKH = 100000

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Lookups
  const [industries, setIndustries] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])

  // UI state
  const [showFiltersMobile, setShowFiltersMobile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters state (derived from URL params initially, but with no default filters)
  const [selectedIndustryIds, setSelectedIndustryIds] = useState(
    (searchParams.get('industries') || '').split(',').filter(Boolean)
  )
  const [stateId, setStateId] = useState(searchParams.get('state') || '')
  const [cityId, setCityId] = useState(searchParams.get('city') || '')
  const [minInvestmentL, setMinInvestmentL] = useState(
    searchParams.get('minInvL') ? Number(searchParams.get('minInvL')) : 0
  )
  const [maxInvestmentL, setMaxInvestmentL] = useState(
    searchParams.get('maxInvL') ? Number(searchParams.get('maxInvL')) : 100
  )
  const [minArea, setMinArea] = useState(searchParams.get('minArea') ? Number(searchParams.get('minArea')) : 0)
  const [maxArea, setMaxArea] = useState(searchParams.get('maxArea') ? Number(searchParams.get('maxArea')) : 2000)
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

  // Data
  const [franchises, setFranchises] = useState([])
  const [totalCount, setTotalCount] = useState(0)

  // Load lookups
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [inds, sts] = await Promise.all([getIndustries(), getStates()])
        setIndustries(inds || [])
        setStates(sts || [])
      } catch (e) {
        setError(e.message || 'Failed to load filters')
      }
    }
    loadLookups()
  }, [])

  // Load cities when state changes
  useEffect(() => {
    const loadCities = async () => {
      if (!stateId) {
        setCities([])
        return
      }
      try {
        const res = await getCitiesByState(stateId)
        setCities(res || [])
      } catch (e) {
        setError(e.message || 'Failed to load cities')
      }
    }
    loadCities()
  }, [stateId])

  // Sync URL params whenever filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedIndustryIds.length) params.set('industries', selectedIndustryIds.join(','))
    if (stateId) params.set('state', stateId)
    if (cityId) params.set('city', cityId)
    if (minInvestmentL) params.set('minInvL', String(minInvestmentL))
    if (maxInvestmentL !== 100) params.set('maxInvL', String(maxInvestmentL))
    if (minArea) params.set('minArea', String(minArea))
    if (maxArea !== 2000) params.set('maxArea', String(maxArea))
    if (sortBy !== 'newest') params.set('sort', sortBy)
    if (page > 1) params.set('page', String(page))
    setSearchParams(params)
  }, [selectedIndustryIds, stateId, cityId, minInvestmentL, maxInvestmentL, minArea, maxArea, sortBy, page, setSearchParams])

  // Fetch results whenever filters/sort/page change
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      setError('')
      try {
        // Check if any meaningful filters are applied
        const hasFilters = selectedIndustryIds.length > 0 || 
                          stateId || 
                          cityId || 
                          minInvestmentL > 0 || 
                          maxInvestmentL < 100 || 
                          minArea > 0 || 
                          maxArea < 2000

        if (hasFilters) {
          // Use searchFranchises when filters are applied
          const filters = {
            industryIds: selectedIndustryIds.length > 0 ? selectedIndustryIds : null,
            stateId: stateId || null,
            cityId: cityId || null,
            // Investment filtering: looking for franchises with overlapping investment ranges
            minInvestment: minInvestmentL > 0 ? minInvestmentL * INR_LAKH : null,
            maxInvestment: maxInvestmentL < 100 ? maxInvestmentL * INR_LAKH : null,
            minArea: minArea > 0 ? minArea : null,
            maxArea: maxArea < 2000 ? maxArea : null,
            page,
            pageSize: PAGE_SIZE,
            sortBy,
          }
          
          const franchiseResults = await searchFranchises('', filters)
          setFranchises(franchiseResults || [])
          setTotalCount((franchiseResults || []).length)
        } else {
          // Use getAllFranchises when no filters are applied (same as Home page)
          const allFranchises = await getAllFranchises()
          
          // Apply client-side pagination
          const offset = (page - 1) * PAGE_SIZE
          const paginatedFranchises = allFranchises.slice(offset, offset + PAGE_SIZE)
          
          setFranchises(paginatedFranchises)
          setTotalCount(allFranchises.length)
        }
      } catch (e) {
        setError(e.message || 'Failed to load results')
        setFranchises([])
        setTotalCount(0)
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [selectedIndustryIds, stateId, cityId, minInvestmentL, maxInvestmentL, minArea, maxArea, sortBy, page])

  const totalPages = useMemo(() => Math.max(1, Math.ceil((totalCount || 0) / PAGE_SIZE)), [totalCount])
  
  // Check if any meaningful filters are applied (same logic as fetchResults)
  const hasActiveFilters = useMemo(() => {
    return selectedIndustryIds.length > 0 || 
           stateId || 
           cityId || 
           minInvestmentL > 0 || 
           maxInvestmentL < 100 || 
           minArea > 0 || 
           maxArea < 2000
  }, [selectedIndustryIds, stateId, cityId, minInvestmentL, maxInvestmentL, minArea, maxArea])

  const clearAll = () => {
    setSelectedIndustryIds([])
    setStateId('')
    setCityId('')
    setMinInvestmentL(0)
    setMaxInvestmentL(100)
    setMinArea(0)
    setMaxArea(2000)
    setSortBy('newest')
    setPage(1)
    // Clear URL parameters
    setSearchParams({})
  }

  // Sorting label mapping
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'inv_asc', label: 'Investment: Low to High' },
    { value: 'inv_desc', label: 'Investment: High to Low' },
    { value: 'alpha', label: 'Alphabetical' },
  ]

  const Sidebar = (
    <aside className="w-full md:w-72 shrink-0">
      <div className="sticky top-20 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Filters</h2>
          {hasActiveFilters && (
            <button onClick={clearAll} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Clear all</button>
          )}
        </div>

        {/* Industries */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Industries</h3>
          <div className="max-h-48 overflow-auto space-y-2">
            {industries.map(ind => {
              const checked = selectedIndustryIds.includes(String(ind.id))
              return (
                <label key={ind.id} className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer hover:text-slate-900">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={checked}
                    onChange={(e) => {
                      setPage(1)
                      if (e.target.checked) {
                        setSelectedIndustryIds(prev => [...prev, String(ind.id)])
                      } else {
                        setSelectedIndustryIds(prev => prev.filter(id => id !== String(ind.id)))
                      }
                    }}
                  />
                  {ind.name}
                </label>
              )
            })}
          </div>
        </div>

        {/* Investment Range */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Investment Range</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>₹{minInvestmentL}L</span>
              <span>₹{maxInvestmentL}L</span>
            </div>
            <div className="px-2">
              <input
                type="range"
                min={0}
                max={maxInvestmentL}
                step={1}
                value={Math.min(minInvestmentL, maxInvestmentL)}
                onChange={(e) => { setPage(1); setMinInvestmentL(Number(e.target.value)) }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <input
                type="range"
                min={minInvestmentL}
                max={100}
                step={1}
                value={Math.max(maxInvestmentL, minInvestmentL)}
                onChange={(e) => { setPage(1); setMaxInvestmentL(Number(e.target.value)) }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 -mt-2"
              />
            </div>
          </div>
        </div>

        {/* Area Requirement */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Area Required (sqft)</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min={0}
              value={minArea}
              onChange={(e) => { setPage(1); setMinArea(Number(e.target.value)) }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Min"
            />
            <input
              type="number"
              min={0}
              value={maxArea}
              onChange={(e) => { setPage(1); setMaxArea(Number(e.target.value)) }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Max"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Location</h3>
          <div className="space-y-3">
            <select
              value={stateId}
              onChange={(e) => { setPage(1); setStateId(e.target.value); setCityId('') }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All States</option>
              {states.map(st => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
            <select
              value={cityId}
              onChange={(e) => { setPage(1); setCityId(e.target.value) }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
              disabled={!stateId}
            >
              <option value="">All Cities</option>
              {cities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </aside>
  )

  const ResultsToolbar = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          {loading ? 'Searching...' : `${totalCount} Franchises`}
        </h1>
        <div className="sm:hidden">
          <button
            onClick={() => setShowFiltersMobile(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
          >
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => { setPage(1); setSortBy(e.target.value) }}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          {sortOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  )

  const Pagination = (
    <div className="flex items-center justify-center gap-2 pt-6">
      <button
        disabled={page <= 1}
        onClick={() => setPage(p => Math.max(1, p - 1))}
        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        <ChevronLeft className="h-4 w-4" /> Previous
      </button>
      <span className="px-4 py-2 text-sm text-slate-700 font-medium">
        {page} of {totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        Next <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )

  const NoResults = (
    <div className="text-center py-16">
      <p className="text-lg font-semibold text-slate-900">No results found</p>
      <p className="mt-2 text-slate-600">Try adjusting your filters:</p>
      <ul className="mt-4 text-sm text-slate-600 space-y-1">
        <li>• Widen the investment range</li>
        <li>• Remove some industry filters</li>
        <li>• Expand area requirements</li>
        <li>• Choose a different location</li>
      </ul>
      <button onClick={clearAll} className="mt-6 inline-flex items-center px-4 py-2 bg-brand-blue-600 text-white rounded-lg hover:bg-brand-blue-700">
        Clear all filters
      </button>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <SimpleNavbar />

      {/* Mobile filters drawer */}
      {showFiltersMobile && (
        <div className="fixed inset-0 z-50 bg-black/40 sm:hidden" onClick={() => setShowFiltersMobile(false)}>
          <div className="absolute inset-y-0 right-0 w-5/6 max-w-sm bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
              <button onClick={() => setShowFiltersMobile(false)} className="p-2 rounded hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            {Sidebar}
          </div>
        </div>
      )}

      <main className="flex-1 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <div className="hidden md:block">
              {Sidebar}
            </div>

            <div className="flex-1 min-w-0">
              {ResultsToolbar}

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                {loading ? (
                  <div className="py-16 text-center text-slate-600">Loading results...</div>
                ) : franchises.length === 0 ? (
                  NoResults
                ) : (
                  <>
                    <FranchiseGrid 
                      items={franchises} 
                      loading={false}
                      page={page}
                      pageSize={PAGE_SIZE}
                      total={totalCount}
                    />
                    {Pagination}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
