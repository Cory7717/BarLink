-- CreateTable StaticOffering
CREATE TABLE "StaticOffering" (
    "id" TEXT NOT NULL,
    "barId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaticOffering_pkey" PRIMARY KEY ("id")
);

-- CreateTable DrinkSpecial
CREATE TABLE "DrinkSpecial" (
    "id" TEXT NOT NULL,
    "barId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "daysOfWeek" INTEGER[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrinkSpecial_pkey" PRIMARY KEY ("id")
);

-- CreateTable FoodOffering
CREATE TABLE "FoodOffering" (
    "id" TEXT NOT NULL,
    "barId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "specialDays" INTEGER[],
    "isSpecial" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodOffering_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaticOffering_barId_position_key" ON "StaticOffering"("barId", "position");

-- CreateIndex
CREATE INDEX "StaticOffering_barId_idx" ON "StaticOffering"("barId");

-- CreateIndex
CREATE INDEX "DrinkSpecial_barId_idx" ON "DrinkSpecial"("barId");

-- CreateIndex
CREATE INDEX "FoodOffering_barId_idx" ON "FoodOffering"("barId");

-- AddForeignKey
ALTER TABLE "StaticOffering" ADD CONSTRAINT "StaticOffering_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrinkSpecial" ADD CONSTRAINT "DrinkSpecial_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodOffering" ADD CONSTRAINT "FoodOffering_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
