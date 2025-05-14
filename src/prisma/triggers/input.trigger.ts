import { PrismaClient } from '@prisma/client';

export async function createKardexInputTrigger(prisma: PrismaClient) {
  // Crear la función
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION register_kardex_on_input()
    RETURNS TRIGGER AS $$
    DECLARE
      last_stock INT := 0;
    BEGIN
      -- Obtener el último stock o 0 si no existe
      SELECT COALESCE((
        SELECT "stock"
        FROM "kardexs"
        WHERE "branchId" = NEW."branchId" AND "productId" = NEW."productId"
        ORDER BY "referenceId" DESC
        LIMIT 1
      ), 0) INTO last_stock;

      -- Insertar nuevo registro con stock acumulado
      INSERT INTO "kardexs" (
        "branchId", "productId", "referenceId", "typeReference", "stock"
      )
      VALUES (
        NEW."branchId",
        NEW."productId",
        NEW."id",
        'inputs',
        last_stock + NEW."quantity"
      );

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Eliminar trigger si existe
  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS trigger_kardex_input ON "inputs";
  `);

  // Crear el trigger
  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER trigger_kardex_input
    AFTER INSERT ON "inputs"
    FOR EACH ROW
    EXECUTE FUNCTION register_kardex_on_input();
  `);
}
