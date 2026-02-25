import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'my'; // my, guide, all

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

    // Get user role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const userRole = userData?.role || 'guide';

    let query = supabase
      .from('ratings_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (type === 'my') {
      // Tourist viewing their own ratings
      if (userRole !== 'guide') {
        query = query.eq('tourist_id', user.id);
      }
    } else if (type === 'guide') {
      // Guide viewing ratings given to them
      if (userRole === 'guide') {
        // Get the guide ID for this user
        const { data: guideData } = await supabase
          .from('guides')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (guideData) {
          query = query.eq('guide_id', guideData.id);
        } else {
          // No guide found for this user
          return NextResponse.json({
            ratings: [],
            count: 0,
          });
        }
      }
    } else if (type === 'all') {
      // Admin viewing all ratings
      if (userRole !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    const { data: ratings, error } = await query;

    if (error) {
      console.error('Error fetching ratings:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!ratings || ratings.length === 0) {
      return NextResponse.json({
        ratings: [],
        count: 0,
      });
    }

    // Fetch related data (guide info for tourist view, tourist info for guide view)
    let enrichedRatings = await Promise.all(
      ratings.map(async (rating) => {
        let guideData = null;
        let touristData = null;

        if (type === 'my' || (type === 'all' && userRole === 'admin')) {
          // Get guide info
          const { data: guide } = await supabase
            .from('guides')
            .select('id, name, email, phone_number, location, profile_picture_url')
            .eq('id', rating.guide_id)
            .single();
          guideData = guide;
        }

        if (type === 'guide' || (type === 'all' && userRole === 'admin')) {
          // Get tourist info from auth users (minimal data)
          const { data: { users: touristUsers } } = await supabase.auth.admin.listUsers();
          touristData = touristUsers?.find(u => u.id === rating.tourist_id);
        }

        return {
          ...rating,
          guide: guideData,
          tourist: touristData ? {
            id: touristData.id,
            email: touristData.email,
          } : null,
        };
      })
    );

    return NextResponse.json({
      ratings: enrichedRatings,
      count: enrichedRatings.length,
    });
  } catch (error) {
    console.error('Error in get-ratings-reviews API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
