import { supabase } from '../../services/supabase'

// Data fetchers
export async function fetchIndustries() {
  const { data, error } = await supabase.from('industries').select('id, name').order('name', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchSectorsByIndustry(industryId) {
  if (!industryId) return []
  const { data, error } = await supabase
    .from('sectors')
    .select('id, name')
    .eq('industry_id', industryId)
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchServicesBySector(sectorId) {
  if (!sectorId) return []
  const { data, error } = await supabase
    .from('services_products')
    .select('id, name')
    .eq('sector_id', sectorId)
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchStates() {
  const { data, error } = await supabase.from('states').select('id, name').order('name', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchCitiesByState(stateId) {
  if (!stateId) return []
  const { data, error } = await supabase
    .from('cities')
    .select('id, name')
    .eq('state_id', stateId)
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

// Searchers
export async function searchByCategories({ industryId, sectorId, serviceId, limit = 24, offset = 0 }) {
  let query = supabase
    .from('franchise_listings')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)

  if (industryId) query = query.eq('industry_id', industryId)
  // sectorId and serviceId are not direct columns on franchise_listings in this schema.
  // Extend the schema to relate them if needed. For now, category search is industry-based.

  const { data, error, count } = await query
  if (error) throw error
  return { data, count }
}

export async function searchByLocation({ industryId, stateId, cityId, limit = 24, offset = 0 }) {
  // Schema does not directly relate states/cities to listings; assumes text arrays preferred_locations/expansion_states.
  // Example filter using preferred_locations text[] contains city name.
  let query = supabase
    .from('franchise_listings')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)

  if (industryId) query = query.eq('industry_id', industryId)
  if (cityId) {
    // Fetch city name then filter
    const { data: city } = await supabase.from('cities').select('name').eq('id', cityId).single()
    if (city?.name) query = query.contains('preferred_locations', [city.name])
  } else if (stateId) {
    // Fetch state name then filter
    const { data: state } = await supabase.from('states').select('name').eq('id', stateId).single()
    if (state?.name) query = query.contains('preferred_locations', [state.name])
  }

  const { data, error, count } = await query
  if (error) throw error
  return { data, count }
}

export async function searchByInvestment({ industryId, minInvestment, maxInvestment, limit = 24, offset = 0 }) {
  let query = supabase
    .from('franchise_listings')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)

  if (industryId) query = query.eq('industry_id', industryId)
  if (minInvestment != null) query = query.gte('min_investment', minInvestment)
  if (maxInvestment != null) query = query.lte('max_investment', maxInvestment)

  const { data, error, count } = await query
  if (error) throw error
  return { data, count }
}

export default {
  fetchIndustries,
  fetchSectorsByIndustry,
  fetchServicesBySector,
  fetchStates,
  fetchCitiesByState,
  searchByCategories,
  searchByLocation,
  searchByInvestment,
}


