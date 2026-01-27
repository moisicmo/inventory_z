import { AddressSelect } from "@/common/entities/address.select";
import { Prisma } from "@/generated/prisma/client";

export type ProviderType = Prisma.ProviderGetPayload<{
  select: typeof ProviderSelect;
}>;

export const ProviderSelect = {
  id: true,
  name: true,
  nit: true,
  phone: true,
  contact: true,
  address: { select: AddressSelect },
};