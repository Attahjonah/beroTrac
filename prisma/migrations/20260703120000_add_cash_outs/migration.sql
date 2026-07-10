-- CreateTable
CREATE TABLE "cash_outs" (
    "id" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_outs_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "department_summaries"
ADD COLUMN "cashOut" DECIMAL(12,2) NOT NULL DEFAULT 0;
