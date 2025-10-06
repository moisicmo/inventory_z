-- DropForeignKey
ALTER TABLE "outputs" DROP CONSTRAINT "outputs_order_id_fkey";

-- AlterTable
ALTER TABLE "inputs" ADD COLUMN     "transfer_id" UUID;

-- AlterTable
ALTER TABLE "outputs" ADD COLUMN     "transfer_id" UUID,
ALTER COLUMN "order_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "inputs" ADD CONSTRAINT "inputs_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "transfers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outputs" ADD CONSTRAINT "outputs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outputs" ADD CONSTRAINT "outputs_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "transfers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
