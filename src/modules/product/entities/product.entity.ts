import { CategoryEntity } from "@/modules/category/entities/category.entity";
import { PresentationEntity } from "@/modules/presentation/entities/presentation.entity";

export const ProductEntity = {
  id: true,
  code: true,
  name: true,
  barCode: true,
  visible: true,
  image: true,
  category: {
    select: CategoryEntity
  },
  presentations: {
    select: PresentationEntity
  }
};