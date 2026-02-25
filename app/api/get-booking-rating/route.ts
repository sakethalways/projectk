import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const booking_id = searchParams.get('booking_id');

    if (!booking_id) {
      return NextResponse.json(
        { error: 'booking_id is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Check if rating exists for this booking
    const { data: existingRating, error: ratingError } = await supabase
      .from('ratings_reviews')
      .select('*')
      .eq('booking_id', booking_id)
      .single();

    if (ratingError && ratingError.code !== 'PGRST116') {
      console.error('Error fetching rating:', ratingError);
      return NextResponse.json(
        { error: ratingError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hasRating: !!existingRating,
      rating: existingRating || null,
    });
  } catch (error) {
    console.error('Error in get-booking-rating API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
