-- DropForeignKey
ALTER TABLE "public"."driver_payments" DROP CONSTRAINT "driver_payments_association_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."driver_payments" DROP CONSTRAINT "driver_payments_created_by_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."driver_payments" DROP CONSTRAINT "driver_payments_driver_id_fkey";

-- AlterTable
ALTER TABLE "public"."driver_payments" ADD COLUMN     "plate_number" VARCHAR(20),
ALTER COLUMN "driver_id" DROP NOT NULL,
ALTER COLUMN "created_by_user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."driver_payments" ADD CONSTRAINT "driver_payments_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "public"."associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."driver_payments" ADD CONSTRAINT "driver_payments_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."driver_payments" ADD CONSTRAINT "driver_payments_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
