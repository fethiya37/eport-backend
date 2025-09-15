/*
  Warnings:

  - You are about to drop the column `included_current_fee` on the `driver_payments` table. All the data in the column will be lost.
  - You are about to drop the column `included_interest` on the `driver_payments` table. All the data in the column will be lost.
  - You are about to drop the column `plate_number` on the `driver_payments` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'CARD', 'BANK', 'MOBILE', 'OTHER');

-- AlterTable
ALTER TABLE "public"."driver_payments" DROP COLUMN "included_current_fee",
DROP COLUMN "included_interest",
DROP COLUMN "plate_number",
ADD COLUMN     "payment_method" "public"."PaymentMethod";
