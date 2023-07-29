-- CreateTable
CREATE TABLE "ProjectType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "FileToCopy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "isTemplate" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "CommandToRun" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "command" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_FileToCopyToProjectType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_FileToCopyToProjectType_A_fkey" FOREIGN KEY ("A") REFERENCES "FileToCopy" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_FileToCopyToProjectType_B_fkey" FOREIGN KEY ("B") REFERENCES "ProjectType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CommandToRunToProjectType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CommandToRunToProjectType_A_fkey" FOREIGN KEY ("A") REFERENCES "CommandToRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CommandToRunToProjectType_B_fkey" FOREIGN KEY ("B") REFERENCES "ProjectType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectType_name_key" ON "ProjectType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_FileToCopyToProjectType_AB_unique" ON "_FileToCopyToProjectType"("A", "B");

-- CreateIndex
CREATE INDEX "_FileToCopyToProjectType_B_index" ON "_FileToCopyToProjectType"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CommandToRunToProjectType_AB_unique" ON "_CommandToRunToProjectType"("A", "B");

-- CreateIndex
CREATE INDEX "_CommandToRunToProjectType_B_index" ON "_CommandToRunToProjectType"("B");
