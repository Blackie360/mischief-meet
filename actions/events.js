"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { eventSchema } from "@/app/lib/validators";

export async function createEvent(data) {
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    if (!data || typeof data !== 'object') {
      throw new Error("Invalid event data");
    }

    const validatedData = eventSchema.parse(data);

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true
      }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const event = await db.event.create({
      data: {
        ...validatedData,
        userId: user.id,
      },
    });

    return event;
  } catch (error) {
    console.error("Error creating event:", error);
    throw new Error("Failed to create event");
  }
}

export async function getUserEvents() {
  try {
    const { userId } = auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        username: true
      }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const events = await db.event.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    return { events, username: user.username };
  } catch (error) {
    console.error("Error getting user events:", error);
    throw new Error("Failed to get user events");
  }
}

export async function deleteEvent(eventId) {
  try {
    const { userId } = auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    if (!eventId) {
      throw new Error("Event ID is required");
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

    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.userId !== user.id) {
      throw new Error("Event not found or unauthorized");
    }

    await db.event.delete({
      where: { id: eventId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting event:", error);
    throw new Error("Failed to delete event");
  }
}

export async function getEventDetails(username, eventId) {
  try {
    if (!username || !eventId) {
      throw new Error("Username and event ID are required");
    }

    const event = await db.event.findFirst({
      where: {
        id: eventId,
        user: {
          username: username,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });

    return event;
  } catch (error) {
    console.error("Error getting event details:", error);
    throw new Error("Failed to get event details");
  }
}
