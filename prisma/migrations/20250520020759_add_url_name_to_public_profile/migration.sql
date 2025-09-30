/*
  Warnings:

  - A unique constraint covering the columns `[urlName]` on the table `PublicProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `urlName` to the `PublicProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PublicProfile" ADD COLUMN     "urlName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PublicProfile_urlName_key" ON "PublicProfile"("urlName");
