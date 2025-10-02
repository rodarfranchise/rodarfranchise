import { useEffect, useMemo, useState } from 'react'
import { Tab } from '@headlessui/react'
import { Plus, Edit, Trash2, Save, X, ChevronDown, Building2, List, Factory, Globe, MapPin } from 'lucide-react'
import {
  getIndustries,
  createIndustry,
  updateIndustry,
  deleteIndustry,
  getSectors,
  getSectorsByIndustry,
  createSector,
  updateSector,
  deleteSector,
  getServices,
  getServicesBySector,
  createService,
  updateService,
  deleteService,
  getStates,
  createState,
  updateState,
  deleteState,
  getCities,
  getCitiesByState,
  createCity,
  updateCity,
  deleteCity,
} from '../../services/adminService'

function SectionHeader({ icon: Icon, title, subtitle, cta }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
        </div>
      </div>
      {cta}
    </div>
  )
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="text-center py-12">
      <p className="text-slate-900 font-medium">{title}</p>
      {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
    </div>
  )
}

export default function CategoryManager() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [industries, setIndustries] = useState([])
  const [sectors, setSectors] = useState([])
  const [services, setServices] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])

  const [selectedIndustryId, setSelectedIndustryId] = useState('')
  const [selectedSectorId, setSelectedSectorId] = useState('')
  const [selectedStateId, setSelectedStateId] = useState('')

  const [form, setForm] = useState({ name: '', parentId: '' })
  const [editing, setEditing] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true)
        const [ind, sec, srv, sts, cts] = await Promise.all([
          getIndustries(),
          getSectors(),
          getServices(),
          getStates(),
          getCities(),
        ])
        setIndustries(ind)
        setSectors(sec)
        setServices(srv)
        setStates(sts)
        setCities(cts)
      } catch (e) {
        setError(e.message || 'Failed to load categories')
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [])

  // Dependent options
  const filteredSectors = useMemo(() => {
    if (!selectedIndustryId) return sectors
    return sectors.filter(s => String(s.industry_id || s.industry?.id) === String(selectedIndustryId))
  }, [sectors, selectedIndustryId])

  const filteredServices = useMemo(() => {
    if (!selectedSectorId) return services
    return services.filter(s => String(s.sector_id || s.sector?.id) === String(selectedSectorId))
  }, [services, selectedSectorId])

  const filteredCities = useMemo(() => {
    if (!selectedStateId) return cities
    return cities.filter(c => String(c.state_id || c.state?.id) === String(selectedStateId))
  }, [cities, selectedStateId])

  const resetForm = () => {
    setForm({ name: '', parentId: '' })
    setEditing(null)
  }

  // Handlers per tab
  const onCreate = async () => {
    try {
      setSubmitting(true)
      setError('')
      if (!form.name.trim()) {
        setError('Name is required')
        return
      }
      if (activeTab === 0) {
        const created = await createIndustry(form.name.trim())
        setIndustries(prev => [...prev, created])
      } else if (activeTab === 1) {
        if (!selectedIndustryId) throw new Error('Select an industry')
        const created = await createSector(form.name.trim(), selectedIndustryId)
        setSectors(prev => [...prev, created])
      } else if (activeTab === 2) {
        if (!selectedSectorId) throw new Error('Select a sector')
        const created = await createService(form.name.trim(), selectedSectorId)
        setServices(prev => [...prev, created])
      } else if (activeTab === 3) {
        const created = await createState(form.name.trim())
        setStates(prev => [...prev, created])
      } else if (activeTab === 4) {
        if (!selectedStateId) throw new Error('Select a state')
        const created = await createCity(form.name.trim(), selectedStateId)
        setCities(prev => [...prev, created])
      }
      resetForm()
    } catch (e) {
      setError(e.message || 'Failed to create item')
    } finally {
      setSubmitting(false)
    }
  }

  const onStartEdit = (item) => {
    setEditing(item)
    setForm({ name: item.name || '', parentId: '' })
  }

  const onSaveEdit = async () => {
    try {
      setSubmitting(true)
      setError('')
      if (!editing) return
      if (!form.name.trim()) {
        setError('Name is required')
        return
      }
      const id = editing.id
      if (activeTab === 0) {
        const updated = await updateIndustry(id, form.name.trim())
        setIndustries(prev => prev.map(i => i.id === id ? updated : i))
      } else if (activeTab === 1) {
        const updated = await updateSector(id, { name: form.name.trim(), industry_id: selectedIndustryId || editing.industry_id })
        setSectors(prev => prev.map(s => s.id === id ? updated : s))
      } else if (activeTab === 2) {
        const updated = await updateService(id, { name: form.name.trim(), sector_id: selectedSectorId || editing.sector_id })
        setServices(prev => prev.map(s => s.id === id ? updated : s))
      } else if (activeTab === 3) {
        const updated = await updateState(id, form.name.trim())
        setStates(prev => prev.map(s => s.id === id ? updated : s))
      } else if (activeTab === 4) {
        const updated = await updateCity(id, { name: form.name.trim(), state_id: selectedStateId || editing.state_id })
        setCities(prev => prev.map(c => c.id === id ? updated : c))
      }
      resetForm()
    } catch (e) {
      setError(e.message || 'Failed to update item')
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = async (item) => {
    try {
      setSubmitting(true)
      setError('')
      if (activeTab === 0) {
        await deleteIndustry(item.id)
        setIndustries(prev => prev.filter(i => i.id !== item.id))
      } else if (activeTab === 1) {
        await deleteSector(item.id)
        setSectors(prev => prev.filter(s => s.id !== item.id))
      } else if (activeTab === 2) {
        await deleteService(item.id)
        setServices(prev => prev.filter(s => s.id !== item.id))
      } else if (activeTab === 3) {
        await deleteState(item.id)
        setStates(prev => prev.filter(s => s.id !== item.id))
      } else if (activeTab === 4) {
        await deleteCity(item.id)
        setCities(prev => prev.filter(c => c.id !== item.id))
      }
    } catch (e) {
      setError(e.message || 'Delete failed')
    } finally {
      setSubmitting(false)
    }
  }

  const tabConfig = [
    { name: 'Industries', icon: Building2 },
    { name: 'Sectors', icon: List },
    { name: 'Services/Products', icon: Factory },
    { name: 'States', icon: Globe },
    { name: 'Cities', icon: MapPin },
  ]

  const listForActiveTab = () => {
    if (activeTab === 0) return industries
    if (activeTab === 1) return filteredSectors
    if (activeTab === 2) return filteredServices
    if (activeTab === 3) return states
    if (activeTab === 4) return filteredCities
    return []
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Manage Categories</h1>
              <p className="text-slate-600">Industries, sectors, services, states and cities</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="flex space-x-2 rounded-lg bg-white p-2 border border-slate-200 shadow-sm overflow-x-auto">
            {tabConfig.map((tab, idx) => (
              <Tab key={tab.name} className={({ selected }) => (
                `${selected ? 'bg-brand-blue-600 text-white' : 'bg-white text-slate-700'} inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue-500`
              )}>
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </Tab>
            ))}
          </Tab.List>

          <div className="mt-6 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            {/* Context filters for linked entities */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {activeTab >= 1 && activeTab <= 2 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Industry</label>
                  <select
                    value={selectedIndustryId}
                    onChange={(e) => { setSelectedIndustryId(e.target.value); setSelectedSectorId('') }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                  >
                    <option value="">All Industries</option>
                    {industries.map(ind => (
                      <option key={ind.id} value={ind.id}>{ind.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {activeTab === 2 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sector</label>
                  <select
                    value={selectedSectorId}
                    onChange={(e) => setSelectedSectorId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                  >
                    <option value="">All Sectors</option>
                    {filteredSectors.map(sec => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {activeTab === 4 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
                  <select
                    value={selectedStateId}
                    onChange={(e) => setSelectedStateId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                  >
                    <option value="">All States</option>
                    {states.map(st => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Create/Edit form */}
            <div className="mb-6">
              <SectionHeader
                icon={tabConfig[activeTab].icon}
                title={editing ? `Edit ${tabConfig[activeTab].name.slice(0, -1)}` : `Add ${tabConfig[activeTab].name.slice(0, -1)}`}
                subtitle={editing ? 'Update the selected item' : 'Create a new item'}
                cta={null}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                    placeholder={`Enter ${tabConfig[activeTab].name.slice(0, -1)} name`}
                  />
                </div>

                <div className="flex gap-3">
                  {editing ? (
                    <>
                      <button
                        onClick={onSaveEdit}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue-600 text-white rounded-lg hover:bg-brand-blue-700 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" /> Save
                      </button>
                      <button
                        onClick={resetForm}
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50"
                      >
                        <X className="h-4 w-4" /> Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={onCreate}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue-600 text-white rounded-lg hover:bg-brand-blue-700 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" /> Add
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* List */}
            <div className="border-t border-slate-200 pt-4">
              {loading ? (
                <EmptyState title="Loading..." subtitle="Please wait" />
              ) : listForActiveTab().length === 0 ? (
                <EmptyState title="No items found" subtitle="Add your first item above" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                        {(activeTab === 1 || activeTab === 2) && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Parent</th>
                        )}
                        {activeTab === 4 && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">State</th>
                        )}
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {listForActiveTab().map(item => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">{item.name}</div>
                          </td>
                          {(activeTab === 1) && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-600">
                                {industries.find(i => String(i.id) === String(item.industry_id || item.industry?.id))?.name || '-'}
                              </div>
                            </td>
                          )}
                          {(activeTab === 2) && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-600">
                                {sectors.find(s => String(s.id) === String(item.sector_id || item.sector?.id))?.name || '-'}
                              </div>
                            </td>
                          )}
                          {activeTab === 4 && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-600">
                                {states.find(s => String(s.id) === String(item.state_id || item.state?.id))?.name || '-'}
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => onStartEdit(item)}
                                className="text-slate-600 hover:text-slate-900 p-1"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => onDelete(item)}
                                disabled={submitting}
                                className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Tab.Group>
      </div>
    </div>
  )
}
