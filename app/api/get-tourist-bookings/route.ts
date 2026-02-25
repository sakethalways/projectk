import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
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

    // Fetch tourist bookings with related data
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        guide:guides(id, name, location, phone_number),
        itinerary:guide_itineraries(id, number_of_days, description, places_to_visit, instructions, image_1_url, image_2_url)
      `)
      .eq('tourist_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      bookings: data || [],
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
