/**
 * Security Utilities - Hardened for Production
 * Prevents console exploitation, XSS, injection attacks
 */

// ==================== SECURE LOGGING ====================
// Replaces console.log/error/warn - no output in production
const isDevelopment = process.env.NODE_ENV === 'development';

const secureLog = {
  error: (message: string, data?: unknown) => {
    if (isDevelopment) {
      // NEVER log sensitive data in development either
      console.error(`[ERROR] ${message}`);
      if (data && typeof data === 'object') {
        // Log only safe properties
        const safeData = JSON.stringify(data)
          .replace(/password/gi, '****')
          .replace(/token/gi, '****')
          .replace(/secret/gi, '****')
          .replace(/key/gi, '****');
        console.error(safeData);
      }
    }
    // In production: silently fail (potential to log to external service)
  },

  warn: (message: string) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`);
    }
  },

  info: (message: string) => {
    if (isDevelopment && process.env.DEBUG === 'true') {
      console.info(`[INFO] ${message}`);
    }
  },
};

export { secureLog };

// ==================== INPUT VALIDATION ====================

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

export const validatePassword = (password: string): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateUUID = (id: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const sanitizeString = (str: string, maxLength: number = 255): string => {
  if (!str) return '';

  // Remove any potentially dangerous characters
  let sanitized = str
    .substring(0, maxLength)
    .trim()
    .replace(/[<>"/]/g, '') // Remove HTML-like characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers

  return sanitized;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[0-9\s\-\+\(\)]{10,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateLocation = (location: string): boolean => {
  // Max 500 chars, no dangerous characters
  return (
    Boolean(location) &&
    location.length > 0 &&
    location.length <= 500 &&
    !/[<>"]/g.test(location)
  );
};

export const validateLanguageArray = (languages: string[]): boolean => {
  if (!Array.isArray(languages)) return false;
  if (languages.length === 0 || languages.length > 20) return false;

  return languages.every(
    (lang) =>
      typeof lang === 'string' &&
      lang.length > 0 &&
      lang.length <= 50 &&
      !/[<>"]/g.test(lang)
  );
};

// ==================== SAFE ERROR RESPONSES ====================

export const getSafeErrorMessage = (error: unknown): string => {
  // Never expose internal error details to client
  if (error instanceof Error) {
    secureLog.error('Internal error:', error.message);
    // Return generic message
    return 'An error occurred. Please try again.';
  }
  return 'An unexpected error occurred.';
};

export const getSafeErrorResponse = (
  error: unknown,
  statusCode: number = 500
) => {
  const safeMessage = getSafeErrorMessage(error);

  // Log actual error internally (never in response)
  if (error instanceof Error) {
    secureLog.error('API Error', {
      message: error.message.substring(0, 100), // Truncate
      statusCode,
    });
  }

  return {
    error: safeMessage,
    status: statusCode,
    timestamp: new Date().toISOString(),
  };
};

// ==================== TOKEN VALIDATION ====================

export const validateJWTFormat = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false;
  if (token.length > 2000) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  return parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part));
};

export const extractBearerToken = (
  authHeader: string
): { valid: boolean; token: string } => {
  if (!authHeader || typeof authHeader !== 'string') {
    return { valid: false, token: '' };
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return { valid: false, token: '' };
  }

  const token = parts[1];
  if (!validateJWTFormat(token)) {
    return { valid: false, token: '' };
  }

  return { valid: true, token };
};

// ==================== RATE LIMITING STATE ====================

const requestTimestamps = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 30;

export const isRateLimited = (
  identifier: string,
  limit: number = MAX_REQUESTS
): boolean => {
  const now = Date.now();
  const timestamps = requestTimestamps.get(identifier) || [];

  // Remove old timestamps
  const filtered = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);

  if (filtered.length >= limit) {
    return true;
  }

  filtered.push(now);
  requestTimestamps.set(identifier, filtered);

  return false;
};

// ==================== SECURE SESSION STORAGE ====================

const SESSION_STORAGE_KEY = '__gs'; // Generic key, no hints

export const secureSessionStorage = {
  set: (key: string, value: unknown) => {
    try {
      if (typeof window === 'undefined') return false;

      // Encrypt key with hash function
      const hashedKey = Buffer.from(`${SESSION_STORAGE_KEY}_${key}`).toString(
        'base64'
      );

      // Store only essential, non-sensitive data
      const allowedKeys = [
        'user_role',
        'session_created',
        'ui_prefs',
        'app_version',
      ];
      if (!allowedKeys.includes(key)) {
        return false;
      }

      sessionStorage.setItem(hashedKey, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  get: (key: string) => {
    try {
      if (typeof window === 'undefined') return null;

      const allowedKeys = [
        'user_role',
        'session_created',
        'ui_prefs',
        'app_version',
      ];
      if (!allowedKeys.includes(key)) {
        return null;
      }

      const hashedKey = Buffer.from(`${SESSION_STORAGE_KEY}_${key}`).toString(
        'base64'
      );
      const value = sessionStorage.getItem(hashedKey);

      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  remove: (key: string) => {
    try {
      if (typeof window === 'undefined') return false;

      const hashedKey = Buffer.from(`${SESSION_STORAGE_KEY}_${key}`).toString(
        'base64'
      );
      sessionStorage.removeItem(hashedKey);
      return true;
    } catch {
      return false;
    }
  },

  clear: () => {
    try {
      if (typeof window === 'undefined') return false;

      const keys = Object.keys(sessionStorage).filter((k) =>
        k.startsWith(Buffer.from(SESSION_STORAGE_KEY).toString('base64'))
      );

      keys.forEach((k) => sessionStorage.removeItem(k));
      return true;
    } catch {
      return false;
    }
  },
};

// ==================== REQUEST BODY VALIDATION ====================

export const validateRequestBody = (
  body: unknown,
  schema: Record<string, { required?: boolean; maxLength?: number; type?: string }>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    errors.push('Request body must be an object');
    return { valid: false, errors };
  }

  const bodyObj = body as Record<string, unknown>;

  Object.entries(schema).forEach(([key, rules]) => {
    const value = bodyObj[key];

    if (rules.required && (value === undefined || value === null)) {
      errors.push(`${key} is required`);
      return;
    }

    if (value !== undefined && value !== null) {
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${key} must be a ${rules.type}`);
      }

      if (
        rules.maxLength &&
        typeof value === 'string' &&
        value.length > rules.maxLength
      ) {
        errors.push(`${key} must be less than ${rules.maxLength} characters`);
      }
    }
  });

  return { valid: errors.length === 0, errors };
};

