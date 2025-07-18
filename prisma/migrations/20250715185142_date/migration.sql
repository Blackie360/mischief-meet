-- AlterTable
ALTER TABLE "User" ADD COLUMN     "allowedDurations" INTEGER[] DEFAULT ARRAY[15, 30, 60]::INTEGER[],
ADD COLUMN     "defaultDuration" INTEGER NOT NULL DEFAULT 30;
