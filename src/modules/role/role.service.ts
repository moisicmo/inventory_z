import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';
import { PermissionEntity } from '@/modules/permission/entities/permission.entity';
import { RoleEntity } from './entities/role.entity';
@Injectable()
export class RoleService {

  constructor(private readonly prisma: PrismaService) { }

  async create(createRoleDto: CreateRoleDto) {
    const { name, permissions } = createRoleDto;

    const createdPermissions = await Promise.all(
      permissions.map(async (perm) => {
        if (!perm.conditions) return { id: perm.id };

        // Creamos una copia con condiciones
        const basePerm = await this.prisma.permission.findUnique({
          where: { id: perm.id },
          select: PermissionEntity,
        });

        if (!basePerm) {
          throw new NotFoundException(`Permission with id #${perm.id} not found`);
        }

        const newPerm = await this.prisma.permission.create({
          data: {
            action: basePerm.action,
            subject: basePerm.subject,
            inverted: basePerm.inverted,
            reason: basePerm.reason,
            active: basePerm.active,
            conditions: perm.conditions,
          },
          select: PermissionEntity,
        });

        return { id: newPerm.id };
      }),
    );

    return this.prisma.role.create({
      data: {
        name,
        permissions: {
          connect: createdPermissions,
        },
      },
      select: RoleEntity,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.role.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.role.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { active: true },
        select: RoleEntity,
      }),
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Role with id #${id} not found`);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const { name, permissions } = updateRoleDto;

    // Verificar si existe el rol
    await this.findOne(id);

    // Procesar permisos con/ sin condiciones
    if (!permissions || permissions.length === 0) {
      return this.prisma.role.update({
        where: { id },
        data: { name },
        select: RoleEntity,
      });
    }
    const updatedPermissions = await Promise.all(
      permissions.map(async (perm) => {
        if (!perm.conditions) return { id: perm.id };

        const basePerm = await this.prisma.permission.findUnique({
          where: { id: perm.id },
          select: PermissionEntity,
        });

        if (!basePerm) {
          throw new NotFoundException(`Permission with id #${perm.id} not found`);
        }

        const newPerm = await this.prisma.permission.create({
          data: {
            action: basePerm.action,
            subject: basePerm.subject,
            inverted: basePerm.inverted,
            reason: basePerm.reason,
            active: basePerm.active,
            conditions: perm.conditions,
          },
          select: PermissionEntity,
        });

        return { id: newPerm.id };
      }),
    );

    // Actualizar el rol y sus permisos
    return this.prisma.role.update({
      where: { id },
      data: {
        name,
        permissions: {
          set: updatedPermissions, // Reemplaza todos los permisos previos
        },
      },
      select: RoleEntity,
    });
  }


  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.role.update({
      where: { id },
      data: {
        active: false,
      },
      select: RoleEntity,
    });
  }
}
