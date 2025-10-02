import FranchiseCard from '../franchise/FranchiseCard'

export default function FranchiseGrid({
  items = [],
  franchises = [], // Add support for franchises prop used in SearchResults.jsx
  loading = false,
  emptyMessage = 'No franchises found',
  page = 1,
  pageSize = 12,
  total = 0,
  onPageChange,
}) {
  // Use franchises prop if provided, otherwise use items
  const franchiseItems = franchises.length > 0 ? franchises : items
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="w-full">
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: Math.min(pageSize, 8) }).map((_, idx) => (
            <div key={idx} className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-16 w-16 rounded-lg bg-slate-200" />
              <div className="mt-4 h-4 w-2/3 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
              <div className="mt-4 h-3 w-full rounded bg-slate-200" />
              <div className="mt-2 h-3 w-5/6 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-2/3 rounded bg-slate-200" />
              <div className="mt-5 h-9 w-full rounded-lg bg-slate-200" />
            </div>
          ))}
        </div>
      ) : franchiseItems.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-slate-900">{emptyMessage}</h3>
          <p className="mt-2 text-slate-600">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8">
            {franchiseItems.map((item) => (
              <FranchiseCard 
                key={item.id} 
                {...item} 
                industry={item.industries?.name || item.industry}
                min_area={item.min_area}
                max_area={item.max_area}
                area_unit={item.area_unit || 'Sq.ft'}
                franchise_outlets={item.franchise_outlets}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => onPageChange?.(page - 1)}
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
              <button
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                disabled={page >= totalPages}
                onClick={() => onPageChange?.(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}


