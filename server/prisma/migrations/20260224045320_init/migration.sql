/*
  Warnings:

  - You are about to drop the column `type` on the `Lesson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "type",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "thumbnail" TEXT;
