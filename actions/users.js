"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function updateUsername(username) {
  try {
    const { userId } = auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      throw new Error("Username is required and must be a non-empty string");
    }

    // Check if username is already taken
    const existingUser = await db.user.findUnique({
      where: { username },
    });

    if (existingUser && existingUser.clerkUserId !== userId) {
      throw new Error("Username is already taken");
    }

    // Update username in database
    await db.user.update({
      where: { clerkUserId: userId },
      data: { username },
    });

    // Update username in Clerk
    await clerkClient.users.updateUser(userId, {
      username,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating username:", error);
    throw new Error("Failed to update username");
  }
}

export async function getUserByUsername(username) {
  try {
    if (!username || typeof username !== 'string') {
      throw new Error("Username is required and must be a string");
    }

    const user = await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        events: {
          where: {
            isPrivate: false,
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            isPrivate: true,
            _count: {
              select: { bookings: true },
            },
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Error getting user by username:", error);
    throw new Error("Failed to get user by username");
  }
}
