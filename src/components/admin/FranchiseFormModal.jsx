import { useState, useEffect, useRef } from 'react'
import { X, Building2, DollarSign, MapPin, Users, Upload, Phone, Mail } from 'lucide-react'
import { getIndustries, getStates } from '../../services/franchiseService'
import { getGalleryImages, deleteGalleryImageComplete } from '../../services/galleryService'
// Gallery images are now directly available from franchise data

export default function FranchiseFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  
  const defaultFormData = {
    brand_name: '',
    tagline: '',
    description: '',
    about_brand: '',
    logo_url: '',
    logo_file: null,
    gallery_files: [],
    industry_id: '',
    min_investment: '',
    max_investment: '',
    franchise_fee: '',
    royalty_percentage: '',
    min_area: '',
    max_area: '',
    area_unit: 'sqft',
    establishment_year: '',
    franchise_commenced_year: '',
    franchise_outlets: '',
    anticipated_roi: '',
    payback_period: '',
    preferred_locations: [''],
    expansion_states: [],
    exclusive_territory: false,
    franchise_term_years: '',
    term_renewable: false,
    training_provided: false,
    training_location: '',
    field_assistance: false,
    expert_guidance: false,
    operating_manuals: false,
    contact_phone: '',
    contact_email: '',
    contact_address: ''
  };
  
  const [formData, setFormData] = useState(initialData ? {...defaultFormData, ...initialData} : {...defaultFormData});
  
  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...defaultFormData,
        ...initialData,
        // Convert is_active status to boolean if needed
        is_active: initialData.status === 'active'
      });
      
      // Load existing gallery images if editing
      if (initialData.id) {
        loadExistingGalleryImages(initialData);
      }
    }
  }, [initialData]);

  // Function to load existing gallery images from franchise data
  const loadExistingGalleryImages = async (franchiseData) => {
    try {
      
      if (franchiseData?.id) {
        // Fetch full gallery data with IDs from the gallery table
        const galleryData = await getGalleryImages(franchiseData.id);
        setExistingGalleryImages(galleryData);
      } else {
        // Fallback to gallery_images array for new franchises
        const images = franchiseData?.gallery_images || [];
        
        // Convert URLs to image objects for consistency
        const imageObjects = images.map((url, index) => ({
          id: `existing-${index}`,
          image_url: url,
          image_alt_text: `Gallery image ${index + 1}`
        }));
        
        setExistingGalleryImages(imageObjects);
      }
    } catch (error) {
      console.error('Error loading existing gallery images:', error);
      setExistingGalleryImages([]);
    }
  };

  const [industries, setIndustries] = useState([])
  const [states, setStates] = useState([])
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [existingGalleryImages, setExistingGalleryImages] = useState([])
  const [deletingImages, setDeletingImages] = useState(new Set())

  
  // Debug the current state of industries and states
  useEffect(() => {
    console.log('Current industries:', industries)
    console.log('Current states:', states)
  }, [industries, states])

  // Fetch industries and states from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Set default mock data immediately to prevent infinite loading
        const defaultIndustries = [
          { id: '1', name: 'Automotive' },
          { id: '2', name: 'Beauty & Health' },
          { id: '3', name: 'Business Services' },
          { id: '4', name: 'Food And Beverage' },
          { id: '5', name: 'Education' },
          { id: '6', name: 'Retail' },
          { id: '7', name: 'Sports Fitness & Entertainment' }
        ];
        
        const defaultStates = [
          { id: '1', name: 'Maharashtra' },
          { id: '2', name: 'Karnataka' },
          { id: '3', name: 'Delhi' },
          { id: '4', name: 'Tamil Nadu' },
          { id: '5', name: 'Gujarat' },
          { id: '6', name: 'Rajasthan' }
        ];
        
        // Set default data first
        setIndustries(defaultIndustries);
        setStates(defaultStates);
        
        // Then try to get real data
        try {
          const industriesData = await getIndustries();
          if (industriesData && industriesData.length > 0) {
            setIndustries(industriesData);
          }
        } catch (industryError) {
          console.error('Error fetching industries:', industryError);
        }
        
        try {
          const statesData = await getStates();
          if (statesData && statesData.length > 0) {
            setStates(statesData);
          }
        } catch (stateError) {
          console.error('Error fetching states:', stateError);
        }
      } catch (error) {
        console.error('Error in data fetching:', error);
      } finally {
        // Always set loading to false to prevent infinite spinner
        setLoading(false);
      }
    };

    if (isOpen) {
      // Reset submission state when modal opens
      setIsSubmitting(false);
      setLoading(true);
      
      // Set a timeout to ensure loading state is cleared even if fetchData hangs
      fetchData();
      const timer = setTimeout(() => {
        setLoading(false);
      }, 3000); // 3 second timeout
      
      return () => clearTimeout(timer);
    }
  }, [isOpen])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      
      setFormData(prev => ({
        ...prev,
        logo_url: previewUrl, // For preview purposes
        logo_file: file       // The actual file to upload
      }));
    }
  }
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  }

  // Image compression function
  const compressImage = (file, quality = 0.7, maxWidth = 800) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleGalleryFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newGalleryFiles = [...formData.gallery_files];
      
      // Process each file with compression
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          try {
            // Temporarily disable compression to test
            console.log('Adding file without compression:', file.name, file.size);
            newGalleryFiles.push(file);
          } catch (error) {
            console.error('Error processing image:', error);
            // Fallback to original file if processing fails
            newGalleryFiles.push(file);
          }
        }
      }
      
      setFormData(prev => ({
        ...prev,
        gallery_files: newGalleryFiles
      }));
    }
  }

  const removeGalleryImage = (index) => {
    const newGalleryFiles = formData.gallery_files.filter((_, i) => i !== index);
    
    setFormData(prev => ({
      ...prev,
      gallery_files: newGalleryFiles
    }));
  }

  const removeExistingGalleryImage = async (index) => {
    const imageToRemove = existingGalleryImages[index];
    
    // Check if this is a real database image (has a UUID id) or a temporary one
    if (imageToRemove.id && !imageToRemove.id.startsWith('existing-')) {
      // Add to deleting set
      setDeletingImages(prev => new Set(prev).add(imageToRemove.id));
      
      try {
        console.log('Deleting gallery image from database and storage:', imageToRemove.id);
        await deleteGalleryImageComplete(imageToRemove.id);
        console.log('Gallery image deleted successfully');
      } catch (error) {
        console.error('Error deleting gallery image:', error);
        alert('Failed to delete image. Please try again.');
        return; // Don't remove from UI if deletion failed
      } finally {
        // Remove from deleting set
        setDeletingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(imageToRemove.id);
          return newSet;
        });
      }
    }
    
    // Remove from UI state
    const newExistingImages = existingGalleryImages.filter((_, i) => i !== index);
    setExistingGalleryImages(newExistingImages);
  }

  const triggerGalleryInput = () => {
    galleryInputRef.current.click();
  }

  const handleLocationChange = (index, value) => {
    const newLocations = [...formData.preferred_locations]
    newLocations[index] = value
    setFormData(prev => ({
      ...prev,
      preferred_locations: newLocations
    }))
  }

  const addLocation = () => {
    setFormData(prev => ({
      ...prev,
      preferred_locations: [...prev.preferred_locations, '']
    }))
  }

  const removeLocation = (index) => {
    setFormData(prev => ({
      ...prev,
      preferred_locations: prev.preferred_locations.filter((_, i) => i !== index)
    }))
  }

  const handleStateSelection = (stateId) => {
    const currentStates = formData.expansion_states
    if (currentStates.includes(stateId)) {
      setFormData(prev => ({
        ...prev,
        expansion_states: currentStates.filter(id => id !== stateId)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        expansion_states: [...currentStates, stateId]
      }))
    }
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Validate form before submission
    if (!validateSubmission()) {
      return; // Stop submission if validation fails
    }
    
    setIsSubmitting(true);
    
    // Set a timeout to automatically reset the submitting state after 60 seconds
    // This prevents the form from being stuck in a submitting state indefinitely
    const submissionTimeout = setTimeout(() => {
      setIsSubmitting(false);
      alert('The submission is taking longer than expected. Please check the console for details or try again.');
    }, 60000);
    
    try {
      
      // Process form data - with strict type handling
      const processedData = {
        // Only include essential fields to start with
        brand_name: formData.brand_name,
        industry_id: formData.industry_id || null
      };
      
      // Carefully add optional fields with proper type conversion
      if (formData.tagline) processedData.tagline = String(formData.tagline);
      if (formData.description) processedData.description = String(formData.description);
      if (formData.about_brand) processedData.about_brand = String(formData.about_brand);
      
      // Handle numeric fields with validation
      if (formData.min_investment) {
        const value = parseFloat(formData.min_investment);
        if (!isNaN(value)) processedData.min_investment = value;
      }
      
      if (formData.max_investment) {
        const value = parseFloat(formData.max_investment);
        if (!isNaN(value)) processedData.max_investment = value;
      }
      
      if (formData.franchise_fee) {
        const value = parseFloat(formData.franchise_fee);
        if (!isNaN(value)) processedData.franchise_fee = value;
      }
      
      if (formData.royalty_percentage) {
        const value = parseFloat(formData.royalty_percentage);
        if (!isNaN(value)) processedData.royalty_percentage = value;
      }
      
      if (formData.min_area) {
        const value = parseFloat(formData.min_area);
        if (!isNaN(value)) processedData.min_area = value;
      }
      
      if (formData.max_area) {
        const value = parseFloat(formData.max_area);
        if (!isNaN(value)) processedData.max_area = value;
      }
      
      if (formData.area_unit) processedData.area_unit = String(formData.area_unit);
      
      if (formData.establishment_year) {
        const value = parseInt(formData.establishment_year);
        if (!isNaN(value)) processedData.establishment_year = value;
      }
      
      if (formData.franchise_commenced_year) {
        const value = parseInt(formData.franchise_commenced_year);
        if (!isNaN(value)) processedData.franchise_commenced_year = value;
      }
      
      if (formData.franchise_outlets) {
        const value = parseInt(formData.franchise_outlets);
        if (!isNaN(value)) processedData.franchise_outlets = value;
      }
      
      if (formData.anticipated_roi) {
        const value = parseFloat(formData.anticipated_roi);
        if (!isNaN(value)) processedData.anticipated_roi = value;
      }
      
      if (formData.payback_period) {
        const value = parseInt(formData.payback_period);
        if (!isNaN(value)) processedData.payback_period = value;
      }
      
      if (formData.franchise_term_years) {
        const value = parseInt(formData.franchise_term_years);
        if (!isNaN(value)) processedData.franchise_term_years = value;
      }
      
      // Handle boolean fields
      processedData.exclusive_territory = Boolean(formData.exclusive_territory);
      processedData.term_renewable = Boolean(formData.term_renewable);
      processedData.training_provided = Boolean(formData.training_provided);
      processedData.field_assistance = Boolean(formData.field_assistance);
      processedData.expert_guidance = Boolean(formData.expert_guidance);
      processedData.operating_manuals = Boolean(formData.operating_manuals);
      
      // Handle arrays with validation
      if (Array.isArray(formData.preferred_locations)) {
        processedData.preferred_locations = formData.preferred_locations.filter(loc => loc && loc.trim() !== '');
      } else {
        processedData.preferred_locations = [];
      }
      
      if (Array.isArray(formData.expansion_states)) {
        processedData.expansion_states = formData.expansion_states;
      } else {
        processedData.expansion_states = [];
      }
      
      // Handle training location if training is provided
      if (formData.training_provided && formData.training_location) {
        processedData.training_location = String(formData.training_location);
      }
      
      // Handle logo
      if (formData.logo_file) {
        processedData.logo_file = formData.logo_file;
      }
      
      if (formData.logo_url && !formData.logo_url.startsWith('blob:')) {
        processedData.logo_url = String(formData.logo_url);
      }

      // Handle gallery images
      
      if (formData.gallery_files && formData.gallery_files.length > 0) {
        processedData.gallery_files = formData.gallery_files;
      }
      
      // Include existing gallery images that should be kept
      if (existingGalleryImages && existingGalleryImages.length > 0) {
        processedData.existing_gallery_images = existingGalleryImages;
      }
      
      
      // Handle contact details
      if (formData.contact_phone) {
        processedData.contact_phone = String(formData.contact_phone);
      }
      
      if (formData.contact_email) {
        processedData.contact_email = String(formData.contact_email);
      }
      
      if (formData.contact_address) {
        processedData.contact_address = String(formData.contact_address);
      }
      
      try {
        console.log('Calling onSubmit function...');
        console.log('Data size:', JSON.stringify(processedData).length, 'characters');
        console.log('Gallery files processed successfully');
        
        // Directly call onSubmit
        const result = await onSubmit(processedData);
        console.log('Form submission completed successfully with result:', result);
        
        // Clear the timeout since we got a response
        clearTimeout(submissionTimeout);
        
        // Reset form and close modal
        resetForm();
        onClose();
      } catch (submitError) {
        // Clear the timeout since we got an error response
        clearTimeout(submissionTimeout);
        throw submitError; // Re-throw to be caught by the outer catch
      }
    } catch (error) {
      // Clear the timeout since we're handling the error
      clearTimeout(submissionTimeout);
      
      console.error('Error submitting franchise:', error);
      
      // More detailed error message
      let errorMessage = 'Error submitting franchise.';
      
      if (error.message) {
        errorMessage += ' ' + error.message;
      }
      
      if (error.cause) {
        console.error('Error cause:', error.cause);
        errorMessage += ' Cause: ' + (error.cause.message || JSON.stringify(error.cause));
      }
      
      // Show the error message
      alert(errorMessage);
    } finally {
      // Always reset the submitting state
      setIsSubmitting(false);
    }
  }

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const steps = [
    { number: 1, title: 'Basic Information', icon: Building2 },
    { number: 2, title: 'Investment Details', icon: DollarSign },
    { number: 3, title: 'Operations & Support', icon: Users },
    { number: 4, title: 'Locations & Terms', icon: MapPin },
    { number: 5, title: 'Contact Details', icon: Phone }
  ]

  // Function to reset the form to its initial state
  const resetForm = () => {
    setFormData({...defaultFormData});
    setCurrentStep(1);
    setIsSubmitting(false);
    setExistingGalleryImages([]);
  };
  
  // Custom close handler to reset form
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  // Function to check if the form can be submitted
  const validateSubmission = () => {
    // Check required fields
    if (!formData.brand_name) {
      alert('Brand name is required');
      setCurrentStep(1);
      return false;
    }
    
    if (!formData.industry_id) {
      alert('Industry selection is required');
      setCurrentStep(1);
      return false;
    }
    
    // Validate contact details
    if (!formData.contact_phone) {
      alert('Contact phone is required');
      setCurrentStep(5);
      return false;
    }
    
    if (!formData.contact_email) {
      alert('Contact email is required');
      setCurrentStep(5);
      return false;
    }
    
    return true;
  };
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-yellow-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-yellow-200 bg-yellow-50/60 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
            {initialData ? 'Edit Franchise' : 'Add New Franchise'}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {initialData ? 'Update franchise details' : 'Create a new franchise listing'}
          </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 border-b border-yellow-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    isActive ? 'border-yellow-600 bg-yellow-600 text-white' :
                    isCompleted ? 'border-green-600 bg-green-600 text-white' :
                    'border-yellow-300 bg-white text-slate-400'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-yellow-700' :
                      isCompleted ? 'text-green-600' :
                      'text-slate-600'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-px mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-slate-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

          {/* Form Content */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(80vh - 200px)' }}>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading form data...</p>
              </div>
            ) : (
              <>
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Brand Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.brand_name}
                          onChange={(e) => handleInputChange('brand_name', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                          placeholder="Enter brand name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Industry <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.industry_id}
                          onChange={(e) => handleInputChange('industry_id', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                          required
                        >
                          <option value="">Select Industry</option>
                          {industries.map(industry => (
                            <option key={industry.id} value={industry.id}>
                              {industry.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={formData.tagline}
                        onChange={(e) => handleInputChange('tagline', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                        placeholder="Enter brand tagline"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                        placeholder="Brief description of the franchise"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        About Brand
                      </label>
                      <textarea
                        value={formData.about_brand}
                        onChange={(e) => handleInputChange('about_brand', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                        placeholder="Detailed information about the brand"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Logo Image
                      </label>
                      <div className="flex flex-col items-center space-y-4">
                        {formData.logo_url ? (
                          <div className="relative w-40 h-40 border border-slate-200 rounded-lg overflow-hidden">
                            <img 
                              src={formData.logo_url} 
                              alt="Logo Preview" 
                              className="w-full h-full object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, logo_url: '', logo_file: null }))}
                              className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md hover:bg-red-50"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={triggerFileInput}
                            className="w-40 h-40 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-blue-500 transition-colors"
                          >
                            <Upload className="h-8 w-8 text-slate-400 mb-2" />
                            <p className="text-sm text-slate-500">Click to upload logo</p>
                            <p className="text-xs text-slate-400 mt-1">PNG, JPG, SVG</p>
                          </div>
                        )}
                        
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept="image/*"
                        />
                        
                        {formData.logo_url && (
                          <p className="text-xs text-slate-500">
                            {formData.logo_file ? formData.logo_file.name : 'Image selected'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Gallery Images Upload */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Gallery Images
                      </label>
                      <div className="space-y-4">
                        {/* Gallery Images Grid */}
                        {(existingGalleryImages.length > 0 || formData.gallery_files.length > 0) && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Existing gallery images */}
                            {existingGalleryImages.map((image, index) => (
                              <div key={`existing-${image.id || index}`} className="relative w-full h-32 border border-slate-200 rounded-lg overflow-hidden">
                                <img 
                                  src={image.image_url} 
                                  alt={image.image_alt_text || `Existing gallery ${index + 1}`} 
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={async () => await removeExistingGalleryImage(index)}
                                  disabled={deletingImages.has(image.id)}
                                  className={`absolute top-2 right-2 p-1 rounded-full shadow-md transition-colors ${
                                    deletingImages.has(image.id)
                                      ? 'bg-gray-200 cursor-not-allowed'
                                      : 'bg-white hover:bg-red-50'
                                  }`}
                                >
                                  {deletingImages.has(image.id) ? (
                                    <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <X className="h-4 w-4 text-red-500" />
                                  )}
                                </button>
                              </div>
                            ))}
                            
                            {/* New gallery files */}
                            {formData.gallery_files.map((file, index) => (
                              <div key={`new-${index}`} className="relative w-full h-32 border border-slate-200 rounded-lg overflow-hidden">
                                <img 
                                  src={URL.createObjectURL(file)} 
                                  alt={`New gallery ${index + 1}`} 
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeGalleryImage(index)}
                                  className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md hover:bg-red-50"
                                >
                                  <X className="h-4 w-4 text-red-500" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Add Images Button */}
                        <div 
                          onClick={triggerGalleryInput}
                          className="w-full h-20 border-2 border-dashed border-yellow-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 transition-colors"
                        >
                          <Upload className="h-6 w-6 text-yellow-600 mb-1" />
                          <p className="text-sm text-slate-500">Click to add gallery images</p>
                          <p className="text-xs text-slate-400">PNG, JPG, SVG (Multiple files allowed)</p>
                        </div>
                        
                        <input
                          type="file"
                          ref={galleryInputRef}
                          onChange={handleGalleryFileChange}
                          className="hidden"
                          accept="image/*"
                          multiple
                        />
                        
                        {(existingGalleryImages.length > 0 || formData.gallery_files.length > 0) && (
                          <p className="text-xs text-slate-500">
                            {existingGalleryImages.length + formData.gallery_files.length} image(s) total
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Establishment Year
                        </label>
                        <input
                          type="number"
                          value={formData.establishment_year}
                          onChange={(e) => handleInputChange('establishment_year', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                          placeholder="2020"
                          min="1900"
                          max={new Date().getFullYear()}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Franchise Commenced Year
                        </label>
                        <input
                          type="number"
                          value={formData.franchise_commenced_year}
                          onChange={(e) => handleInputChange('franchise_commenced_year', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                          placeholder="2022"
                          min="1900"
                          max={new Date().getFullYear()}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Investment Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Minimum Investment (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.min_investment}
                          onChange={(e) => handleInputChange('min_investment', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                          placeholder="500000"
                          min="0"
                          step="1000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Maximum Investment (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.max_investment}
                          onChange={(e) => handleInputChange('max_investment', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                          placeholder="1000000"
                          min="0"
                          step="1000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Franchise Fee (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.franchise_fee}
                          onChange={(e) => handleInputChange('franchise_fee', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                          placeholder="100000"
                          min="0"
                          step="1000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Royalty Percentage (%)
                        </label>
                        <input
                          type="number"
                          value={formData.royalty_percentage}
                          onChange={(e) => handleInputChange('royalty_percentage', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                          placeholder="5.0"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Minimum Area
                        </label>
                        <input
                          type="number"
                          value={formData.min_area}
                          onChange={(e) => handleInputChange('min_area', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                          placeholder="500"
                          min="0"
                          step="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Maximum Area
                        </label>
                        <input
                          type="number"
                          value={formData.max_area}
                          onChange={(e) => handleInputChange('max_area', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                          placeholder="1500"
                          min="0"
                          step="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Area Unit
                        </label>
                        <select
                          value={formData.area_unit}
                          onChange={(e) => handleInputChange('area_unit', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                        >
                          <option value="sqft">Square Feet</option>
                          <option value="sqm">Square Meters</option>
                          <option value="acres">Acres</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Current Franchise Outlets
                        </label>
                        <input
                          type="number"
                          value={formData.franchise_outlets}
                          onChange={(e) => handleInputChange('franchise_outlets', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                          placeholder="10"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Anticipated ROI (%)
                        </label>
                        <input
                          type="number"
                          value={formData.anticipated_roi}
                          onChange={(e) => handleInputChange('anticipated_roi', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                          placeholder="25.0"
                          min="0"
                          max="1000"
                          step="0.1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Payback Period (months)
                        </label>
                        <input
                          type="number"
                          value={formData.payback_period}
                          onChange={(e) => handleInputChange('payback_period', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                          placeholder="18"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Operations & Support */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-4">
                        Support Services Provided
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.training_provided}
                            onChange={(e) => handleInputChange('training_provided', e.target.checked)}
                            className="rounded border-slate-300 text-brand-blue-600 focus:ring-brand-blue-500"
                          />
                          <span className="ml-2 text-sm text-slate-700">Training Provided</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.field_assistance}
                            onChange={(e) => handleInputChange('field_assistance', e.target.checked)}
                            className="rounded border-slate-300 text-brand-blue-600 focus:ring-brand-blue-500"
                          />
                          <span className="ml-2 text-sm text-slate-700">Field Assistance</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.expert_guidance}
                            onChange={(e) => handleInputChange('expert_guidance', e.target.checked)}
                            className="rounded border-slate-300 text-brand-blue-600 focus:ring-brand-blue-500"
                          />
                          <span className="ml-2 text-sm text-slate-700">Expert Guidance</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.operating_manuals}
                            onChange={(e) => handleInputChange('operating_manuals', e.target.checked)}
                            className="rounded border-slate-300 text-brand-blue-600 focus:ring-brand-blue-500"
                          />
                          <span className="ml-2 text-sm text-slate-700">Operating Manuals</span>
                        </label>
                      </div>
                    </div>

                    {formData.training_provided && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Training Location
                        </label>
                        <input
                          type="text"
                          value={formData.training_location}
                          onChange={(e) => handleInputChange('training_location', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                          placeholder="Mumbai, Delhi, Bangalore"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Franchise Term (years)
                        </label>
                        <input
                          type="number"
                          value={formData.franchise_term_years}
                          onChange={(e) => handleInputChange('franchise_term_years', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                          placeholder="5"
                          min="1"
                          max="50"
                        />
                      </div>

                      <div className="flex items-center pt-8">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.term_renewable}
                            onChange={(e) => handleInputChange('term_renewable', e.target.checked)}
                            className="rounded border-slate-300 text-brand-blue-600 focus:ring-brand-blue-500"
                          />
                          <span className="ml-2 text-sm text-slate-700">Term Renewable</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.exclusive_territory}
                          onChange={(e) => handleInputChange('exclusive_territory', e.target.checked)}
                          className="rounded border-slate-300 text-brand-blue-600 focus:ring-brand-blue-500"
                        />
                        <span className="ml-2 text-sm text-slate-700">Exclusive Territory Rights</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Step 4: Locations & Terms */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Preferred Locations
                      </label>
                      {formData.preferred_locations.map((location, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={location}
                            onChange={(e) => handleLocationChange(index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                            placeholder="City name"
                          />
                          {formData.preferred_locations.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLocation(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addLocation}
                        className="text-sm text-brand-blue-600 hover:text-brand-blue-700 font-medium"
                      >
                        + Add Another Location
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-4">
                        States for Expansion
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto border border-slate-200 rounded-lg p-4">
                        {states.map(state => (
                          <label key={state.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.expansion_states.includes(state.id)}
                              onChange={() => handleStateSelection(state.id)}
                              className="rounded border-slate-300 text-brand-blue-600 focus:ring-brand-blue-500"
                            />
                            <span className="ml-2 text-sm text-slate-700">{state.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Step 5: Contact Details */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Contact Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Contact Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => handleInputChange('contact_email', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                        placeholder="contact@yourbrand.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Contact Address
                      </label>
                      <textarea
                        value={formData.contact_address}
                        onChange={(e) => handleInputChange('contact_address', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
                        placeholder="Head Office Address"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-yellow-200 bg-yellow-50/60 flex-shrink-0">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-yellow-100'
              }`}
            >
              Previous
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-yellow-300 rounded-lg text-slate-800 bg-white hover:bg-yellow-50 transition-colors"
              >
                Cancel
              </button>
              
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={loading}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors shadow"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || loading}
                  className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{initialData ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : initialData ? 'Update Franchise' : 'Create Franchise'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}