-- Add slug column, backfill from id, then make it required and unique
ALTER TABLE "Board" ADD COLUMN "slug" TEXT;
UPDATE "Board" SET "slug" = "id" WHERE "slug" IS NULL;
ALTER TABLE "Board" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Board_slug_key" ON "Board"("slug");
