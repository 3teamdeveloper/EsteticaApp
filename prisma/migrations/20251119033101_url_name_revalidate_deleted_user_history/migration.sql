-- CreateTable
CREATE TABLE "DeletedUser" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "email" TEXT,
    "role" "UserRole",
    "businessType" TEXT,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "DeletedUser_pkey" PRIMARY KEY ("id")
);
