-- Add columns for offers and scheduling to pricing_plans
alter table pricing_plans
add column if not exists discount_percent integer default 0,
add column if not exists offer_name text,
add column if not exists offer_start_date timestamp with time zone,
add column if not exists offer_end_date timestamp with time zone;
