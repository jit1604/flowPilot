-- CreateTable
CREATE TABLE "WeeklyIntention" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekKey" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inbox',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "dueDate" DATETIME,
    "estimatedEffort" INTEGER,
    "actualEffort" INTEGER,
    "projectId" TEXT,
    "parentTaskId" TEXT,
    "sourceType" TEXT NOT NULL DEFAULT 'manual',
    "workContext" TEXT NOT NULL DEFAULT 'standard',
    "nextAction" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("actualEffort", "createdAt", "description", "dueDate", "estimatedEffort", "id", "nextAction", "parentTaskId", "priority", "projectId", "sourceType", "status", "title", "updatedAt") SELECT "actualEffort", "createdAt", "description", "dueDate", "estimatedEffort", "id", "nextAction", "parentTaskId", "priority", "projectId", "sourceType", "status", "title", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");
CREATE INDEX "Task_parentTaskId_idx" ON "Task"("parentTaskId");
CREATE INDEX "Task_status_idx" ON "Task"("status");
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyIntention_weekKey_key" ON "WeeklyIntention"("weekKey");
