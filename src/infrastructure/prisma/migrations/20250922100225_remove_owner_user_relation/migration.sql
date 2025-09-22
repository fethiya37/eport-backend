/*
  Warnings:

  - The values [Owner] on the enum `UserType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `user_id` on the `owners` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserType_new" AS ENUM ('Superadmin', 'Admin', 'Association', 'Driver', 'Controller');
ALTER TABLE "public"."users" ALTER COLUMN "user_type" TYPE "public"."UserType_new" USING ("user_type"::text::"public"."UserType_new");
ALTER TYPE "public"."UserType" RENAME TO "UserType_old";
ALTER TYPE "public"."UserType_new" RENAME TO "UserType";
DROP TYPE "public"."UserType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."owners" DROP CONSTRAINT "owners_user_id_fkey";

-- DropIndex
DROP INDEX "public"."owners_user_id_key";

-- AlterTable
ALTER TABLE "public"."owners" DROP COLUMN "user_id";
