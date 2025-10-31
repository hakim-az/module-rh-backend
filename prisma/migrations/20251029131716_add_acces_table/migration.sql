-- CreateTable
CREATE TABLE "acces" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "upn" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "licenseSku" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "displayName" TEXT NOT NULL,
    "alias" TEXT,

    CONSTRAINT "acces_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "acces_userId_key" ON "acces"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "acces_upn_key" ON "acces"("upn");

-- CreateIndex
CREATE INDEX "acces_userId_fkey" ON "acces"("userId");

-- AddForeignKey
ALTER TABLE "acces" ADD CONSTRAINT "acces_userId_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
