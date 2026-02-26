import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/lib/send-notification';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id, status } = body;

    if (!booking_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['accepted', 'rejected', 'cancelled', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get booking details to notify users
    const { data: bookingData } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    // Update booking status
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', booking_id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      );
    }

    // Send notifications based on status change
    if (bookingData) {
      const notificationMap: Record<string, { title: string; message: string; type: string }> = {
        accepted: {
          type: 'booking_confirmed',
          title: '✅ Booking Confirmed',
          message: 'Your booking request has been confirmed by the guide!',
        },
        rejected: {
          type: 'booking_cancelled',
          title: '❌ Booking Rejected',
          message: 'Your booking request has been rejected by the guide.',
        },
        cancelled: {
          type: 'booking_cancelled',
          title: '❌ Booking Cancelled',
          message: 'Your booking has been cancelled.',
        },
        completed: {
          type: 'booking_completed',
          title: '🎉 Tour Completed',
          message: 'Your tour has been completed. Please leave a review and rating!',
        },
      };

      const notif = notificationMap[status];
      if (notif) {
        // Notify tourist
        if (bookingData.tourist_id) {
          await sendNotification(
            bookingData.tourist_id,
            notif.type,
            notif.title,
            notif.message,
            { relatedBookingId: booking_id }
          );
        }

        // Notify guide with different message
        if (bookingData.guide_id) {
          const guideMessages: Record<string, { title: string; message: string }> = {
            cancelled: {
              title: '❌ Booking Cancelled',
              message: 'A booking has been cancelled.',
            },
            completed: {
              title: '🎉 Tour Completed',
              message: 'Your tour has been marked as completed.',
            },
          };

          const guideMsg = guideMessages[status];
          if (guideMsg) {
            await sendNotification(
              bookingData.guide_id,
              notif.type,
              guideMsg.title,
              guideMsg.message,
              { relatedBookingId: booking_id }
            );
          }
        }

        // Send special trip_completed thank you message to tourist
        if (status === 'completed' && bookingData.tourist_id) {
          await sendNotification(
            bookingData.tourist_id,
            'trip_completed',
            '🎉 Thank You!',
            'Thank you for booking with us! We hope you had a wonderful experience with our guide. Please leave a review to help other tourists find great guides.',
            { relatedBookingId: booking_id }
          );
        }

        // Notify admins about cancellations and completions
        if (status === 'cancelled' || status === 'completed') {
          const { data: admins } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'admin');

          if (admins && admins.length > 0) {
            for (const admin of admins) {
              if (status === 'cancelled') {
                await sendNotification(
                  admin.id,
                  'booking_cancelled',
                  '❌ Booking Cancelled',
                  `A booking has been cancelled. Booking ID: ${booking_id}`,
                  { relatedBookingId: booking_id }
                );
              } else if (status === 'completed') {
                await sendNotification(
                  admin.id,
                  'trip_completed',
                  '✅ Tour Completed',
                  `A tour has been completed. Booking ID: ${booking_id}`,
                  { relatedBookingId: booking_id }
                );
              }
            }
          }
        }
      }
    }

    // If marking as completed or past, increment guide's trips_completed count
    if ((status === 'completed' || status === 'past') && data?.guide_id) {
      // Get current trips_completed count
      const { data: guideData } = await supabase
        .from('guides')
        .select('trips_completed')
        .eq('id', data.guide_id)
        .single();

      const currentCount = guideData?.trips_completed ?? 0;

      // Update with incremented count
      const { error: updateGuideError } = await supabase
        .from('guides')
        .update({ trips_completed: currentCount + 1 })
        .eq('id', data.guide_id);

      if (updateGuideError) {
        console.error('Error updating guide trips_completed:', updateGuideError);
        // Don't fail the booking update, just log the error
      }
    }

    return NextResponse.json({
      booking: data,
      message: `Booking ${status} successfully`,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
