import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken, validateUUID, isRateLimited } from '@/lib/security-utils';
import { errorResponses, handleAPIError } from '@/lib/api-error-handler';

export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(`unsave_guide_${ip}`, 50)) {
      return errorResponses.rateLimited();
    }

    const { searchParams } = new URL(request.url);
    const guide_id = searchParams.get('guide_id');

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

    // Unsave the guide
    const { error } = await supabase
      .from('saved_guides')
      .delete()
      .eq('tourist_id', user.id)
      .eq('guide_id', guide_id);

    if (error) {
      return handleAPIError(error, { action: 'unsave_guide', userId: user.id });
    }

    return NextResponse.json({
      success: true,
      message: 'Guide unsaved successfully',
    });
  } catch (error) {
    return handleAPIError(error, { action: 'unsave_guide' });
  }
}

export async function POST(request: NextRequest) {
  return DELETE(request);
}
