/*
  Warnings:

  - Added the required column `destinationDirectory` to the `FileToCopy` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FileToCopy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "destinationDirectory" TEXT NOT NULL,
    "isTemplate" BOOLEAN NOT NULL
);
INSERT INTO "new_FileToCopy" ("fileName", "filePath", "id", "isTemplate") SELECT "fileName", "filePath", "id", "isTemplate" FROM "FileToCopy";
DROP TABLE "FileToCopy";
ALTER TABLE "new_FileToCopy" RENAME TO "FileToCopy";
CREATE UNIQUE INDEX "FileToCopy_fileName_key" ON "FileToCopy"("fileName");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
