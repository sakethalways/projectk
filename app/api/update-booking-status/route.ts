import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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
