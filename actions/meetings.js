"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { google } from "googleapis";
import { sendEmail } from "@/lib/mailer";
import BookingCancellation from "@/components/emails/BookingCancellation";

export async function getUserMeetings(type = "upcoming") {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (type !== "upcoming" && type !== "past") {
    throw new Error("Type must be either 'upcoming' or 'past'");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      id: true
    }
  });

  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();

  const meetings = await db.booking.findMany({
    where: {
      event: {
        userId: user.id, // Show bookings for events created by this user
      },
      startTime: type === "upcoming" ? { gte: now } : { lt: now },
    },
    include: {
      event: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      startTime: type === "upcoming" ? "asc" : "desc",
    },
  });

  return meetings;
}

export async function cancelMeeting(meetingId) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!meetingId) {
    throw new Error("Meeting ID is required");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      id: true
    }
  });

  if (!user) {
    throw new Error("User not found");
  }

  const meeting = await db.booking.findUnique({
    where: { id: meetingId },
    include: { 
      event: {
        include: {
          user: {
            select: {
              id: true,
              clerkUserId: true,
              name: true,
              email: true
            }
          }
        }
      }
    },
  });

  if (!meeting || meeting.event.userId !== user.id) {
    throw new Error("Meeting not found or unauthorized");
  }

  // Cancel the meeting in Google Calendar
  let token;
  try {
    const { data } = await clerkClient.users.getUserOauthAccessToken(
      meeting.event.user.clerkUserId,
      "oauth_google"
    );

    token = data[0]?.token;
  } catch (error) {
    console.error("Failed to get Google OAuth token:", error);
    // Continue with database deletion even if Google Calendar deletion fails
  }

  if (token) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    try {
      await calendar.events.delete({
        calendarId: "primary",
        eventId: meeting.googleEventId,
      });
    } catch (error) {
      console.error("Failed to delete event from Google Calendar:", error);
    }
  }

  // Delete the meeting from the database
  await db.booking.delete({
    where: { id: meetingId },
  });

  // Send cancellation emails (best-effort)
  try {
    const attendeeName = meeting.name || meeting.email || "Attendee";
    const hostName = meeting.event.user.name || "Host";

    if (meeting.email) {
      await sendEmail({
        to: meeting.email,
        subject: `Booking cancelled: ${meeting.event.title}`,
        react: BookingCancellation({
          recipientName: attendeeName,
          eventTitle: meeting.event.title,
          startTime: meeting.startTime,
        }),
      });
    }

    if (meeting.event.user.email) {
      await sendEmail({
        to: meeting.event.user.email,
        subject: `Booking cancelled: ${meeting.event.title}`,
        react: BookingCancellation({
          recipientName: hostName,
          eventTitle: meeting.event.title,
          startTime: meeting.startTime,
        }),
      });
    }
  } catch (emailError) {
    console.error("Failed to send cancellation emails:", emailError);
  }

  return { success: true };
}
