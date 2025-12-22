import { BranchSelect } from "@/modules/branch/entities/branch.entity";
import { Prisma } from "@/generated/prisma/client";

export type PriceType = Prisma.PriceGetPayload<{
  select: typeof PriceSelect;
}>;

export const PriceSelect = {
  id: true,
  price: true,
  promoPrice: true,
  typeUnit: true,
  branch: { select: BranchSelect}
};