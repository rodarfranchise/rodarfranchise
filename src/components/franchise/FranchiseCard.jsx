import { Link } from 'react-router-dom'
import { Building2, MapPin, IndianRupee, Scan, Store } from 'lucide-react'

function formatInvestment(min, max) {
  const toLakh = (v) => {
    if (v == null) return null
    const lakh = Math.round(Number(v) / 100000)
    return `${lakh}L`
  }
  const a = toLakh(min)
  const b = toLakh(max)
  if (a && b) return `₹${a} - ${b}`
  if (a) return `₹${a}+`
  if (b) return `Up to ₹${b}`
  return '—'
}

function formatArea(min, max, unit = 'sqft') {
  if (!min && !max) return '—'
  if (min && max) return `${min}-${max} ${unit.replace(/\bft\b/i, 'ft')}`
  if (min) return `${min}+ ${unit}`
  return `${max} ${unit}`
}

export default function FranchiseCard({
  id,
  brand_name,
  tagline,
  logo_url,
  industry, // string or { name }
  min_investment,
  max_investment,
  min_area,
  max_area,
  area_unit = 'Sq.ft',
  franchise_outlets,
  className = '',
}) {
  const industryName = typeof industry === 'string' ? industry : industry?.name
  const investment = formatInvestment(min_investment, max_investment)
  const area = formatArea(min_area, max_area, area_unit)

  return (
    <div className={`group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md ${className}`}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center">
            {logo_url ? (
              <img src={logo_url} alt={`${brand_name} logo`} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-7 w-7 text-slate-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-slate-900 group-hover:text-brand-blue-700">
              {brand_name}
            </h3>
            {tagline && (
              <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{tagline}</p>
            )}
            {industryName && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
                <Store className="h-3.5 w-3.5" />
                <span>{industryName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2 text-slate-600">
            <IndianRupee className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Investment</p>
              <p className="font-medium text-slate-900">{investment}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Scan className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Area Required</p>
              <p className="font-medium text-slate-900">{area}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Store className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Outlets</p>
              <p className="font-medium text-slate-900">{franchise_outlets ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Category</p>
              <p className="font-medium text-slate-900">{industryName ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Learn more about this opportunity</span>
          <Link
            to={`/franchise/${id}`}
            className="inline-flex items-center justify-center rounded-lg bg-brand-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-blue-700 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:ring-offset-2"
          >
            Know More
          </Link>
        </div>
      </div>
    </div>
  )
}


