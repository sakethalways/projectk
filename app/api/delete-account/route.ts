'use server';

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import {
  secureLog,
  extractBearerToken,
  validatePassword,
  isRateLimited,
} from '@/lib/security-utils';
import { errorResponses, handleAPIError } from '@/lib/api-error-handler';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - sensitive operation
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(`delete_account_${ip}`, 5)) {
      secureLog.warn(`High rate of delete attempts from ${ip.substring(0, 10)}`);
      return errorResponses.rateLimited();
    }

    let password: string;
    try {
      const body = await request.json();
      password = body.password;
    } catch (e) {
      return errorResponses.validation('Invalid JSON format');
    }

    if (!password || typeof password !== 'string' || password.length === 0) {
      return errorResponses.validation('Password is required');
    }

    if (password.length > 128) {
      return errorResponses.validation('Invalid password format');
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
    if (!authHeader || typeof authHeader !== 'string') {
      return errorResponses.missingAuthHeader();
    }

    const { valid, token } = extractBearerToken(authHeader);
    if (!valid || !token) {
      return errorResponses.invalidToken();
    }

    // Verify user and get email
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !authUser) {
      secureLog.warn('Failed auth user retrieval');
      return errorResponses.invalidToken();
    }

    if (!authUser.id || typeof authUser.id !== 'string') {
      return errorResponses.invalidToken();
    }

    // Verify password by attempting sign in
    if (!authUser.email) {
      secureLog.warn('Auth user missing email');
      return errorResponses.invalidToken();
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authUser.email,
        password: password,
      });

      if (signInError) {
        secureLog.warn('Password verification failed');
        return errorResponses.validation('Invalid password');
      }
    } catch (err) {
      secureLog.error('Password verification error');
      return errorResponses.validation('Password verification failed');
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
        secureLog.warn('Warning: Could not delete saved guides (non-blocking)');
      }

      // Step 2: Delete all bookings (CASCADE will handle ratings_reviews)
      const { error: bookingError } = await supabase
        .from('bookings')
        .delete()
        .eq('tourist_id', authUser.id);

      if (bookingError) {
        secureLog.warn('Warning: Could not delete bookings (non-blocking)');
      }

      // Step 3: Delete any orphaned ratings_reviews (in case some exist independently)
      const { error: ratingError } = await supabase
        .from('ratings_reviews')
        .delete()
        .eq('tourist_id', authUser.id);

      if (ratingError) {
        secureLog.warn('Warning: Could not delete ratings (non-blocking)');
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
          secureLog.warn('Warning: Could not delete itineraries (non-blocking)');
        }

        // Step 2: Delete all bookings for this guide
        const { error: bookingError } = await supabase
          .from('bookings')
          .delete()
          .eq('guide_id', guideData.id);

        if (bookingError) {
          secureLog.warn('Warning: Could not delete guide bookings (non-blocking)');
        }

        // Step 3: Delete all ratings_reviews for this guide
        const { error: ratingError } = await supabase
          .from('ratings_reviews')
          .delete()
          .eq('guide_id', guideData.id);

        if (ratingError) {
          secureLog.warn('Warning: Could not delete guide ratings (non-blocking)');
        }

        // Step 4: Delete the guide record
        const { error: guideError } = await supabase
          .from('guides')
          .delete()
          .eq('id', guideData.id);

        if (guideError) {
          secureLog.warn('Warning: Could not delete guide record (non-blocking)');
        }
      }
    }

    // Step 6: Delete user record from users table
    const { error: userDeleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', authUser.id);

    if (userDeleteError) {
      secureLog.warn('Warning: Could not delete user record (non-blocking)');
    }

    // Step 7: Delete auth user
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(authUser.id);

    if (authDeleteError) {
      secureLog.error('Auth user deletion failed');
      return errorResponses.internalError();
    }

    // Success! Return safe response (NO redirect path - handled by client)
    return NextResponse.json(
      {
        success: true,
        message: 'Account deletion processed',
      },
      { status: 200 }
    );
  } catch (error) {
    return handleAPIError(error, { action: 'delete_account' });
  }
}
