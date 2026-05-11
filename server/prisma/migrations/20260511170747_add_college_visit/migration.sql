-- CreateTable
CREATE TABLE "CollegeVisit" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "visitorToken" TEXT,
    "collegeId" TEXT NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollegeVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollegeVisit_userId_collegeId_visitedAt_idx" ON "CollegeVisit"("userId", "collegeId", "visitedAt");

-- CreateIndex
CREATE INDEX "CollegeVisit_visitorToken_collegeId_visitedAt_idx" ON "CollegeVisit"("visitorToken", "collegeId", "visitedAt");

-- AddForeignKey
ALTER TABLE "CollegeVisit" ADD CONSTRAINT "CollegeVisit_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;
