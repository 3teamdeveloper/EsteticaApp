/*
  Warnings:

  - A unique constraint covering the columns `[employeeId,dayOfWeek,serviceId,period]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Schedule_employeeId_dayOfWeek_serviceId_period_key" ON "Schedule"("employeeId", "dayOfWeek", "serviceId", "period");
