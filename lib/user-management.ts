/**
 * Utility functions for user management operations
 */

import { supabase } from './supabase-client';

/**
 * Delete a guide user and all their associated data
 * This includes:
 * - Guide record
 * - Profile picture from storage
 * - Verification document from storage
 * - Itinerary images from storage
 * - Availability records
 * - Itinerary records
 * - Auth user from Supabase
 * 
 * @param guideId - The guide ID to delete
 * @param userId - The auth user ID to delete
 * @returns Object with success status and error message if any
 */
export async function deleteGuideUserCompletely(guideId: string, userId: string) {
  try {
    // Call API endpoint that uses admin credentials for complete deletion
    const response = await fetch('/api/admin-delete-guide', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ guideId, userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error deleting guide via API:', errorData);
      return { success: false, error: errorData.error || 'Failed to delete guide' };
    }

    const result = await response.json();
    return { success: true, error: null };
  } catch (err) {
    console.error('Error in deleteGuideUserCompletely:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
/**
 * Deactivate a guide account
 * @param guideId - The guide ID
 * @param reason - Reason for deactivation
 */
export async function deactivateGuide(guideId: string, reason: string) {
  try {
    if (!supabase) {
      console.error('Supabase not initialized');
      return { success: false, error: 'Supabase not initialized' };
    }
    const { error } = await supabase!
      .from('guides')
      .update({
        is_deactivated: true,
        deactivation_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', guideId);

    if (error) {
      console.error('Error deactivating guide:', error);
      return { success: false, error: 'Failed to deactivate guide' };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Error in deactivateGuide:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Activate a deactivated guide account
 * @param guideId - The guide ID
 */
export async function activateGuide(guideId: string) {
  try {
    if (!supabase) {
      console.error('Supabase not initialized');
      return { success: false, error: 'Supabase not initialized' };
    }
    const { error } = await supabase!
      .from('guides')
      .update({
        is_deactivated: false,
        deactivation_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', guideId);

    if (error) {
      console.error('Error activating guide:', error);
      return { success: false, error: 'Failed to activate guide' };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Error in activateGuide:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
