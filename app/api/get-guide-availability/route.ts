import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const guideId = request.nextUrl.searchParams.get('guideId');

    if (!guideId) {
      return NextResponse.json(
        { error: 'guideId is required' },
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

    console.log(`API: Fetching availability for guide ${guideId}`);

    // Fetch guide availability - use service role to bypass RLS
    const { data, error } = await supabase
      .from('guide_availability')
      .select('*')
      .eq('guide_id', guideId);

    console.log(`API: Query result - data:`, data, 'error:', error);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch availability',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Return first record if exists
    const availability = data && data.length > 0 ? data[0] : null;

    return NextResponse.json({
      availability: availability,
      message: availability ? 'Availability found' : 'No availability set',
    });
  } catch (error) {
    console.error('Error fetching guide availability:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch availability',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
