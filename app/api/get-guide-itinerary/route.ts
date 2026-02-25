import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const guideId = searchParams.get('guideId');

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

    // Fetch all itineraries for the guide
    const { data, error } = await supabase
      .from('guide_itineraries')
      .select('*')
      .eq('guide_id', guideId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data || data.length === 0) {
      // No records found - return 200 with empty array instead of 404
      // This is an expected case when guide hasn't created itineraries yet
      return NextResponse.json(
        { itineraries: [], message: 'No itinerary found for this guide' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      itineraries: data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
