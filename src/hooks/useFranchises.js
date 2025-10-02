import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getAllFranchises,
  searchFranchises,
  getIndustries,
  getSectorsByIndustry,
  getServicesBySector,
  getStates,
  getCitiesByState,
} from '../services/franchiseService'

export default function useFranchises(initialFilters = {}) {
  const [franchises, setFranchises] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState(initialFilters)

  const [industries, setIndustries] = useState([])
  const [states, setStates] = useState([])
  const [sectors, setSectors] = useState([])
  const [services, setServices] = useState([])
  const [cities, setCities] = useState([])

  // Load lookups
  useEffect(() => {
    ;(async () => {
      try {
        const [ind, st] = await Promise.all([getIndustries(), getStates()])
        setIndustries(ind || [])
        setStates(st || [])
      } catch (e) {
        // no-op
      }
    })()
  }, [])

  // Cascade sector/services when industry/sector changes
  useEffect(() => {
    if (!filters.industryId) {
      setSectors([])
      setServices([])
      return
    }
    getSectorsByIndustry(filters.industryId)
      .then((s) => setSectors(s || []))
      .catch(() => setSectors([]))
  }, [filters.industryId])

  useEffect(() => {
    if (!filters.sectorId) {
      setServices([])
      return
    }
    getServicesBySector(filters.sectorId)
      .then((s) => setServices(s || []))
      .catch(() => setServices([]))
  }, [filters.sectorId])

  // Cascade cities when state changes
  useEffect(() => {
    if (!filters.stateId) {
      setCities([])
      return
    }
    getCitiesByState(filters.stateId)
      .then((c) => setCities(c || []))
      .catch(() => setCities([]))
  }, [filters.stateId])

  const load = useCallback(async (f = filters) => {
    setLoading(true)
    setError('')
    try {
      const hasAnyFilter = Boolean(
        f.industryId || f.stateId || f.cityId || f.minInvestment != null || f.maxInvestment != null || f.q
      )
      if (hasAnyFilter) {
        const { data, count } = await searchFranchises(f)
        setFranchises(data || [])
        setCount(count || 0)
      } else {
        const data = await getAllFranchises({ limit: f.limit || 50, offset: f.offset || 0 })
        setFranchises(data || [])
        setCount(data?.length || 0)
      }
    } catch (e) {
      setError(e?.message || 'Failed to load franchises')
      setFranchises([])
      setCount(0)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Initial load
  useEffect(() => {
    load(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateFilters = useCallback((next) => {
    setFilters((prev) => ({ ...prev, ...next }))
  }, [])

  return {
    franchises,
    count,
    loading,
    error,
    filters,
    setFilters: updateFilters,
    reload: () => load(filters),
    lookups: {
      industries,
      states,
      sectors,
      services,
      cities,
    },
  }
}


