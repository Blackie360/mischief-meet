-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" TIMESTAMPTZ(6),
ADD COLUMN     "image" TEXT;
