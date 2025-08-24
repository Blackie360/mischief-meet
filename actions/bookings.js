"use server";

import { db } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { google } from "googleapis";
import { bookingSchema } from "@/app/lib/validators";

export async function createBooking(bookingData) {
  try {
    if (!bookingData) {
      throw new Error("Booking data is required");
    }

    // Validate the booking data
    const validatedData = bookingSchema.parse(bookingData);
    
    // Fetch the event and its creator
    const event = await db.event.findUnique({
      where: { id: validatedData.eventId },
      include: { 
        user: {
          select: {
            id: true,
            clerkUserId: true,
            email: true
          }
        } 
      },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    // Get the event creator's Google OAuth token from Clerk
    let token;
    try {
      const { data } = await clerkClient.users.getUserOauthAccessToken(
        event.user.clerkUserId,
        "oauth_google"
      );

      token = data[0]?.token;

      if (!token) {
        throw new Error("Event creator has not connected Google Calendar");
      }
    } catch (error) {
      console.error("Error getting Google OAuth token:", error);
      throw new Error("Failed to get Google Calendar access. Please ensure Google Calendar is connected.");
    }

    // Set up Google OAuth client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Create Google Meet link
    let meetLink, googleEventId;
    try {
      const meetResponse = await calendar.events.insert({
        calendarId: "primary",
        conferenceDataVersion: 1,
        requestBody: {
          summary: `${validatedData.name} - ${event.title}`,
          description: validatedData.additionalInfo,
          start: { dateTime: validatedData.startTime },
          end: { dateTime: validatedData.endTime },
          attendees: [{ email: validatedData.email }, { email: event.user.email }],
          conferenceData: {
            createRequest: { requestId: `${event.id}-${Date.now()}` },
          },
        },
      });

      meetLink = meetResponse.data.hangoutLink;
      googleEventId = meetResponse.data.id;
    } catch (error) {
      console.error("Error creating Google Calendar event:", error);
      throw new Error("Failed to create Google Calendar event. Please try again.");
    }

    // Create booking in database
    const booking = await db.booking.create({
      data: {
        eventId: event.id,
        userId: event.userId,
        name: validatedData.name,
        email: validatedData.email,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        additionalInfo: validatedData.additionalInfo,
        meetLink,
        googleEventId,
      },
    });

    return { success: true, booking, meetLink };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false, error: error.message };
  }
}
