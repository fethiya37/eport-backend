-- CreateEnum
CREATE TYPE "public"."RouteQuotaStatus" AS ENUM ('Pending', 'Fulfilled');

-- AlterTable
ALTER TABLE "public"."route_quotas" ADD COLUMN     "remaining_vehicles" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "public"."RouteQuotaStatus" NOT NULL DEFAULT 'Pending';
