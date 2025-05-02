import { PaginationDto } from '@/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class PermissionService {

  constructor(
    @Inject('ExtendedPrisma') private readonly prisma: PrismaService['extendedPrisma']
  ) { }

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
      }),
      meta: { total: totalPages, page, lastPage },
    };
  }
}
