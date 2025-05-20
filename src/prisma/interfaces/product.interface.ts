import { categoryDefaultSelect, presentationDefaultSelect } from ".";

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
  presentations: {
    select: presentationDefaultSelect
  }
};
