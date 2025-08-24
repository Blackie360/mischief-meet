"use server";

import { db } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { google } from "googleapis";
import { bookingSchema } from "@/app/lib/validators";

export async function createBooking(bookingData) {
  console.log("createBooking called with:", bookingData);
  
  try {
    if (!bookingData) {
      throw new Error("Booking data is required");
    }

    console.log("Validating booking data...");
    // Validate the booking data
    const validatedData = bookingSchema.parse(bookingData);
    console.log("Validation passed:", validatedData);
    
    console.log("Fetching event with ID:", validatedData.eventId);
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
    console.log("Event found:", event);

    if (!event) {
      throw new Error("Event not found");
    }

    console.log("Getting Google OAuth token for user:", event.user.clerkUserId);
    // Get the event creator's Google OAuth token from Clerk
    let token;
    try {
      const { data } = await clerkClient.users.getUserOauthAccessToken(
        event.user.clerkUserId,
        "oauth_google"
      );

      token = data[0]?.token;
      console.log("Token received:", token ? "Yes" : "No");

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

    console.log("Creating Google Calendar event...");
    // Create Google Meet link
    let meetLink, googleEventId;
    try {
      console.log("Calendar event data:", {
        summary: `${validatedData.name} - ${event.title}`,
        start: validatedData.startTime,
        end: validatedData.endTime,
        attendees: [validatedData.email, event.user.email]
      });
      
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
      console.log("Google Calendar event created successfully:", { meetLink, googleEventId });
    } catch (error) {
      console.error("Error creating Google Calendar event:", error);
      throw new Error("Failed to create Google Calendar event. Please try again.");
    }

    // Check if the user making the booking exists in our database
    let bookingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    // If user doesn't exist, create them (this handles external users booking events)
    if (!bookingUser) {
      bookingUser = await db.user.create({
        data: {
          email: validatedData.email,
          name: validatedData.name,
          clerkUserId: `external_${Date.now()}`, // Temporary ID for external users
        },
      });
    }

    console.log("Creating booking in database...");
    // Create booking in database
    const booking = await db.booking.create({
      data: {
        eventId: event.id,
        userId: bookingUser.id, // Use the booking user's ID, not the event creator's ID
        name: validatedData.name,
        email: validatedData.email,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        additionalInfo: validatedData.additionalInfo,
        meetLink,
        googleEventId,
      },
    });

    console.log("Database booking created successfully:", booking);
    const result = { success: true, booking, meetLink };
    console.log("Returning result:", result);
    return result;
  } catch (error) {
    console.error("Error creating booking:", error);
    console.error("Error stack:", error.stack);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    const errorResult = { success: false, error: error.message };
    console.log("Returning error result:", errorResult);
    return errorResult;
  }
}

export async function getEventCreatorBookings(userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const now = new Date();

    const upcomingBookings = await db.booking.findMany({
      where: {
        event: {
          userId: userId,
        },
        startTime: { gte: now },
      },
      include: {
        event: {
          select: {
            title: true,
            description: true,
            duration: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    const pastBookings = await db.booking.findMany({
      where: {
        event: {
          userId: userId,
        },
        startTime: { lt: now },
      },
      include: {
        event: {
          select: {
            title: true,
            description: true,
            duration: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return {
      upcoming: upcomingBookings,
      past: pastBookings,
      total: upcomingBookings.length + pastBookings.length,
    };
  } catch (error) {
    console.error("Error getting event creator bookings:", error);
    throw new Error("Failed to get bookings");
  }
}
