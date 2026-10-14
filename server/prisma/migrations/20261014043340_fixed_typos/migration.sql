/*
  Warnings:

  - You are about to drop the column `iconrUrl` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `nautralWidth` on the `Image` table. All the data in the column will be lost.
  - Added the required column `naturalWidth` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Character" DROP COLUMN "iconrUrl",
ADD COLUMN     "iconUrl" TEXT;

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "nautralWidth",
ADD COLUMN     "naturalWidth" INTEGER NOT NULL;
