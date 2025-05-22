import { PaginationDto } from '@/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { PermissionEntity } from './entities/permission.entity';
@Injectable()
export class PermissionService {

  constructor(private readonly prisma: PrismaService) {}

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
}
