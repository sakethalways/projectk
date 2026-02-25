import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { booking_id, rating, review_text } = await request.json();

    if (!booking_id || !rating) {
      return NextResponse.json(
        { error: 'booking_id and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'rating must be between 1 and 5' },
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

    // Get auth header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Invalid authorization header' },
        { status: 401 }
      );
    }

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get booking details to verify it belongs to the tourist and is completed
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .eq('tourist_id', user.id)
      .eq('status', 'completed')
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found or not completed' },
        { status: 404 }
      );
    }

    // Check if rating already exists
    const { data: existingRating } = await supabase
      .from('ratings_reviews')
      .select('id')
      .eq('booking_id', booking_id)
      .single();

    if (existingRating) {
      // Update existing rating
      const { data, error } = await supabase
        .from('ratings_reviews')
        .update({
          rating,
          review_text: review_text || null,
          updated_at: new Date().toISOString(),
        })
        .eq('booking_id', booking_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating rating:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Rating updated successfully',
        rating: data,
      });
    } else {
      // Create new rating
      const { data, error } = await supabase
        .from('ratings_reviews')
        .insert({
          booking_id,
          tourist_id: user.id,
          guide_id: booking.guide_id,
          rating,
          review_text: review_text || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating rating:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Rating created successfully',
        rating: data,
      });
    }
  } catch (error) {
    console.error('Error in create-rating-review API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
