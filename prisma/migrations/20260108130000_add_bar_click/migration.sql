-- CreateTable
CREATE TABLE "BarClick" (
    "id" TEXT NOT NULL,
    "barId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "query" TEXT,
    "dayOfWeek" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BarClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BarClick_barId_idx" ON "BarClick"("barId");

-- CreateIndex
CREATE INDEX "BarClick_source_idx" ON "BarClick"("source");

-- CreateIndex
CREATE INDEX "BarClick_dayOfWeek_idx" ON "BarClick"("dayOfWeek");

-- CreateIndex
CREATE INDEX "BarClick_createdAt_idx" ON "BarClick"("createdAt");

-- AddForeignKey
ALTER TABLE "BarClick" ADD CONSTRAINT "BarClick_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
