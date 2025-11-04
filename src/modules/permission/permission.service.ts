import { PaginationDto } from '@/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionEntity } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
@Injectable()
export class PermissionService {

  constructor(private readonly prisma: PrismaService) { }

  async create(email: string, createPermissionDto: CreatePermissionDto) {
    const { subject, ...createDto } = createPermissionDto;
    return await this.prisma.permission.create({
      data: {
        ...createDto,
        subject: subject.toString(),
        createdBy: email,
      },
      select: PermissionEntity
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.permission.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.permission.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { active: true },
        select: PermissionEntity,
      }),
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      select: PermissionEntity,
    });

    if (!permission) {
      throw new NotFoundException(`Permission with id #${id} not found`);
    }

    return permission;
  }
}
