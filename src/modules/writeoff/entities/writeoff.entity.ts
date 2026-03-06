import { BranchSelect } from "@/modules/branch/entities/branch.entity";
import { Prisma } from "@/generated/prisma/client";

export const WriteoffOutputSelect = {
  id: true,
  quantity: true,
  product: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
};

export const WriteoffSelect = {
  id: true,
  reason: true,
  description: true,
  active: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  branch: { select: BranchSelect },
  outputs: { select: WriteoffOutputSelect },
};

export type WriteoffType = Prisma.BajaGetPayload<{
  select: typeof WriteoffSelect;
}>;
