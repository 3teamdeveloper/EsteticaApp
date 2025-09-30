-- AlterTable
ALTER TABLE "User" ADD COLUMN     "businessType" TEXT,
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3);
