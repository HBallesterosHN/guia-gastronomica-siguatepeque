-- OwnershipRole: editor (PG 12+ permite ADD VALUE dentro de la transacción de migración)
ALTER TYPE "OwnershipRole" ADD VALUE 'editor';

-- OwnershipStatus (reemplaza status TEXT)
CREATE TYPE "OwnershipStatus" AS ENUM ('active', 'inactive');

ALTER TABLE "restaurant_ownerships" ADD COLUMN "status_new" "OwnershipStatus" NOT NULL DEFAULT 'active';

UPDATE "restaurant_ownerships"
SET "status_new" = CASE
  WHEN lower(trim("status"::text)) = 'active' THEN 'active'::"OwnershipStatus"
  ELSE 'inactive'::"OwnershipStatus"
END;

ALTER TABLE "restaurant_ownerships" DROP COLUMN "status";
ALTER TABLE "restaurant_ownerships" RENAME COLUMN "status_new" TO "status";

ALTER TABLE "restaurant_ownerships" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "restaurant_ownerships" SET "updatedAt" = "createdAt";

DROP INDEX IF EXISTS "restaurant_ownerships_restaurantId_userId_key";

CREATE UNIQUE INDEX "restaurant_ownerships_userId_restaurantId_key" ON "restaurant_ownerships"("userId", "restaurantId");

-- Un solo reclamo pendiente por usuario y slug (además de la validación en app)
CREATE UNIQUE INDEX "restaurant_claims_one_pending_per_user_slug" ON "restaurant_claims" ("userId", "restaurantSlug")
WHERE "status" = 'pending';
