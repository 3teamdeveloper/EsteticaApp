/*
  Warnings:

  - The primary key for the `Appointment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Appointment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `clientId` column on the `Appointment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `employeeId` column on the `Appointment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Client` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Client` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Employee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Employee` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `EmployeeService` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `EmployeeService` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `PublicProfile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `PublicProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Schedule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Schedule` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Service` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Service` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `serviceId` on the `Appointment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Appointment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Employee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `employeeId` on the `EmployeeService` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `serviceId` on the `EmployeeService` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `PublicProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `employeeId` on the `Schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `serviceId` on the `Schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Service` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "AppointmentToClient";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "AppointmentToEmployee";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "AppointmentToService";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "AppointmentToUser";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "EmployeeToUser";

-- DropForeignKey
ALTER TABLE "EmployeeService" DROP CONSTRAINT "EmployeeServiceToEmployee";

-- DropForeignKey
ALTER TABLE "EmployeeService" DROP CONSTRAINT "EmployeeServiceToService";

-- DropForeignKey
ALTER TABLE "PublicProfile" DROP CONSTRAINT "PublicProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "ScheduleToEmployee";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "ScheduleToService";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "ScheduleToUser";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "ServiceToUser";

-- AlterTable
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "serviceId",
ADD COLUMN     "serviceId" INTEGER NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "clientId",
ADD COLUMN     "clientId" INTEGER,
DROP COLUMN "employeeId",
ADD COLUMN     "employeeId" INTEGER,
ADD CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Client" DROP CONSTRAINT "Client_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Client_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "Employee_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "EmployeeService" DROP CONSTRAINT "EmployeeService_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "employeeId",
ADD COLUMN     "employeeId" INTEGER NOT NULL,
DROP COLUMN "serviceId",
ADD COLUMN     "serviceId" INTEGER NOT NULL,
ADD CONSTRAINT "EmployeeService_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PublicProfile" DROP CONSTRAINT "PublicProfile_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "PublicProfile_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "employeeId",
ADD COLUMN     "employeeId" INTEGER NOT NULL,
DROP COLUMN "serviceId",
ADD COLUMN     "serviceId" INTEGER NOT NULL,
ADD CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Service" DROP CONSTRAINT "Service_pkey",
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "Service_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeService_employeeId_serviceId_key" ON "EmployeeService"("employeeId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "PublicProfile_userId_key" ON "PublicProfile"("userId");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "AppointmentToService" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "AppointmentToUser" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "AppointmentToClient" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "AppointmentToEmployee" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "ServiceToUser" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "ScheduleToUser" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "ScheduleToEmployee" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "ScheduleToService" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicProfile" ADD CONSTRAINT "PublicProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "EmployeeToUser" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeService" ADD CONSTRAINT "EmployeeServiceToEmployee" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeService" ADD CONSTRAINT "EmployeeServiceToService" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
