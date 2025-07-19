import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { OAuth2Client } from 'google-auth-library';

// Types for Google Calendar API
export interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
  selected?: boolean;
}

export interface EventDetails {
  summary: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date;
  attendees: { email: string; name?: string }[];
  timeZone?: string;
  conferenceData?: boolean;
}

export interface GoogleCalendarEvent {
  id: string;
  htmlLink: string;
  hangoutLink?: string;
}

// Error class for Google Calendar API errors
export class GoogleCalendarError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'GoogleCalendarError';
    this.status = status;
    this.code = code;
  }
}

// Initialize Google Calendar API client with service account (legacy method)
const initServiceAccountClient = () => {
  try {
    const credentials = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_id: process.env.GOOGLE_CLIENT_ID,
    };

    if (!credentials.client_email || !credentials.private_key) {
      throw new Error('Missing Google API credentials');
    }

    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    return google.calendar({ version: 'v3', auth });
  } catch (error) {
    console.error('Error initializing Google Calendar client:', error);
    throw new GoogleCalendarError('Failed to initialize Google Calendar client');
  }
};

// Initialize Google Calendar API client with OAuth token
const initOAuthClient = (accessToken: string) => {
  try {
    const auth = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({ access_token: accessToken });
    return google.calendar({ version: 'v3', auth });
  } catch (error) {
    console.error('Error initializing Google Calendar OAuth client:', error);
    throw new GoogleCalendarError('Failed to initialize Google Calendar client with OAuth token');
  }
};

/**
 * Get a Google Calendar client with a valid access token for a user
 * @param userId User ID
 * @returns Google Calendar API client
 */
export async function getCalendarClientForUser(userId: string) {
  try {
    // Import dynamically to avoid circular dependencies
    const { getValidAccessToken } = await import('./token-service');
    
    // Get a valid access token (refreshed if needed)
    const accessToken = await getValidAccessToken(userId);
    
    // Initialize the client with the token
    return initOAuthClient(accessToken);
  } catch (error: any) {
    console.error('Error getting calendar client for user:', error);
    
    if (error.code === 'INVALID_GRANT') {
      throw new GoogleCalendarError(
        'Your Google Calendar connection needs to be renewed. Please reconnect in settings.',
        401,
        'TOKEN_EXPIRED'
      );
    }
    
    throw new GoogleCalendarError('Failed to initialize Google Calendar client');
  }
}

/**
 * Get a list of user's calendars
 * @param accessToken User's OAuth access token
 * @returns List of user's calendars
 */
export async function getUserCalendars(accessToken: string): Promise<GoogleCalendar[]> {
  try {
    const calendar = initOAuthClient(accessToken);
    
    const response = await calendar.calendarList.list({
      minAccessRole: 'writer', // Only include calendars where user can write events
      showHidden: false,
    });
    
    if (!response.data.items) {
      return [];
    }
    
    return response.data.items.map(item => ({
      id: item.id || '',
      summary: item.summary || '',
      description: item.description,
      primary: item.primary || false,
      backgroundColor: item.backgroundColor,
      foregroundColor: item.foregroundColor,
      selected: item.selected,
    }));
  } catch (error: any) {
    console.error('Error fetching user calendars:', error);
    
    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || 'Unknown error';
      
      if (status === 401) {
        throw new GoogleCalendarError('Authentication failed. Please reconnect your Google Calendar.', status, 'UNAUTHENTICATED');
      } else if (status === 403) {
        throw new GoogleCalendarError('Permission denied. Please check your calendar permissions.', status, 'PERMISSION_DENIED');
      } else if (status === 429) {
        throw new GoogleCalendarError('Too many requests. Please try again later.', status, 'RATE_LIMIT_EXCEEDED');
      }
      
      throw new GoogleCalendarError(`Google Calendar API error: ${message}`, status);
    }
    
    throw new GoogleCalendarError('Failed to fetch calendars');
  }
}

// Create a Google Calendar event and return the Meet link (legacy method with service account)
export async function createGoogleMeetEvent({
  summary,
  description,
  startDateTime,
  endDateTime,
  attendees,
  timeZone = 'UTC',
}: EventDetails) {
  try {
    const calendar = initServiceAccountClient();
    
    const event = {
      summary,
      description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone,
      },
      attendees: attendees.map(attendee => ({ email: attendee.email })),
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: event,
    });

    const meetLink = response.data.hangoutLink || '';
    const eventId = response.data.id || '';
    const eventLink = response.data.htmlLink || '';

    return {
      meetLink,
      eventId,
      eventLink,
    };
  } catch (error) {
    console.error('Error creating Google Meet event:', error);
    throw new GoogleCalendarError('Failed to create Google Calendar event');
  }
}

/**
 * Create a calendar event in the user's selected calendar
 * @param accessToken User's OAuth access token
 * @param calendarId ID of the calendar to create the event in
 * @param eventDetails Details of the event to create
 * @returns Created event details
 */
