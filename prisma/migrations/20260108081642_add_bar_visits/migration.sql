-- CreateTable
CREATE TABLE "BarVisit" (
    "id" TEXT NOT NULL,
    "barId" TEXT NOT NULL,
    "userId" TEXT,
    "source" TEXT NOT NULL,
    "verificationMethod" TEXT NOT NULL,
    "clickId" TEXT,
    "promoCodeId" TEXT,
    "metadata" JSONB,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BarVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BarVisit_barId_idx" ON "BarVisit"("barId");

-- CreateIndex
CREATE INDEX "BarVisit_userId_idx" ON "BarVisit"("userId");

-- CreateIndex
CREATE INDEX "BarVisit_visitedAt_idx" ON "BarVisit"("visitedAt");

-- CreateIndex
CREATE INDEX "BarVisit_source_idx" ON "BarVisit"("source");

-- CreateIndex
CREATE INDEX "BarVisit_clickId_idx" ON "BarVisit"("clickId");

-- AddForeignKey
ALTER TABLE "BarVisit" ADD CONSTRAINT "BarVisit_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarVisit" ADD CONSTRAINT "BarVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
