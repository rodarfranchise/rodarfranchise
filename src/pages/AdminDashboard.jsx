import { useState, useEffect } from 'react'
import { 
  LogOut, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  ListFilter,
  Mail
} from 'lucide-react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import FranchiseFormModal from '../components/admin/FranchiseFormModal'
import ViewFranchiseModal from '../components/admin/ViewFranchiseModal'
import ContactQueryModal from '../components/admin/ContactQueryModal'
import { 
  createFranchise, 
  getAdminFranchiseListings,
  getDashboardStats,
  deleteFranchise,
  getCompleteFranchiseById,
  updateFranchise,
  toggleFranchiseStatus
} from '../services/franchiseService'
import { 
  getContactQueries, 
  updateContactQueryStatus, 
  deleteContactQuery,
  getContactQueryStats 
} from '../services/contactService'

export default function AdminDashboard() {
  const { admin, logout } = useAuth()
  const [franchises, setFranchises] = useState([])
  const [contactQueries, setContactQueries] = useState([])
  const [loading, setLoading] = useState(true) // Only for initial dashboard load
  const [operationLoading, setOperationLoading] = useState(false) // For individual operations
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [contactSearchTerm, setContactSearchTerm] = useState('')
  const [selectedContactStatus, setSelectedContactStatus] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewFranchise, setViewFranchise] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editFranchise, setEditFranchise] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [viewContactQuery, setViewContactQuery] = useState(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [activeTab, setActiveTab] = useState('franchises') // 'franchises' or 'contacts'
  const [notification, setNotification] = useState(null) // { type: 'success'|'error', message: string }

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);
  const [dashboardStats, setDashboardStats] = useState({
    totalFranchises: 0,
    activeFranchises: 0,
    pendingFranchises: 0,
    totalInvestment: '₹0'
  })
  const [contactStats, setContactStats] = useState({
    total: 0,
    new: 0,
    read: 0,
    replied: 0,
    closed: 0
  })

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const startTime = performance.now()
        
        // Fetch all data in parallel instead of sequentially
        const [franchiseData, stats, contactData, contactStatsData] = await Promise.all([
          getAdminFranchiseListings(),
          getDashboardStats(),
          getContactQueries(),
          getContactQueryStats()
        ])
        
        const endTime = performance.now()
        
        // Set all the data
        setFranchises(franchiseData)
        setDashboardStats(stats)
        setContactQueries(contactData)
        setContactStats(contactStatsData)
        
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error)
        setNotification({ type: 'error', message: 'Failed to load dashboard data. Please try refreshing the page.' })
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Realtime updates for franchise list and stats
  useEffect(() => {
    const channel = supabase
      .channel('admin-dashboard-franchise-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'franchise_listings'
      }, async () => {
        try {
          const [franchiseData, stats] = await Promise.all([
            getAdminFranchiseListings(),
            getDashboardStats()
          ])
          setFranchises(franchiseData)
          setDashboardStats(stats)
        } catch (e) {
          // Ignore transient errors, UI will refresh next change or manual actions
          console.error('Realtime refresh failed:', e)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  
  const handleCreateFranchise = async (franchiseData) => {
    try {
      // Set status to active by default
      franchiseData.is_active = true;
      
      // Create the franchise
      const createdFranchise = await createFranchise(franchiseData);
      
      // Refresh the dashboard data to include the new franchise
      try {
        // Fetch updated franchise listings
        const franchiseData = await getAdminFranchiseListings();
        setFranchises(franchiseData);
        
        // Fetch updated dashboard statistics
        const stats = await getDashboardStats();
        setDashboardStats(stats);
      } catch (refreshError) {
        console.error('Error refreshing dashboard data:', refreshError);
        // Even if refresh fails, the franchise was created successfully
      }
      
      // Show success notification
      setNotification({ type: 'success', message: 'Franchise created successfully!' });
      
      return createdFranchise; // Return the created franchise for the modal to process
    } catch (error) {
      console.error('AdminDashboard: Error creating franchise:', error);
      
      // Create a more detailed error message
      let errorMessage = 'Failed to create franchise.';
      
      if (error.message) {
        errorMessage += ' ' + error.message;
      }
      
      if (error.cause) {
        console.error('Error cause:', error.cause);
        if (error.cause.message) {
          errorMessage += ' Cause: ' + error.cause.message;
        }
      }
      
      alert(errorMessage);
      throw error; // Re-throw so the modal can handle it
    }
  }
  
  const handleEditSubmit = async (updatedData) => {
    try {
      setOperationLoading(true);
      
      // Convert logo to base64 if it's a file
      if (updatedData.logo_file && updatedData.logo_file instanceof File) {
        console.log('Converting logo to base64 format for update');
        
        try {
          const base64Logo = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(updatedData.logo_file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
          });
          
          // Store the base64 data in logo_url
          updatedData.logo_url = base64Logo;
          console.log('Logo successfully converted to base64 for update');
        } catch (logoError) {
          console.error('Error converting logo to base64:', logoError);
        }
      }
      
      // Call the API to update the franchise in the database
      const updatedFranchise = await updateFranchise(editFranchise.id, updatedData);
      console.log('Franchise updated successfully:', updatedFranchise);
      
      // Refresh the franchise listings to show updated data
      const franchiseData = await getAdminFranchiseListings();
      setFranchises(franchiseData);
      
      // Close the modal and clear edit state
      setShowEditModal(false);
      setEditFranchise(null);
      
      // Show success notification
      setNotification({ type: 'success', message: 'Franchise updated successfully!' });
      
      return { success: true };
    } catch (error) {
      console.error('AdminDashboard: Error updating franchise:', error);
      
      // Create a more detailed error message
      let errorMessage = 'Failed to update franchise.';
      
      if (error.message) {
        errorMessage += ' ' + error.message;
      }
      
      if (error.cause) {
        console.error('Error cause:', error.cause);
        if (error.cause.message) {
          errorMessage += ' Cause: ' + error.cause.message;
        }
      }
      
      alert(errorMessage);
      return { success: false, error };
    } finally {
      setOperationLoading(false);
    }
  }
  
  const handleDeleteFranchise = async (franchiseId, franchiseName) => {
    try {
      if (confirm(`Are you sure you want to delete ${franchiseName}?`)) {
        console.log('AdminDashboard: Deleting franchise with ID:', franchiseId);
        
        // Show operation loading state
        setOperationLoading(true);
        
        // Delete from database
        await deleteFranchise(franchiseId);
        
        // Remove from local state
        setFranchises(prev => prev.filter(f => f.id !== franchiseId));
        
        // Update dashboard statistics
        try {
          const stats = await getDashboardStats();
          setDashboardStats(stats);
        } catch (statsError) {
          console.error('Error refreshing dashboard stats:', statsError);
        }
        
        // Success notification
        setNotification({ type: 'success', message: `${franchiseName} has been deleted successfully.` });
      }
    } catch (error) {
      console.error('AdminDashboard: Error deleting franchise:', error);
      
      // Create a more detailed error message
      let errorMessage = 'Failed to delete franchise.';
      
      if (error.message) {
        errorMessage += ' ' + error.message;
      }
      
      if (error.cause) {
        console.error('Error cause:', error.cause);
        if (error.cause.message) {
          errorMessage += ' Cause: ' + error.cause.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setOperationLoading(false);
    }
  }

  // Contact Query Management Functions
  const handleUpdateContactStatus = async (queryId, newStatus, adminNotes = '') => {
    try {
      setOperationLoading(true);
      const startTime = performance.now();
      
      await updateContactQueryStatus(queryId, newStatus, adminNotes);
      
      // Refresh contact queries and statistics in parallel
      const [updatedQueries, updatedStats] = await Promise.all([
        getContactQueries(),
        getContactQueryStats()
      ]);
      
      const endTime = performance.now();
      console.log(`Contact status updated in ${(endTime - startTime).toFixed(2)}ms`);
      
      setContactQueries(updatedQueries);
      setContactStats(updatedStats);
      
      setNotification({ type: 'success', message: 'Contact query status updated successfully!' });
    } catch (error) {
      console.error('Error updating contact query status:', error);
      setNotification({ type: 'error', message: 'Failed to update contact query status. Please try again.' });
    } finally {
      setOperationLoading(false);
    }
  }

  const handleDeleteContactQuery = async (queryId, contactName) => {
    try {
      if (confirm(`Are you sure you want to delete the contact query from ${contactName}?`)) {
        setOperationLoading(true);
        
        await deleteContactQuery(queryId);
        
        // Remove from local state
        setContactQueries(prev => prev.filter(q => q.id !== queryId));
        
        // Refresh contact statistics
        const updatedStats = await getContactQueryStats();
        setContactStats(updatedStats);
        
        setNotification({ type: 'success', message: 'Contact query deleted successfully!' });
      }
    } catch (error) {
      console.error('Error deleting contact query:', error);
      setNotification({ type: 'error', message: 'Failed to delete contact query. Please try again.' });
    } finally {
      setOperationLoading(false);
    }
  }

  const filteredFranchises = franchises.filter(franchise => {
    const matchesSearch = franchise.brand_name.toLowerCase().includes(searchTerm.toLowerCase())
    const franchiseIndustryName = franchise?.industries?.name || ''
    const matchesIndustry = !selectedIndustry || franchiseIndustryName === selectedIndustry
    return matchesSearch && matchesIndustry
  })

  const filteredContactQueries = contactQueries.filter(query => {
    const matchesSearch = 
      query.name.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
      query.email.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
      query.subject.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
      query.message.toLowerCase().includes(contactSearchTerm.toLowerCase())
    const matchesStatus = !selectedContactStatus || query.status === selectedContactStatus
    return matchesSearch && matchesStatus
  })

  const franchiseStats = [
    { label: 'Total Franchises', value: dashboardStats.totalFranchises, icon: Building2, color: 'text-blue-600' },
    { label: 'Active Listings', value: dashboardStats.activeFranchises, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Inactive Listings', value: dashboardStats.inactiveFranchises ?? Math.max((dashboardStats.totalFranchises || 0) - (dashboardStats.activeFranchises || 0), 0), icon: EyeOff, color: 'text-yellow-600' },
    { label: 'Total Investment', value: dashboardStats.totalInvestment, icon: DollarSign, color: 'text-purple-600' }
  ]

  const contactStatsCards = [
    { label: 'Total Queries', value: contactStats.total, icon: Mail, color: 'text-blue-600' },
    { label: 'New Queries', value: contactStats.new, icon: Users, color: 'text-orange-600' },
    { label: 'Read', value: contactStats.read, icon: Eye, color: 'text-yellow-600' },
    { label: 'Replied', value: contactStats.replied, icon: TrendingUp, color: 'text-green-600' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Loading overlay for individual operations
  const LoadingOverlay = () => {
    if (!operationLoading) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4 shadow-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-600"></div>
          <p className="text-sm text-slate-600">Processing...</p>
        </div>
      </div>
    );
  };

  // Notification component
  const Notification = () => {
    if (!notification) return null;
    
    return (
      <div className="fixed top-4 right-4 z-50 max-w-sm">
        <div className={`rounded-lg shadow-lg p-4 flex items-center gap-3 ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className={`flex-shrink-0 ${
            notification.type === 'success' ? 'text-green-500' : 'text-red-500'
          }`}>
            {notification.type === 'success' ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              notification.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className={`flex-shrink-0 ${
              notification.type === 'success' ? 'text-green-400 hover:text-green-600' : 'text-red-400 hover:text-red-600'
            }`}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur shadow-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600">Welcome back, {admin?.name || 'Admin'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 border border-orange-300 rounded-lg text-slate-800 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('franchises')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'franchises'
                    ? 'border-brand-blue-500 text-brand-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Franchises
              </button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'contacts'
                    ? 'border-brand-blue-500 text-brand-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Contact Queries
              </button>
            </nav>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(activeTab === 'franchises' ? franchiseStats : contactStatsCards).map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-lg shadow-md border border-orange-200 p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg bg-orange-50 ${stat.color.replace('text-blue-600','text-orange-600')}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-700">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions Bar */}
        {activeTab === 'franchises' && (
          <div className="bg-white rounded-lg shadow-md border border-orange-200 p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search franchises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                >
                  <option value="">All Industries</option>
                  {/* Get unique industries from the franchises data */}
                  {Array.from(new Set(franchises.map(f => f?.industries?.name).filter(Boolean)))
                    .sort()
                    .map(industryName => (
                      <option key={industryName} value={industryName}>
                        {industryName}
                      </option>
                    ))
                  }
                </select>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors shadow">
                <Plus className="h-4 w-4" />
                Add Franchise
              </button>
            </div>
          </div>
        )}

        {/* Contact Queries Filter Bar */}
        {activeTab === 'contacts' && (
          <div className="bg-white rounded-lg shadow-md border border-orange-200 p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, subject, or message..."
                    value={contactSearchTerm}
                    onChange={(e) => setContactSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <select
                  value={selectedContactStatus}
                  onChange={(e) => setSelectedContactStatus(e.target.value)}
                  className="px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-500">
                  Showing {filteredContactQueries.length} of {contactQueries.length} queries
                </div>
                {(contactSearchTerm || selectedContactStatus) && (
                  <button
                    onClick={() => {
                      setContactSearchTerm('')
                      setSelectedContactStatus('')
                    }}
                    className="text-sm text-yellow-700 hover:text-yellow-800 font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Franchises Table */}
        {activeTab === 'franchises' && (
          <div className="bg-white rounded-lg shadow-md border border-orange-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-orange-200 bg-orange-50/60">
              <h2 className="text-lg font-semibold text-slate-900">Franchise Listings</h2>
            </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-orange-200">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Investment Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-orange-100">
                {filteredFranchises.map((franchise) => (
                  <tr key={franchise.id} className="hover:bg-orange-50/60">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{franchise.brand_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{franchise?.industries?.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">
                        ₹{(franchise.min_investment / 100000).toFixed(1)}L - ₹{(franchise.max_investment / 100000).toFixed(1)}L
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center">
                        <select
                          value={(franchise.status || (franchise.is_active ? 'active' : 'inactive'))}
                          onChange={async (e) => {
                            const next = e.target.value === 'active';
                            try {
                              setOperationLoading(true);
                              const updated = await toggleFranchiseStatus(franchise.id, next);
                              setFranchises(prev => prev.map(f => f.id === franchise.id ? { ...f, is_active: updated.is_active, status: updated.status } : f));
                              // Optimistically update dashboard tiles immediately
                              setDashboardStats(prev => {
                                const wasActive = (franchise.status || (franchise.is_active ? 'active' : 'inactive')) === 'active'
                                let nextActive = prev.activeFranchises || 0
                                if (next && !wasActive) nextActive = nextActive + 1
                                if (!next && wasActive) nextActive = Math.max(0, nextActive - 1)
                                const total = prev.totalFranchises || 0
                                const nextInactive = Math.max(0, total - nextActive)
                                return { ...prev, activeFranchises: nextActive, inactiveFranchises: nextInactive }
                              })
                            } catch (err) {
                              console.error('Failed to toggle status', err);
                              setNotification({ type: 'error', message: 'Failed to update status' });
                            } finally {
                              setOperationLoading(false);
                            }
                          }}
                          className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-800 appearance-none pr-6 relative ${
                            (franchise.status || (franchise.is_active ? 'active' : 'inactive')) === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                          style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" viewBox=\"0 0 20 20\"><path fill=\"%23666666\" d=\"M5.23 7.21a.75.75 0 011.06.02L10 11.117l3.71-3.885a.75.75 0 111.08 1.04l-4.24 4.44a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z\"/></svg>')", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(franchise.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={async () => {
                            try {
        // Show operation loading state
        setOperationLoading(true);
                              
                              // Fetch complete franchise details from the database
                              const completeDetails = await getCompleteFranchiseById(franchise.id);
                              
                              // Set the complete franchise details for viewing
                              setViewFranchise(completeDetails);
                              setShowViewModal(true);
                            } catch (error) {
                              console.error('Error fetching complete franchise details:', error);
                              setNotification({ type: 'error', message: 'Failed to fetch complete franchise details. Please try again.' });
                            } finally {
                              setOperationLoading(false);
                            }
                          }}
                          className="text-yellow-800 hover:text-yellow-900 p-1"
                          aria-label="View franchise details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={async () => {
                            try {
        // Show operation loading state
        setOperationLoading(true);
                              
                              // Fetch complete franchise details from the database
                              const completeDetails = await getCompleteFranchiseById(franchise.id);
                              
                              // Set the complete franchise details for editing
                              setEditFranchise(completeDetails);
                              setShowEditModal(true);
                            } catch (error) {
                              console.error('Error fetching complete franchise details:', error);
                              setNotification({ type: 'error', message: 'Failed to fetch complete franchise details. Please try again.' });
                            } finally {
                              setOperationLoading(false);
                            }
                          }}
                          className="text-slate-600 hover:text-slate-900 p-1"
                          aria-label="Edit franchise"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFranchise(franchise.id, franchise.brand_name)}
                          className="text-red-600 hover:text-red-900 p-1"
                          aria-label="Delete franchise"
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
          
          {filteredFranchises.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No franchises found matching your criteria.</p>
            </div>
          )}
          </div>
        )}

        {/* Contact Queries Table */}
        {activeTab === 'contacts' && (
          <div className="bg-white rounded-lg shadow-md border border-orange-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-orange-200 bg-orange-50/60">
              <h2 className="text-lg font-semibold text-slate-900">Contact Queries</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-orange-200">
                <thead className="bg-orange-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-orange-100">
                  {filteredContactQueries.map((query) => (
                    <tr key={query.id} className="hover:bg-orange-50/60">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{query.name}</div>
                        {query.phone && (
                          <div className="text-sm text-slate-500">{query.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">{query.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 max-w-xs truncate" title={query.subject}>
                          {query.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={query.status}
                          onChange={(e) => handleUpdateContactStatus(query.id, e.target.value)}
                          className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${
                            query.status === 'new' 
                              ? 'bg-orange-100 text-orange-800' 
                              : query.status === 'read'
                              ? 'bg-blue-100 text-blue-800'
                              : query.status === 'replied'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(query.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              setViewContactQuery(query);
                              setShowContactModal(true);
                            }}
                            className="text-yellow-800 hover:text-yellow-900 p-1"
                            aria-label="View message details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteContactQuery(query.id, query.name)}
                            className="text-red-600 hover:text-red-900 p-1"
                            aria-label="Delete contact query"
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
            
            {filteredContactQueries.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">
                  {contactQueries.length === 0 
                    ? "No contact queries found." 
                    : "No contact queries match your filter criteria."
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Franchise Form Modal */}
      <FranchiseFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateFranchise}
      />
      
      {/* View Franchise Modal */}
      <ViewFranchiseModal 
        isOpen={showViewModal} 
        onClose={() => {
          setShowViewModal(false)
          setViewFranchise(null)
        }} 
        franchise={viewFranchise} 
      />
      
      {/* Edit Franchise Modal */}
      <FranchiseFormModal 
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditFranchise(null)
        }}
        onSubmit={handleEditSubmit}
        initialData={editFranchise}
      />
      
      {/* Contact Query Modal */}
      <ContactQueryModal 
        isOpen={showContactModal}
        onClose={() => {
          setShowContactModal(false)
          setViewContactQuery(null)
        }}
        query={viewContactQuery}
      />
      
      {/* Loading Overlay for Operations */}
      <LoadingOverlay />
      
      {/* Notification */}
      <Notification />
    </div>
  )
}
