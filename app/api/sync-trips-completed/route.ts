import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

async function syncTripsCompleted(supabase: any, isAdmin: boolean = false) {
  // Get all guides
  const { data: guides, error: guidesError } = await supabase
    .from('guides')
    .select('id')
    .order('created_at', { ascending: false });

  if (guidesError || !guides) {
    throw new Error('Failed to fetch guides');
  }

  let successCount = 0;
  let errorCount = 0;

  // For each guide, count completed/past bookings and update trips_completed
  for (const guide of guides) {
    try {
      // Get all completed bookings for this guide
      const { data: completedBookings, error: completedError } = await supabase
        .from('bookings')
        .select('id')
        .eq('guide_id', guide.id)
        .eq('status', 'completed');

      // Get all past bookings for this guide
      const { data: pastBookings, error: pastError } = await supabase
        .from('bookings')
        .select('id')
        .eq('guide_id', guide.id)
        .eq('status', 'past');

      if (completedError) {
        console.error(`Error fetching completed bookings for guide ${guide.id}:`, completedError);
        errorCount++;
        continue;
      }

      if (pastError) {
        console.error(`Error fetching past bookings for guide ${guide.id}:`, pastError);
        errorCount++;
        continue;
      }

      const totalTrips = (completedBookings?.length || 0) + (pastBookings?.length || 0);

      // Update guide with this count
      const { error: updateError } = await supabase
        .from('guides')
        .update({ trips_completed: totalTrips })
        .eq('id', guide.id);

      if (updateError) {
        if (updateError.message?.includes('trips_completed') || updateError.code === 'PGRST204') {
          console.error(`Schema error: trips_completed column may not exist in database:`, updateError);
        } else {
          console.error(`Error updating guide ${guide.id}:`, updateError);
        }
        errorCount++;
      } else {
        successCount++;
      }
    } catch (err) {
      console.error(`Error processing guide ${guide.id}:`, err);
      errorCount++;
    }
  }

  return { totalGuides: guides.length, successCount, errorCount };
}

export async function GET(request: NextRequest) {
  try {
    // Get guide_id from query params
    const guidId = request.nextUrl.searchParams.get('guide_id');

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

    // If guide_id provided, sync just that guide
    if (guidId) {
      try {
        // Get all completed bookings for this guide
        const { data: completedBookings, error: completedError } = await supabase
          .from('bookings')
          .select('id')
          .eq('guide_id', guidId)
          .eq('status', 'completed');

        // Get all past bookings for this guide
        const { data: pastBookings, error: pastError } = await supabase
          .from('bookings')
          .select('id')
          .eq('guide_id', guidId)
          .eq('status', 'past');

        if (completedError) {
          console.error('Error fetching completed bookings:', completedError);
          return NextResponse.json({ error: 'Failed to fetch completed bookings' }, { status: 500 });
        }

        if (pastError) {
          console.error('Error fetching past bookings:', pastError);
          return NextResponse.json({ error: 'Failed to fetch past bookings' }, { status: 500 });
        }

        const completedCount = completedBookings?.length || 0;
        const pastCount = pastBookings?.length || 0;
        const totalTrips = completedCount + pastCount;

        const { error: updateError } = await supabase
          .from('guides')
          .update({ trips_completed: totalTrips })
          .eq('id', guidId);

        if (updateError) {
          console.error('Error updating guide:', updateError);
          
          // Check if it's a missing column error
          if (updateError.message?.includes('trips_completed') || updateError.code === 'PGRST204') {
            return NextResponse.json({ 
              error: 'Database schema not initialized. Please run the migration to add trips_completed column.',
              details: 'Run this SQL in Supabase SQL Editor: ALTER TABLE guides ADD COLUMN IF NOT EXISTS trips_completed INTEGER DEFAULT 0;'
            }, { status: 500 });
          }
          
          return NextResponse.json({ error: 'Failed to update guide', details: updateError.message }, { status: 500 });
        }

        return NextResponse.json({
          message: 'Guide trips_completed synced successfully',
          guide_id: guidId,
          trips_completed: totalTrips,
          breakdown: {
            completed: completedCount,
            past: pastCount,
          },
        });
      } catch (err) {
        console.error('Error syncing single guide:', err);
        return NextResponse.json(
          { error: err instanceof Error ? err.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }

    // Otherwise sync all guides
    const result = await syncTripsCompleted(supabase);
    return NextResponse.json({
      message: 'All guides trips_completed synced',
      ...result,
    });
  } catch (error) {
    console.error('Error syncing trips_completed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get admin auth token from header to verify this is an admin request
    const authHeader = request.headers.get('Authorization');
    
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

    // If auth header provided, verify it's an admin
    if (authHeader) {
      const clientSubabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      });

      const { data: authData, error: authError } = await clientSubabase.auth.getUser();
      if (authError || !authData.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Check if user is admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (userData?.role !== 'admin') {
        return NextResponse.json({ error: 'Only admins can sync trips' }, { status: 403 });
      }
    }

    const result = await syncTripsCompleted(supabase, !!authHeader);
    return NextResponse.json({
      message: 'Sync completed',
      ...result,
    });
  } catch (error) {
    console.error('Error syncing trips_completed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
