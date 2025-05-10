import { permissionDefaultSelect } from ".";

export const roleDefaultSelect = {
  id: true,
  name: true,
  permissions:{
    select: permissionDefaultSelect
  }
};