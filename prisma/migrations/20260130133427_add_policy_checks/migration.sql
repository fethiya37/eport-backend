ALTER TABLE "association_policies"
  ADD CONSTRAINT "chk_association_policies_weekly_fee_nonnegative" CHECK ("weekly_fee" >= 0),
  ADD CONSTRAINT "chk_association_policies_monthly_fee_nonnegative" CHECK ("monthly_fee" >= 0),
  ADD CONSTRAINT "chk_association_policies_daily_fine_percent_range" CHECK ("daily_fine_percent" >= 0 AND "daily_fine_percent" <= 1);
