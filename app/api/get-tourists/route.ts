import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    // Create client with auth token from request
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: request.headers.get('Authorization') || '',
        },
      },
    });

    // Get current user from auth token
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userDataError || userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can view tourists' },
        { status: 403 }
      );
    }

    // Fetch all tourists
    const { data: tourists, error: touristsError } = await supabase
      .from('tourist_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (touristsError) {
      console.error('Error fetching tourists:', touristsError);
      return NextResponse.json(
        { error: 'Failed to fetch tourists' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tourists: tourists || [],
      count: tourists?.length || 0,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
