-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "public"."drivers" ADD COLUMN     "active_until_date" DATE,
ADD COLUMN     "interest_accrued" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "is_weekly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payment_status" "public"."PaymentStatus" NOT NULL DEFAULT 'INACTIVE';