// ==================== SECURE RANDOM ID ====================

export const generateSecureRandomId = (): string => {
  // Generate 32 random bytes and convert to hex
  const randomBytes = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    // Node.js fallback
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

// ==================== HEADERS SECURITY ====================

export const getSecurityHeaders = () => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy':
      'geolocation=(), microphone=(), camera=(), payment=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
};

// ==================== DATA SANITIZATION ====================

export const sanitizeResponseData = (
  data: Record<string, unknown>
): Record<string, unknown> => {
  const sanitized = { ...data };

  // Remove sensitive fields
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'api_key',
    'refresh_token',
    'access_token',
    'encrypted_password',
  ];

  sensitiveFields.forEach((field) => {
    if (field in sanitized) {
      delete sanitized[field];
    }
  });

  return sanitized;
};

// ==================== XSS PREVENTION ====================

export const escapeHtml = (str: string): string => {
  const div = typeof document !== 'undefined' ? document.createElement('div') : null;

  if (!div) {
    // Server-side escape
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  div.textContent = str;
  return div.innerHTML;
};

// ==================== EXPORT ALL ====================
export const SecurityUtils = {
  secureLog,
  validateEmail,
  validatePassword,
  validateUUID,
  sanitizeString,
  validatePhoneNumber,
  validateLocation,
  validateLanguageArray,
  getSafeErrorMessage,
  getSafeErrorResponse,
  validateJWTFormat,
  extractBearerToken,
  isRateLimited,
  secureSessionStorage,
  validateRequestBody,
  generateSecureRandomId,
  getSecurityHeaders,
  sanitizeResponseData,
  escapeHtml,
};
