/*
  Warnings:

  - You are about to alter the column `ip_address` on the `activity_logs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(45)`.

*/
-- DropIndex
DROP INDEX "public"."activity_logs_association_id_idx";

-- DropIndex
DROP INDEX "public"."activity_logs_created_at_idx";

-- DropIndex
DROP INDEX "public"."activity_logs_entity_type_entity_id_idx";

-- DropIndex
DROP INDEX "public"."activity_logs_user_id_idx";

-- AlterTable
ALTER TABLE "activity_logs" ALTER COLUMN "entity_type" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "ip_address" SET DATA TYPE VARCHAR(45);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "locked_until" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "activity_logs_user_id_created_at_idx" ON "activity_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "activity_logs_association_id_created_at_idx" ON "activity_logs"("association_id", "created_at");

-- CreateIndex
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");
