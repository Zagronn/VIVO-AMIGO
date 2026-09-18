-- CreateEnum
CREATE TYPE "SharePlatform" AS ENUM ('WHATSAPP', 'FACEBOOK', 'NATIVE');

-- CreateTable
CREATE TABLE "user_shares" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "platform" "SharePlatform" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_shares_user_id_platform_key" ON "user_shares"("user_id", "platform");

-- AddForeignKey
ALTER TABLE "user_shares" ADD CONSTRAINT "user_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
