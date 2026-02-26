/**
 * Helper function to send notifications from client or API routes
 */

export async function sendNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  options?: {
    data?: Record<string, any>;
    relatedUserId?: string;
    relatedGuideId?: string;
    relatedBookingId?: string;
  }
) {
  try {
    // If running on server, use notification service directly
    if (typeof window === 'undefined') {
      const { createNotification } = await import('@/lib/notification-service');
      await createNotification(userId, type, title, message, options);
      return true;
    }

    // Client-side: make HTTP request
    const response = await fetch('/api/create-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        type,
        title,
        message,
        data: options?.data,
        relatedUserId: options?.relatedUserId,
        relatedGuideId: options?.relatedGuideId,
        relatedBookingId: options?.relatedBookingId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error sending notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in sendNotification:', error);
    return false;
  }
}

/**
 * Send notification to multiple users
 */
export async function sendBulkNotification(
  userIds: string[],
  type: string,
  title: string,
  message: string,
  options?: {
    data?: Record<string, any>;
    relatedUserId?: string;
    relatedGuideId?: string;
    relatedBookingId?: string;
  }
) {
  const results = await Promise.all(
    userIds.map((userId) =>
      sendNotification(userId, type, title, message, options)
    )
  );

  return results.every((result) => result);
}
