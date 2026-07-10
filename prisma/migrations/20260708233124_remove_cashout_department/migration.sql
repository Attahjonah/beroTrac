/*
  Warnings:

  - You are about to drop the column `department` on the `cash_outs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cash_outs" DROP COLUMN "department";

-- AlterTable
ALTER TABLE "department_summaries" ALTER COLUMN "cashOut" DROP DEFAULT;
