-- Service flags (moved after init: prior migration 20260211 ran lexicographically before create-table and could not apply.)
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "offersDelivery" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "acceptsReservations" BOOLEAN NOT NULL DEFAULT false;
