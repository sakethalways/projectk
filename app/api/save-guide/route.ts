import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken, validateUUID, isRateLimited } from '@/lib/security-utils';
import { errorResponses, handleAPIError } from '@/lib/api-error-handler';
import { sendNotification } from '@/lib/send-notification';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(`save_guide_${ip}`, 50)) {
      return errorResponses.rateLimited();
    }

    let guide_id: string;
    try {
      const body = await request.json();
      guide_id = body.guide_id;
    } catch (e) {
      return errorResponses.validation('Invalid JSON format');
    }

    // Validate guide_id is UUID format
    if (!guide_id || !validateUUID(guide_id)) {
      return errorResponses.validation('Invalid guide ID format');
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

    // Get the auth header to get tourist_id
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return errorResponses.missingAuthHeader();
    }

    // Extract token from "Bearer <token>"
    const { valid, token } = extractBearerToken(authHeader);
    if (!valid || !token) {
      return errorResponses.invalidToken();
    }

    // Verify the token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return errorResponses.invalidToken();
    }

    // Get guide info for notification
    const { data: guideData } = await supabase
      .from('guides')
      .select('user_id, name')
      .eq('id', guide_id)
      .single();

    // Save the guide
    const { data, error } = await supabase
      .from('saved_guides')
      .insert({
        tourist_id: user.id,
        guide_id: guide_id,
      })
      .select()
      .single();

    if (error) {
      // Check if it's a unique constraint error (already saved)
      if (error.code === '23505') {
        return errorResponses.conflict('Guide is already saved');
      }
      return handleAPIError(error, { action: 'save_guide', userId: user.id });
    }

    // Send notification to guide
    if (guideData) {
      await sendNotification(
        guideData.user_id,
        'guide_saved',
        '⭐ Added to Favorites',
        `A tourist has saved your profile to their favorites!`,
        { relatedGuideId: guide_id, relatedUserId: user.id }
      );
    }

    // Don't return full data - just success confirmation
    return NextResponse.json({
      success: true,
      message: 'Guide saved successfully',
    });
  } catch (error) {
    return handleAPIError(error, { action: 'save_guide' });
  }
}
