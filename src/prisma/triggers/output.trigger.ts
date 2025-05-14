// prisma/triggers/kardex-output.trigger.ts
import { PrismaClient } from '@prisma/client';

export async function createKardexOutputTrigger(prisma: PrismaClient) {
  // Crear la función
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION register_kardex_on_output()
    RETURNS TRIGGER AS $$
    DECLARE
      last_stock INT := 0;
    BEGIN
      SELECT "stock" INTO last_stock
      FROM "kardexs"
      WHERE "branchId" = NEW."branchId" AND "productId" = NEW."productId"
      ORDER BY "referenceId" DESC
      LIMIT 1;

      INSERT INTO "kardexs" (
        "branchId", "productId", "referenceId", "typeReference", "detail", "stock"
      )
      VALUES (
        NEW."branchId",
        NEW."productId",
        NEW."id",
        'outputs',
        'venta',
        last_stock - NEW."quantity"
      );

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Eliminar trigger si existe
  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS trigger_kardex_output ON "outputs";
  `);

  // Crear el trigger
  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER trigger_kardex_output
    AFTER INSERT ON "outputs"
    FOR EACH ROW
    EXECUTE FUNCTION register_kardex_on_output();
  `);
}
