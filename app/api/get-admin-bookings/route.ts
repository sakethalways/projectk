import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filterStatus = searchParams.get('status'); // active, past, all

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    // Create client with auth token to verify user
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: request.headers.get('Authorization') || '',
        },
      },
    });

    // Get current user from auth token
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userDataError || userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Create service role client for fetching all bookings
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Build query
    let query = serviceSupabase
      .from('bookings')
      .select(`
        *,
        guide:guides(id, name, location, phone_number),
        itinerary:guide_itineraries(id, number_of_days, description, places_to_visit, instructions, image_1_url, image_2_url)
      `);

    // Apply filters
    if (filterStatus === 'active') {
      query = query.eq('status', 'accepted');
    } else if (filterStatus === 'past') {
      query = query.in('status', ['completed', 'past']);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    // Fetch tourist profiles separately
    const touristIds = data?.map((b: any) => b.tourist_id).filter(Boolean) || [];
    let touristProfiles: any[] = [];

    if (touristIds.length > 0) {
      const { data: profiles, error: profileError } = await serviceSupabase
        .from('tourist_profiles')
        .select('id, user_id, name, phone_number, location, email')
        .in('user_id', touristIds);

      if (!profileError && profiles) {
        touristProfiles = profiles;
      }
    }

    // Merge tourist data into bookings
    const bookingsWithTourists = data?.map((booking: any) => ({
      ...booking,
      tourist: touristProfiles.find(p => p.user_id === booking.tourist_id) || null
    })) || [];

    return NextResponse.json({
      bookings: bookingsWithTourists,
    });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
