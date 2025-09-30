-- AlterTable
ALTER TABLE "PublicProfile" ADD COLUMN     "backgroundColor" TEXT,
ADD COLUMN     "cardBackgroundColor" TEXT,
ADD COLUMN     "fontFamily" TEXT,
ADD COLUMN     "primaryColor" TEXT,
ADD COLUMN     "slogan" TEXT,
ADD COLUMN     "textColor" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "serviceImage" TEXT;
