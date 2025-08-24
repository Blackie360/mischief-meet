"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getLatestUpdates() {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {

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

  const upcomingMeetings = await db.booking.findMany({
    where: {
      event: {
        userId: user.id, // Show bookings for events created by this user
      },
      startTime: { gte: now },
    },
    include: {
      event: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
    take: 3,
  });

  // Get total counts
  const [upcomingCount, pastCount] = await Promise.all([
    db.booking.count({
      where: {
        event: { userId: user.id },
        startTime: { gte: now },
      },
    }),
    db.booking.count({
      where: {
        event: { userId: user.id },
        startTime: { lt: now },
      },
    }),
  ]);

  return {
    upcomingMeetings,
    counts: {
      upcoming: upcomingCount,
      past: pastCount,
      total: upcomingCount + pastCount,
    },
  };
  } catch (error) {
    console.error("Error getting latest updates:", error);
    throw new Error("Failed to get latest updates");
  }
}
