-- AlterTable
ALTER TABLE "satisfaction_ratings" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'visualization',
ALTER COLUMN "is_customized" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "idx_satisfaction_category" ON "satisfaction_ratings"("category");
