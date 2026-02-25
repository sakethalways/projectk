import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tourist_id, guide_id, itinerary_id, booking_date, price, price_type } = body;

    if (!tourist_id || !guide_id || !itinerary_id || !booking_date || !price || !price_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Create booking
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        tourist_id,
        guide_id,
        itinerary_id,
        booking_date,
        price,
        price_type,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      booking: data,
      message: 'Booking created successfully',
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
