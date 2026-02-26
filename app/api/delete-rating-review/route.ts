import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/lib/send-notification';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rating_id = searchParams.get('rating_id');

    if (!rating_id) {
      return NextResponse.json(
        { error: 'rating_id is required' },
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

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userData?.role === 'admin';

    // Get the rating to verify ownership
    const { data: rating, error: ratingError } = await supabase
      .from('ratings_reviews')
      .select('*')
      .eq('id', rating_id)
      .single();

    if (ratingError || !rating) {
      return NextResponse.json(
        { error: 'Rating not found' },
        { status: 404 }
      );
    }

    // Check if user is the creator or admin
    if (rating.tourist_id !== user.id && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this rating' },
        { status: 403 }
      );
    }

    // Delete the rating
    const { error } = await supabase
      .from('ratings_reviews')
      .delete()
      .eq('id', rating_id);

    if (error) {
      console.error('Error deleting rating:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Send notification to guide about deleted review
    await sendNotification(
      rating.guide_id,
      'review_deleted',
      '🗑️ Review Deleted',
      `A review on your profile has been deleted.`,
      { relatedGuideId: rating.guide_id, relatedUserId: rating.tourist_id }
    );

    return NextResponse.json({
      message: 'Rating deleted successfully',
    });
  } catch (error) {
    console.error('Error in delete-rating-review API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return DELETE(request);
}
