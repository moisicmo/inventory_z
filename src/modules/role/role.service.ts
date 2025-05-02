import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';

@Injectable()
export class RoleService {

  constructor(
    @Inject('ExtendedPrisma') private readonly prisma: PrismaService['extendedPrisma']
  ) { }

  async create(createRoleDto: CreateRoleDto) {
    return await this.prisma.role.create({
      data: {
        ...createRoleDto
      }
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
      }),
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Role with id #${id} not found`);
    }

    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    await this.findOne(id);

    return this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.role.update({
      where: { id },
      data: {
        active: false,
      },
    });
  }
}
