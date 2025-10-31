/*
  Warnings:

  - A unique constraint covering the columns `[phone_number,user_type]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."users_phone_number_key";

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_user_type_key" ON "users"("phone_number", "user_type");
