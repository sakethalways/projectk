import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { guideId, userId } = await request.json();

    if (!guideId || !userId) {
      return NextResponse.json(
        { error: 'Missing guideId or userId' },
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

    // Create admin client with service role key
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Step 1: Delete guide itineraries
    try {
      await adminClient
        .from('guide_itineraries')
        .delete()
        .eq('guide_id', guideId);
    } catch (err) {
      console.warn('Warning deleting itineraries:', err);
    }

    // Step 2: Delete guide availability
    try {
      await adminClient
        .from('guide_availability')
        .delete()
        .eq('guide_id', guideId);
    } catch (err) {
      console.warn('Warning deleting availability:', err);
    }

    // Step 3: Delete guide record
    const { error: deleteGuideError } = await adminClient
      .from('guides')
      .delete()
      .eq('id', guideId);

    if (deleteGuideError) {
      console.error('Error deleting guide record:', deleteGuideError);
      return NextResponse.json(
        { error: 'Failed to delete guide record', details: deleteGuideError },
        { status: 400 }
      );
    }

    // Step 4: Delete user role record
    try {
      await adminClient
        .from('users')
        .delete()
        .eq('id', userId);
    } catch (err) {
      console.warn('Warning deleting user role:', err);
    }

    // Step 5: Delete auth user using admin API
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError);
      // Still return success as guide record is deleted
      // Just log the warning
      console.warn('Auth user deletion failed but guide record deleted:', deleteAuthError);
    }

    return NextResponse.json({
      success: true,
      message: 'Guide and associated data deleted successfully',
    });
  } catch (error) {
    console.error('Error in admin delete guide:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
