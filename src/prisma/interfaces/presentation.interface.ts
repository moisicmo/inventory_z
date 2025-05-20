import { branchDefaultSelect, priceDefaultSelect } from ".";

export const presentationDefaultSelect = {
  id: true,
  typeUnit: true,
  branch: {
    select: branchDefaultSelect
  },
  prices: {
    where: { active: true },
    select: priceDefaultSelect
  }
};
