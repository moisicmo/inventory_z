import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';
import { ProviderEntity } from './entities/provider.entity';

@Injectable()
export class ProviderService {

  constructor(private readonly prisma: PrismaService) {}

  async create(email: string,createProviderDto: CreateProviderDto) {
    return await this.prisma.provider.create({
      data: {
        ...createProviderDto,
        createdBy: email,
      },
      select: ProviderEntity
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.provider.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.prisma.provider.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { active: true },
      select: ProviderEntity,
    });

    return {
      data,
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
      select: ProviderEntity,
    });

    if (!provider) {
      throw new NotFoundException(`Provider with id #${id} not found`);
    }

    return provider;
  }

  async update(id: string, updateProviderDto: UpdateProviderDto) {
    await this.findOne(id);

    return this.prisma.provider.update({
      where: { id },
      data: updateProviderDto,
      select: ProviderEntity,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.prisma.provider.update({
      where: { id },
      data: { active: false },
      select: ProviderEntity,
    });
  }
}
