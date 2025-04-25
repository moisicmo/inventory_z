/*
  Warnings:

  - You are about to drop the column `referenceType` on the `kardexs` table. All the data in the column will be lost.
  - You are about to drop the column `discountType` on the `prices` table. All the data in the column will be lost.
  - You are about to drop the column `unitType` on the `products` table. All the data in the column will be lost.
  - Added the required column `typeReference` to the `kardexs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TypeDiscount" AS ENUM ('MONTO', 'PORCENTAJE');

-- CreateEnum
CREATE TYPE "TypeUnit" AS ENUM ('UNIDAD', 'LIBRA', 'KILO', 'CAJA', 'DOCENA');

-- CreateEnum
CREATE TYPE "TypeReference" AS ENUM ('inputs', 'outputs');

-- AlterTable
ALTER TABLE "kardexs" DROP COLUMN "referenceType",
ADD COLUMN     "typeReference" "TypeReference" NOT NULL;

-- AlterTable
ALTER TABLE "prices" DROP COLUMN "discountType",
ADD COLUMN     "typeDiscount" "TypeDiscount" NOT NULL DEFAULT 'MONTO',
ADD COLUMN     "typeUnit" "TypeUnit" NOT NULL DEFAULT 'UNIDAD';

-- AlterTable
ALTER TABLE "products" DROP COLUMN "unitType";

-- DropEnum
DROP TYPE "DiscountType";

-- DropEnum
DROP TYPE "ReferenceType";

-- DropEnum
DROP TYPE "UnitType";
