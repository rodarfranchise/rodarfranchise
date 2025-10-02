import { supabase } from './supabase'
import { uploadImage, deleteImage, addGalleryImage, getGalleryImages, deleteFranchiseGalleryImages, deleteGalleryImageComplete } from './galleryService'

// Image compression function
function compressImage(file, maxWidth = 800, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// Helper function to wrap errors with context
function wrapError(error, context) {
  const wrappedError = new Error(context)
  wrappedError.cause = error
  return wrappedError
}

// Get all franchises for public display
export async function getAllFranchises() {
  try {
    const { data, error } = await supabase
      .from('franchise_listings')
      .select(`
        id,
        brand_name,
        tagline,
        description,
        logo_url,
        min_investment,
        max_investment,
        min_area,
        max_area,
        area_unit,
        franchise_outlets,
        status,
        is_active,
        created_at,
        industries:industry_id(id, name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Fetch gallery images for each franchise
    const franchisesWithGallery = await Promise.all(
      (data || []).map(async (franchise) => {
        try {
          const galleryImages = await getGalleryImages(franchise.id)
          return {
            ...franchise,
            gallery_images: galleryImages.map(img => img.image_url),
            min_investment: franchise.min_investment ?? null,
            max_investment: franchise.max_investment ?? null,
            min_area: franchise.min_area ?? null,
            max_area: franchise.max_area ?? null,
            franchise_outlets: franchise.franchise_outlets ?? null
          }
        } catch (galleryError) {
          console.error(`Error fetching gallery for franchise ${franchise.id}:`, galleryError)
          return {
            ...franchise,
            gallery_images: [],
            min_investment: franchise.min_investment ?? null,
            max_investment: franchise.max_investment ?? null,
            min_area: franchise.min_area ?? null,
            max_area: franchise.max_area ?? null,
            franchise_outlets: franchise.franchise_outlets ?? null
          }
        }
      })
    )
    
    return franchisesWithGallery
  } catch (error) {
    console.error('Error fetching franchises:', error)
    throw wrapError(error, 'Failed to fetch franchises')
  }
}

// Get all franchises for admin dashboard
export async function getAdminFranchiseListings() {
  try {
    const { data, error } = await supabase
      .from('franchise_listings')
      .select(`
        id,
        brand_name,
        tagline,
        description,
        logo_url,
        min_investment,
        max_investment,
        is_active,
        created_at,
        industries:industry_id(id, name)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Fetch gallery images for each franchise
    const franchisesWithGallery = await Promise.all(
      (data || []).map(async (franchise) => {
        try {
          const galleryImages = await getGalleryImages(franchise.id)
          return {
            ...franchise,
            gallery_images: galleryImages.map(img => img.image_url),
            min_investment: franchise.min_investment ?? null,
            max_investment: franchise.max_investment ?? null,
            min_area: franchise.min_area ?? null,
            max_area: franchise.max_area ?? null,
            franchise_outlets: franchise.franchise_outlets ?? null
          }
        } catch (galleryError) {
          console.error(`Error fetching gallery for franchise ${franchise.id}:`, galleryError)
          return {
            ...franchise,
            gallery_images: [],
            min_investment: franchise.min_investment ?? null,
            max_investment: franchise.max_investment ?? null,
            min_area: franchise.min_area ?? null,
            max_area: franchise.max_area ?? null,
            franchise_outlets: franchise.franchise_outlets ?? null
          }
        }
      })
    )
    
    return franchisesWithGallery
  } catch (error) {
    console.error('Error fetching admin franchise listings:', error)
    throw wrapError(error, 'Failed to fetch franchise listings for admin')
  }
}

// Get franchise by ID
export async function getFranchiseById(id) {
  try {
    const { data, error } = await supabase
      .from('franchise_listings')
      .select(`
        *,
        industries:industry_id(id, name)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) throw error
    
    // Fetch gallery images from the gallery table
    try {
      const galleryImages = await getGalleryImages(id)
      return {
        ...data,
        gallery_images: galleryImages.map(img => img.image_url)
      }
    } catch (galleryError) {
      console.error(`Error fetching gallery for franchise ${id}:`, galleryError)
      return {
        ...data,
        gallery_images: []
      }
    }
  } catch (error) {
    console.error('Error fetching franchise by ID:', error)
    throw wrapError(error, 'Failed to fetch franchise details')
  }
}

// Search franchises
export async function searchFranchises(query, filters = {}) {
  try {
    let supabaseQuery = supabase
      .from('franchise_listings')
      .select(`
        id,
        brand_name,
        tagline,
        description,
        logo_url,
        min_investment,
        max_investment,
        min_area,
        max_area,
        area_unit,
        franchise_outlets,
        status,
        is_active,
        created_at,
        industries:industry_id(id, name)
      `)
      .eq('is_active', true)

    // Apply text search
    if (query && typeof query === 'string' && query.trim()) {
      supabaseQuery = supabaseQuery.or(`brand_name.ilike.%${query}%,tagline.ilike.%${query}%,description.ilike.%${query}%`)
    }

    // Apply filters - only apply if they have meaningful values
    if (filters.industry_id || (filters.industryIds && filters.industryIds.length > 0)) {
      const industryId = filters.industry_id || filters.industryIds[0]
      supabaseQuery = supabaseQuery.eq('industry_id', industryId)
    }

    // Investment filtering: for overlapping ranges
    // User wants franchises where the investment range overlaps with their budget
    if (filters.minInvestment && filters.minInvestment > 0) {
      // Franchise max_investment should be >= user's minimum (franchise has options at or above user's min)
      supabaseQuery = supabaseQuery.gte('max_investment', filters.minInvestment)
    }

    if (filters.maxInvestment && filters.maxInvestment > 0) {
      // Franchise min_investment should be <= user's maximum (franchise has options at or below user's max)
      supabaseQuery = supabaseQuery.lte('min_investment', filters.maxInvestment)
    }

    if (filters.min_area && filters.min_area > 0) {
      supabaseQuery = supabaseQuery.gte('min_area', filters.min_area)
    }

    if (filters.max_area && filters.max_area > 0) {
      supabaseQuery = supabaseQuery.lte('max_area', filters.max_area)
    }

    const { data, error } = await supabaseQuery.order('created_at', { ascending: false })

    if (error) throw error
    
    // Fetch gallery images for each franchise
    const franchisesWithGallery = await Promise.all(
      (data || []).map(async (franchise) => {
        try {
          const galleryImages = await getGalleryImages(franchise.id)
          return {
            ...franchise,
            gallery_images: galleryImages.map(img => img.image_url),
            min_investment: franchise.min_investment ?? null,
            max_investment: franchise.max_investment ?? null,
            min_area: franchise.min_area ?? null,
            max_area: franchise.max_area ?? null,
            franchise_outlets: franchise.franchise_outlets ?? null
          }
        } catch (galleryError) {
          console.error(`Error fetching gallery for franchise ${franchise.id}:`, galleryError)
          return {
            ...franchise,
            gallery_images: [],
            min_investment: franchise.min_investment ?? null,
            max_investment: franchise.max_investment ?? null,
            min_area: franchise.min_area ?? null,
            max_area: franchise.max_area ?? null,
            franchise_outlets: franchise.franchise_outlets ?? null
          }
        }
      })
    )
    
    return franchisesWithGallery
  } catch (error) {
    console.error('Error searching franchises:', error)
    throw wrapError(error, 'Failed to search franchises')
  }
}

// Create new franchise
export async function createFranchise(franchiseData) {
  try {
    // Clean the data
    const cleanData = { ...franchiseData }
    
    // Handle logo upload
    if (cleanData.logo_file && cleanData.logo_file instanceof File) {
      try {
        // Compress the image
        const compressedLogo = await compressImage(cleanData.logo_file)
        const logoFile = new File([compressedLogo], cleanData.logo_file.name, {
          type: 'image/jpeg'
        })
        
        // Upload to Supabase Storage
        const logoResult = await uploadImage(logoFile, 'temp-logo')
        cleanData.logo_url = logoResult.publicUrl
      } catch (logoError) {
        console.error('Error uploading logo:', logoError)
        throw new Error('Failed to upload logo')
      }
    }
    
    // Remove the file objects before sending to Supabase
    delete cleanData.logo_file;
    delete cleanData.gallery_files;
    
    // Make sure expansion_states is an array of UUIDs
    if (cleanData.expansion_states && Array.isArray(cleanData.expansion_states)) {
      cleanData.expansion_states = cleanData.expansion_states.filter(state => 
        typeof state === 'string' && state.length > 0
      )
    } else {
      cleanData.expansion_states = []
    }
    
    // Insert the franchise
    const { data, error } = await supabase
      .from('franchise_listings')
      .insert([cleanData])
      .select()
      .single()
          
    if (error) {
      console.error('Error creating franchise:', error)
      throw error
    }
    
    // Handle gallery files - upload to Supabase Storage and add to gallery table
    if (franchiseData.gallery_files && Array.isArray(franchiseData.gallery_files) && franchiseData.gallery_files.length > 0) {
      try {
        for (let i = 0; i < franchiseData.gallery_files.length; i++) {
          const file = franchiseData.gallery_files[i];
          if (file instanceof File) {
            try {
              const compressedImage = await compressImage(file)
              const compressedFile = new File([compressedImage], file.name, {
                type: 'image/jpeg'
              })
              
              const result = await uploadImage(compressedFile, data.id)
              await addGalleryImage(data.id, result.publicUrl, `Gallery image ${i + 1}`, i)
            } catch (fileError) {
              console.error('Error processing gallery file:', file.name, fileError)
            }
          }
        }
        
        console.log('Gallery images successfully uploaded to storage and gallery table');
      } catch (galleryError) {
        console.error('Error uploading gallery images:', galleryError);
        // Don't fail the entire operation if gallery images fail
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error creating franchise:', error)
    throw wrapError(error, 'Failed to create franchise')
  }
}

// Get complete franchise details for admin
export async function getCompleteFranchiseById(id) {
  try {
    const { data, error } = await supabase
      .from('franchise_listings')
      .select(`
        *,
        industries:industry_id(id, name)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    // Fetch gallery images from the gallery table
    try {
      const galleryImages = await getGalleryImages(id)
      return {
        ...data,
        gallery_images: galleryImages.map(img => img.image_url)
      }
    } catch (galleryError) {
      console.error(`Error fetching gallery for franchise ${id}:`, galleryError)
      return {
        ...data,
        gallery_images: []
      }
    }
  } catch (error) {
    console.error('Error fetching complete franchise details:', error)
    throw wrapError(error, 'Failed to fetch complete franchise details')
  }
}

// Update franchise
export async function updateFranchise(id, franchiseData) {
  try {
    // Clean the data
    const cleanData = { ...franchiseData }
    
    // Handle logo update
    if (cleanData.logo_file && cleanData.logo_file instanceof File) {
      console.log('Processing logo file update:', cleanData.logo_file.name)
      
      try {
        // Compress the image
        const compressedLogo = await compressImage(cleanData.logo_file)
        const logoFile = new File([compressedLogo], cleanData.logo_file.name, {
          type: 'image/jpeg'
        })
        
        // Upload to Supabase Storage
        const logoResult = await uploadImage(logoFile, id)
        cleanData.logo_url = logoResult.publicUrl
        console.log('Logo updated successfully:', logoResult.publicUrl)
      } catch (logoError) {
        console.error('Error uploading logo:', logoError)
        throw new Error('Failed to upload logo')
      }
    }
    
    // Extract gallery data from the franchise data
    const galleryImages = cleanData.gallery_files || [];
    const existingGalleryImages = cleanData.existing_gallery_images || [];
    
    // Remove the file objects before sending to Supabase
    delete cleanData.logo_file;
    delete cleanData.gallery_files;
    delete cleanData.existing_gallery_images;
    
    // Make sure expansion_states is an array of UUIDs
    if (cleanData.expansion_states && Array.isArray(cleanData.expansion_states)) {
      cleanData.expansion_states = cleanData.expansion_states.filter(state => 
        typeof state === 'string' && state.length > 0
      )
    } else {
      cleanData.expansion_states = []
    }
    
    // Update the franchise
    const { data, error } = await supabase
      .from('franchise_listings')
      .update(cleanData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating franchise:', error)
      throw error
    }
    
    // Update gallery images in the gallery table
    try {
      console.log('Updating gallery images in gallery table');
      
      // Get current gallery images from the gallery table
      const currentGalleryImages = await getGalleryImages(id);
      console.log('Current gallery images:', currentGalleryImages.length);
      
      // Handle new gallery images upload
      if (galleryImages && galleryImages.length > 0) {
        console.log('Processing new gallery images:', galleryImages.length);
        
        // Upload new images to Supabase Storage and add to gallery table
        for (let i = 0; i < galleryImages.length; i++) {
          const imageFile = galleryImages[i];
          console.log(`Processing image ${i + 1}/${galleryImages.length}:`, {
            file: imageFile,
            type: typeof imageFile,
            isFile: imageFile instanceof File,
            name: imageFile?.name,
            size: imageFile?.size
          });
          
          // Skip invalid files
          if (!imageFile || !(imageFile instanceof File)) {
            console.warn(`Skipping invalid file at index ${i}:`, imageFile);
            continue;
          }
          
          try {
            console.log(`Uploading image ${i + 1}/${galleryImages.length}:`, imageFile.name);
            const uploadResult = await uploadImage(imageFile, id);
            console.log('Upload successful:', uploadResult.publicUrl);
            
            // Add to gallery table
            await addGalleryImage(id, uploadResult.publicUrl, `Gallery image ${currentGalleryImages.length + i + 1}`, currentGalleryImages.length + i);
          } catch (uploadError) {
            console.error(`Failed to upload image ${i + 1}:`, uploadError);
            // Continue with other images even if one fails
          }
        }
      }
      
      // Handle existing gallery images removal
      if (existingGalleryImages !== undefined) {
        console.log('Processing existing gallery images removal:', existingGalleryImages.length);
        
        // Get current gallery images again to get the latest state
        const updatedGalleryImages = await getGalleryImages(id);
        
        // Find images to remove (images not in existingGalleryImages)
        const existingUrls = existingGalleryImages.map(img => img.image_url || img);
        const imagesToRemove = updatedGalleryImages.filter(img => !existingUrls.includes(img.image_url));
        
        console.log('Images to remove:', imagesToRemove.length);
        
        // Delete images from gallery table
        for (const imageToRemove of imagesToRemove) {
          try {
            await deleteGalleryImage(imageToRemove.id);
            console.log('Removed gallery image:', imageToRemove.id);
          } catch (deleteError) {
            console.error('Error removing gallery image:', deleteError);
          }
        }
      }
      
      console.log('Gallery images updated successfully');
      
    } catch (galleryError) {
      console.error('Error updating gallery images:', galleryError);
      // Don't fail the entire operation if gallery images fail
      console.log('Franchise update succeeded, but gallery update failed');
    }
    
    return data;
  } catch (error) {
    console.error('Error updating franchise:', error)
    throw wrapError(error, 'Failed to update franchise')
  }
}

// Delete franchise
export async function deleteFranchise(id) {
  try {
    // Delete gallery images first (this will also delete from storage)
    try {
      await deleteFranchiseGalleryImages(id);
      console.log('Gallery images deleted successfully');
    } catch (galleryError) {
      console.error('Error deleting gallery images:', galleryError);
      // Continue with franchise deletion even if gallery deletion fails
    }
    
    // Delete the franchise (this will cascade delete related data)
    const { error } = await supabase
      .from('franchise_listings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting franchise:', error)
      throw error
    }
    
    console.log('Franchise deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting franchise:', error)
    throw wrapError(error, 'Failed to delete franchise')
  }
}

// Toggle franchise active status
export async function toggleFranchiseStatus(id, isActive) {
  try {
    const { data, error } = await supabase
      .from('franchise_listings')
      .update({ is_active: isActive, status: isActive ? 'active' : 'inactive' })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error toggling franchise status:', error)
    throw wrapError(error, 'Failed to toggle franchise status')
  }
}

// Get all industries
export async function getIndustries() {
  try {
    const { data, error } = await supabase
      .from('industries')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching industries:', error)
    throw wrapError(error, 'Failed to fetch industries')
  }
}

// Get all states
export async function getStates() {
  try {
    const { data, error } = await supabase
      .from('states')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching states:', error)
    throw wrapError(error, 'Failed to fetch states')
  }
}

// Get cities by state
export async function getCitiesByState(stateId) {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('id, name')
      .eq('state_id', stateId)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching cities by state:', error)
    throw wrapError(error, 'Failed to fetch cities')
  }
}

// Get sectors by industry
export async function getSectorsByIndustry(industryId) {
  try {
    const { data, error } = await supabase
      .from('sectors')
      .select('id, name')
      .eq('industry_id', industryId)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching sectors by industry:', error)
    throw wrapError(error, 'Failed to fetch sectors')
  }
}

// Get services by sector
export async function getServicesBySector(sectorId) {
  try {
    const { data, error } = await supabase
      .from('services_products')
      .select('id, name')
      .eq('sector_id', sectorId)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching services by sector:', error)
    throw wrapError(error, 'Failed to fetch services')
  }
}

// Industry management functions
export async function createIndustry(name) {
  try {
    const { data, error } = await supabase
      .from('industries')
      .insert([{ name }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating industry:', error)
    throw wrapError(error, 'Failed to create industry')
  }
}

export async function updateIndustry(id, name) {
  try {
    const { data, error } = await supabase
      .from('industries')
      .update({ name })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating industry:', error)
    throw wrapError(error, 'Failed to update industry')
  }
}

export async function deleteIndustry(id) {
  try {
    const { error } = await supabase
      .from('industries')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting industry:', error)
    throw wrapError(error, 'Failed to delete industry')
  }
}

// Sector management functions
export async function getSectors() {
  try {
    const { data, error } = await supabase
      .from('sectors')
      .select('id, name, industry_id, industries:industry_id(name)')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching sectors:', error)
    throw wrapError(error, 'Failed to fetch sectors')
  }
}

export async function createSector(name, industryId) {
  try {
    const { data, error } = await supabase
      .from('sectors')
      .insert([{ name, industry_id: industryId }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating sector:', error)
    throw wrapError(error, 'Failed to create sector')
  }
}

export async function updateSector(id, name, industryId) {
  try {
    const { data, error } = await supabase
      .from('sectors')
      .update({ name, industry_id: industryId })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating sector:', error)
    throw wrapError(error, 'Failed to update sector')
  }
}

export async function deleteSector(id) {
  try {
    const { error } = await supabase
      .from('sectors')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting sector:', error)
    throw wrapError(error, 'Failed to delete sector')
  }
}

// Service management functions
export async function getServices() {
  try {
    const { data, error } = await supabase
      .from('services_products')
      .select('id, name, sector_id, sectors:sector_id(name, industries:industry_id(name))')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching services:', error)
    throw wrapError(error, 'Failed to fetch services')
  }
}

export async function createService(name, sectorId) {
  try {
    const { data, error } = await supabase
      .from('services_products')
      .insert([{ name, sector_id: sectorId }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating service:', error)
    throw wrapError(error, 'Failed to create service')
  }
}

export async function updateService(id, name, sectorId) {
  try {
    const { data, error } = await supabase
      .from('services_products')
      .update({ name, sector_id: sectorId })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating service:', error)
    throw wrapError(error, 'Failed to update service')
  }
}

export async function deleteService(id) {
  try {
    const { error } = await supabase
      .from('services_products')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting service:', error)
    throw wrapError(error, 'Failed to delete service')
  }
}

// State management functions
export async function createState(name) {
  try {
    const { data, error } = await supabase
      .from('states')
      .insert([{ name }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating state:', error)
    throw wrapError(error, 'Failed to create state')
  }
}

export async function updateState(id, name) {
  try {
    const { data, error } = await supabase
      .from('states')
      .update({ name })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating state:', error)
    throw wrapError(error, 'Failed to update state')
  }
}

export async function deleteState(id) {
  try {
    const { error } = await supabase
      .from('states')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting state:', error)
    throw wrapError(error, 'Failed to delete state')
  }
}

// City management functions
export async function getCities() {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('id, name, state_id, states:state_id(name)')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching cities:', error)
    throw wrapError(error, 'Failed to fetch cities')
  }
}

export async function createCity(name, stateId) {
  try {
    const { data, error } = await supabase
      .from('cities')
      .insert([{ name, state_id: stateId }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating city:', error)
    throw wrapError(error, 'Failed to create city')
  }
}

export async function updateCity(id, name, stateId) {
  try {
    const { data, error } = await supabase
      .from('cities')
      .update({ name, state_id: stateId })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating city:', error)
    throw wrapError(error, 'Failed to update city')
  }
}

export async function deleteCity(id) {
  try {
    const { error } = await supabase
      .from('cities')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting city:', error)
    throw wrapError(error, 'Failed to delete city')
  }
}

// Get dashboard statistics
export async function getDashboardStats() {
  try {
    const [franchisesResult, industriesResult] = await Promise.all([
      supabase
        .from('franchise_listings')
        .select('id, is_active, created_at', { count: 'exact' }),
      supabase
        .from('industries')
        .select('id', { count: 'exact' })
    ])

    if (franchisesResult.error) throw franchisesResult.error
    if (industriesResult.error) throw industriesResult.error

    const totalFranchises = franchisesResult.count || 0
    const activeFranchises = franchisesResult.data?.filter(f => f.is_active).length || 0
    const inactiveFranchises = totalFranchises - activeFranchises
    const totalIndustries = industriesResult.count || 0

    return {
      totalFranchises,
      activeFranchises,
      inactiveFranchises,
      totalIndustries
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw wrapError(error, 'Failed to fetch dashboard statistics')
  }
}

export default {
  getAllFranchises,
  getAdminFranchiseListings,
  getFranchiseById,
  searchFranchises,
  createFranchise,
  getCompleteFranchiseById,
  updateFranchise,
  deleteFranchise,
  toggleFranchiseStatus,
  getIndustries,
  getStates,
  getCitiesByState,
  getSectorsByIndustry,
  getServicesBySector,
  getDashboardStats,
  // Industry management
  createIndustry,
  updateIndustry,
  deleteIndustry,
  // Sector management
  getSectors,
  createSector,
  updateSector,
  deleteSector,
  // Service management
  getServices,
  createService,
  updateService,
  deleteService,
  // State management
  createState,
  updateState,
  deleteState,
  // City management
  getCities,
  createCity,
  updateCity,
  deleteCity
}
