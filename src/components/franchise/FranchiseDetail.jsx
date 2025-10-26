import { useState, useRef, useEffect } from 'react'
import { 
  Building2, 
  IndianRupee, 
  MapPin, 
  Calendar, 
  Users, 
  Target, 
  Award,
  CheckCircle,
  Phone,
  Mail,
  MessageSquare,
  Store,
  Scan,
  Clock,
  TrendingUp,
  Shield,
  BookOpen,
  Headphones,
  Globe,
  Plus,
  Expand,
  X
} from 'lucide-react'
// Gallery images are now directly available from franchise data

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

export default function FranchiseDetail({ franchise }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedImage, setExpandedImage] = useState(null)
  // Gallery images are fetched from the gallery table and attached to franchise data
  const galleryImages = franchise?.gallery_images || []
  const galleryLoading = false // No loading needed since images are in the franchise data
  
  // Extract franchise data
  const {
    brand_name,
    tagline,
    description,
    about_brand,
    logo_url,
    industry,
    establishment_year,
    franchise_commenced_year,
    franchise_outlets,
    min_investment,
    max_investment,
    franchise_fee,
    royalty_percentage,
    anticipated_roi,
    payback_period,
    min_area,
    max_area,
    area_unit,
    preferred_locations = [],
    expansion_states = [],
    exclusive_territory,
    franchise_term_years,
    term_renewable,
    training_provided,
    training_location,
    field_assistance,
    expert_guidance,
    operating_manuals,
    other,
    contact_phone,
    contact_email,
    contact_address
  } = franchise || {}
  
  // Create refs for each section
  const overviewRef = useRef(null)
  const investmentRef = useRef(null)
  const requirementsRef = useRef(null)
  const trainingRef = useRef(null)
  const expansionRef = useRef(null)
  const contactRef = useRef(null)
  
  // Handle tab click to scroll to the appropriate section
  const handleTabClick = (tabId) => {
    setActiveTab(tabId)
    
    // Map tab IDs to their refs
    const tabRefs = {
      'overview': overviewRef,
      'investment': investmentRef,
      'requirements': requirementsRef,
      'training': trainingRef,
      'expansion': expansionRef,
      'contact': contactRef
    }
    
    // Scroll to the section with smooth behavior
    if (tabRefs[tabId]?.current) {
      tabRefs[tabId].current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }
  
  // Set up intersection observer to update active tab when scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Extract the section ID from the data attribute
            const sectionId = entry.target.getAttribute('data-section-id')
            if (sectionId) {
              setActiveTab(sectionId)
            }
          }
        })
      },
      { threshold: 0.5 } // Trigger when at least 50% of the section is visible
    )
    
    // Observe all section elements
    const sections = document.querySelectorAll('[data-section-id]')
    sections.forEach(section => {
      observer.observe(section)
    })
    
    return () => {
      sections.forEach(section => {
        observer.unobserve(section)
      })
    }
  }, [])

  // Handle image expansion
  const handleImageClick = (imageUrl, index) => {
    setExpandedImage({ url: imageUrl, index })
  }

  const closeExpandedImage = () => {
    setExpandedImage(null)
  }

  // Handle keyboard navigation for expanded image
  const handleKeyDown = (e) => {
    if (!expandedImage) return
    
    if (e.key === 'Escape') {
      closeExpandedImage()
    } else if (e.key === 'ArrowLeft' && expandedImage.index > 0) {
      setExpandedImage({
        url: galleryImages[expandedImage.index - 1],
        index: expandedImage.index - 1
      })
    } else if (e.key === 'ArrowRight' && expandedImage.index < galleryImages.length - 1) {
      setExpandedImage({
        url: galleryImages[expandedImage.index + 1],
        index: expandedImage.index + 1
      })
    }
  }

  // Add keyboard event listener when image is expanded
  useEffect(() => {
    if (expandedImage) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [expandedImage])
  
  // Gallery images are fetched from the gallery table and attached to franchise data
  // No need to fetch them separately
  
  if (!franchise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue-600"></div>
      </div>
    )
  }


  const industryName = typeof industry === 'string' ? industry : industry?.name

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Store },
    { id: 'investment', label: 'Investment', icon: IndianRupee },
    { id: 'requirements', label: 'Requirements', icon: Target },
    { id: 'training', label: 'Training & Support', icon: BookOpen },
    { id: 'expansion', label: 'Expansion Plans', icon: Globe },
    { id: 'contact', label: 'Contact', icon: MessageSquare }
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:gap-12">
            <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center">
              {logo_url ? (
                <img src={logo_url} alt={`${brand_name} logo`} className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-16 w-16 text-white/80" />
              )}
            </div>
            <div className="mt-8 lg:mt-0">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {brand_name}
              </h1>
              {tagline && (
                <p className="mt-4 text-xl text-black sm:text-2xl">
                  {tagline}
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
                {industryName && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1">
                    <Store className="h-4 w-4" />
                    {industryName}
                  </span>
                )}
                {establishment_year && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1">
                    <Calendar className="h-4 w-4" />
                    Est. {establishment_year}
                  </span>
                )}
                {franchise_outlets && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1">
                    <Users className="h-4 w-4" />
                    {franchise_outlets} Outlets
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Sticky */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Gallery Section - Only show if there are images */}
      {galleryImages && galleryImages.length > 0 && (
        <div className="bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Gallery</h2>
              <p className="text-slate-600">Explore our franchise</p>
            </div>
            
            {galleryLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-600"></div>
                <span className="ml-2 text-slate-600">Loading gallery...</span>
              </div>
            ) : (
              <div className="relative">
                {/* Scrollable container */}
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                  {galleryImages.map((imageUrl, index) => {
                    return (
                      <div key={index} className="relative group flex-shrink-0 snap-center">
                        <div 
                          className="w-72 sm:w-80 h-64 bg-slate-100 rounded-lg overflow-hidden shadow-sm cursor-pointer relative"
                          onClick={() => handleImageClick(imageUrl, index)}
                        >
                          <img
                            src={imageUrl}
                            alt={`${brand_name} gallery ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              console.error(`Image ${index + 1} failed to load:`, imageUrl, e);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          {/* Error fallback */}
                          <div className="w-full h-full bg-slate-200 rounded-lg flex items-center justify-center text-slate-500" style={{ display: 'none' }}>
                            <div className="text-center">
                              <div className="text-4xl mb-2">📷</div>
                              <p className="text-sm">Image failed to load</p>
                            </div>
                          </div>
                          
                          {/* Expand icon overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                                <Expand className="h-6 w-6 text-slate-700" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Overview Tab */}
        <div 
          ref={overviewRef} 
          data-section-id="overview" 
          className="space-y-8 mb-16 scroll-mt-32"
        >
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Overview</h2>
            {/* About Brand */}
            {about_brand && (
              <section className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">About {brand_name}</h3>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 leading-relaxed">{about_brand}</p>
                </div>
              </section>
            )}

            {/* Why Choose This Franchise */}
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Why Choose {brand_name}?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Award className="h-6 w-6 text-yellow-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Proven Track Record</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {establishment_year ? `Established in ${establishment_year}` : 'Established brand'} with {franchise_outlets || 'multiple'} successful outlets
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-yellow-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Brand Recognition</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Well-established brand with strong customer loyalty and market presence
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-6 w-6 text-yellow-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Growth Potential</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Expanding business model with opportunities for multiple locations
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-6 w-6 text-yellow-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Support Network</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Comprehensive training and ongoing support from experienced team
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Stats */}
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Quick Facts</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500">
                    {establishment_year || '—'}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">Established</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500">
                    {franchise_commenced_year || '—'}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">Franchising Started</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500">
                    {franchise_outlets || '—'}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">Total Outlets</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500">
                    {franchise_term_years || '—'}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">Term (Years)</div>
                </div>
              </div>
            </section>
          </div>

        {/* Investment Tab */}
        <div 
          ref={investmentRef} 
          data-section-id="investment" 
          className="space-y-8 mb-16 scroll-mt-32 pt-8 border-t border-slate-200"
        >
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Investment Details</h2>
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Investment Breakdown</h3>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">Investment Range</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatInvestment(min_investment, max_investment)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">Franchise Fee</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {franchise_fee ? `₹${(franchise_fee / 100000).toFixed(1)}L` : '—'}
                      </td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">Royalty Percentage</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {royalty_percentage ? `${royalty_percentage}%` : '—'}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">Anticipated ROI</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {anticipated_roi ? `${anticipated_roi}%` : '—'}
                      </td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">Payback Period</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {payback_period ? `${payback_period} months` : '—'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

        {/* Requirements Tab */}
        <div 
          ref={requirementsRef} 
          data-section-id="requirements" 
          className="space-y-8 mb-16 scroll-mt-32 pt-8 border-t border-slate-200"
        >
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Requirements</h2>
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Franchise Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Property Requirements</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Scan className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-slate-600">
                        Area: {formatArea(min_area, max_area, area_unit)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-slate-600">
                        Location: High footfall areas preferred
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Franchise Terms</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-slate-600">
                        Term: {franchise_term_years || '—'} years
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-slate-600">
                        Renewable: {term_renewable ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-slate-600">
                        Exclusive Territory: {exclusive_territory ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

        {/* Training Tab */}
        <div 
          ref={trainingRef} 
          data-section-id="training" 
          className="space-y-8 mb-16 scroll-mt-32 pt-8 border-t border-slate-200"
        >
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Training & Support</h2>
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Training & Support Programs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Training Programs</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-slate-600">
                        Operating Manuals: {operating_manuals ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-slate-600">
                        Training Location: {training_location || 'Head Office'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Ongoing Support</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Headphones className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-slate-600">
                        Field Assistance: {field_assistance ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-slate-600">
                        Expert Guidance: {expert_guidance ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm text-slate-600">
                        Other: {other ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

        {/* Expansion Tab */}
        <div 
          ref={expansionRef} 
          data-section-id="expansion" 
          className="space-y-8 mb-16 scroll-mt-32 pt-8 border-t border-slate-200"
        >
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Expansion Plans</h2>
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Expansion Opportunities</h3>
              {preferred_locations && preferred_locations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Preferred Locations</h3>
                  <div className="flex flex-wrap gap-2">
                    {preferred_locations.map((location, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700"
                      >
                        {location}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Expansion States</h3>
                <p className="text-slate-600">
                  {expansion_states && expansion_states.length > 0 
                    ? `${brand_name} is actively expanding across multiple states in India.`
                    : 'Expansion plans are currently being developed.'}
                </p>
              </div>
            </section>
          </div>

        {/* Contact Tab */}
        <div 
          ref={contactRef} 
          data-section-id="contact" 
          className="space-y-8 mb-16 scroll-mt-32 pt-8 border-t border-slate-200"
        >
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Contact Information</h2>
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Get in Touch</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-yellow-500" />
                      <span className="text-slate-600">{franchise.contact_phone || 'Contact number not available'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-yellow-500" />
                      <span className="text-slate-600">{franchise.contact_email || `info@${brand_name?.toLowerCase().replace(/\s+/g, '')}.com`}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-yellow-500" />
                      <span className="text-slate-600">{franchise.contact_address || 'Contact address not available'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Send Inquiry</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                      <textarea
                        rows={4}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500"
                        placeholder="Tell us about your interest in this franchise opportunity..."
                      />
                    </div>
                    <button
                      type="submit"
                        className="w-full rounded-lg bg-yellow-500 px-4 py-2 text-white font-medium hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-colors"
                    >
                      Send Inquiry
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </div>
      </div>

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeExpandedImage}
              className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-sm text-white rounded-full p-2 hover:bg-white/30 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation arrows */}
            {expandedImage.index > 0 && (
              <button
                onClick={() => setExpandedImage({
                  url: galleryImages[expandedImage.index - 1],
                  index: expandedImage.index - 1
                })}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm text-white rounded-full p-3 hover:bg-white/30 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {expandedImage.index < galleryImages.length - 1 && (
              <button
                onClick={() => setExpandedImage({
                  url: galleryImages[expandedImage.index + 1],
                  index: expandedImage.index + 1
                })}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm text-white rounded-full p-3 hover:bg-white/30 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              {expandedImage.index + 1} of {galleryImages.length}
            </div>

            {/* Expanded image */}
            <img
              src={expandedImage.url}
              alt={`${brand_name} gallery ${expandedImage.index + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
