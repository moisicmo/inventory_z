import { Prisma } from "@prisma/client";

export type UserEntity = Prisma.UserGetPayload<{
  select: typeof UserSelect;
}>;

export const UserSelect = {
  id: true,
  numberDocument: true,
  typeDocument: true,
  name: true,
  lastName: true,
  email: true,
};