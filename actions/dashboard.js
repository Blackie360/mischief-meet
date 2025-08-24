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
      userId: user.id,
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

  return upcomingMeetings;
  } catch (error) {
    console.error("Error getting latest updates:", error);
    throw new Error("Failed to get latest updates");
  }
}
