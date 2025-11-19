import { Prisma } from "@prisma/client";

export type BrandType = Prisma.BrandGetPayload<{
  select: typeof BrandSelect;
}>;

export const BrandSelect = {
  id: true,
  name: true,
  description: true,
};