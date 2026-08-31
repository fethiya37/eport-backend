-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('Superadmin', 'Admin', 'Association', 'Driver', 'Controller');

-- CreateEnum
CREATE TYPE "RouteQuotaStatus" AS ENUM ('Pending', 'Fulfilled');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "FeePlan" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "RouteAssignmentHistoryStatus" AS ENUM ('WORKED', 'NOT_WORKED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK', 'MOBILE', 'OTHER');

-- CreateEnum
CREATE TYPE "RouteAssignmentStatus" AS ENUM ('Approved', 'Pending');

-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "user_type" "UserType" NOT NULL,
    "name" VARCHAR(100),
    "password_hash" VARCHAR(255),
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "association_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tokens" (
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
CREATE TABLE "revoked_tokens" (
    "jti" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revoked_tokens_pkey" PRIMARY KEY ("jti")
);

-- CreateTable
CREATE TABLE "associations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "logo" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "associations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "association_id" INTEGER NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "license_no" TEXT,
    "license_expiry" TIMESTAMP(3),
    "phone_number" VARCHAR(20) NOT NULL,
    "status" "DriverStatus" NOT NULL DEFAULT 'ACTIVE',
    "has_smartphone" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "active_until_date" DATE,
    "interest_accrued" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "last_accrual_date" DATE,
    "last_accrual_amount" DECIMAL(10,2),

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "plate_number" VARCHAR(20) NOT NULL,
    "libre_no" TEXT,
    "association_id" INTEGER NOT NULL,
    "driver_id" INTEGER,
    "make" TEXT,
    "model" TEXT,
    "color" TEXT,
    "capacity" INTEGER,
    "status" "VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_weekly" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_groups" (
    "id" SERIAL NOT NULL,
    "route_group" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "route_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
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
CREATE TABLE "route_quotas" (
    "id" SERIAL NOT NULL,
    "association_id" INTEGER NOT NULL,
    "route_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "no_vehicles" INTEGER NOT NULL,
    "remaining_vehicles" INTEGER NOT NULL DEFAULT 0,
    "status" "RouteQuotaStatus" NOT NULL DEFAULT 'Pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "route_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_assignments" (
    "id" SERIAL NOT NULL,
    "route_id" INTEGER NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "association_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "RouteAssignmentStatus" NOT NULL DEFAULT 'Pending',
    "is_weekly" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "history_status" "RouteAssignmentHistoryStatus" DEFAULT 'WORKED',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'INACTIVE',
    "assigned_by_user_id" INTEGER NOT NULL,
    "approved_by_user_id" INTEGER,
    "approved_at" TIMESTAMP(3),
    "route_quota_id" INTEGER,

    CONSTRAINT "route_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "association_policies" (
    "id" SERIAL NOT NULL,
    "association_id" INTEGER NOT NULL,
    "weekly_fee" DECIMAL(10,2) NOT NULL,
    "monthly_fee" DECIMAL(10,2) NOT NULL,
    "daily_fine_percent" DECIMAL(5,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "association_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_payments" (
    "id" SERIAL NOT NULL,
    "association_id" INTEGER NOT NULL,
    "driver_id" INTEGER,
    "created_by_user_id" INTEGER,
    "fee_plan" "FeePlan" NOT NULL,
    "prepaid_qty" INTEGER NOT NULL DEFAULT 0,
    "amount" DECIMAL(12,2) NOT NULL,
    "covered_start_date" TIMESTAMP(3) NOT NULL,
    "covered_end_date" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_method" "PaymentMethod",
    "plate_number" VARCHAR(20),

    CONSTRAINT "driver_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "association_subaccounts" (
    "id" SERIAL NOT NULL,
    "association_id" INTEGER NOT NULL,
    "chapa_id" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "association_subaccounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "association_id" INTEGER,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(100),
    "entity_id" INTEGER,
    "description" TEXT,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "users_association_id_idx" ON "users"("association_id");

-- CreateIndex
CREATE INDEX "users_user_type_association_id_idx" ON "users"("user_type", "association_id");

-- CreateIndex
CREATE INDEX "users_phone_number_idx" ON "users"("phone_number");

-- CreateIndex
CREATE INDEX "users_user_type_idx" ON "users"("user_type");

-- CreateIndex
CREATE INDEX "users_association_id_user_type_idx" ON "users"("association_id", "user_type");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_user_type_key" ON "users"("phone_number", "user_type");

-- CreateIndex
CREATE INDEX "user_tokens_user_id_idx" ON "user_tokens"("user_id");

-- CreateIndex
CREATE INDEX "user_tokens_token_hash_idx" ON "user_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "user_tokens_expires_at_idx" ON "user_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "revoked_tokens_user_id_idx" ON "revoked_tokens"("user_id");

-- CreateIndex
CREATE INDEX "revoked_tokens_expires_at_idx" ON "revoked_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "associations_name_idx" ON "associations"("name");

-- CreateIndex
CREATE INDEX "associations_created_at_idx" ON "associations"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_user_id_key" ON "drivers"("user_id");

-- CreateIndex
CREATE INDEX "drivers_association_id_active_until_date_idx" ON "drivers"("association_id", "active_until_date");

-- CreateIndex
CREATE INDEX "drivers_association_id_status_idx" ON "drivers"("association_id", "status");

-- CreateIndex
CREATE INDEX "drivers_association_id_full_name_idx" ON "drivers"("association_id", "full_name");

-- CreateIndex
CREATE INDEX "drivers_status_idx" ON "drivers"("status");

-- CreateIndex
CREATE INDEX "drivers_last_accrual_date_idx" ON "drivers"("last_accrual_date");

-- CreateIndex
CREATE INDEX "drivers_user_id_idx" ON "drivers"("user_id");

-- CreateIndex
CREATE INDEX "drivers_phone_number_idx" ON "drivers"("phone_number");

-- CreateIndex
CREATE INDEX "drivers_full_name_idx" ON "drivers"("full_name");

-- CreateIndex
CREATE INDEX "drivers_association_id_idx" ON "drivers"("association_id");

-- CreateIndex
CREATE INDEX "drivers_association_id_phone_number_idx" ON "drivers"("association_id", "phone_number");

-- CreateIndex
CREATE INDEX "drivers_license_no_idx" ON "drivers"("license_no");

-- CreateIndex
CREATE INDEX "drivers_license_expiry_idx" ON "drivers"("license_expiry");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_association_id_phone_number_key" ON "drivers"("association_id", "phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_number_key" ON "vehicles"("plate_number");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_driver_id_key" ON "vehicles"("driver_id");

-- CreateIndex
CREATE INDEX "vehicles_association_id_status_idx" ON "vehicles"("association_id", "status");

-- CreateIndex
CREATE INDEX "vehicles_driver_id_idx" ON "vehicles"("driver_id");

-- CreateIndex
CREATE INDEX "vehicles_plate_number_idx" ON "vehicles"("plate_number");

-- CreateIndex
CREATE INDEX "vehicles_status_idx" ON "vehicles"("status");

-- CreateIndex
CREATE INDEX "vehicles_association_id_idx" ON "vehicles"("association_id");

-- CreateIndex
CREATE INDEX "vehicles_driver_id_association_id_idx" ON "vehicles"("driver_id", "association_id");

-- CreateIndex
CREATE INDEX "vehicles_status_association_id_idx" ON "vehicles"("status", "association_id");

-- CreateIndex
CREATE INDEX "vehicles_libre_no_idx" ON "vehicles"("libre_no");

-- CreateIndex
CREATE INDEX "vehicles_created_at_idx" ON "vehicles"("created_at");

-- CreateIndex
CREATE INDEX "vehicles_deleted_at_idx" ON "vehicles"("deleted_at");

-- CreateIndex
CREATE INDEX "route_groups_route_group_idx" ON "route_groups"("route_group");

-- CreateIndex
CREATE INDEX "route_groups_created_at_idx" ON "route_groups"("created_at");

-- CreateIndex
CREATE INDEX "routes_route_group_id_idx" ON "routes"("route_group_id");

-- CreateIndex
CREATE INDEX "routes_departure_arrival_idx" ON "routes"("departure", "arrival");

-- CreateIndex
CREATE INDEX "routes_departure_idx" ON "routes"("departure");

-- CreateIndex
CREATE INDEX "routes_arrival_idx" ON "routes"("arrival");

-- CreateIndex
CREATE INDEX "routes_route_group_id_departure_idx" ON "routes"("route_group_id", "departure");

-- CreateIndex
CREATE INDEX "routes_created_at_idx" ON "routes"("created_at");

-- CreateIndex
CREATE INDEX "routes_updated_at_idx" ON "routes"("updated_at");

-- CreateIndex
CREATE INDEX "route_quotas_association_id_route_id_start_date_end_date_idx" ON "route_quotas"("association_id", "route_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "route_quotas_association_id_status_idx" ON "route_quotas"("association_id", "status");

-- CreateIndex
CREATE INDEX "route_quotas_route_id_idx" ON "route_quotas"("route_id");

-- CreateIndex
CREATE INDEX "route_quotas_start_date_idx" ON "route_quotas"("start_date");

-- CreateIndex
CREATE INDEX "route_quotas_end_date_idx" ON "route_quotas"("end_date");

-- CreateIndex
CREATE INDEX "route_quotas_status_idx" ON "route_quotas"("status");

-- CreateIndex
CREATE INDEX "route_quotas_association_id_route_id_idx" ON "route_quotas"("association_id", "route_id");

-- CreateIndex
CREATE INDEX "route_quotas_association_id_start_date_idx" ON "route_quotas"("association_id", "start_date");

-- CreateIndex
CREATE INDEX "route_quotas_route_id_start_date_end_date_idx" ON "route_quotas"("route_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "route_quotas_created_at_idx" ON "route_quotas"("created_at");

-- CreateIndex
CREATE INDEX "route_quotas_updated_at_idx" ON "route_quotas"("updated_at");

-- CreateIndex
CREATE INDEX "route_assignments_association_id_route_id_start_date_end_da_idx" ON "route_assignments"("association_id", "route_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "route_assignments_association_id_vehicle_id_status_idx" ON "route_assignments"("association_id", "vehicle_id", "status");

-- CreateIndex
CREATE INDEX "route_assignments_vehicle_id_payment_status_idx" ON "route_assignments"("vehicle_id", "payment_status");

-- CreateIndex
CREATE INDEX "route_assignments_payment_status_idx" ON "route_assignments"("payment_status");

-- CreateIndex
CREATE INDEX "route_assignments_assigned_by_user_id_idx" ON "route_assignments"("assigned_by_user_id");

-- CreateIndex
CREATE INDEX "route_assignments_approved_by_user_id_idx" ON "route_assignments"("approved_by_user_id");

-- CreateIndex
CREATE INDEX "route_assignments_route_quota_id_idx" ON "route_assignments"("route_quota_id");

-- CreateIndex
CREATE INDEX "route_assignments_route_id_idx" ON "route_assignments"("route_id");

-- CreateIndex
CREATE INDEX "route_assignments_status_idx" ON "route_assignments"("status");

-- CreateIndex
CREATE INDEX "route_assignments_start_date_idx" ON "route_assignments"("start_date");

-- CreateIndex
CREATE INDEX "route_assignments_end_date_idx" ON "route_assignments"("end_date");

-- CreateIndex
CREATE INDEX "route_assignments_association_id_status_idx" ON "route_assignments"("association_id", "status");

-- CreateIndex
CREATE INDEX "route_assignments_route_quota_id_status_idx" ON "route_assignments"("route_quota_id", "status");

-- CreateIndex
CREATE INDEX "route_assignments_vehicle_id_idx" ON "route_assignments"("vehicle_id");

-- CreateIndex
CREATE INDEX "route_assignments_created_at_idx" ON "route_assignments"("created_at");

-- CreateIndex
CREATE INDEX "route_assignments_approved_at_idx" ON "route_assignments"("approved_at");

-- CreateIndex
CREATE INDEX "route_assignments_association_id_start_date_idx" ON "route_assignments"("association_id", "start_date");

-- CreateIndex
CREATE INDEX "route_assignments_route_quota_id_vehicle_id_idx" ON "route_assignments"("route_quota_id", "vehicle_id");

-- CreateIndex
CREATE INDEX "route_assignments_is_weekly_idx" ON "route_assignments"("is_weekly");

-- CreateIndex
CREATE INDEX "route_assignments_history_status_idx" ON "route_assignments"("history_status");

-- CreateIndex
CREATE UNIQUE INDEX "association_policies_association_id_key" ON "association_policies"("association_id");

-- CreateIndex
CREATE INDEX "association_policies_association_id_idx" ON "association_policies"("association_id");

-- CreateIndex
CREATE INDEX "association_policies_created_at_idx" ON "association_policies"("created_at");

-- CreateIndex
CREATE INDEX "driver_payments_association_id_idx" ON "driver_payments"("association_id");

-- CreateIndex
CREATE INDEX "driver_payments_driver_id_idx" ON "driver_payments"("driver_id");

-- CreateIndex
CREATE INDEX "driver_payments_association_id_paid_at_idx" ON "driver_payments"("association_id", "paid_at");

-- CreateIndex
CREATE INDEX "driver_payments_driver_id_paid_at_idx" ON "driver_payments"("driver_id", "paid_at");

-- CreateIndex
CREATE INDEX "driver_payments_association_id_plate_number_idx" ON "driver_payments"("association_id", "plate_number");

-- CreateIndex
CREATE INDEX "driver_payments_paid_at_idx" ON "driver_payments"("paid_at");

-- CreateIndex
CREATE INDEX "driver_payments_fee_plan_idx" ON "driver_payments"("fee_plan");

-- CreateIndex
CREATE INDEX "driver_payments_payment_method_idx" ON "driver_payments"("payment_method");

-- CreateIndex
CREATE INDEX "driver_payments_covered_start_date_idx" ON "driver_payments"("covered_start_date");

-- CreateIndex
CREATE INDEX "driver_payments_covered_end_date_idx" ON "driver_payments"("covered_end_date");

-- CreateIndex
CREATE INDEX "driver_payments_plate_number_idx" ON "driver_payments"("plate_number");

-- CreateIndex
CREATE INDEX "driver_payments_created_by_user_id_idx" ON "driver_payments"("created_by_user_id");

-- CreateIndex
CREATE INDEX "driver_payments_association_id_fee_plan_idx" ON "driver_payments"("association_id", "fee_plan");

-- CreateIndex
CREATE INDEX "driver_payments_driver_id_fee_plan_idx" ON "driver_payments"("driver_id", "fee_plan");

-- CreateIndex
CREATE INDEX "driver_payments_paid_at_association_id_idx" ON "driver_payments"("paid_at", "association_id");

-- CreateIndex
CREATE UNIQUE INDEX "association_subaccounts_association_id_key" ON "association_subaccounts"("association_id");

-- CreateIndex
CREATE UNIQUE INDEX "association_subaccounts_chapa_id_key" ON "association_subaccounts"("chapa_id");

-- CreateIndex
CREATE INDEX "association_subaccounts_association_id_idx" ON "association_subaccounts"("association_id");

-- CreateIndex
CREATE INDEX "association_subaccounts_chapa_id_idx" ON "association_subaccounts"("chapa_id");

-- CreateIndex
CREATE INDEX "association_subaccounts_business_name_idx" ON "association_subaccounts"("business_name");

-- CreateIndex
CREATE INDEX "association_subaccounts_created_at_idx" ON "association_subaccounts"("created_at");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_created_at_idx" ON "activity_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "activity_logs_association_id_created_at_idx" ON "activity_logs"("association_id", "created_at");

-- CreateIndex
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");

-- CreateIndex
CREATE INDEX "activity_logs_entity_type_entity_id_idx" ON "activity_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "activity_logs_action_created_at_idx" ON "activity_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "activity_logs_association_id_idx" ON "activity_logs"("association_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "associations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tokens" ADD CONSTRAINT "user_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "associations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "associations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_route_group_id_fkey" FOREIGN KEY ("route_group_id") REFERENCES "route_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_quotas" ADD CONSTRAINT "route_quotas_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "associations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_quotas" ADD CONSTRAINT "route_quotas_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_assignments" ADD CONSTRAINT "route_assignments_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_assignments" ADD CONSTRAINT "route_assignments_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_assignments" ADD CONSTRAINT "route_assignments_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "associations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_assignments" ADD CONSTRAINT "route_assignments_route_quota_id_fkey" FOREIGN KEY ("route_quota_id") REFERENCES "route_quotas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_assignments" ADD CONSTRAINT "route_assignments_assigned_by_user_id_fkey" FOREIGN KEY ("assigned_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_assignments" ADD CONSTRAINT "route_assignments_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "association_policies" ADD CONSTRAINT "association_policies_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_payments" ADD CONSTRAINT "driver_payments_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_payments" ADD CONSTRAINT "driver_payments_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_payments" ADD CONSTRAINT "driver_payments_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "association_subaccounts" ADD CONSTRAINT "association_subaccounts_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "associations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
