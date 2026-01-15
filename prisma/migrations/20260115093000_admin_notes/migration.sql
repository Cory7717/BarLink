CREATE TABLE "AdminNote" (
    "id" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "barId" TEXT,
    "userId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminNote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdminNote_barId_idx" ON "AdminNote"("barId");
CREATE INDEX "AdminNote_userId_idx" ON "AdminNote"("userId");
CREATE INDEX "AdminNote_adminEmail_idx" ON "AdminNote"("adminEmail");
CREATE INDEX "AdminNote_createdAt_idx" ON "AdminNote"("createdAt");

ALTER TABLE "AdminNote" ADD CONSTRAINT "AdminNote_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdminNote" ADD CONSTRAINT "AdminNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
