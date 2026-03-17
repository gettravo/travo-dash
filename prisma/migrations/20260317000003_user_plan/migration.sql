CREATE TABLE "UserPlan" (
  "id"        TEXT         NOT NULL,
  "userId"    TEXT         NOT NULL,
  "isPro"     BOOLEAN      NOT NULL DEFAULT false,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserPlan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserPlan_userId_key" ON "UserPlan"("userId");
