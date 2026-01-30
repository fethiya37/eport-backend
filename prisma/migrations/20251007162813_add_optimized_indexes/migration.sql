-- CreateIndex
CREATE INDEX "associations_name_idx" ON "public"."associations"("name");

-- CreateIndex
CREATE INDEX "associations_phone_number_idx" ON "public"."associations"("phone_number");

-- CreateIndex
CREATE INDEX "driver_payments_association_id_paid_at_idx" ON "public"."driver_payments"("association_id", "paid_at");

-- CreateIndex
CREATE INDEX "driver_payments_driver_id_paid_at_idx" ON "public"."driver_payments"("driver_id", "paid_at");

-- CreateIndex
CREATE INDEX "driver_payments_association_id_plate_number_idx" ON "public"."driver_payments"("association_id", "plate_number");

-- CreateIndex
CREATE INDEX "drivers_association_id_status_idx" ON "public"."drivers"("association_id", "status");

-- CreateIndex
CREATE INDEX "drivers_association_id_full_name_idx" ON "public"."drivers"("association_id", "full_name");

-- CreateIndex
CREATE INDEX "drivers_status_idx" ON "public"."drivers"("status");

-- CreateIndex
CREATE INDEX "owners_association_id_full_name_idx" ON "public"."owners"("association_id", "full_name");

-- CreateIndex
CREATE INDEX "route_assignments_association_id_vehicle_id_status_idx" ON "public"."route_assignments"("association_id", "vehicle_id", "status");

-- CreateIndex
CREATE INDEX "route_assignments_vehicle_id_payment_status_idx" ON "public"."route_assignments"("vehicle_id", "payment_status");

-- CreateIndex
CREATE INDEX "route_assignments_payment_status_idx" ON "public"."route_assignments"("payment_status");

-- CreateIndex
CREATE INDEX "route_groups_route_group_idx" ON "public"."route_groups"("route_group");

-- CreateIndex
CREATE INDEX "route_quotas_association_id_status_idx" ON "public"."route_quotas"("association_id", "status");

-- CreateIndex
CREATE INDEX "routes_departure_arrival_idx" ON "public"."routes"("departure", "arrival");

-- CreateIndex
CREATE INDEX "users_association_id_idx" ON "public"."users"("association_id");

-- CreateIndex
CREATE INDEX "users_user_type_association_id_idx" ON "public"."users"("user_type", "association_id");

-- CreateIndex
CREATE INDEX "vehicles_association_id_status_idx" ON "public"."vehicles"("association_id", "status");

-- CreateIndex
CREATE INDEX "vehicles_driver_id_idx" ON "public"."vehicles"("driver_id");

-- CreateIndex
CREATE INDEX "vehicles_owner_id_idx" ON "public"."vehicles"("owner_id");
