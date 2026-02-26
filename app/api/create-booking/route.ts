import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/lib/send-notification';

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

    // Check for active bookings with the same guide
    const { data: existingBookings, error: checkError } = await supabase
      .from('bookings')
      .select('id')
      .eq('tourist_id', tourist_id)
      .eq('guide_id', guide_id)
      .in('status', ['pending', 'accepted']);

    if (checkError) {
      console.error('Error checking existing bookings:', checkError);
      return NextResponse.json(
        { error: 'Failed to verify booking availability' },
        { status: 500 }
      );
    }

    if (existingBookings && existingBookings.length > 0) {
      return NextResponse.json(
        { error: 'You already have an active booking with this guide. Complete or cancel your previous booking first.' },
        { status: 400 }
      );
    }

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

    // Get guide's user_id for notification
    const { data: guideData } = await supabase
      .from('guides')
      .select('user_id')
      .eq('id', guide_id)
      .single();

    // Get tourist's user_id (tourist_id is already user_id, but let's be safe)
    const { data: touristData } = await supabase
      .from('users')
      .select('id')
      .eq('id', tourist_id)
      .single();

    // Send notifications
    // Notify guide about new booking request
    if (guideData?.user_id) {
      await sendNotification(
        guideData.user_id,
        'booking_created',
        '📅 New Booking Request',
        `A tourist has requested to book a tour with you. Please review and confirm the booking.`,
        { relatedBookingId: data.id, relatedUserId: tourist_id }
      );
    }

    // Notify tourist that booking was created
    if (touristData?.id) {
      await sendNotification(
        touristData.id,
        'booking_created',
        '📅 Booking Request Sent',
        `Your booking request has been sent to the guide. Please wait for confirmation.`,
        { relatedBookingId: data.id, relatedGuideId: guide_id }
      );
    }

    // Notify all admins about new booking
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin');

    if (admins && admins.length > 0) {
      for (const admin of admins) {
        await sendNotification(
          admin.id,
          'booking_created',
          '📅 New Booking Created',
          `A new booking has been created. Tourist ID: ${tourist_id}`,
          { relatedBookingId: data.id, relatedUserId: tourist_id, relatedGuideId: guide_id }
        );
      }
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
