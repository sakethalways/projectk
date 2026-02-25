import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Must be logged in' },
        { status: 401 }
      );
    }

    // Find the user's guide
    const { data: guides, error: fetchError } = await supabase
      .from('guides')
      .select('id, status, is_deactivated')
      .eq('user_id', user.id);

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 400 }
      );
    }

    // Update the first guide to approved
    if (guides && guides.length > 0) {
      const { error: updateError } = await supabase
        .from('guides')
        .update({ status: 'approved', is_deactivated: false })
        .eq('id', guides[0].id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        message: 'Guide approved successfully',
        guideId: guides[0].id,
      });
    }

    return NextResponse.json(
      { message: 'No guides found for this user' },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
