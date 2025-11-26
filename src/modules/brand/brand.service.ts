import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';
import { BrandSelect, BrandType } from './entities/brand.entity';
import { PaginationResult } from '@/common/entities/pagination.entity';

@Injectable()
export class BrandService {

  constructor(private readonly prisma: PrismaService) {}

  async create(email: string,createBrandDto: CreateBrandDto) {
    return await this.prisma.brand.create({
      data: {
        ...createBrandDto,
        createdBy: email,
      },
      select: BrandSelect
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<BrandType>> {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.brand.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.prisma.brand.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { active: true },
      select: BrandSelect,
    });

    return {
      data,
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      select: BrandSelect,
    });

    if (!brand) {
      throw new NotFoundException(`Brand with id #${id} not found`);
    }

    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    await this.findOne(id);

    return this.prisma.brand.update({
      where: { id },
      data: updateBrandDto,
      select: BrandSelect,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.prisma.brand.update({
      where: { id },
      data: { active: false },
      select: BrandSelect,
    });
  }

  async searchByName(name: string) {
    if (!name) {
      return [];
    }
    return this.prisma.brand.findMany({
      where: {
        name: {
          startsWith: name,
          mode: 'insensitive',
        },
        active: true,
      },
      take: 10,
      select: BrandEntity,
    });
  }
}
