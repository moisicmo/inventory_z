import { BrandSelect } from "@/modules/brand/entities/brand.entity";
import { CategorySelect } from "@/modules/category/entities/category.entity";
import { PriceSelect } from "@/modules/price/entities/price.entity";
import { Prisma } from "@/generated/prisma/client";

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
  promoPrice: true,
  refCost: true,
  unitConversion: {
    select: {
      fromUnit: true,
      toUnit: true,
      factor: true,
    }
  },
  category: { select: CategorySelect},
  brand: { select: BrandSelect},
  prices:{ select: PriceSelect}
};