import { UserSelect } from "@/common";
import { Prisma } from "@prisma/client";

export type CustomerType = Prisma.CustomerGetPayload<{
  select: typeof CustomerSelect;
}>;

export const CustomerSelect = {
  userId: true,
  active: true,
  user: { select: UserSelect }
};