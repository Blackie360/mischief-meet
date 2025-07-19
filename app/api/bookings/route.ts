import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getValidAccessToken } from '@/lib/token-service';
import { createCalendarEvent } from '@/lib/google-calendar';
import { sendBookingConfirmation } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      hostId, 
      guestName, 
      guestEmail, 
      bookingDate, 
      startTime, 
      duration, 
      notes 
    } = body;

    if (!hostId || !guestName || !guestEmail || !bookingDate || !startTime || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get host information
    const host = await prisma.user.findUnique({
      where: { id: hostId },
      select: {
        name: true,
        email: true,
        timezone: true,
        googleCalendarEnabled: true,
        googleCalendarId: true
      }
    });

    if (!host) {
      return NextResponse.json({ error: 'Host not found' }, { status: 404 });
    }

    // Convert string time to proper DateTime objects for Prisma
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const startDateTime = new Date(bookingDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + duration);
    
    // Format end time for display/emails
    const endTime = `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`;
    
    const booking = await prisma.booking.create({
      data: {
        hostId,
        guestName,
        guestEmail,
        bookingDate: new Date(bookingDate),
        startTime: startDateTime,
        endTime: endDateTime,
        notes,
        status: 'confirmed'
      }
    });

    let meetLink = null;
    let googleEventId = null;
    let googleEventLink = null;

    // Import error handling utilities
    const { safeCalendarOperation, formatCalendarError } = await import('@/lib/calendar-error-handler');

    // If host has Google Calendar enabled, create calendar event
    if (host.googleCalendarEnabled && host.googleCalendarId) {
      const calendarResult = await safeCalendarOperation(
        async () => {
          // Get a valid access token for the host
          const accessToken = await getValidAccessToken(hostId);
          
          // Create calendar event with Google Meet link
          const event = await createCalendarEvent(
            accessToken,
            host.googleCalendarId!,
            {
              summary: `Meeting with ${guestName}`,
              description: notes ? `Notes: ${notes}` : 'Scheduled via MeetMischief',
              startDateTime: startDateTime,
              endDateTime: endDateTime,
              attendees: [
                { email: guestEmail, name: guestName },
                { email: host.email || '' }
              ],
              timeZone: host.timezone,
              conferenceData: true // Request Google Meet link
            }
          );

          return {
            id: event.id,
            htmlLink: event.htmlLink,
            hangoutLink: event.hangoutLink
          };
        },
        (error) => {
          console.error('Failed to create Google Calendar event:', error);
          // Return null values to indicate failure
          return { id: null, htmlLink: null, hangoutLink: null };
        }
      );

      // If calendar event creation was successful
      if (calendarResult.id) {
        // Update booking with Google Calendar event information
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            googleEventId: calendarResult.id,
            googleEventLink: calendarResult.htmlLink,
            meetLink: calendarResult.hangoutLink
          }
        });

        meetLink = calendarResult.hangoutLink;
        googleEventId = calendarResult.id;
        googleEventLink = calendarResult.htmlLink;
        
        console.log('Google Calendar event created successfully:', calendarResult);
      }
    } else {
      // If Google Calendar is not enabled, create a Google Meet link using service account
      const meetResult = await safeCalendarOperation(
        async () => {
          const { createGoogleMeetEvent } = await import('@/lib/google-calendar');
          return await createGoogleMeetEvent({
            summary: `Meeting with ${guestName}`,
            description: notes ? `Notes: ${notes}` : 'Scheduled via MeetMischief',
            startDateTime: startDateTime,
            endDateTime: endDateTime,
            attendees: [
              { email: guestEmail, name: guestName },
              { email: host.email || '' }
            ],
            timeZone: host.timezone
          });
        },
        (error) => {
          console.error('Failed to create Google Meet link:', error);
          // Return empty values to indicate failure
          return { meetLink: null, eventId: null, eventLink: null };
        }
      );

      // If Meet link creation was successful
      if (meetResult.eventId) {
        // Update booking with Google Meet link
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            meetLink: meetResult.meetLink,
            googleEventId: meetResult.eventId,
            googleEventLink: meetResult.eventLink
          }
        });

        meetLink = meetResult.meetLink;
        googleEventId = meetResult.eventId;
        googleEventLink = meetResult.eventLink;
      }
    }

    // Format date and time for email
    const formattedDate = new Date(bookingDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const formattedTime = `${startTime} - ${endTime} (${host.timezone})`;

    // Send confirmation email to guest
    await sendBookingConfirmation({
      to: guestEmail,
      hostName: host.name || 'Your Host',
      guestName,
      guestEmail,
      eventTitle: 'Meeting',
      eventDate: formattedDate,
      eventTime: formattedTime,
      duration,
      meetingLink: meetLink,
      isHost: false
    });

    // Send notification email to host
    if (host.email) {
      await sendBookingConfirmation({
        to: host.email,
        hostName: host.name || 'You',
        guestName,
        guestEmail,
        eventTitle: 'Meeting',
        eventDate: formattedDate,
        eventTime: formattedTime,
        duration,
        meetingLink: meetLink,
        isHost: true
      });
    }

    return NextResponse.json({
      id: booking.id,
      meetLink,
      googleEventId,
      googleEventLink
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}