import { PrismaClient } from '@prisma/client';

export async function createKardexInputTrigger(prisma: PrismaClient) {
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION register_kardex_on_input()
    RETURNS TRIGGER AS $$
    DECLARE
      last_stock INT := 0;
    BEGIN
      -- Obtener el último stock del mismo presentationId y branchId
      SELECT COALESCE((
        SELECT "stock"
        FROM "kardexs"
        WHERE "presentationId" = NEW."presentationId"
          AND "branchId" = NEW."branchId"
        ORDER BY "createdAt" DESC
        LIMIT 1
      ), 0) INTO last_stock;

      -- Insertar nuevo registro en kardex
      INSERT INTO "kardexs" (
        "branchId", "presentationId", "referenceId", "typeReference", "stock"
      )
      VALUES (
        NEW."branchId",
        NEW."presentationId",
        NEW."id",
        'inputs',
        last_stock + NEW."quantity"
      );

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Eliminar trigger si ya existe
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
