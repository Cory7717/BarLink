-- Inventory + per-location license schema

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "barId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "bottleSizeMl" INTEGER NOT NULL,
    "startingQtyBottles" INTEGER NOT NULL DEFAULT 0,
    "costPerBottle" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryImport" (
    "id" TEXT NOT NULL,
    "barId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "rowsImported" INTEGER NOT NULL DEFAULT 0,
    "mapping" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftUsage" (
    "id" TEXT NOT NULL,
    "barId" TEXT NOT NULL,
    "userId" TEXT,
    "shiftTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShiftUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftUsageItem" (
    "id" TEXT NOT NULL,
    "shiftUsageId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "quantityUsed" DECIMAL(5,2) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "ShiftUsageItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventorySnapshot" (
    "id" TEXT NOT NULL,
    "barId" TEXT NOT NULL,
    "userId" TEXT,
    "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventorySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventorySnapshotItem" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "quantityOnHand" DECIMAL(7,2) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "InventorySnapshotItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BottlePhoto" (
    "id" TEXT NOT NULL,
    "snapshotItemId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "estimatedPct" DECIMAL(5,2),
    "estimatedMl" DECIMAL(7,2),
    "modelVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BottlePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostingProfile" (
    "id" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "pourSizeOz" DECIMAL(5,2) NOT NULL,
    "menuPrice" DECIMAL(7,2) NOT NULL,
    "costPerPour" DECIMAL(7,4) NOT NULL,
    "marginPct" DECIMAL(5,2) NOT NULL,
    "profitPerBottle" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CostingProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VarianceAlert" (
    "id" TEXT NOT NULL,
    "barId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "expectedMl" DECIMAL(10,2) NOT NULL,
    "observedMl" DECIMAL(10,2) NOT NULL,
    "varianceMl" DECIMAL(10,2) NOT NULL,
    "variancePct" DECIMAL(6,2) NOT NULL,
    "severity" TEXT NOT NULL,
    "reasonHint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VarianceAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarLicense" (
    "id" TEXT NOT NULL,
    "barId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "priceCents" INTEGER NOT NULL DEFAULT 2900,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "billingCycle" TEXT NOT NULL DEFAULT 'MONTHLY',
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BarLicense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryItem_barId_idx" ON "InventoryItem"("barId");
CREATE INDEX "InventoryItem_category_idx" ON "InventoryItem"("category");
CREATE INDEX "InventoryItem_isActive_idx" ON "InventoryItem"("isActive");

CREATE INDEX "InventoryImport_barId_idx" ON "InventoryImport"("barId");
CREATE INDEX "InventoryImport_createdById_idx" ON "InventoryImport"("createdById");

CREATE INDEX "ShiftUsage_barId_idx" ON "ShiftUsage"("barId");
CREATE INDEX "ShiftUsage_userId_idx" ON "ShiftUsage"("userId");
CREATE INDEX "ShiftUsage_shiftTime_idx" ON "ShiftUsage"("shiftTime");

CREATE INDEX "ShiftUsageItem_shiftUsageId_idx" ON "ShiftUsageItem"("shiftUsageId");
CREATE INDEX "ShiftUsageItem_inventoryItemId_idx" ON "ShiftUsageItem"("inventoryItemId");

CREATE INDEX "InventorySnapshot_barId_idx" ON "InventorySnapshot"("barId");
CREATE INDEX "InventorySnapshot_userId_idx" ON "InventorySnapshot"("userId");
CREATE INDEX "InventorySnapshot_snapshotDate_idx" ON "InventorySnapshot"("snapshotDate");

CREATE INDEX "InventorySnapshotItem_snapshotId_idx" ON "InventorySnapshotItem"("snapshotId");
CREATE INDEX "InventorySnapshotItem_inventoryItemId_idx" ON "InventorySnapshotItem"("inventoryItemId");

CREATE INDEX "VarianceAlert_barId_idx" ON "VarianceAlert"("barId");
CREATE INDEX "VarianceAlert_inventoryItemId_idx" ON "VarianceAlert"("inventoryItemId");
CREATE INDEX "VarianceAlert_periodStart_periodEnd_idx" ON "VarianceAlert"("periodStart", "periodEnd");

CREATE UNIQUE INDEX "BottlePhoto_snapshotItemId_key" ON "BottlePhoto"("snapshotItemId");
CREATE UNIQUE INDEX "BarLicense_barId_key" ON "BarLicense"("barId");
CREATE INDEX "BarLicense_ownerId_idx" ON "BarLicense"("ownerId");
CREATE INDEX "BarLicense_status_idx" ON "BarLicense"("status");

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryImport" ADD CONSTRAINT "InventoryImport_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryImport" ADD CONSTRAINT "InventoryImport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShiftUsage" ADD CONSTRAINT "ShiftUsage_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShiftUsage" ADD CONSTRAINT "ShiftUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShiftUsageItem" ADD CONSTRAINT "ShiftUsageItem_shiftUsageId_fkey" FOREIGN KEY ("shiftUsageId") REFERENCES "ShiftUsage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShiftUsageItem" ADD CONSTRAINT "ShiftUsageItem_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventorySnapshot" ADD CONSTRAINT "InventorySnapshot_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventorySnapshot" ADD CONSTRAINT "InventorySnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InventorySnapshotItem" ADD CONSTRAINT "InventorySnapshotItem_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "InventorySnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventorySnapshotItem" ADD CONSTRAINT "InventorySnapshotItem_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BottlePhoto" ADD CONSTRAINT "BottlePhoto_snapshotItemId_fkey" FOREIGN KEY ("snapshotItemId") REFERENCES "InventorySnapshotItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CostingProfile" ADD CONSTRAINT "CostingProfile_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VarianceAlert" ADD CONSTRAINT "VarianceAlert_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VarianceAlert" ADD CONSTRAINT "VarianceAlert_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BarLicense" ADD CONSTRAINT "BarLicense_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BarLicense" ADD CONSTRAINT "BarLicense_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
