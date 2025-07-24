/**
 * Custom error types for PUO Memo Client
 */

export class PuoMemoError extends Error {
  public readonly statusCode?: number;
  public readonly errorCode?: string;
  public readonly details?: any;

  constructor(message: string, statusCode?: number, errorCode?: string, details?: any) {
    super(message);
    this.name = 'PuoMemoError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PuoMemoError);
    }
  }
}

export class AuthenticationError extends PuoMemoError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTH_FAILED');
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends PuoMemoError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class ValidationError extends PuoMemoError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends PuoMemoError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class NetworkError extends PuoMemoError {
  constructor(message: string = 'Network request failed') {
    super(message, undefined, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends PuoMemoError {
  constructor(message: string = 'Request timed out') {
    super(message, 408, 'TIMEOUT');
    this.name = 'TimeoutError';
  }
}

export class QuotaExceededError extends PuoMemoError {
  public readonly quotaType: 'memories' | 'searches' | 'storage' | 'api_calls';
  public readonly limit: number;
  public readonly current: number;

  constructor(quotaType: string, limit: number, current: number) {
    super(
      `${quotaType} quota exceeded: ${current}/${limit}`,
      402,
      'QUOTA_EXCEEDED'
    );
    this.name = 'QuotaExceededError';
    this.quotaType = quotaType as any;
    this.limit = limit;
    this.current = current;
  }
}

export class ConfigurationError extends PuoMemoError {
  constructor(message: string) {
    super(message, undefined, 'CONFIG_ERROR');
    this.name = 'ConfigurationError';
  }
}

/**
 * Helper function to determine if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
  if (error instanceof PuoMemoError) {
    // 5xx errors are typically retryable
    if (error.statusCode && error.statusCode >= 500) {
      return true;
    }
    
    // Rate limits are retryable after delay
    if (error instanceof RateLimitError) {
      return true;
    }
    
    // Network and timeout errors are often transient
    if (error instanceof NetworkError || error instanceof TimeoutError) {
      return true;
    }
  }
  
  return false;
}

/**
 * Extract user-friendly error message
 */
export function getErrorMessage(error: any): string {
  if (error instanceof PuoMemoError) {
    return error.message;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Create appropriate error from API response
 */
export function createErrorFromResponse(response: any): PuoMemoError {
  const status = response.status;
  const data = response.data || {};
  const message = data.message || `API error: ${status}`;
  
  switch (status) {
    case 401:
      return new AuthenticationError(message);
    case 404:
      return new NotFoundError(data.resource || 'Resource', data.id || 'unknown');
    case 429:
      return new RateLimitError(message, data.retry_after);
    case 400:
      return new ValidationError(message, data.details);
    case 402:
      return new QuotaExceededError(
        data.quota_type || 'unknown',
        data.limit || 0,
        data.current || 0
      );
    default:
      return new PuoMemoError(message, status, data.code, data.details);
  }
}