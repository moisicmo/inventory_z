import { Prisma } from "@prisma/client";

export type InputType = Prisma.InputGetPayload<{
  select: typeof InputSelect;
}>;

export const InputSelect = {
  id: true,
  quantity: true,
  price: true,
  dueDate: true,
  detail: true,
  createdAt: true,
};