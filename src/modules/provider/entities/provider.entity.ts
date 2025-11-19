import { AddressSelect } from "@/common/entities/address.select";
import { Prisma } from "@prisma/client";

export type ProviderType = Prisma.ProviderGetPayload<{
  select: typeof ProviderSelect;
}>;

export const ProviderSelect = {
  id: true,
  name: true,
  nit: true,
  phone: true,
  address: { select: AddressSelect },
};