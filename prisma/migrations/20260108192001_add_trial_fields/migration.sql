-- DropIndex
DROP INDEX "Badge_category_idx";

-- DropIndex
DROP INDEX "Badge_tier_idx";

-- DropIndex
DROP INDEX "BarVisit_clickId_idx";

-- AlterTable
ALTER TABLE "BarLicense" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "trialEndsAt" TIMESTAMP(3),
ADD COLUMN     "trialReminderSentAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "BarAnalytics" (
    "id" TEXT NOT NULL,
    "barId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "profileClicks" INTEGER NOT NULL DEFAULT 0,
    "searchAppears" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BarAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchQuery" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "location" TEXT,
    "category" TEXT,
    "dayOfWeek" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchQuery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BarAnalytics_barId_idx" ON "BarAnalytics"("barId");

-- CreateIndex
CREATE INDEX "BarAnalytics_date_idx" ON "BarAnalytics"("date");

-- CreateIndex
CREATE INDEX "BarAnalytics_dayOfWeek_idx" ON "BarAnalytics"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "BarAnalytics_barId_date_key" ON "BarAnalytics"("barId", "date");

-- CreateIndex
CREATE INDEX "SearchQuery_query_idx" ON "SearchQuery"("query");

-- CreateIndex
CREATE INDEX "SearchQuery_dayOfWeek_idx" ON "SearchQuery"("dayOfWeek");

-- CreateIndex
CREATE INDEX "SearchQuery_count_idx" ON "SearchQuery"("count");

-- CreateIndex
CREATE UNIQUE INDEX "SearchQuery_query_location_category_key" ON "SearchQuery"("query", "location", "category");

-- CreateIndex
CREATE INDEX "BarBadge_awardedAt_idx" ON "BarBadge"("awardedAt");

-- CreateIndex
CREATE INDEX "CostingProfile_inventoryItemId_idx" ON "CostingProfile"("inventoryItemId");

-- AddForeignKey
ALTER TABLE "BarAnalytics" ADD CONSTRAINT "BarAnalytics_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