export async function createCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventDetails: EventDetails
): Promise<GoogleCalendarEvent> {
  try {
    const calendar = initOAuthClient(accessToken);
    
    const event = {
      summary: eventDetails.summary,
      description: eventDetails.description,
      start: {
        dateTime: eventDetails.startDateTime.toISOString(),
        timeZone: eventDetails.timeZone || 'UTC',
      },
      end: {
        dateTime: eventDetails.endDateTime.toISOString(),
        timeZone: eventDetails.timeZone || 'UTC',
      },
      attendees: eventDetails.attendees.map(attendee => ({ 
        email: attendee.email,
        displayName: attendee.name
      })),
      // Add Google Meet conference data if requested
      ...(eventDetails.conferenceData && {
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      }),
    };

    const response = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: eventDetails.conferenceData ? 1 : 0,
      requestBody: event,
      sendUpdates: 'all', // Send email notifications to attendees
    });

    if (!response.data.id) {
      throw new GoogleCalendarError('Failed to create calendar event: No event ID returned');
    }

    return {
      id: response.data.id,
      htmlLink: response.data.htmlLink || '',
      hangoutLink: response.data.hangoutLink,
    };
  } catch (error: any) {
    console.error('Error creating calendar event:', error);
    
    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || 'Unknown error';
      
      if (status === 401) {
        throw new GoogleCalendarError('Authentication failed. Please reconnect your Google Calendar.', status, 'UNAUTHENTICATED');
      } else if (status === 403) {
        throw new GoogleCalendarError('Permission denied. Please check your calendar permissions.', status, 'PERMISSION_DENIED');
      } else if (status === 404) {
        throw new GoogleCalendarError('Calendar not found. Please select a different calendar.', status, 'NOT_FOUND');
      }
      
      throw new GoogleCalendarError(`Google Calendar API error: ${message}`, status);
    }
    
    throw new GoogleCalendarError('Failed to create calendar event');
  }
}

/**
 * Update an existing calendar event
 * @param accessToken User's OAuth access token
 * @param calendarId ID of the calendar containing the event
 * @param eventId ID of the event to update
 * @param eventDetails Updated event details
 * @returns Updated event details
 */
export async function updateCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  eventDetails: EventDetails
): Promise<GoogleCalendarEvent> {
  try {
    const calendar = initOAuthClient(accessToken);
    
    const event = {
      summary: eventDetails.summary,
      description: eventDetails.description,
      start: {
        dateTime: eventDetails.startDateTime.toISOString(),
        timeZone: eventDetails.timeZone || 'UTC',
      },
      end: {
        dateTime: eventDetails.endDateTime.toISOString(),
        timeZone: eventDetails.timeZone || 'UTC',
      },
      attendees: eventDetails.attendees.map(attendee => ({ 
        email: attendee.email,
        displayName: attendee.name
      })),
    };

    const response = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: event,
      sendUpdates: 'all', // Send email notifications to attendees
    });

    return {
      id: response.data.id || eventId,
      htmlLink: response.data.htmlLink || '',
      hangoutLink: response.data.hangoutLink,
    };
  } catch (error: any) {
    console.error('Error updating calendar event:', error);
    
    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || 'Unknown error';
      
      if (status === 401) {
        throw new GoogleCalendarError('Authentication failed. Please reconnect your Google Calendar.', status, 'UNAUTHENTICATED');
      } else if (status === 403) {
        throw new GoogleCalendarError('Permission denied. Please check your calendar permissions.', status, 'PERMISSION_DENIED');
      } else if (status === 404) {
        throw new GoogleCalendarError('Event not found. It may have been deleted.', status, 'NOT_FOUND');
      }
      
      throw new GoogleCalendarError(`Google Calendar API error: ${message}`, status);
    }
    
    throw new GoogleCalendarError('Failed to update calendar event');
  }
}

/**
 * Delete a calendar event
 * @param accessToken User's OAuth access token
 * @param calendarId ID of the calendar containing the event
 * @param eventId ID of the event to delete
 */
export async function deleteCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<void> {
  try {
    const calendar = initOAuthClient(accessToken);
    
    await calendar.events.delete({
      calendarId,
      eventId,
      sendUpdates: 'all', // Send email notifications to attendees
    });
  } catch (error: any) {
    console.error('Error deleting calendar event:', error);
    
    // Don't throw on 404 errors (event already deleted)
    if (error.response && error.response.status === 404) {
      console.warn('Event not found, may have been already deleted:', eventId);
      return;
    }
    
    // Handle other specific error cases
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || 'Unknown error';
      
      if (status === 401) {
        throw new GoogleCalendarError('Authentication failed. Please reconnect your Google Calendar.', status, 'UNAUTHENTICATED');
      } else if (status === 403) {
        throw new GoogleCalendarError('Permission denied. Please check your calendar permissions.', status, 'PERMISSION_DENIED');
      }
      
      throw new GoogleCalendarError(`Google Calendar API error: ${message}`, status);
    }
    
    throw new GoogleCalendarError('Failed to delete calendar event');
  }
}

/**
 * Get a calendar event by ID
 * @param accessToken User's OAuth access token
 * @param calendarId ID of the calendar containing the event
 * @param eventId ID of the event to retrieve
 * @returns Event details
 */
export async function getCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<any> {
  try {
    const calendar = initOAuthClient(accessToken);
    
    const response = await calendar.events.get({
      calendarId,
      eventId,
    });

    return response.data;
  } catch (error: any) {
    console.error('Error getting calendar event:', error);
    
    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || 'Unknown error';
      
      if (status === 401) {
        throw new GoogleCalendarError('Authentication failed. Please reconnect your Google Calendar.', status, 'UNAUTHENTICATED');
      } else if (status === 403) {
        throw new GoogleCalendarError('Permission denied. Please check your calendar permissions.', status, 'PERMISSION_DENIED');
      } else if (status === 404) {
        throw new GoogleCalendarError('Event not found. It may have been deleted.', status, 'NOT_FOUND');
      }
      
      throw new GoogleCalendarError(`Google Calendar API error: ${message}`, status);
    }
    
    throw new GoogleCalendarError('Failed to get calendar event');
  }
}