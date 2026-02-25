/**
 * API Error Handler - Secure, No Data Leakage
 * Handles all errors with safe responses
 */

import { NextResponse } from 'next/server';
import { secureLog, getSafeErrorResponse } from '@/lib/security-utils';

export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_INPUT = 'INVALID_INPUT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  MISSING_AUTH = 'MISSING_AUTH',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export class APIError extends Error {
  constructor(
    public code: ErrorCode,
    public statusCode: number,
    message: string,
    public internalDetails?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const errorResponses = {
  unauthorized: () =>
    NextResponse.json(
      { error: 'Authentication required', code: ErrorCode.UNAUTHORIZED },
      { status: 401 }
    ),

  invalidToken: () =>
    NextResponse.json(
      { error: 'Invalid or expired token', code: ErrorCode.INVALID_TOKEN },
      { status: 401 }
    ),

  missingAuthHeader: () =>
    NextResponse.json(
      { error: 'Authentication header required', code: ErrorCode.MISSING_AUTH },
      { status: 401 }
    ),

  forbidden: () =>
    NextResponse.json(
      {
        error: 'You do not have permission to perform this action',
        code: ErrorCode.FORBIDDEN,
      },
      { status: 403 }
    ),

  notFound: () =>
    NextResponse.json(
      { error: 'Resource not found', code: ErrorCode.NOT_FOUND },
      { status: 404 }
    ),

  validation: (message: string = 'Invalid request data') =>
    NextResponse.json(
      { error: message, code: ErrorCode.VALIDATION_ERROR },
      { status: 400 }
    ),

  conflict: (message: string = 'Resource already exists') =>
    NextResponse.json(
      { error: message, code: ErrorCode.CONFLICT },
      { status: 409 }
    ),

  rateLimited: () =>
    NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        code: ErrorCode.RATE_LIMITED,
      },
      { status: 429 }
    ),

  internalError: (error?: unknown) => {
    // Log actual error internally
    secureLog.error('Internal server error', {
      type: error instanceof Error ? error.constructor.name : typeof error,
      hasMessage: error instanceof Error,
    });

    return NextResponse.json(
      {
        error: 'An error occurred processing your request',
        code: ErrorCode.INTERNAL_ERROR,
      },
      { status: 500 }
    );
  },
};

export const handleAPIError = (
  error: unknown,
  context?: { userId?: string; action?: string }
) => {
  if (error instanceof APIError) {
    secureLog.error(`[${error.code}] ${error.message}`, {
      action: context?.action,
      userId: context?.userId ? context.userId.substring(0, 8) : 'unknown',
      statusCode: error.statusCode,
    });

    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof SyntaxError) {
    return errorResponses.validation('Invalid JSON in request body');
  }

  // Generic internal error - never reveal details
  secureLog.error('Unhandled error', {
    type: error instanceof Error ? error.constructor.name : typeof error,
    action: context?.action,
  });

  return errorResponses.internalError(error);
};

export const validateCredentials = (
  credentials: unknown
): {
  valid: boolean;
  email?: string;
  password?: string;
  error?: string;
} => {
  if (!credentials || typeof credentials !== 'object') {
    return { valid: false, error: 'Invalid credentials format' };
  }

  const creds = credentials as Record<string, unknown>;
  const email = String(creds.email || '').trim().toLowerCase();
  const password = String(creds.password || '');

  if (!email || email.length > 255) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (!password || password.length < 8 || password.length > 128) {
    return { valid: false, error: 'Invalid password format' };
  }

  return { valid: true, email, password };
};

// ==================== RESPONSE WRAPPERS ====================

export const successResponse = (
  data: unknown,
  statusCode: number = 200,
  headers?: Record<string, string>
) => {
  const response = NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );

  // Add security headers
  Object.entries(headers || {}).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
};

export const errorResponse = (
  message: string,
  statusCode: number = 500,
  code?: string
) => {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: code || 'ERROR',
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
};

// ==================== SECURITY VALIDATION ====================

export const validateAPICredentials = (
  supabaseUrl?: string,
  serviceKey?: string
): { valid: boolean; error?: string } => {
  if (!supabaseUrl || !serviceKey) {
    secureLog.error('Missing API credentials');
    return {
      valid: false,
      error: 'System configuration error',
    };
  }

  if (typeof supabaseUrl !== 'string' || typeof serviceKey !== 'string') {
    return { valid: false, error: 'Invalid credential format' };
  }

  if (supabaseUrl.length > 500 || serviceKey.length > 1000) {
    return { valid: false, error: 'Invalid credential length' };
  }

  return { valid: true };
};

// ==================== PREVENT HEADER INJECTION ====================

export const validateAuthHeader = (header: string | null): boolean => {
  if (!header || typeof header !== 'string') return false;

  // Check for newlines (header injection attempt)
  if (/[\r\n]/.test(header)) return false;

  // Max reasonable length for auth header
  if (header.length > 2000) return false;

  return true;
};
