import { branchDefaultSelect, priceDefaultSelect, categoryDefaultSelect } from '.';

export const presentationDefaultSelect = {
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
        select: categoryDefaultSelect
      },
    }
  },
  branch: {
    select: branchDefaultSelect
  },
  prices: {
    where: { active: true },
    select: priceDefaultSelect
  }
};
