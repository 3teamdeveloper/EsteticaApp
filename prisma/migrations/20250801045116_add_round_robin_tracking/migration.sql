-- CreateTable
CREATE TABLE "RoundRobinTracking" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "lastIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoundRobinTracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoundRobinTracking_serviceId_date_timeSlot_key" ON "RoundRobinTracking"("serviceId", "date", "timeSlot");

-- AddForeignKey
ALTER TABLE "RoundRobinTracking" ADD CONSTRAINT "RoundRobinTracking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
