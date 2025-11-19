import { BranchSelect } from "@/modules/branch/entities/branch.entity";
import { ProductSelect } from "@/modules/product/entities/product.entity";
import { Prisma } from "@prisma/client";

export type TransferType = Prisma.TransferGetPayload<{
  select: typeof TransferSelect;
}>;

export const TransferSelect = {
  id: true,
  quantity: true,
  price: true,
  detail: true,
  fromBranch: { select: BranchSelect },
  toBranch: { select: BranchSelect },
  product: { select: ProductSelect },
};