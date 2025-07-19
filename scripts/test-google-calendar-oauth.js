// Test script for Google Calendar OAuth integration
// Usage: node scripts/test-google-calendar-oauth.js <access_token>

const { 
  getUserCalendars, 
  createCalendarEvent, 
  updateCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvent
} = require('../lib/google-calendar');

async function testGoogleCalendarAPI() {
  try {
    // Get access token from command line arguments
    const accessToken = process.argv[2];
    
    if (!accessToken) {
      console.error('Please provide an access token as a command line argument');
      console.error('Usage: node scripts/test-google-calendar-oauth.js <access_token>');
      process.exit(1);
    }

    console.log('Testing Google Calendar API with OAuth...');
    
    // Test getUserCalendars
    console.log('\n1. Testing getUserCalendars...');
    const calendars = await getUserCalendars(accessToken);
    console.log(`Found ${calendars.length} calendars:`);
    calendars.forEach((calendar, index) => {
      console.log(`  ${index + 1}. ${calendar.summary}${calendar.primary ? ' (Primary)' : ''} - ID: ${calendar.id}`);
    });
    
    if (calendars.length === 0) {
      console.error('No calendars found. Cannot continue with tests.');
      process.exit(1);
    }
    
    // Use the primary calendar or the first one in the list
    const testCalendar = calendars.find(cal => cal.primary) || calendars[0];
    console.log(`\nUsing calendar: ${testCalendar.summary} (${testCalendar.id}) for testing`);
    
    // Test createCalendarEvent
    console.log('\n2. Testing createCalendarEvent...');
    const now = new Date();
    const eventStart = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    const eventEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    
    const eventDetails = {
      summary: 'Test Event from OAuth API',
      description: 'This is a test event created by the Google Calendar OAuth API test script',
      startDateTime: eventStart,
      endDateTime: eventEnd,
      attendees: [
        { email: 'test@example.com', name: 'Test User' }
      ],
      timeZone: 'UTC',
      conferenceData: true
    };
    
    const createdEvent = await createCalendarEvent(accessToken, testCalendar.id, eventDetails);
    console.log('Event created successfully:');
    console.log(`  ID: ${createdEvent.id}`);
    console.log(`  Link: ${createdEvent.htmlLink}`);
    console.log(`  Meet Link: ${createdEvent.hangoutLink || 'None'}`);
    
    // Test getCalendarEvent
    console.log('\n3. Testing getCalendarEvent...');
    const retrievedEvent = await getCalendarEvent(accessToken, testCalendar.id, createdEvent.id);
    console.log('Event retrieved successfully:');
    console.log(`  Summary: ${retrievedEvent.summary}`);
    console.log(`  Start: ${retrievedEvent.start.dateTime}`);
    console.log(`  End: ${retrievedEvent.end.dateTime}`);
    
    // Test updateCalendarEvent
    console.log('\n4. Testing updateCalendarEvent...');
    const updatedEventDetails = {
      ...eventDetails,
      summary: 'Updated Test Event from OAuth API',
      description: 'This event was updated by the Google Calendar OAuth API test script'
    };
    
    const updatedEvent = await updateCalendarEvent(
      accessToken, 
      testCalendar.id, 
      createdEvent.id, 
      updatedEventDetails
    );
    console.log('Event updated successfully:');
    console.log(`  ID: ${updatedEvent.id}`);
    console.log(`  Link: ${updatedEvent.htmlLink}`);
    
    // Test deleteCalendarEvent
    console.log('\n5. Testing deleteCalendarEvent...');
    await deleteCalendarEvent(accessToken, testCalendar.id, createdEvent.id);
    console.log('Event deleted successfully');
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error testing Google Calendar API:', error);
    process.exit(1);
  }
}

testGoogleCalendarAPI();