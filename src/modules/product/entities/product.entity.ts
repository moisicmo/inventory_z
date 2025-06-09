import { CategoryEntity } from "@/modules/category/entities/category.entity";
import { ProductPresentationEntity } from "@/modules/productPresentation/entities/product-presentation.entity";

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
  productPresentations: {
    select: ProductPresentationEntity
  }
};