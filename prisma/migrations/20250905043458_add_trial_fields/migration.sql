-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isTrialActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "trialEndDate" TIMESTAMP(3),
ADD COLUMN     "trialExpirationNotified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trialStartDate" TIMESTAMP(3);
