import { BranchEntity } from "@/modules/branch/entities/branch.entity";
import { CategoryEntity } from "@/modules/category/entities/category.entity";
import { PriceEntity } from "@/modules/price/entities/price.entity";

export const PresentationEntity = {
  id: true,
  typeUnit: true,
  product: {
    select: {
      id: true,
      code: true,
      name: true,
      barCode: true,
      visible: true,
      image: true,
      category: {
        select: CategoryEntity
      },
    }
  },
  branch: {
    select: BranchEntity
  },
  prices: {
    where: { active: true },
    select: PriceEntity
  }
};