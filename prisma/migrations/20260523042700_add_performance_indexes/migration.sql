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

-- CreateIndex
CREATE INDEX "association_policies_association_id_idx" ON "association_policies"("association_id");

-- CreateIndex
CREATE INDEX "association_policies_created_at_idx" ON "association_policies"("created_at");

-- CreateIndex
CREATE INDEX "association_subaccounts_association_id_idx" ON "association_subaccounts"("association_id");

-- CreateIndex
CREATE INDEX "association_subaccounts_chapa_id_idx" ON "association_subaccounts"("chapa_id");

-- CreateIndex
CREATE INDEX "association_subaccounts_business_name_idx" ON "association_subaccounts"("business_name");

-- CreateIndex
CREATE INDEX "association_subaccounts_created_at_idx" ON "association_subaccounts"("created_at");

-- CreateIndex
CREATE INDEX "associations_created_at_idx" ON "associations"("created_at");

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
CREATE INDEX "owners_association_id_idx" ON "owners"("association_id");

-- CreateIndex
CREATE INDEX "owners_phone_number_idx" ON "owners"("phone_number");

-- CreateIndex
CREATE INDEX "owners_full_name_idx" ON "owners"("full_name");

-- CreateIndex
CREATE INDEX "revoked_tokens_expires_at_idx" ON "revoked_tokens"("expires_at");

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
CREATE INDEX "route_groups_created_at_idx" ON "route_groups"("created_at");

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
CREATE INDEX "user_tokens_token_hash_idx" ON "user_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "user_tokens_expires_at_idx" ON "user_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "users_phone_number_idx" ON "users"("phone_number");

-- CreateIndex
CREATE INDEX "users_user_type_idx" ON "users"("user_type");

-- CreateIndex
CREATE INDEX "users_association_id_user_type_idx" ON "users"("association_id", "user_type");

-- CreateIndex
CREATE INDEX "vehicles_plate_number_idx" ON "vehicles"("plate_number");

-- CreateIndex
CREATE INDEX "vehicles_status_idx" ON "vehicles"("status");

-- CreateIndex
CREATE INDEX "vehicles_association_id_idx" ON "vehicles"("association_id");

-- CreateIndex
CREATE INDEX "vehicles_owner_id_association_id_idx" ON "vehicles"("owner_id", "association_id");

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
