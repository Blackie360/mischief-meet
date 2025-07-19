// This script tests the Google Calendar API integration
require('dotenv').config();
const { createGoogleMeetEvent } = require('../lib/google-calendar');

async function testGoogleCalendarAPI() {
  try {
    console.log('Testing Google Calendar API...');
    
    const startDateTime = new Date();
    startDateTime.setHours(startDateTime.getHours() + 1); // 1 hour from now
    
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + 30); // 30 minutes meeting
    
    const result = await createGoogleMeetEvent({
      summary: 'Test Meeting',
      description: 'This is a test meeting created by the script',
      startDateTime,
      endDateTime,
      attendees: [
        { email: process.env.EMAIL_SERVER_USER, name: 'Test Host' },
        { email: 'test-guest@example.com', name: 'Test Guest' }
      ],
      timeZone: 'UTC'
    });
    
    console.log('Google Meet link created successfully:');
    console.log('Meet Link:', result.meetLink);
    console.log('Event ID:', result.eventId);
    console.log('Event Link:', result.eventLink);
    
    return result;
  } catch (error) {
    console.error('Error testing Google Calendar API:', error);
    throw error;
  }
}

testGoogleCalendarAPI()
  .then(() => console.log('Test completed successfully'))
  .catch(error => console.error('Test failed:', error));