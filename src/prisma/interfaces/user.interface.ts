export const userDefaultSelect = {
  id: true,
  numberDocument: true,
  typeDocument: true,
  name: true,
  lastName: true,
  email: true,
  staffs: {
    select: {
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  customers: {
    select: {
      userId: false,
      active: true,
      updatedAt: false,
      createdAt: false,
    }
  }
};