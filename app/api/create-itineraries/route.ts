import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

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

    // Get all approved guides without itineraries
    const { data: guides, error: guidesError } = await supabase
      .from('guides')
      .select('id, name, location, user_id')
      .eq('status', 'approved')
      .eq('is_deactivated', false);

    if (guidesError) {
      return NextResponse.json(
        { error: guidesError.message },
        { status: 400 }
      );
    }

    if (!guides || guides.length === 0) {
      return NextResponse.json(
        { message: 'No approved guides found' },
        { status: 404 }
      );
    }

    // Check which guides already have itineraries
    const { data: existingItineraries } = await supabase
      .from('guide_itineraries')
      .select('guide_id');

    const existingGuideIds = new Set(existingItineraries?.map(it => it.guide_id) || []);

    // Create itineraries for guides that don't have them
    const guidesToAdd = guides.filter(g => !existingGuideIds.has(g.id));

    if (guidesToAdd.length === 0) {
      return NextResponse.json({
        message: 'All guides already have itineraries',
        guideCount: guides.length,
      });
    }

    // Create itineraries
    const itineraries = guidesToAdd.map((guide, idx) => ({
      guide_id: guide.id,
      user_id: guide.user_id, // Use the guide's actual user_id
      number_of_days: 5,
      timings: '9:00 AM - 5:00 PM',
      description: `Discover the wonders of ${guide.location} with a knowledgeable local guide. Experience authentic culture, hidden gems, and create unforgettable memories.`,
      places_to_visit: 'Local landmarks\nCultural heritage sites\nAuthentic local markets\nHidden gem attractions\nLocal dining experiences',
      instructions: 'Comfortable walking shoes required. Bring water and sun protection. All-inclusive tour experience.',
      image_1_url: null,
      image_2_url: null,
    }));

    const { data: insertedItineraries, error: insertError } = await supabase
      .from('guide_itineraries')
      .insert(itineraries)
      .select('id');

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: insertError.message, details: insertError },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Itineraries created successfully',
      created: (insertedItineraries || []).length,
      guides: guidesToAdd.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
