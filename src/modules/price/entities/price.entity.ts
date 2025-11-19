import { BranchSelect } from "@/modules/branch/entities/branch.entity";
import { Prisma } from "@prisma/client";

export type PriceType = Prisma.PriceGetPayload<{
  select: typeof PriceSelect;
}>;

export const PriceSelect = {
  id: true,
  price: true,
  typeUnit: true,
  branch: { select: BranchSelect}
};