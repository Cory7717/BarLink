-- CreateEnum
CREATE TYPE "BadgeTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');

-- CreateEnum
CREATE TYPE "BadgeCategory" AS ENUM ('FOUNDING', 'ENGAGEMENT', 'CONTENT', 'PATRON_LOVE', 'ACHIEVEMENT', 'COMMUNITY', 'SEASONAL');

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "tier" "BadgeTier" NOT NULL DEFAULT 'BRONZE',
    "category" "BadgeCategory" NOT NULL,
    "requirement" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarBadge" (
    "id" TEXT NOT NULL,
    "barId" TEXT NOT NULL,
    "badgeKey" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" JSONB,
    "metadata" JSONB,

    CONSTRAINT "BarBadge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Badge_key_key" ON "Badge"("key");

-- CreateIndex
CREATE INDEX "Badge_category_idx" ON "Badge"("category");

-- CreateIndex
CREATE INDEX "Badge_tier_idx" ON "Badge"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "BarBadge_barId_badgeKey_key" ON "BarBadge"("barId", "badgeKey");

-- CreateIndex
CREATE INDEX "BarBadge_barId_idx" ON "BarBadge"("barId");

-- CreateIndex
CREATE INDEX "BarBadge_badgeKey_idx" ON "BarBadge"("badgeKey");

-- AddForeignKey
ALTER TABLE "BarBadge" ADD CONSTRAINT "BarBadge_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarBadge" ADD CONSTRAINT "BarBadge_badgeKey_fkey" FOREIGN KEY ("badgeKey") REFERENCES "Badge"("key") ON DELETE CASCADE ON UPDATE CASCADE;
