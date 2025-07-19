/*
  Warnings:

  - You are about to drop the column `eventId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `eventLink` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "eventId",
DROP COLUMN "eventLink",
ADD COLUMN     "googleEventId" TEXT,
ADD COLUMN     "googleEventLink" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleCalendarEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "googleCalendarId" TEXT;
