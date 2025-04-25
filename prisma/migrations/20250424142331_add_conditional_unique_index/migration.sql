CREATE UNIQUE INDEX "unique_active_price"
ON "prices" ("productId", "typeUnit")
WHERE "active" = true;