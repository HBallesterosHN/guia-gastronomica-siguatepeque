-- CreateTable
CREATE TABLE "restaurants" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priceRange" TEXT NOT NULL DEFAULT '$$',
    "summary" TEXT,
    "address" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "phone" TEXT,
    "whatsapp" TEXT,
    "scheduleLabel" TEXT,
    "menuUrl" TEXT,
    "instagramUrl" TEXT,
    "googleMapsUrl" TEXT,
    "ratingAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "heroUrl" TEXT,
    "gallery" JSONB,
    "source" TEXT NOT NULL DEFAULT 'auto',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_update_requests" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT,
    "restaurantSlug" TEXT,
    "ownerName" TEXT NOT NULL,
    "ownerPhone" TEXT,
    "ownerEmail" TEXT,
    "message" TEXT,
    "requestedChanges" JSONB,
    "imageUrls" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurant_update_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_requests" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT,
    "restaurantSlug" TEXT,
    "ownerName" TEXT NOT NULL,
    "ownerPhone" TEXT,
    "ownerEmail" TEXT,
    "message" TEXT,
    "menuUrl" TEXT,
    "instagramUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claim_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_slug_key" ON "restaurants"("slug");

-- AddForeignKey
ALTER TABLE "restaurant_update_requests" ADD CONSTRAINT "restaurant_update_requests_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_requests" ADD CONSTRAINT "claim_requests_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
