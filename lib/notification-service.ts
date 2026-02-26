/**
 * Notification Service
 * Handles creating and managing notifications for users
 */

import { supabase } from './supabase-client';

export enum NotificationType {
  // Guide notifications
  GUIDE_APPROVED = 'guide_approved',
  GUIDE_REJECTED = 'guide_rejected',
  GUIDE_DEACTIVATED = 'guide_deactivated',
  GUIDE_REACTIVATED = 'guide_reactivated',
  GUIDE_DELETED = 'guide_deleted',
  GUIDE_SAVED = 'guide_saved',
  GUIDE_UNSAVED = 'guide_unsaved',
  
  // Booking notifications
  BOOKING_CREATED = 'booking_created',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_COMPLETED = 'booking_completed',
  BOOKING_CANCELLED = 'booking_cancelled',
  
  // Rating & Review notifications
  RATING_RECEIVED = 'rating_received',
  REVIEW_POSTED = 'review_posted',
  REVIEW_DELETED = 'review_deleted',
  
  // Trip notifications
  TRIP_COMPLETED = 'trip_completed',
  
  // User notifications
  TOURIST_LOGIN = 'tourist_login',
  
  // Generic
  MESSAGE = 'message',
  ADMIN_ACTION = 'admin_action',
  CUSTOM = 'custom',
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType | string;
  title: string;
  message: string;
  data?: Record<string, any> | null;
  related_user_id?: string | null;
  related_guide_id?: string | null;
  related_booking_id?: string | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new notification for a user
 */
export async function createNotification(
  userId: string,
  type: NotificationType | string,
  title: string,
  message: string,
  options?: {
    data?: Record<string, any>;
    relatedUserId?: string;
    relatedGuideId?: string;
    relatedBookingId?: string;
  }
) {
  if (!supabase) {
    console.error('Supabase client not available');
    return { error: 'Database connection failed' };
  }

  try {
    const { data, error } = await supabase!.from('notifications').insert([
      {
        user_id: userId,
        type,
        title,
        message,
        data: options?.data || null,
        related_user_id: options?.relatedUserId || null,
        related_guide_id: options?.relatedGuideId || null,
        related_booking_id: options?.relatedBookingId || null,
      },
    ]);

    if (error) {
      console.error('Error creating notification:', error);
      return { error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in createNotification:', err);
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Get all notifications for a user
 */
export async function getUserNotifications(userId: string, limit = 20, offset = 0) {
  if (!supabase) {
    console.error('Supabase client not available');
    return { notifications: [], total: 0, error: 'Database connection failed' };
  }

  try {
    const { data, error, count } = await supabase!
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching notifications:', error);
      return { notifications: [], total: 0, error: error.message };
    }

    return { notifications: data || [], total: count || 0, error: null };
  } catch (err) {
    console.error('Error in getUserNotifications:', err);
    return { notifications: [], total: 0, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string) {
  if (!supabase) {
    console.error('Supabase client not available');
    return { count: 0, error: 'Database connection failed' };
  }

  try {
    const { count, error } = await supabase!
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error fetching unread count:', error);
      return { count: 0, error: error.message };
    }

    return { count: count || 0, error: null };
  } catch (err) {
    console.error('Error in getUnreadNotificationCount:', err);
    return { count: 0, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  if (!supabase) {
    console.error('Supabase client not available');
    return { error: 'Database connection failed' };
  }

  try {
    const { data, error } = await supabase!
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .select();

    if (error) {
      console.error('Error marking notification as read:', error);
      return { error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in markNotificationAsRead:', err);
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  if (!supabase) {
    console.error('Supabase client not available');
    return { error: 'Database connection failed' };
  }

  try {
    const { data, error } = await supabase!
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select();

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return { error: error.message };
    }

    return { data, count: (data || []).length, error: null };
  } catch (err) {
    console.error('Error in markAllNotificationsAsRead:', err);
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string) {
  if (!supabase) {
    console.error('Supabase client not available');
    return { error: 'Database connection failed' };
  }

  try {
    const { error } = await supabase!.from('notifications').delete().eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    console.error('Error in deleteNotification:', err);
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Delete all notifications for a user (optional: filter by type or read status)
 */
export async function deleteAllNotifications(userId: string, options?: { type?: string; isRead?: boolean }) {
  if (!supabase) {
    console.error('Supabase client not available');
    return { count: 0, error: 'Database connection failed' };
  }

  try {
    let query = supabase!.from('notifications').delete().eq('user_id', userId);

    if (options?.type) {
      query = query.eq('type', options.type);
    }

    if (options?.isRead !== undefined) {
      query = query.eq('is_read', options.isRead);
    }

    const { data, error } = await query.select();

    if (error) {
      console.error('Error deleting notifications:', error);
      return { count: 0, error: error.message };
    }

    return { count: (data || []).length, error: null };
  } catch (err) {
    console.error('Error in deleteAllNotifications:', err);
    return { count: 0, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Get notification templates with predefined messages
 */
export const NotificationTemplates = {
  guideApproved: (guideName: string) => ({
    type: NotificationType.GUIDE_APPROVED,
    title: '✅ Guide Application Approved',
    message: `Congratulations! Your guide application has been approved. You can now start accepting bookings.`,
  }),

  guideRejected: (guideName: string, reason?: string) => ({
    type: NotificationType.GUIDE_REJECTED,
    title: '❌ Guide Application Rejected',
    message: `Your guide application has been rejected${reason ? `. Reason: ${reason}` : ''}. You can reapply after addressing the feedback.`,
  }),

  guideDeactivated: (reason?: string) => ({
    type: NotificationType.GUIDE_DEACTIVATED,
    title: '⏸️ Account Deactivated',
    message: `Your guide account has been deactivated${reason ? `. Reason: ${reason}` : ''}. You can reactivate it anytime from your settings.`,
  }),

  guideReactivated: () => ({
    type: NotificationType.GUIDE_REACTIVATED,
    title: '✅ Account Reactivated',
    message: 'Your guide account has been reactivated. You can now accept new bookings.',
  }),

  guideDeleted: () => ({
    type: NotificationType.GUIDE_DELETED,
    title: '🗑️ Account Deleted',
    message: 'Your guide account and all associated data have been permanently deleted.',
  }),

  bookingCreated: (guideName: string, touristName: string) => ({
    type: NotificationType.BOOKING_CREATED,
    title: '📅 New Booking Request',
    message: `${touristName} has requested to book a tour with you. Please review and confirm the booking.`,
  }),

  bookingConfirmed: (guideName: string, dates?: string) => ({
    type: NotificationType.BOOKING_CONFIRMED,
    title: '✅ Booking Confirmed',
    message: `Your booking with ${guideName} has been confirmed${dates ? `. Tour dates: ${dates}` : ''}.`,
  }),

  bookingCompleted: (guideName: string) => ({
    type: NotificationType.BOOKING_COMPLETED,
    title: '🎉 Tour Completed',
    message: `Your tour with ${guideName} has been marked as completed. Please leave a review and rating.`,
  }),

  bookingCancelled: (reason?: string) => ({
    type: NotificationType.BOOKING_CANCELLED,
    title: '❌ Booking Cancelled',
    message: `Your booking has been cancelled${reason ? `. Reason: ${reason}` : ''}.`,
  }),

  guideSaved: (guideName: string) => ({
    type: NotificationType.GUIDE_SAVED,
    title: '⭐ Guide Saved',
    message: `You have saved ${guideName} to your favorites.`,
  }),

  guideUnsaved: (guideName: string) => ({
    type: NotificationType.GUIDE_UNSAVED,
    title: '⭐ Guide Removed',
    message: `${guideName} has been removed from your favorites.`,
  }),

  ratingReceived: (touristName: string, rating: number) => ({
    type: NotificationType.RATING_RECEIVED,
    title: `⭐ ${rating}-Star Rating`,
    message: `${touristName} gave you a ${rating}-star rating for your tour.`,
  }),

  reviewReceived: (touristName: string) => ({
    type: NotificationType.REVIEW_POSTED,
    title: '📝 Review Received',
    message: `${touristName} left a review for your tour.`,
  }),

  customMessage: (title: string, message: string) => ({
    type: NotificationType.CUSTOM,
    title,
    message,
  }),
};
