/*
  Warnings:

  - You are about to drop the `claim_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `restaurant_update_requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "OwnershipRole" AS ENUM ('owner', 'manager');

-- CreateEnum
CREATE TYPE "ChangeRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- DropForeignKey
ALTER TABLE "claim_requests" DROP CONSTRAINT "claim_requests_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "restaurant_update_requests" DROP CONSTRAINT "restaurant_update_requests_restaurantId_fkey";

-- DropTable
DROP TABLE "claim_requests";

-- DropTable
DROP TABLE "restaurant_update_requests";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "provider" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "restaurant_claims" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT,
    "restaurantSlug" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "ownerPhone" TEXT,
    "ownerEmail" TEXT,
    "message" TEXT,
    "evidenceUrl" TEXT,
    "status" "ClaimStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_ownerships" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OwnershipRole" NOT NULL DEFAULT 'owner',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurant_ownerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_change_requests" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "imageUrls" JSONB,
    "status" "ChangeRequestStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "restaurant_claims_restaurantSlug_idx" ON "restaurant_claims"("restaurantSlug");

-- CreateIndex
CREATE INDEX "restaurant_claims_status_idx" ON "restaurant_claims"("status");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_ownerships_restaurantId_userId_key" ON "restaurant_ownerships"("restaurantId", "userId");

-- CreateIndex
CREATE INDEX "restaurant_change_requests_status_idx" ON "restaurant_change_requests"("status");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_claims" ADD CONSTRAINT "restaurant_claims_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_claims" ADD CONSTRAINT "restaurant_claims_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_ownerships" ADD CONSTRAINT "restaurant_ownerships_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_ownerships" ADD CONSTRAINT "restaurant_ownerships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_change_requests" ADD CONSTRAINT "restaurant_change_requests_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_change_requests" ADD CONSTRAINT "restaurant_change_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
