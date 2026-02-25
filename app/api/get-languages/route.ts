import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
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

    // Get all approved guides
    const { data: guides, error } = await supabase
      .from('guides')
      .select('languages')
      .eq('status', 'approved')
      .eq('is_deactivated', false);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Extract unique languages
    const languagesSet = new Set<string>();
    guides?.forEach(guide => {
      if (Array.isArray(guide.languages)) {
        guide.languages.forEach(lang => {
          if (lang) languagesSet.add(lang);
        });
      }
    });

    const languages = Array.from(languagesSet).sort();

    return NextResponse.json({ languages });
  } catch (error) {
    console.error('Error fetching languages:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
