-- CreateEnum
CREATE TYPE "public"."PlanType" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "public"."PaymentSource" AS ENUM ('SYSTEM', 'MANUAL');

-- AlterTable
ALTER TABLE "public"."drivers" ADD COLUMN     "last_accrual_amount" DECIMAL(10,2),
ADD COLUMN     "last_accrual_date" DATE;

-- CreateTable
CREATE TABLE "public"."association_payment_policies" (
    "id" SERIAL NOT NULL,
    "association_id" INTEGER NOT NULL,
    "weekly_fee" DECIMAL(10,2) NOT NULL,
    "monthly_fee" DECIMAL(10,2) NOT NULL,
    "daily_fine_percent" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "association_payment_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."driver_payments" (
    "id" SERIAL NOT NULL,
    "driver_id" INTEGER NOT NULL,
    "association_id" INTEGER NOT NULL,
    "plan_type" "public"."PlanType" NOT NULL,
    "source" "public"."PaymentSource" NOT NULL DEFAULT 'SYSTEM',
    "units" INTEGER NOT NULL,
    "unit_fee" DECIMAL(10,2) NOT NULL,
    "total_paid" DECIMAL(10,2) NOT NULL,
    "coverage_start_date" DATE NOT NULL,
    "coverage_end_date" DATE NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" INTEGER,

    CONSTRAINT "driver_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "association_payment_policies_association_id_key" ON "public"."association_payment_policies"("association_id");

-- CreateIndex
CREATE INDEX "association_payment_policies_association_id_idx" ON "public"."association_payment_policies"("association_id");

-- CreateIndex
CREATE INDEX "driver_payments_driver_id_idx" ON "public"."driver_payments"("driver_id");

-- CreateIndex
CREATE INDEX "driver_payments_association_id_idx" ON "public"."driver_payments"("association_id");

-- CreateIndex
CREATE INDEX "driver_payments_paid_at_idx" ON "public"."driver_payments"("paid_at");

-- CreateIndex
CREATE INDEX "drivers_association_id_is_weekly_active_until_date_idx" ON "public"."drivers"("association_id", "is_weekly", "active_until_date");

-- CreateIndex
CREATE INDEX "drivers_payment_status_idx" ON "public"."drivers"("payment_status");

-- CreateIndex
CREATE INDEX "drivers_last_accrual_date_idx" ON "public"."drivers"("last_accrual_date");

-- AddForeignKey
ALTER TABLE "public"."association_payment_policies" ADD CONSTRAINT "association_payment_policies_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "public"."associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."driver_payments" ADD CONSTRAINT "driver_payments_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."driver_payments" ADD CONSTRAINT "driver_payments_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "public"."associations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."driver_payments" ADD CONSTRAINT "driver_payments_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
