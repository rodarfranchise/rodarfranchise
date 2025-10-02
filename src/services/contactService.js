import { supabase } from './supabase'

/**
 * Submit a contact query to the database
 * @param {Object} contactData - The contact form data
 * @param {string} contactData.name - User's full name
 * @param {string} contactData.email - User's email address
 * @param {string} contactData.phone - User's phone number (optional)
 * @param {string} contactData.subject - Subject of the query
 * @param {string} contactData.message - The message content
 * @returns {Promise<Object>} The created contact query
 */
export async function submitContactQuery(contactData) {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    // Validate required fields
    if (!contactData.name || !contactData.email || !contactData.subject || !contactData.message) {
      throw new Error('Missing required fields: name, email, subject, and message are required')
    }

    // Insert the contact query into the database
    const { data, error } = await supabase
      .from('contact_queries')
      .insert([
        {
          name: contactData.name.trim(),
          email: contactData.email.trim().toLowerCase(),
          phone: contactData.phone?.trim() || null,
          subject: contactData.subject.trim(),
          message: contactData.message.trim(),
          status: 'new'
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error inserting contact query:', error)
      throw new Error(`Failed to submit contact query: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error in submitContactQuery:', error)
    throw error
  }
}

/**
 * Get all contact queries for admin dashboard
 * @returns {Promise<Array>} Array of contact queries
 */
export async function getContactQueries() {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    const { data, error } = await supabase
      .from('contact_queries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching contact queries:', error)
      throw new Error(`Failed to fetch contact queries: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error in getContactQueries:', error)
    throw error
  }
}

/**
 * Update contact query status
 * @param {string} queryId - The ID of the contact query
 * @param {string} status - New status ('new', 'read', 'replied', 'closed')
 * @param {string} adminNotes - Optional admin notes
 * @returns {Promise<Object>} Updated contact query
 */
export async function updateContactQueryStatus(queryId, status, adminNotes = null) {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    const updateData = {
      status,
      updated_at: new Date().toISOString()
    }

    if (adminNotes) {
      updateData.admin_notes = adminNotes.trim()
    }

    const { data, error } = await supabase
      .from('contact_queries')
      .update(updateData)
      .eq('id', queryId)
      .select()
      .single()

    if (error) {
      console.error('Error updating contact query status:', error)
      throw new Error(`Failed to update contact query: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error in updateContactQueryStatus:', error)
    throw error
  }
}

/**
 * Delete a contact query
 * @param {string} queryId - The ID of the contact query to delete
 * @returns {Promise<boolean>} Success status
 */
export async function deleteContactQuery(queryId) {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    const { error } = await supabase
      .from('contact_queries')
      .delete()
      .eq('id', queryId)

    if (error) {
      console.error('Error deleting contact query:', error)
      throw new Error(`Failed to delete contact query: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error('Error in deleteContactQuery:', error)
    throw error
  }
}

/**
 * Get contact query statistics for admin dashboard
 * @returns {Promise<Object>} Statistics object
 */
export async function getContactQueryStats() {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    // Get total count
    const { count: totalCount, error: totalError } = await supabase
      .from('contact_queries')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      throw new Error(`Failed to fetch total count: ${totalError.message}`)
    }

    // Get count by status
    const { data: statusData, error: statusError } = await supabase
      .from('contact_queries')
      .select('status')

    if (statusError) {
      throw new Error(`Failed to fetch status data: ${statusError.message}`)
    }

    // Calculate status counts
    const statusCounts = statusData.reduce((acc, query) => {
      acc[query.status] = (acc[query.status] || 0) + 1
      return acc
    }, {})

    const stats = {
      total: totalCount || 0,
      new: statusCounts.new || 0,
      read: statusCounts.read || 0,
      replied: statusCounts.replied || 0,
      closed: statusCounts.closed || 0
    }

    return stats
  } catch (error) {
    console.error('Error in getContactQueryStats:', error)
    throw error
  }
}
