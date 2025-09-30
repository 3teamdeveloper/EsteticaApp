/*
  Warnings:

  - A unique constraint covering the columns `[accountUserId]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "accountUserId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Employee_accountUserId_key" ON "Employee"("accountUserId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_accountUserId_fkey" FOREIGN KEY ("accountUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
