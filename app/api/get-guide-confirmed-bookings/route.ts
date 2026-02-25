import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    // Create client with auth token from request
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

    // Get guide ID for this user
    const { data: guideData, error: guideError } = await supabase
      .from('guides')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (guideError || !guideData) {
      return NextResponse.json(
        { error: 'No guide profile found' },
        { status: 404 }
      );
    }

    // Fetch confirmed bookings (accepted status)
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        guide:guides!bookings_guide_id_fkey(id, name, location, profile_picture_url),
        itinerary:guide_itineraries(id, number_of_days, description, places_to_visit, instructions, image_1_url, image_2_url)
      `)
      .eq('guide_id', guideData.id)
      .eq('status', 'accepted')
      .order('booking_date', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch confirmed bookings' },
        { status: 500 }
      );
    }

    // Create service role client to fetch tourist profiles (bypass RLS)
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Fetch tourist profiles for all bookings
    const touristIds = data?.map(b => b.tourist_id) || [];
    let touristProfiles: any[] = [];
    
    if (touristIds.length > 0) {
      const { data: profiles } = await serviceSupabase
        .from('tourist_profiles')
        .select('id, user_id, name, phone_number, location, profile_picture_url')
        .in('user_id', touristIds);
      
      touristProfiles = profiles || [];
    }

    // Merge tourist profile data into bookings
    const bookingsWithTourists = data?.map(booking => ({
      ...booking,
      tourist: touristProfiles.find(p => p.user_id === booking.tourist_id) || null
    })) || [];

    return NextResponse.json({
      bookings: bookingsWithTourists,
    });
  } catch (error) {
    console.error('Error fetching confirmed bookings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
