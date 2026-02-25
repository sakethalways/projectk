import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { calculateSimilarity } from '@/lib/fuzzy-match';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name') || '';
    const language = searchParams.get('language') || '';
    const location = searchParams.get('location') || '';
    const availabilityDate = searchParams.get('availabilityDate') || '';

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

    // Get all approved and active guides
    const { data: guides, error: guidesError } = await supabase
      .from('guides')
      .select('id, name, location, languages, profile_picture_url, status, is_deactivated')
      .eq('status', 'approved')
      .eq('is_deactivated', false)
      .limit(100);

    if (guidesError) {
      return NextResponse.json(
        { error: guidesError.message },
        { status: 400 }
      );
    }

    if (!guides) {
      return NextResponse.json({ guides: [] });
    }

    // Client-side filtering (case-insensitive)
    let filteredGuides = guides;

    // Filter by name (case-insensitive substring match)
    if (name.trim()) {
      const searchName = name.toLowerCase();
      filteredGuides = filteredGuides.filter((guide) =>
        guide.name.toLowerCase().includes(searchName)
      );
    }

    // Filter by location (case-insensitive with fuzzy matching 70-80%)
    if (location.trim()) {
      const searchLocation = location.toLowerCase();
      filteredGuides = filteredGuides.filter((guide) => {
        const guideLocation = guide.location.toLowerCase();
        // First try exact substring match
        if (guideLocation.includes(searchLocation)) return true;
        // Then try fuzzy matching
        const similarity = calculateSimilarity(guideLocation, searchLocation);
        return similarity >= 70; // 70-80% and above
      });
    }

    // Filter by language (case-insensitive, check if in array)
    if (language.trim()) {
      const searchLanguage = language.toLowerCase();
      filteredGuides = filteredGuides.filter((guide) => {
        if (!Array.isArray(guide.languages)) return false;
        return guide.languages.some(lang =>
          lang.toLowerCase() === searchLanguage
        );
      });
    }

    // Filter by availability date (check if date falls within start_date to end_date range)
    if (availabilityDate.trim()) {
      // Fetch all availabilities for checking date ranges
      const { data: allAvailabilities, error: availError } = await supabase
        .from('guide_availability')
        .select('guide_id, start_date, end_date, is_available');

      if (!availError && allAvailabilities) {
        const selectedDate = availabilityDate; // Format: YYYY-MM-DD
        const availableGuideIds = new Set<string>();

        // Check each availability record
        allAvailabilities.forEach((avail: any) => {
          // Only consider guides that are marked as available
          if (avail.is_available) {
            // Check if the selected date falls within the range
            if (selectedDate >= avail.start_date && selectedDate <= avail.end_date) {
              availableGuideIds.add(avail.guide_id);
            }
          }
        });

        filteredGuides = filteredGuides.filter((guide) =>
          availableGuideIds.has(guide.id)
        );
      }
    }

    return NextResponse.json({ guides: filteredGuides });
  } catch (error) {
    console.error('Error searching guides:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
