-- CreateTable
CREATE TABLE "OwnerPasswordReset" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OwnerPasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OwnerPasswordReset_tokenHash_key" ON "OwnerPasswordReset"("tokenHash");

-- CreateIndex
CREATE INDEX "OwnerPasswordReset_ownerId_idx" ON "OwnerPasswordReset"("ownerId");

-- CreateIndex
CREATE INDEX "OwnerPasswordReset_expiresAt_idx" ON "OwnerPasswordReset"("expiresAt");

-- AddForeignKey
ALTER TABLE "OwnerPasswordReset" ADD CONSTRAINT "OwnerPasswordReset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
