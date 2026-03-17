-- Add region to Metric
ALTER TABLE "Metric" ADD COLUMN "region" TEXT;

-- Add name and teamId to UserStack
ALTER TABLE "UserStack" ADD COLUMN "name" TEXT;
ALTER TABLE "UserStack" ADD COLUMN "teamId" TEXT;

-- Add notification type filters to AlertSettings
ALTER TABLE "AlertSettings" ADD COLUMN "notifyDowntime" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "AlertSettings" ADD COLUMN "notifyLatency" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "AlertSettings" ADD COLUMN "notifyErrorRate" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "AlertSettings" ADD COLUMN "notifyResolved" BOOLEAN NOT NULL DEFAULT true;

-- Team models
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeamInvite" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamInvite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");
CREATE UNIQUE INDEX "TeamInvite_token_key" ON "TeamInvite"("token");

ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TeamInvite" ADD CONSTRAINT "TeamInvite_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserStack" ADD CONSTRAINT "UserStack_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
