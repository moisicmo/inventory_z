import { Prisma } from "@/generated/prisma/client";

export type KardexType = Prisma.KardexGetPayload<{
  select: typeof KardexSelect;
}>;


export const KardexSelect = {
  stock: true,
  referenceId: true,
  typeReference: true,
};