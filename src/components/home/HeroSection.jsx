import { useEffect, useMemo, useState } from 'react'
import { Tab } from '@headlessui/react'
import { Search, ChevronDown } from 'lucide-react'
import {
  fetchIndustries,
  fetchSectorsByIndustry,
  fetchServicesBySector,
  fetchStates,
  fetchCitiesByState,
  searchByCategories,
  searchByLocation,
  searchByInvestment,
} from './SearchFilters'
import { useNavigate } from 'react-router-dom'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function HeroSection() {
  const navigate = useNavigate()

  const [industries, setIndustries] = useState([])
  const [states, setStates] = useState([])

  // Category tab state
  const [catIndustry, setCatIndustry] = useState('')
  const [catSectors, setCatSectors] = useState([])
  const [catSector, setCatSector] = useState('')
  const [catServices, setCatServices] = useState([])
  const [catService, setCatService] = useState('')

  // Location tab state
  const [locIndustry, setLocIndustry] = useState('')
  const [locState, setLocState] = useState('')
  const [locCities, setLocCities] = useState([])
  const [locCity, setLocCity] = useState('')

  // Investment tab state
  const [invIndustry, setInvIndustry] = useState('')
  const [invMin, setInvMin] = useState('')
  const [invMax, setInvMax] = useState('')

  // Initial loads
  useEffect(() => {
    fetchIndustries().then(setIndustries).catch(() => setIndustries([]))
    fetchStates().then(setStates).catch(() => setStates([]))
  }, [])

  // Cascade fetches for category tab
  useEffect(() => {
    if (!catIndustry) {
      setCatSectors([])
      setCatSector('')
      setCatServices([])
      setCatService('')
      return
    }
    fetchSectorsByIndustry(catIndustry)
      .then(setCatSectors)
      .catch(() => setCatSectors([]))
    setCatSector('')
    setCatServices([])
    setCatService('')
  }, [catIndustry])

  useEffect(() => {
    if (!catSector) {
      setCatServices([])
      setCatService('')
      return
    }
    fetchServicesBySector(catSector)
      .then(setCatServices)
      .catch(() => setCatServices([]))
    setCatService('')
  }, [catSector])

  // Cascade fetches for location tab
  useEffect(() => {
    if (!locState) {
      setLocCities([])
      setLocCity('')
      return
    }
    fetchCitiesByState(locState)
      .then(setLocCities)
      .catch(() => setLocCities([]))
    setLocCity('')
  }, [locState])

  const invOptions = useMemo(() => [
    { label: '₹1 Lakh', value: 100000 },
    { label: '₹5 Lakhs', value: 500000 },
    { label: '₹10 Lakhs', value: 1000000 },
    { label: '₹25 Lakhs', value: 2500000 },
    { label: '₹50 Lakhs', value: 5000000 },
    { label: '₹1 Crore', value: 10000000 },
  ], [])

  const onSearchCategories = async () => {
    try {
      const { count } = await searchByCategories({
        industryId: catIndustry || null,
        sectorId: catSector || null,
        serviceId: catService || null,
        limit: 0,
      })
      navigate(`/search?type=category&industry=${catIndustry}&sector=${catSector}&service=${catService}&count=${count ?? 0}`)
    } catch (e) {
      navigate(`/search?type=category&industry=${catIndustry}&sector=${catSector}&service=${catService}`)
    }
  }

  const onSearchLocation = async () => {
    try {
      const { count } = await searchByLocation({
        industryId: locIndustry || null,
        stateId: locState || null,
        cityId: locCity || null,
        limit: 0,
      })
      navigate(`/search?type=location&industry=${locIndustry}&state=${locState}&city=${locCity}&count=${count ?? 0}`)
    } catch (e) {
      navigate(`/search?type=location&industry=${locIndustry}&state=${locState}&city=${locCity}`)
    }
  }

  const onSearchInvestment = async () => {
    try {
      const min = invMin ? Number(invMin) : null
      const max = invMax ? Number(invMax) : null
      const { count } = await searchByInvestment({
        industryId: invIndustry || null,
        minInvestment: min,
        maxInvestment: max,
        limit: 0,
      })
      navigate(`/search?type=investment&industry=${invIndustry}&min=${min ?? ''}&max=${max ?? ''}&count=${count ?? 0}`)
    } catch (e) {
      navigate(`/search?type=investment&industry=${invIndustry}&min=${invMin}&max=${invMax}`)
    }
  }

  return (
    <section className="flex items-center justify-center py-10">
      <div className="w-full max-w-5xl px-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Find Your Franchise</h2>
          <p className="text-lg text-white/80">Search from 100+ business options across industries, locations, and investments.</p>
        </div>
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-white/10 p-1 mb-8 backdrop-blur-md">
            {['Categories', 'Location', 'Investment'].map((tab) => (
              <Tab
                key={tab}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-3 text-base font-medium leading-5 text-white transition-all duration-200 font-sans',
                    selected 
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-md' 
                      : 'hover:bg-white/30 hover:text-white'
                  )
                }
              >
                {tab}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            {/* Categories */}
            <Tab.Panel className="p-0">
              <div className="grid gap-6 md:grid-cols-4">
                <div>
                      <label className="mb-3 block text-base font-bold text-white drop-shadow font-sans">Industry</label>
                  <select
                    value={catIndustry}
                    onChange={(e) => setCatIndustry(e.target.value)}
                    className="w-full rounded-lg border px-4 py-3 text-slate-800 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 font-sans text-base"
                  >
                    <option value="" className="text-slate-800">Select Industry</option>
                    {industries.map((i) => (
                      <option key={i.id} value={i.id} className="text-slate-800">{i.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                      <label className="mb-3 block text-base font-bold text-white drop-shadow font-sans">Sector</label>
                  <select
                    value={catSector}
                    onChange={(e) => setCatSector(e.target.value)}
                    disabled={!catSectors.length}
                    className="w-full rounded-lg border px-4 py-3 text-slate-800 placeholder-slate-500 disabled:bg-slate-100/50 disabled:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 font-sans text-base"
                  >
                    <option value="" className="text-slate-800">Select Sector</option>
                    {catSectors.map((s) => (
                      <option key={s.id} value={s.id} className="text-slate-800">{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                      <label className="mb-3 block text-base font-bold text-white drop-shadow font-sans">Service / Product</label>
                  <select
                    value={catService}
                    onChange={(e) => setCatService(e.target.value)}
                    disabled={!catServices.length}
                    className="w-full rounded-lg border px-4 py-3 text-slate-800 placeholder-slate-500 disabled:bg-slate-100/50 disabled:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 font-sans text-base"
                  >
                    <option value="" className="text-slate-800">Select Service/Product</option>
                    {catServices.map((sp) => (
                      <option key={sp.id} value={sp.id} className="text-slate-800">{sp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                      onClick={onSearchCategories}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#e3ae00] px-6 py-3 font-medium text-black shadow-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 font-sans text-base"
                  >
                    <Search className="h-5 w-5" />
                    Search
                  </button>
                </div>
              </div>
            </Tab.Panel>
            {/* Location */}
            <Tab.Panel className="p-0">
              <div className="grid gap-6 md:grid-cols-4">
                <div>
                      <label className="mb-3 block text-base font-bold text-white drop-shadow font-sans">Industry</label>
                  <select
                    value={locIndustry}
                    onChange={(e) => setLocIndustry(e.target.value)}
                    className="w-full rounded-lg border px-4 py-3 text-slate-800 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 font-sans text-base"
                  >
                    <option value="" className="text-slate-800">Select Industry</option>
                    {industries.map((i) => (
                      <option key={i.id} value={i.id} className="text-slate-800">{i.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                      <label className="mb-3 block text-base font-bold text-white drop-shadow font-sans">State</label>
                  <select
                    value={locState}
                    onChange={(e) => setLocState(e.target.value)}
                    className="w-full rounded-lg border px-4 py-3 text-slate-800 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 font-sans text-base"
                  >
                    <option value="" className="text-slate-800">Select State</option>
                    {states.map((s) => (
                      <option key={s.id} value={s.id} className="text-slate-800">{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                      <label className="mb-3 block text-base font-bold text-white drop-shadow font-sans">City</label>
                  <select
                    value={locCity}
                    onChange={(e) => setLocCity(e.target.value)}
                    disabled={!locCities.length}
                    className="w-full rounded-lg border px-4 py-3 text-slate-800 placeholder-slate-500 disabled:bg-slate-100/50 disabled:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 font-sans text-base"
                  >
                    <option value="" className="text-slate-800">Select City</option>
                    {locCities.map((c) => (
                      <option key={c.id} value={c.id} className="text-slate-800">{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                      onClick={onSearchLocation}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#e3ae00] px-6 py-3 font-medium text-black shadow-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 font-sans text-base"
                  >
                    <Search className="h-5 w-5" />
                    Search
                  </button>
                </div>
              </div>
            </Tab.Panel>
            {/* Investment */}
            <Tab.Panel className="p-0">
              <div className="grid gap-6 md:grid-cols-4">
                <div>
                    <label className="mb-3 block text-base font-bold text-white drop-shadow font-sans">Industry</label>
                  <select
                    value={invIndustry}
                    onChange={(e) => setInvIndustry(e.target.value)}
                    className="w-full rounded-lg border px-4 py-3 text-slate-800 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 font-sans text-base"
                  >
                    <option value="" className="text-slate-800">Select Industry</option>
                    {industries.map((i) => (
                      <option key={i.id} value={i.id} className="text-slate-800">{i.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-3 block text-base font-bold text-white drop-shadow font-sans">Min Investment</label>
                  <select
                    value={invMin}
                    onChange={(e) => setInvMin(e.target.value)}
                    className="w-full rounded-lg border px-4 py-3 text-slate-800 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 font-sans text-base"
                  >
                    <option value="" className="text-slate-800">Any</option>
                    {invOptions.map((o) => (
                      <option key={o.value} value={o.value} className="text-slate-800">{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-3 block text-base font-bold text-white drop-shadow font-sans">Max Investment</label>
                  <select
                    value={invMax}
                    onChange={(e) => setInvMax(e.target.value)}
                    className="w-full rounded-lg border px-4 py-3 text-slate-800 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 font-sans text-base"
                  >
                    <option value="" className="text-slate-800">Any</option>
                    {invOptions.map((o) => (
                      <option key={o.value} value={o.value} className="text-slate-800">{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                      onClick={onSearchInvestment}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#e3ae00] px-6 py-3 font-medium text-black shadow-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 font-sans text-base"
                  >
                    <Search className="h-5 w-5" />
                    Search
                  </button>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </section>
  )
}


