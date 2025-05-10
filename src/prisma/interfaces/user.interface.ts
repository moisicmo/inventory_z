import { staffDefaultSelect } from ".";

export const userDefaultSelect = {
  id: true,
  numberDocument: true,
  typeDocument: true,
  name: true,
  lastName: true,
  email: true,
  staff: {
    select: staffDefaultSelect
  },
  customer: {
    select: {
      userId: false,
      active: true,
      updatedAt: false,
      createdAt: false,
    }
  }
};