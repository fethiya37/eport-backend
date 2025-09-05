/*
  Warnings:

  - You are about to drop the column `coverage_end_date` on the `driver_payments` table. All the data in the column will be lost.
  - You are about to drop the column `coverage_start_date` on the `driver_payments` table. All the data in the column will be lost.
  - You are about to drop the column `plan_type` on the `driver_payments` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `driver_payments` table. All the data in the column will be lost.
  - You are about to drop the column `total_paid` on the `driver_payments` table. All the data in the column will be lost.
  - You are about to drop the column `unit_fee` on the `driver_payments` table. All the data in the column will be lost.
  - You are about to drop the column `units` on the `driver_payments` table. All the data in the column will be lost.
  - You are about to drop the `association_payment_policies` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `amount` to the `driver_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `covered_end_date` to the `driver_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `covered_start_date` to the `driver_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fee_plan` to the `driver_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `included_interest` to the `driver_payments` table without a default value. This is not possible if the table is not empty.
  - Made the column `created_by_user_id` on table `driver_payments` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."FeePlan" AS ENUM ('WEEKLY', 'MONTHLY');

-- DropForeignKey
ALTER TABLE "public"."association_payment_policies" DROP CONSTRAINT "association_payment_policies_association_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."driver_payments" DROP CONSTRAINT "driver_payments_created_by_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."driver_payments" DROP CONSTRAINT "driver_payments_driver_id_fkey";

-- DropIndex
DROP INDEX "public"."driver_payments_paid_at_idx";

-- AlterTable
ALTER TABLE "public"."driver_payments" DROP COLUMN "coverage_end_date",
DROP COLUMN "coverage_start_date",
DROP COLUMN "plan_type",
DROP COLUMN "source",
DROP COLUMN "total_paid",
DROP COLUMN "unit_fee",
DROP COLUMN "units",
ADD COLUMN     "amount" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "covered_end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "covered_start_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fee_plan" "public"."FeePlan" NOT NULL,
ADD COLUMN     "included_current_fee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "included_interest" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "plate_number" VARCHAR(50),
ADD COLUMN     "prepaid_qty" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "created_by_user_id" SET NOT NULL;

-- DropTable
DROP TABLE "public"."association_payment_policies";

-- CreateTable
CREATE TABLE "public"."association_policies" (
    "id" SERIAL NOT NULL,
    "association_id" INTEGER NOT NULL,
    "weekly_fee" DECIMAL(10,2) NOT NULL,
    "monthly_fee" DECIMAL(10,2) NOT NULL,
    "daily_fine_percent" DECIMAL(5,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "association_policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "association_policies_association_id_key" ON "public"."association_policies"("association_id");

-- AddForeignKey
ALTER TABLE "public"."association_policies" ADD CONSTRAINT "association_policies_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "public"."associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."driver_payments" ADD CONSTRAINT "driver_payments_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."driver_payments" ADD CONSTRAINT "driver_payments_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
