import { Prisma } from '@/generated/prisma/client';
import { PermissionSelect } from '@/modules/permission/entities/permission.entity';

export type RoleType = Prisma.RoleGetPayload<{
  select: typeof RoleSelect;
}>;

export const RoleSelect = {
  id: true,
  name: true,
  permissions: { select: PermissionSelect }
};