-- Add subscription tier and inventory add-on flags
ALTER TABLE "Bar" ADD COLUMN IF NOT EXISTS "subscriptionTier" TEXT DEFAULT 'FREE';
ALTER TABLE "Bar" ADD COLUMN IF NOT EXISTS "inventoryAddOnEnabled" BOOLEAN DEFAULT false;

-- Bar memberships for staff/manager roles
CREATE TABLE IF NOT EXISTS "BarMembership" (
  "id" TEXT PRIMARY KEY,
  "barId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'MANAGER',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "BarMembership_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "BarMembership_barId_idx" ON "BarMembership"("barId");
CREATE INDEX IF NOT EXISTS "BarMembership_userId_idx" ON "BarMembership"("userId");

-- Patron search events
CREATE TABLE IF NOT EXISTS "PatronSearchEvent" (
  "id" TEXT PRIMARY KEY,
  "barId" TEXT NULL,
  "query" TEXT NULL,
  "category" TEXT NULL,
  "city" TEXT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "PatronSearchEvent_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "PatronSearchEvent_createdAt_idx" ON "PatronSearchEvent"("createdAt");
CREATE INDEX IF NOT EXISTS "PatronSearchEvent_city_idx" ON "PatronSearchEvent"("city");

-- Bar actions (profile view, directions, website click, etc.)
CREATE TABLE IF NOT EXISTS "BarAction" (
  "id" TEXT PRIMARY KEY,
  "barId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "BarAction_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "BarAction_barId_idx" ON "BarAction"("barId");
CREATE INDEX IF NOT EXISTS "BarAction_action_idx" ON "BarAction"("action");

-- Followers
CREATE TABLE IF NOT EXISTS "BarFollower" (
  "id" TEXT PRIMARY KEY,
  "barId" TEXT NOT NULL,
  "patronEmail" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "BarFollower_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "BarFollower_unique" ON "BarFollower"("barId", "patronEmail");

-- Boosts and metrics
CREATE TABLE IF NOT EXISTS "Boost" (
  "id" TEXT PRIMARY KEY,
  "barId" TEXT NOT NULL,
  "eventId" TEXT NULL,
  "startAt" TIMESTAMP NOT NULL,
  "endAt" TIMESTAMP NOT NULL,
  "budgetCents" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "Boost_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "Boost_barId_idx" ON "Boost"("barId");

CREATE TABLE IF NOT EXISTS "BoostMetric" (
  "id" TEXT PRIMARY KEY,
  "boostId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "impressions" INTEGER DEFAULT 0,
  "clicks" INTEGER DEFAULT 0,
  CONSTRAINT "BoostMetric_boostId_fkey" FOREIGN KEY ("boostId") REFERENCES "Boost"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "BoostMetric_boostId_idx" ON "BoostMetric"("boostId");
CREATE UNIQUE INDEX IF NOT EXISTS "BoostMetric_unique" ON "BoostMetric"("boostId", "date");

-- Inventory core
CREATE TABLE IF NOT EXISTS "Product" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "unitType" TEXT NOT NULL,
  "sizeMl" INTEGER NULL,
  "upc" TEXT UNIQUE NULL,
  "isActive" BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS "BarProduct" (
  "id" TEXT PRIMARY KEY,
  "barId" TEXT NOT NULL,
  "productId" TEXT NULL,
  "customName" TEXT NULL,
  "parLevel" INTEGER NULL,
  "reorderThreshold" INTEGER NULL,
  "preferredVendor" TEXT NULL,
  "isActive" BOOLEAN DEFAULT true,
  CONSTRAINT "BarProduct_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE,
  CONSTRAINT "BarProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "BarProduct_barId_idx" ON "BarProduct"("barId");
CREATE INDEX IF NOT EXISTS "BarProduct_productId_idx" ON "BarProduct"("productId");

CREATE TABLE IF NOT EXISTS "InventoryScanSession" (
  "id" TEXT PRIMARY KEY,
  "barId" TEXT NOT NULL,
  "createdByUserId" TEXT NULL,
  "imageUrl" TEXT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "InventoryScanSession_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "InventoryScanSession_barId_idx" ON "InventoryScanSession"("barId");

CREATE TABLE IF NOT EXISTS "InventoryScanDetection" (
  "id" TEXT PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "productGuessText" TEXT NOT NULL,
  "productId" TEXT NULL,
  "bbox" JSON NULL,
  "confidence" DOUBLE PRECISION DEFAULT 0,
  "remainingBucket" TEXT NULL,
  "sizeMlGuess" INTEGER NULL,
  CONSTRAINT "InventoryScanDetection_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InventoryScanSession"("id") ON DELETE CASCADE,
  CONSTRAINT "InventoryScanDetection_productId_fkey" FOREIGN KEY ("productId") REFERENCES "BarProduct"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "InventoryScanDetection_sessionId_idx" ON "InventoryScanDetection"("sessionId");

CREATE TABLE IF NOT EXISTS "InventoryCount" (
  "id" TEXT PRIMARY KEY,
  "barId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "countedAt" TIMESTAMP DEFAULT NOW(),
  "quantity" DECIMAL(10,2) NOT NULL,
  "unit" TEXT NOT NULL,
  "remainingPercent" INTEGER NULL,
  "remainingBucket" TEXT NULL,
  "method" TEXT NOT NULL,
  "confidence" DOUBLE PRECISION NULL,
  "notes" TEXT NULL,
  CONSTRAINT "InventoryCount_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE,
  CONSTRAINT "InventoryCount_productId_fkey" FOREIGN KEY ("productId") REFERENCES "BarProduct"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "InventoryCount_barId_idx" ON "InventoryCount"("barId");
CREATE INDEX IF NOT EXISTS "InventoryCount_productId_idx" ON "InventoryCount"("productId");
CREATE INDEX IF NOT EXISTS "InventoryCount_countedAt_idx" ON "InventoryCount"("countedAt");
