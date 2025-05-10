import { categoryDefaultSelect, priceDefaultSelect } from ".";

export const productDefaultSelect = {
  id: true,
  code: true,
  name: true,
  barCode: true,
  visible: true,
  image: true,
  category: {
    select: categoryDefaultSelect
  },
  prices: {
    where: {
      active: true
    },
    select: {
      ...priceDefaultSelect
    }
  }
};