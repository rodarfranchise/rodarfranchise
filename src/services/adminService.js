import { supabase } from './supabase'

// Utility to throw on Supabase error
function assertNoError(error, fallbackMessage = 'Unexpected error') {
  if (error) {
    throw new Error(error.message || fallbackMessage)
  }
}

// INDUSTRIES -------------------------------------------------
export async function getIndustries() {
  const { data, error } = await supabase
    .from('industries')
    .select('*')
    .order('name', { ascending: true })
  assertNoError(error, 'Failed to fetch industries')
  return data || []
}

export async function createIndustry(name) {
  const { data, error } = await supabase
    .from('industries')
    .insert([{ name }])
    .select()
    .single()
  assertNoError(error, 'Failed to create industry')
  return data
}

export async function updateIndustry(id, name) {
  const { data, error } = await supabase
    .from('industries')
    .update({ name })
    .eq('id', id)
    .select()
    .single()
  assertNoError(error, 'Failed to update industry')
  return data
}

export async function deleteIndustry(id) {
  // Prevent delete if sectors exist
  const { count, error: countError } = await supabase
    .from('sectors')
    .select('id', { count: 'exact', head: true })
    .eq('industry_id', id)
  assertNoError(countError)
  if ((count || 0) > 0) {
    throw new Error('Cannot delete industry with existing sectors. Delete sectors first.')
  }
  const { error } = await supabase
    .from('industries')
    .delete()
    .eq('id', id)
  assertNoError(error, 'Failed to delete industry')
  return true
}

// SECTORS ----------------------------------------------------
export async function getSectors() {
  const { data, error } = await supabase
    .from('sectors')
    .select('*, industry:industries(id, name)')
    .order('name', { ascending: true })
  assertNoError(error, 'Failed to fetch sectors')
  return data || []
}

export async function getSectorsByIndustry(industryId) {
  const { data, error } = await supabase
    .from('sectors')
    .select('*')
    .eq('industry_id', industryId)
    .order('name', { ascending: true })
  assertNoError(error, 'Failed to fetch sectors')
  return data || []
}

export async function createSector(name, industryId) {
  const { data, error } = await supabase
    .from('sectors')
    .insert([{ name, industry_id: industryId }])
    .select()
    .single()
  assertNoError(error, 'Failed to create sector')
  return data
}

export async function updateSector(id, { name, industry_id }) {
  const payload = {}
  if (name !== undefined) payload.name = name
  if (industry_id !== undefined) payload.industry_id = industry_id
  const { data, error } = await supabase
    .from('sectors')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  assertNoError(error, 'Failed to update sector')
  return data
}

export async function deleteSector(id) {
  // Prevent delete if services/products exist
  const { count, error: countError } = await supabase
    .from('services_products')
    .select('id', { count: 'exact', head: true })
    .eq('sector_id', id)
  assertNoError(countError)
  if ((count || 0) > 0) {
    throw new Error('Cannot delete sector with existing services/products. Delete them first.')
  }
  const { error } = await supabase
    .from('sectors')
    .delete()
    .eq('id', id)
  assertNoError(error, 'Failed to delete sector')
  return true
}

// SERVICES / PRODUCTS ---------------------------------------
export async function getServices() {
  const { data, error } = await supabase
    .from('services_products')
    .select('*, sector:sectors(id, name), industry:sectors(industry_id)')
    .order('name', { ascending: true })
  assertNoError(error, 'Failed to fetch services/products')
  return data || []
}

export async function getServicesBySector(sectorId) {
  const { data, error } = await supabase
    .from('services_products')
    .select('*')
    .eq('sector_id', sectorId)
    .order('name', { ascending: true })
  assertNoError(error, 'Failed to fetch services/products')
  return data || []
}

export async function createService(name, sectorId) {
  const { data, error } = await supabase
    .from('services_products')
    .insert([{ name, sector_id: sectorId }])
    .select()
    .single()
  assertNoError(error, 'Failed to create service/product')
  return data
}

export async function updateService(id, { name, sector_id }) {
  const payload = {}
  if (name !== undefined) payload.name = name
  if (sector_id !== undefined) payload.sector_id = sector_id
  const { data, error } = await supabase
    .from('services_products')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  assertNoError(error, 'Failed to update service/product')
  return data
}

export async function deleteService(id) {
  // Optionally prevent delete if referenced elsewhere; basic delete for now
  const { error } = await supabase
    .from('services_products')
    .delete()
    .eq('id', id)
  assertNoError(error, 'Failed to delete service/product')
  return true
}

// STATES -----------------------------------------------------
export async function getStates() {
  const { data, error } = await supabase
    .from('states')
    .select('*')
    .order('name', { ascending: true })
  assertNoError(error, 'Failed to fetch states')
  return data || []
}

export async function createState(name) {
  const { data, error } = await supabase
    .from('states')
    .insert([{ name }])
    .select()
    .single()
  assertNoError(error, 'Failed to create state')
  return data
}

export async function updateState(id, name) {
  const { data, error } = await supabase
    .from('states')
    .update({ name })
    .eq('id', id)
    .select()
    .single()
  assertNoError(error, 'Failed to update state')
  return data
}

export async function deleteState(id) {
  // Prevent delete if cities exist
  const { count, error: countError } = await supabase
    .from('cities')
    .select('id', { count: 'exact', head: true })
    .eq('state_id', id)
  assertNoError(countError)
  if ((count || 0) > 0) {
    throw new Error('Cannot delete state with existing cities. Delete cities first.')
  }
  const { error } = await supabase
    .from('states')
    .delete()
    .eq('id', id)
  assertNoError(error, 'Failed to delete state')
  return true
}

// CITIES -----------------------------------------------------
export async function getCities() {
  const { data, error } = await supabase
    .from('cities')
    .select('*, state:states(id, name)')
    .order('name', { ascending: true })
  assertNoError(error, 'Failed to fetch cities')
  return data || []
}

export async function getCitiesByState(stateId) {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('state_id', stateId)
    .order('name', { ascending: true })
  assertNoError(error, 'Failed to fetch cities')
  return data || []
}

export async function createCity(name, stateId) {
  const { data, error } = await supabase
    .from('cities')
    .insert([{ name, state_id: stateId }])
    .select()
    .single()
  assertNoError(error, 'Failed to create city')
  return data
}

export async function updateCity(id, { name, state_id }) {
  const payload = {}
  if (name !== undefined) payload.name = name
  if (state_id !== undefined) payload.state_id = state_id
  const { data, error } = await supabase
    .from('cities')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  assertNoError(error, 'Failed to update city')
  return data
}

export async function deleteCity(id) {
  const { error } = await supabase
    .from('cities')
    .delete()
    .eq('id', id)
  assertNoError(error, 'Failed to delete city')
  return true
}
