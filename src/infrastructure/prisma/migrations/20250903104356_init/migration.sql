-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('Superadmin', 'Admin', 'Association', 'Driver', 'Controller', 'Owner');

-- CreateEnum
CREATE TYPE "public"."AssociationStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."OwnerStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."DriverStatus" AS ENUM ('AVAILABLE', 'ON_TRIP', 'OFFLINE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."VehicleStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'RETIRED');

-- CreateEnum
CREATE TYPE "public"."VehicleAssociationStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'RESIGNED');

-- CreateEnum
CREATE TYPE "public"."RouteAssignmentStatus" AS ENUM ('Approved', 'Pending');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "user_type" "public"."UserType" NOT NULL,
    "name" VARCHAR(100),
    "password_hash" VARCHAR(255),
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "association_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."revoked_tokens" (
    "jti" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revoked_tokens_pkey" PRIMARY KEY ("jti")
);

-- CreateTable
CREATE TABLE "public"."associations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(20),
    "logo" VARCHAR(255),
    "status" "public"."AssociationStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "associations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."owners" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "association_id" INTEGER NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "status" "public"."OwnerStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."drivers" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "association_id" INTEGER NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "license_no" TEXT,
    "license_expiry" TIMESTAMP(3),
    "phone_number" VARCHAR(20) NOT NULL,
    "status" "public"."DriverStatus" NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vehicles" (
    "id" SERIAL NOT NULL,
    "plate_number" VARCHAR(20) NOT NULL,
    "libre_no" TEXT,
    "owner_id" INTEGER NOT NULL,
    "association_id" INTEGER NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "color" TEXT,
    "capacity" INTEGER,
    "status" "public"."VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vehicle_associations" (
    "id" SERIAL NOT NULL,
    "association_id" INTEGER NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "status" "public"."VehicleAssociationStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "vehicle_associations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vehicle_assignments" (
    "id" SERIAL NOT NULL,
    "driver_id" INTEGER NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "association_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "vehicle_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."route_groups" (
    "id" SERIAL NOT NULL,
    "route_group" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "route_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."routes" (
    "id" SERIAL NOT NULL,
    "route_group_id" INTEGER NOT NULL,
    "departure" TEXT NOT NULL,
    "arrival" TEXT NOT NULL,
    "kilometer" DECIMAL(6,2),
    "tariff" DECIMAL(6,2),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."route_quotas" (
    "id" SERIAL NOT NULL,
    "association_id" INTEGER NOT NULL,
    "route_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "no_vehicles" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "route_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."route_assignments" (
    "id" SERIAL NOT NULL,
    "route_id" INTEGER NOT NULL,
    "driver_id" INTEGER NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "association_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "public"."RouteAssignmentStatus" NOT NULL DEFAULT 'Pending',
    "is_weekly" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "assigned_by_user_id" INTEGER NOT NULL,
    "approved_by_user_id" INTEGER,
    "approved_at" TIMESTAMP(3),
    "route_quota_id" INTEGER,

    CONSTRAINT "route_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "public"."users"("phone_number");

-- CreateIndex
CREATE INDEX "user_tokens_user_id_idx" ON "public"."user_tokens"("user_id");

-- CreateIndex
CREATE INDEX "revoked_tokens_user_id_idx" ON "public"."revoked_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "owners_user_id_key" ON "public"."owners"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "owners_association_id_phone_number_key" ON "public"."owners"("association_id", "phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_user_id_key" ON "public"."drivers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_association_id_phone_number_key" ON "public"."drivers"("association_id", "phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_number_key" ON "public"."vehicles"("plate_number");

-- CreateIndex
CREATE INDEX "vehicle_associations_association_id_idx" ON "public"."vehicle_associations"("association_id");

-- CreateIndex
CREATE INDEX "vehicle_associations_vehicle_id_ended_at_idx" ON "public"."vehicle_associations"("vehicle_id", "ended_at");

-- CreateIndex
CREATE INDEX "vehicle_assignments_driver_id_idx" ON "public"."vehicle_assignments"("driver_id");

-- CreateIndex
CREATE INDEX "vehicle_assignments_vehicle_id_idx" ON "public"."vehicle_assignments"("vehicle_id");

-- CreateIndex
CREATE INDEX "vehicle_assignments_association_id_idx" ON "public"."vehicle_assignments"("association_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_assignments_driver_id_vehicle_id_active_key" ON "public"."vehicle_assignments"("driver_id", "vehicle_id", "active");

-- CreateIndex
CREATE INDEX "routes_route_group_id_idx" ON "public"."routes"("route_group_id");

-- CreateIndex
CREATE INDEX "route_quotas_association_id_route_id_start_date_end_date_idx" ON "public"."route_quotas"("association_id", "route_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "route_assignments_association_id_route_id_start_date_end_da_idx" ON "public"."route_assignments"("association_id", "route_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "route_assignments_assigned_by_user_id_idx" ON "public"."route_assignments"("assigned_by_user_id");

-- CreateIndex
CREATE INDEX "route_assignments_approved_by_user_id_idx" ON "public"."route_assignments"("approved_by_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "route_assignments_route_id_driver_id_vehicle_id_key" ON "public"."route_assignments"("route_id", "driver_id", "vehicle_id");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "public"."associations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_tokens" ADD CONSTRAINT "user_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."owners" ADD CONSTRAINT "owners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."owners" ADD CONSTRAINT "owners_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "public"."associations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drivers" ADD CONSTRAINT "drivers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drivers" ADD CONSTRAINT "drivers_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "public"."associations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vehicles" ADD CONSTRAINT "vehicles_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vehicles" ADD CONSTRAINT "vehicles_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "public"."associations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vehicle_associations" ADD CONSTRAINT "vehicle_associations_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "public"."associations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vehicle_associations" ADD CONSTRAINT "vehicle_associations_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vehicle_assignments" ADD CONSTRAINT "vehicle_assignments_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vehicle_assignments" ADD CONSTRAINT "vehicle_assignments_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vehicle_assignments" ADD CONSTRAINT "vehicle_assignments_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "public"."associations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."routes" ADD CONSTRAINT "routes_route_group_id_fkey" FOREIGN KEY ("route_group_id") REFERENCES "public"."route_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."route_quotas" ADD CONSTRAINT "route_quotas_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "public"."associations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."route_quotas" ADD CONSTRAINT "route_quotas_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."route_assignments" ADD CONSTRAINT "route_assignments_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."route_assignments" ADD CONSTRAINT "route_assignments_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."route_assignments" ADD CONSTRAINT "route_assignments_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."route_assignments" ADD CONSTRAINT "route_assignments_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "public"."associations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."route_assignments" ADD CONSTRAINT "route_assignments_route_quota_id_fkey" FOREIGN KEY ("route_quota_id") REFERENCES "public"."route_quotas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."route_assignments" ADD CONSTRAINT "route_assignments_assigned_by_user_id_fkey" FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."route_assignments" ADD CONSTRAINT "route_assignments_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
