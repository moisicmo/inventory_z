import { branchDefaultSelect } from ".";

export const priceDefaultSelect = {
  id: true,
  typeUnit: true,
  price: true,
  branch: {
    select: branchDefaultSelect
  }
}