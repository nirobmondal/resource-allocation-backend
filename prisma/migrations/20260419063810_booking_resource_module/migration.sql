/*
  Warnings:

  - You are about to drop the column `bookingId` on the `resources` table. All the data in the column will be lost.
  - Added the required column `resourceId` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `capacity` on the `resources` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "resources" DROP CONSTRAINT "resources_bookingId_fkey";

-- DropIndex
DROP INDEX "bookings_requestedBy_idx";

-- DropIndex
DROP INDEX "resources_bookingId_idx";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "resourceId" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'CONFIRMED';

-- AlterTable
ALTER TABLE "resources" DROP COLUMN "bookingId",
DROP COLUMN "capacity",
ADD COLUMN     "capacity" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "bookings_resourceId_bookingDate_idx" ON "bookings"("resourceId", "bookingDate");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
