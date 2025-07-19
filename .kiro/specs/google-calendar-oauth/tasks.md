# Implementation Plan

- [x] 1. Set up Google OAuth with NextAuth.js

  - Update NextAuth configuration to include Google Calendar scopes
  - Modify the Google provider setup to request offline access
  - Update the callback handling to properly store tokens
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.4_

- [-] 2. Update database schema for Google Calendar integration

  - [x] 2.1 Add Google Calendar fields to User model

    - Add googleCalendarId and googleCalendarEnabled fields
    - Create migration for schema changes
    - _Requirements: 2.2, 2.3_

  - [x] 2.2 Add Google Calendar event fields to Booking model

    - Add googleEventId and googleEventLink fields
    - Create migration for schema changes
    - _Requirements: 3.1, 3.2_

- [x] 3. Implement Google Calendar API service

  - [x] 3.1 Create service for fetching user calendars

    - Implement function to get list of user's calendars
    - Handle authentication and error cases
    - _Requirements: 2.1, 2.5_

  - [x] 3.2 Create service for calendar event operations

    - Implement functions for creating calendar events
    - Implement functions for updating calendar events
    - Implement functions for deleting calendar events
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [-] 4. Implement token management service

  - [x] 4.1 Create token refresh functionality

    - Implement function to refresh expired access tokens
    - Add error handling for invalid refresh tokens
    - _Requirements: 4.2, 4.3, 5.2_

  - [ ] 4.2 Create token revocation functionality
    - Implement function to revoke OAuth tokens
    - Add cleanup for user account deletion
    - _Requirements: 4.1, 4.5, 5.1_

- [ ] 5. Create user interface for Google Calendar connection

  - [ ] 5.1 Add Google Calendar section to settings page

    - Create UI components for connection status
    - Add connect/disconnect buttons
    - Display appropriate status messages
    - _Requirements: 1.1, 1.4, 1.5, 4.1_

  - [ ] 5.2 Implement calendar selection UI
    - Create dropdown for selecting calendars
    - Add loading state for calendar fetching
    - Implement saving of calendar selection
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 6. Integrate Google Calendar with booking system

  - [ ] 6.1 Update booking creation flow

    - Check for connected Google Calendar
    - Create calendar events for new bookings
    - Store event IDs with booking records
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 6.2 Update booking modification flow
    - Update calendar events when bookings are modified
    - Delete calendar events when bookings are cancelled
    - Handle error cases gracefully
    - _Requirements: 3.4, 3.5, 3.6_

- [ ] 7. Implement error handling and recovery

  - [ ] 7.1 Add error handling for OAuth flow

    - Handle user rejection of permissions
    - Handle API errors during authentication

    - Provide clear error messages to users
    - _Requirements: 4.3, 5.3_

  - [ ] 7.2 Add error handling for calendar operations
    - Implement retry mechanism for API failures
    - Handle permission errors gracefully
    - Continue booking flow even if calendar sync fails
    - _Requirements: 3.6, 5.3_
