import { UserEntity } from "@/common";

export const CustomerEntity = {
  userId: true,
  active: true,
  user: {
    select: UserEntity,
  }
};