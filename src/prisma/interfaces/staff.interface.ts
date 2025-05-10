import { branchDefaultSelect, roleDefaultSelect } from ".";



export const staffDefaultSelect = {
  role: {
    select: roleDefaultSelect,
  },
  branches: {
    select: branchDefaultSelect
  }
};