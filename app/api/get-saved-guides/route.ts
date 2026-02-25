import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
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

    // Get the auth header to get tourist_id
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Invalid authorization header' },
        { status: 401 }
      );
    }

    // Verify the token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get saved guides for the tourist
    const { data: savedGuideRecords, error: recordError } = await supabase
      .from('saved_guides')
      .select('guide_id')
      .eq('tourist_id', user.id)
      .order('created_at', { ascending: false });

    if (recordError) {
      console.error('Error fetching saved guides:', recordError);
      return NextResponse.json(
        { error: recordError.message },
        { status: 500 }
      );
    }

    if (!savedGuideRecords || savedGuideRecords.length === 0) {
      return NextResponse.json({
        guides: [],
        count: 0,
      });
    }

    // Get the guide IDs
    const guideIds = savedGuideRecords.map((record) => record.guide_id);

    // Fetch the actual guide details
    const { data: guides, error: guideError } = await supabase
      .from('guides')
      .select('*')
      .in('id', guideIds)
      .eq('status', 'approved')
      .eq('is_deactivated', false);

    if (guideError) {
      console.error('Error fetching guide details:', guideError);
      return NextResponse.json(
        { error: guideError.message },
        { status: 500 }
      );
    }

    // Fetch languages for each guide
    const guidesWithLanguages = await Promise.all(
      (guides || []).map(async (guide) => {
        const { data: langData } = await supabase
          .from('guide_languages')
          .select('language')
          .eq('guide_id', guide.id);

        return {
          ...guide,
          languages: langData?.map((l) => l.language) || [],
        };
      })
    );

    return NextResponse.json({
      guides: guidesWithLanguages,
      count: guidesWithLanguages.length,
    });
  } catch (error) {
    console.error('Error in get-saved-guides API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
