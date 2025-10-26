import { X, Building2, DollarSign, MapPin, Calendar, Users, Clock, Award, Briefcase, Check, Phone, Mail, Home } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'
import { getCompleteFranchiseById } from '../../services/franchiseService'

export default function ViewFranchiseModal({ isOpen, onClose, franchise }) {
  const [currentFranchise, setCurrentFranchise] = useState(franchise)

  useEffect(() => {
    if (!isOpen || !franchise?.id) return

    // Ensure we start with latest details
    ;(async () => {
      try {
        const fresh = await getCompleteFranchiseById(franchise.id)
        if (fresh) setCurrentFranchise(fresh)
      } catch (e) {
        // Fallback to provided data on error
        setCurrentFranchise(franchise)
      }
    })()

    const channel = supabase
      .channel('franchise-listing-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'franchise_listings',
        filter: `id=eq.${franchise.id}`
      }, async (payload) => {
        try {
          const fresh = await getCompleteFranchiseById(franchise.id)
          if (fresh) setCurrentFranchise(fresh)
          else if (payload.new) setCurrentFranchise((prev) => ({ ...prev, ...payload.new }))
        } catch {
          if (payload.new) setCurrentFranchise((prev) => ({ ...prev, ...payload.new }))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isOpen, franchise?.id])

  useEffect(() => {
    if (franchise && !isOpen) setCurrentFranchise(franchise)
  }, [franchise, isOpen])

  if (!isOpen || !franchise) return null

  const formatCurrency = (amount) => {
    if (!amount) return '-'
    return `₹${(amount / 100000).toFixed(1)}L`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-yellow-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-yellow-200 bg-yellow-50/60 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{currentFranchise?.brand_name}</h2>
            <p className="text-sm text-slate-600 mt-1">{currentFranchise?.industries?.name || '-'}</p>
            {currentFranchise?.tagline && (
              <p className="text-xs text-slate-500 italic mt-1">"{currentFranchise.tagline}"</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Logo */}
            {currentFranchise?.logo_url && (
              <div className="bg-white p-4 rounded-lg flex justify-center border border-gray-200">
                <div className="w-40 h-40 overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <img 
                    src={currentFranchise.logo_url} 
                    alt={`${currentFranchise.brand_name} logo`} 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Brand Name</p>
                  <p className="text-sm font-medium text-slate-900">{currentFranchise?.brand_name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Industry</p>
                  <p className="text-sm font-medium text-slate-900">{currentFranchise?.industries?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Created</p>
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {currentFranchise?.created_at}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <p className={`text-sm font-medium inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    (currentFranchise?.status || (currentFranchise?.is_active ? 'active' : 'inactive')) === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {(currentFranchise?.status || (currentFranchise?.is_active ? 'active' : 'inactive')) === 'active' ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Establishment Year</p>
                  <p className="text-sm font-medium text-slate-900">{currentFranchise?.establishment_year || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Franchise Commenced Year</p>
                  <p className="text-sm font-medium text-slate-900">{currentFranchise?.franchise_commenced_year || '-'}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {currentFranchise?.description && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Description
                </h3>
                <p className="text-sm text-slate-700">{currentFranchise.description}</p>
              </div>
            )}

            {/* About Brand */}
            {currentFranchise?.about_brand && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  About Brand
                </h3>
                <p className="text-sm text-slate-700">{currentFranchise.about_brand}</p>
              </div>
            )}

            {/* Investment Details */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Investment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Investment Range</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatCurrency(currentFranchise?.min_investment)} - {formatCurrency(currentFranchise?.max_investment)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Franchise Fee</p>
                  <p className="text-sm font-medium text-slate-900">{formatCurrency(currentFranchise?.franchise_fee)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Royalty Percentage</p>
                  <p className="text-sm font-medium text-slate-900">{currentFranchise?.royalty_percentage ? `${currentFranchise.royalty_percentage}%` : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Area Requirement</p>
                  <p className="text-sm font-medium text-slate-900">
                    {currentFranchise?.min_area && currentFranchise?.max_area
                      ? `${currentFranchise.min_area} - ${currentFranchise.max_area} ${currentFranchise.area_unit || 'sqft'}`
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Franchise Outlets</p>
                  <p className="text-sm font-medium text-slate-900">{currentFranchise?.franchise_outlets || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Anticipated ROI</p>
                  <p className="text-sm font-medium text-slate-900">{currentFranchise?.anticipated_roi ? `${currentFranchise.anticipated_roi}%` : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Payback Period</p>
                  <p className="text-sm font-medium text-slate-900">{currentFranchise?.payback_period ? `${currentFranchise.payback_period} months` : '-'}</p>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Terms & Conditions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Franchise Term</p>
                  <p className="text-sm font-medium text-slate-900">{franchise.franchise_term_years ? `${franchise.franchise_term_years} years` : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Term Renewable</p>
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                    {currentFranchise?.term_renewable ? <Check className="h-3 w-3 text-green-500" /> : '-'} 
                    {currentFranchise?.term_renewable ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Exclusive Territory</p>
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                    {currentFranchise?.exclusive_territory ? <Check className="h-3 w-3 text-green-500" /> : '-'} 
                    {currentFranchise?.exclusive_territory ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            {/* Support Services */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Support Services
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Training Provided</p>
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                    {currentFranchise?.training_provided ? <Check className="h-3 w-3 text-green-500" /> : '-'} 
                    {currentFranchise?.training_provided ? 'Yes' : 'No'}
                  </p>
                </div>
                {currentFranchise?.training_provided && currentFranchise?.training_location && (
                  <div>
                    <p className="text-xs text-slate-500">Training Location</p>
                    <p className="text-sm font-medium text-slate-900">{currentFranchise.training_location}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500">Field Assistance</p>
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                    {currentFranchise?.field_assistance ? <Check className="h-3 w-3 text-green-500" /> : '-'} 
                    {currentFranchise?.field_assistance ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Expert Guidance</p>
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                    {currentFranchise?.expert_guidance ? <Check className="h-3 w-3 text-green-500" /> : '-'} 
                    {currentFranchise?.expert_guidance ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Operating Manuals</p>
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                    {currentFranchise?.operating_manuals ? <Check className="h-3 w-3 text-green-500" /> : '-'} 
                    {currentFranchise?.operating_manuals ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Other</p>
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                    {currentFranchise?.other ? <Check className="h-3 w-3 text-green-500" /> : '-'} 
                    {currentFranchise?.other ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            {/* Locations */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Preferred Locations
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentFranchise?.preferred_locations && currentFranchise.preferred_locations.map((location, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full bg-slate-200 text-slate-700 text-xs"
                  >
                    {location}
                  </span>
                ))}
                {(!currentFranchise?.preferred_locations || currentFranchise.preferred_locations.length === 0) && (
                  <span className="text-sm text-slate-500">No locations specified</span>
                )}
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Contact Phone</p>
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-500" />
                    {currentFranchise?.contact_phone || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Contact Email</p>
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                    <Mail className="h-3 w-3 text-slate-500" />
                    {currentFranchise?.contact_email || '-'}
                  </p>
                </div>
                {currentFranchise?.contact_address && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500">Contact Address</p>
                    <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                      <Home className="h-3 w-3 text-slate-500" />
                      {currentFranchise.contact_address}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-yellow-200 bg-yellow-50/60 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-yellow-300 rounded-lg text-slate-800 bg-white hover:bg-yellow-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
