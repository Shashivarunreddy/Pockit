-- CreateTable
CREATE TABLE "MyColumn" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "position" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MyColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MyItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'NONE',
    "position" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MyItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MyColumn_userId_idx" ON "MyColumn"("userId");

-- CreateIndex
CREATE INDEX "MyItem_userId_idx" ON "MyItem"("userId");

-- CreateIndex
CREATE INDEX "MyItem_columnId_idx" ON "MyItem"("columnId");

-- AddForeignKey
ALTER TABLE "MyColumn" ADD CONSTRAINT "MyColumn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MyItem" ADD CONSTRAINT "MyItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MyItem" ADD CONSTRAINT "MyItem_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "MyColumn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
