-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "billingType" TEXT,
ADD COLUMN     "planType" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscriptionBilling" TEXT DEFAULT 'monthly',
ADD COLUMN     "subscriptionPlan" TEXT DEFAULT 'free',
ADD COLUMN     "subscriptionStatus" TEXT DEFAULT 'trial';
