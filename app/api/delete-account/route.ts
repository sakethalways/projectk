'use server';

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
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

    // Verify user and get email
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !authUser) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Verify password by attempting sign in
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authUser.email || '',
        password: password,
      });

      if (signInError) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        );
      }
    } catch (err) {
      return NextResponse.json(
        { error: 'Password verification failed' },
        { status: 401 }
      );
    }

    // Get user role
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('role, id')
      .eq('id', authUser.id)
      .single();

    if (userDataError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userRole = userData.role;

    // Delete data based on user role
    if (userRole === 'tourist') {
      // Step 1: Delete all saved_guides (CASCADE will happen via FK)
      const { error: savedError } = await supabase
        .from('saved_guides')
        .delete()
        .eq('tourist_id', authUser.id);

      if (savedError) {
        console.error('Error deleting saved guides:', savedError);
        // Continue anyway, don't block account deletion
      }

      // Step 2: Delete all bookings (CASCADE will handle ratings_reviews)
      const { error: bookingError } = await supabase
        .from('bookings')
        .delete()
        .eq('tourist_id', authUser.id);

      if (bookingError) {
        console.error('Error deleting bookings:', bookingError);
        // Continue anyway
      }

      // Step 3: Delete any orphaned ratings_reviews (in case some exist independently)
      const { error: ratingError } = await supabase
        .from('ratings_reviews')
        .delete()
        .eq('tourist_id', authUser.id);

      if (ratingError) {
        console.error('Error deleting ratings:', ratingError);
        // Continue anyway
      }
    } else if (userRole === 'guide') {
      // Step 1: Delete all guide itineraries
      const { data: guideData } = await supabase
        .from('guides')
        .select('id')
        .eq('user_id', authUser.id)
        .single();

      if (guideData) {
        const { error: itineraryError } = await supabase
          .from('guide_itineraries')
          .delete()
          .eq('guide_id', guideData.id);

        if (itineraryError) {
          console.error('Error deleting itineraries:', itineraryError);
          // Continue anyway
        }

        // Step 2: Delete all bookings for this guide
        const { error: bookingError } = await supabase
          .from('bookings')
          .delete()
          .eq('guide_id', guideData.id);

        if (bookingError) {
          console.error('Error deleting guide bookings:', bookingError);
          // Continue anyway
        }

        // Step 3: Delete all ratings_reviews for this guide
        const { error: ratingError } = await supabase
          .from('ratings_reviews')
          .delete()
          .eq('guide_id', guideData.id);

        if (ratingError) {
          console.error('Error deleting guide ratings:', ratingError);
          // Continue anyway
        }

        // Step 4: Delete the guide record
        const { error: guideError } = await supabase
          .from('guides')
          .delete()
          .eq('id', guideData.id);

        if (guideError) {
          console.error('Error deleting guide record:', guideError);
          // Continue anyway
        }
      }
    }

    // Step 6: Delete user record from users table
    const { error: userDeleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', authUser.id);

    if (userDeleteError) {
      console.error('Error deleting user record:', userDeleteError);
      // Continue to auth deletion anyway
    }

    // Step 7: Delete auth user
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(authUser.id);

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      return NextResponse.json(
        {
          error: 'Failed to delete account',
          details: authDeleteError.message,
        },
        { status: 500 }
      );
    }

    // Success!
    return NextResponse.json(
      {
        message: 'Account successfully deleted',
        redirectTo: '/login',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in delete-account API:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
