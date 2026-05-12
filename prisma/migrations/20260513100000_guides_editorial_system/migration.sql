-- CreateTable
CREATE TABLE "guides" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "intro" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'published',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "coverImageUrl" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_restaurants" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "label" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guide_restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guides_slug_key" ON "guides"("slug");

-- CreateIndex
CREATE INDEX "guide_restaurants_guideId_idx" ON "guide_restaurants"("guideId");

-- CreateIndex
CREATE INDEX "guide_restaurants_restaurantId_idx" ON "guide_restaurants"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "guide_restaurants_guideId_restaurantId_key" ON "guide_restaurants"("guideId", "restaurantId");

-- AddForeignKey
ALTER TABLE "guide_restaurants" ADD CONSTRAINT "guide_restaurants_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "guides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_restaurants" ADD CONSTRAINT "guide_restaurants_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
