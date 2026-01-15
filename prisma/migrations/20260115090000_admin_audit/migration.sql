CREATE TABLE "AdminAudit" (
    "id" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdminAudit_adminEmail_idx" ON "AdminAudit"("adminEmail");
CREATE INDEX "AdminAudit_entityType_idx" ON "AdminAudit"("entityType");
CREATE INDEX "AdminAudit_entityId_idx" ON "AdminAudit"("entityId");
CREATE INDEX "AdminAudit_createdAt_idx" ON "AdminAudit"("createdAt");
