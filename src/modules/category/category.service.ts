import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoryService {

  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return await this.prisma.category.create({
      data: createCategoryDto,
      select: CategoryEntity
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.category.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.prisma.category.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { active: true },
      select: CategoryEntity,
    });

    return {
      data,
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      select: CategoryEntity,
    });

    if (!category) {
      throw new NotFoundException(`Category with id #${id} not found`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      select: CategoryEntity,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.prisma.category.update({
      where: { id },
      data: { active: false },
      select: CategoryEntity,
    });
  }
}
