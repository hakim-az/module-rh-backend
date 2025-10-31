-- CreateTable
CREATE TABLE "user_emails" (
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

    CONSTRAINT "user_emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_emails_userId_key" ON "user_emails"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_emails_upn_key" ON "user_emails"("upn");

-- CreateIndex
CREATE INDEX "mail_userId_fkey" ON "user_emails"("userId");

-- AddForeignKey
ALTER TABLE "user_emails" ADD CONSTRAINT "mail_userId_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
