import { supabase } from './supabase'
import { storageClient } from './supabase'

function handleResponse({ data, error }) {
  if (error) throw error
  return data
}

function wrapError(e, context) {
  const err = new Error(context)
  err.cause = e
  return err
}

// Storage bucket name
const STORAGE_BUCKET = 'franchise-gallery-images'

// Upload image to Supabase Storage
export async function uploadImage(file, franchiseId) {
  try {
    // Check if file is valid
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file object provided')
    }
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${franchiseId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    // Upload file to storage using service key client (bypasses RLS)
    const { data, error } = await storageClient.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      throw error
    }
    
    // Get public URL
    const { data: urlData } = storageClient.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName)
    
    return {
      fileName: data.path,
      publicUrl: urlData.publicUrl
    }
  } catch (e) {
    throw wrapError(e, 'Failed to upload image')
  }
}

// Add gallery image to database
export async function addGalleryImage(franchiseId, imageUrl, altText = null, displayOrder = 0) {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .insert([{
        franchise_id: franchiseId,
        image_url: imageUrl,
        image_alt_text: altText,
        display_order: displayOrder
      }])
      .select()
      .single()
    
    if (error) throw error
    
    return data
  } catch (e) {
    console.error('Error adding gallery image:', e)
    throw wrapError(e, 'Failed to add gallery image')
  }
}

// Get gallery images for a franchise
export async function getGalleryImages(franchiseId) {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('franchise_id', franchiseId)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    
    return data || []
  } catch (e) {
    console.error('Error fetching gallery images:', e)
    throw wrapError(e, 'Failed to fetch gallery images')
  }
}

// Update gallery image
export async function updateGalleryImage(imageId, updates) {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .update(updates)
      .eq('id', imageId)
      .select()
      .single()
    
    if (error) throw error
    
    return data
  } catch (e) {
    console.error('Error updating gallery image:', e)
    throw wrapError(e, 'Failed to update gallery image')
  }
}

// Delete gallery image from database
export async function deleteGalleryImage(imageId) {
  try {
    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', imageId)
    
    if (error) throw error
    
    return true
  } catch (e) {
    console.error('Error deleting gallery image from database:', e)
    throw wrapError(e, 'Failed to delete gallery image from database')
  }
}

// Delete gallery image completely (both database and storage)
export async function deleteGalleryImageComplete(imageId) {
  try {
    // First get the image data to extract the file name for storage deletion
    const { data: imageData, error: fetchError } = await supabase
      .from('gallery')
      .select('image_url')
      .eq('id', imageId)
      .single()
    
    if (fetchError) {
      throw fetchError
    }
    
    // Extract file name from URL for storage deletion
    const imageUrl = imageData.image_url
    const urlParts = imageUrl.split('/')
    const fileName = urlParts.slice(-2).join('/') // Get last two parts (franchiseId/filename)
    
    // Delete from database first
    const { error: dbError } = await supabase
      .from('gallery')
      .delete()
      .eq('id', imageId)
    
    if (dbError) {
      throw dbError
    }
    
    // Delete from storage
    try {
      const { error: storageError } = await storageClient.storage
        .from(STORAGE_BUCKET)
        .remove([fileName])
      
      if (storageError) {
        // Don't throw here as the database deletion was successful
      }
    } catch (storageError) {
      // Storage deletion failed but database deletion was successful
    }
    
    return true
  } catch (e) {
    console.error('Error deleting gallery image completely:', e)
    throw wrapError(e, 'Failed to delete gallery image completely')
  }
}

// Delete image from Supabase Storage
export async function deleteImage(fileName) {
  try {
    const { error } = await storageClient.storage
      .from(STORAGE_BUCKET)
      .remove([fileName])
    
    if (error) {
      throw error
    }
    
    return true
  } catch (e) {
    console.error('Error in deleteImage:', e)
    throw wrapError(e, 'Failed to delete image from storage')
  }
}

// Delete multiple images from Supabase Storage
export async function deleteImages(fileNames) {
  try {
    if (!fileNames || fileNames.length === 0) {
      return true
    }
    
    const { error } = await storageClient.storage
      .from(STORAGE_BUCKET)
      .remove(fileNames)
    
    if (error) {
      throw error
    }
    
    return true
  } catch (e) {
    console.error('Error in deleteImages:', e)
    throw wrapError(e, 'Failed to delete images from storage')
  }
}

// Delete all gallery images for a franchise
export async function deleteFranchiseGalleryImages(franchiseId) {
  try {
    // First get all gallery images to extract file names for storage deletion
    const galleryImages = await getGalleryImages(franchiseId)
    
    // Extract file names from URLs for storage deletion
    const fileNames = galleryImages.map(img => {
      const url = img.image_url
      // Extract file name from URL (assuming format: .../bucket/path/filename)
      const parts = url.split('/')
      return parts.slice(-2).join('/') // Get last two parts (franchiseId/filename)
    })
    
    // Delete from storage
    if (fileNames.length > 0) {
      await deleteImages(fileNames)
    }
    
    // Delete from database
    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('franchise_id', franchiseId)
    
    if (error) throw error
    
    return true
  } catch (e) {
    console.error('Error deleting franchise gallery images:', e)
    throw wrapError(e, 'Failed to delete franchise gallery images')
  }
}

// Reorder gallery images
export async function reorderGalleryImages(franchiseId, imageIds) {
  try {
    const updates = imageIds.map((imageId, index) => ({
      id: imageId,
      display_order: index
    }))
    
    const { error } = await supabase
      .from('gallery')
      .upsert(updates, { onConflict: 'id' })
    
    if (error) throw error
    
    return true
  } catch (e) {
    console.error('Error reordering gallery images:', e)
    throw wrapError(e, 'Failed to reorder gallery images')
  }
}

// Get total gallery images count across all franchises
export async function getGalleryCount() {
  try {
    const { count, error } = await supabase
      .from('gallery')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    return count || 0
  } catch (e) {
    console.error('Error fetching gallery count:', e)
    return 0
  }
}

export default {
  uploadImage,
  addGalleryImage,
  getGalleryImages,
  updateGalleryImage,
  deleteGalleryImage,
  deleteGalleryImageComplete,
  deleteImage,
  deleteImages,
  deleteFranchiseGalleryImages,
  reorderGalleryImages,
  getGalleryCount
}