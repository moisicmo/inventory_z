import { Prisma } from "@prisma/client";

export type CategoryType = Prisma.CategoryGetPayload<{
  select: typeof CategorySelect;
}>;

export const CategorySelect = {
  id: true,
  name: true,
};