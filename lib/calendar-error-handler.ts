import { GoogleCalendarError } from './google-calendar';

/**
 * Retry configuration for calendar operations
 */
interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  factor: number;
}

/**
 * Default retry configuration
 */
const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  factor: 2, // Exponential backoff factor
};

/**
 * Execute a calendar operation with retry logic
 * @param operation Function to execute
 * @param retryConfig Retry configuration
 * @returns Result of the operation
 */
export async function withCalendarRetry<T>(
  operation: () => Promise<T>,
  retryConfig: Partial<RetryConfig> = {}
): Promise<T> {
  const config = { ...defaultRetryConfig, ...retryConfig };
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry for certain error types
      if (error instanceof GoogleCalendarError) {
        // Don't retry for permission errors, invalid tokens, or not found errors
        if (
          error.code === 'PERMISSION_DENIED' ||
          error.code === 'UNAUTHENTICATED' ||
          error.code === 'NOT_FOUND' ||
          error.code === 'INVALID_GRANT' ||
          error.code === 'TOKEN_EXPIRED'
        ) {
          throw error;
        }
      }
      
      // If this was the last attempt, don't wait
      if (attempt === config.maxRetries - 1) {
        break;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        config.maxDelay,
        config.initialDelay * Math.pow(config.factor, attempt) * (0.8 + Math.random() * 0.4)
      );
      
      console.log(`Calendar operation failed, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${config.maxRetries})`, error);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If we got here, all retries failed
  throw lastError || new Error('Calendar operation failed after multiple retries');
}

/**
 * Safely execute a calendar operation, with fallback behavior if it fails
 * @param operation Function to execute
 * @param fallback Fallback function to execute if operation fails
 * @param retryConfig Retry configuration
 * @returns Result of the operation or fallback
 */
export async function safeCalendarOperation<T>(
  operation: () => Promise<T>,
  fallback: (error: Error) => Promise<T> | T,
  retryConfig?: Partial<RetryConfig>
): Promise<T> {
  try {
    return await withCalendarRetry(operation, retryConfig);
  } catch (error: any) {
    console.error('Calendar operation failed after retries:', error);
    return await fallback(error);
  }
}

/**
 * Format calendar error for user-friendly display
 * @param error Error object
 * @returns User-friendly error message
 */
export function formatCalendarError(error: any): string {
  if (error instanceof GoogleCalendarError) {
    switch (error.code) {
      case 'PERMISSION_DENIED':
        return 'You don\'t have permission to access this calendar. Please check your calendar settings.';
      case 'UNAUTHENTICATED':
        return 'Your Google Calendar connection needs to be renewed. Please reconnect in settings.';
      case 'NOT_FOUND':
        return 'The calendar or event was not found. It may have been deleted.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Too many requests to Google Calendar. Please try again later.';
      case 'TOKEN_EXPIRED':
        return 'Your Google Calendar access has expired. Please reconnect in settings.';
      default:
        return error.message || 'An error occurred with Google Calendar.';
    }
  }
  
  return error?.message || 'An unknown error occurred with Google Calendar.';
}