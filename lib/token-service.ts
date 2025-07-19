import { PrismaClient } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";

const prisma = new PrismaClient();

// Constants
const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';

// Error class for token-related errors
export class TokenError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'TokenError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Refresh an expired OAuth access token using the refresh token
 * @param refreshToken The refresh token to use
 * @returns New access token and expiration time
 */
export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string, expiresAt: number }> {
  try {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    // Request a new access token with exponential backoff retry
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        if (!credentials.access_token) {
          throw new TokenError('Failed to refresh access token: No token returned');
        }

        // Calculate expiration time
        const expiresAt = Date.now() + (credentials.expiry_date || 3600 * 1000);

        return {
          accessToken: credentials.access_token,
          expiresAt: expiresAt
        };
      } catch (retryError: any) {
        retries++;
        
        // If we've reached max retries, throw the error
        if (retries >= maxRetries) {
          throw retryError;
        }
        
        // If it's a rate limit or temporary server error, wait and retry
        if (retryError.code === 429 || retryError.code === 500) {
          const delay = Math.pow(2, retries) * 1000; // Exponential backoff
          console.log(`Rate limit or server error, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // For other errors, don't retry
          throw retryError;
        }
      }
    }
    
    throw new TokenError('Max retries reached when refreshing token');
  } catch (error: any) {
    console.error('Error refreshing access token:', error);
    
    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || 'Unknown error';
      
      if (status === 400 && message.includes('invalid_grant')) {
        throw new TokenError('Refresh token is invalid or has been revoked. Please reconnect your Google Calendar.', status, 'INVALID_GRANT');
      }
      
      throw new TokenError(`Failed to refresh token: ${message}`, status);
    }
    
    // Check for common OAuth errors in the error object
    if (error.code === 'INVALID_GRANT') {
      throw new TokenError('Refresh token is invalid or has been revoked. Please reconnect your Google Calendar.', 400, 'INVALID_GRANT');
    }
    
    throw new TokenError('Failed to refresh access token');
  }
}

/**
 * Update a user's NextAuth account with new token information
 * @param userId User ID
 * @param providerAccountId Provider account ID (from Google)
 * @param accessToken New access token
 * @param expiresAt New expiration timestamp
 */
export async function updateUserTokens(
  userId: string,
  providerAccountId: string,
  accessToken: string,
  expiresAt: number
): Promise<void> {
  try {
    await prisma.account.update({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: providerAccountId
        }
      },
      data: {
        access_token: accessToken,
        expires_at: Math.floor(expiresAt / 1000) // Convert to seconds for database storage
      }
    });
  } catch (error) {
    console.error('Error updating user tokens:', error);
    throw new TokenError('Failed to update user tokens in database');
  }
}

/**
 * Refresh a user's access token if it's expired
 * @param userId User ID
 * @returns Updated access token and expiration time, or null if no refresh was needed
 */
export async function refreshUserAccessTokenIfNeeded(userId: string): Promise<{ accessToken: string, expiresAt: number } | null> {
  try {
    // Get the user's Google account
    const account = await prisma.account.findFirst({
      where: {
        userId: userId,
        provider: 'google'
      }
    });

    if (!account) {
      throw new TokenError('User has no connected Google account');
    }

    if (!account.refresh_token) {
      throw new TokenError('No refresh token available. User needs to reconnect their Google account.');
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const isExpired = !account.expires_at || Date.now() > (account.expires_at * 1000 - 5 * 60 * 1000);
    
    if (!isExpired) {
      // Token is still valid
      return null;
    }

    // Refresh the token
    const { accessToken, expiresAt } = await refreshAccessToken(account.refresh_token);
    
    // Update the database with new token
    await updateUserTokens(userId, account.providerAccountId, accessToken, expiresAt);
    
    return { accessToken, expiresAt };
  } catch (error) {
    if (error instanceof TokenError) {
      throw error;
    }
    console.error('Error refreshing user access token:', error);
    throw new TokenError('Failed to refresh user access token');
  }
}

/**
 * Get a valid access token for a user
 * @param userId User ID
 * @returns Valid access token
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  try {
    // Get the user's Google account
    const account = await prisma.account.findFirst({
      where: {
        userId: userId,
        provider: 'google'
      }
    });

    if (!account) {
      throw new TokenError('User has no connected Google account');
    }

    if (!account.access_token) {
      throw new TokenError('No access token available');
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const isExpired = !account.expires_at || Date.now() > (account.expires_at * 1000 - 5 * 60 * 1000);
    
    if (!isExpired) {
      // Token is still valid
      return account.access_token;
    }

    // Token is expired, try to refresh it
    if (!account.refresh_token) {
      throw new TokenError('No refresh token available. User needs to reconnect their Google account.');
    }

    // Refresh the token
    const { accessToken } = await refreshAccessToken(account.refresh_token);
    
    // Update the database with new token
    await updateUserTokens(userId, account.providerAccountId, accessToken, Date.now() + 3600 * 1000);
    
    return accessToken;
  } catch (error) {
    if (error instanceof TokenError) {
      throw error;
    }
    console.error('Error getting valid access token:', error);
    throw new TokenError('Failed to get valid access token');
  }
}
/**

 * Revoke an OAuth token (either access or refresh token)
 * @param token The token to revoke
 */
export async function revokeToken(token: string): Promise<void> {
  try {
    // Google's token revocation endpoint requires a POST request with the token
    const response = await fetch(GOOGLE_REVOKE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `token=${encodeURIComponent(token)}`
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error_description || errorData.error || 'Unknown error';
      throw new TokenError(`Failed to revoke token: ${errorMessage}`, response.status);
    }
  } catch (error: any) {
    if (error instanceof TokenError) {
      throw error;
    }
    console.error('Error revoking token:', error);
    throw new TokenError('Failed to revoke token');
  }
}

/**
 * Revoke all OAuth tokens for a user
 * @param userId User ID
 */
export async function revokeUserTokens(userId: string): Promise<void> {
  try {
    // Get the user's Google account
    const account = await prisma.account.findFirst({
      where: {
        userId: userId,
        provider: 'google'
      }
    });

    if (!account) {
      // No Google account found, nothing to revoke
      return;
    }

    // Revoke access token if it exists
    if (account.access_token) {
      try {
        await revokeToken(account.access_token);
      } catch (error) {
        console.warn('Error revoking access token:', error);
        // Continue to revoke refresh token even if access token revocation fails
      }
    }

    // Revoke refresh token if it exists
    if (account.refresh_token) {
      try {
        await revokeToken(account.refresh_token);
      } catch (error) {
        console.warn('Error revoking refresh token:', error);
      }
    }

    // Update the database to clear the tokens
    await prisma.account.update({
      where: {
        id: account.id
      },
      data: {
        access_token: null,
        refresh_token: null,
        expires_at: null
      }
    });

    // Update user's Google Calendar connection status
    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        googleCalendarEnabled: false,
        googleCalendarId: null
      }
    });
  } catch (error) {
    console.error('Error revoking user tokens:', error);
    throw new TokenError('Failed to revoke user tokens');
  }
}

/**
 * Clean up user's Google Calendar connection when account is deleted
 * @param userId User ID
 */
export async function cleanupUserTokensOnAccountDeletion(userId: string): Promise<void> {
  try {
    // Revoke tokens first
    await revokeUserTokens(userId);
    
    // Additional cleanup if needed
    // Note: The actual account deletion should be handled by the account deletion process
    // This function just ensures tokens are properly revoked before deletion
  } catch (error) {
    console.error('Error cleaning up user tokens on account deletion:', error);
    // Log but don't throw, as we want account deletion to proceed even if token cleanup fails
  }
}