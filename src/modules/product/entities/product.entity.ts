import { BrandSelect } from "@/modules/brand/entities/brand.entity";
import { CategorySelect } from "@/modules/category/entities/category.entity";
import { PriceSelect } from "@/modules/price/entities/price.entity";
import { ProviderSelect } from "@/modules/provider/entities/provider.entity";
import { Prisma } from "@prisma/client";

export type ProductType = Prisma.ProductGetPayload<{
  select: typeof ProductSelect;
}>;

export const ProductSelect = {
  id: true,
  code: true,
  name: true,
  description: true,
  image: true,
  barCode: true,
  visible: true,
  category: { select: CategorySelect},
  brand: { select: BrandSelect},
  provider:{ select: ProviderSelect },
  prices:{ select: PriceSelect}
};