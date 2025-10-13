/*
  Warnings:

  - A unique constraint covering the columns `[confirmationToken]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "confirmationEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "confirmationMethod" TEXT,
ADD COLUMN     "confirmationToken" TEXT,
ADD COLUMN     "confirmationTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "confirmedByClient" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_confirmationToken_key" ON "Appointment"("confirmationToken");
