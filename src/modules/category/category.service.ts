import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';

@Injectable()
export class CategoryService {

  constructor(private prisma: PrismaService) { }

  async create(createCategoryDto: CreateCategoryDto) {
    return await this.prisma.category.create({
      data: {
        ...createCategoryDto
      }
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.category.count({ where: { active: true } });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.category.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          active: true,
        },
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      },
    };
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findFirst({
      where: { id, active: true },
    });

    if (!category) {
      throw new NotFoundException(`Customer with id #${id} not found`);
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    const category = await this.prisma.category.update({
      where: { id },
      data: {
        active: false,
      },
    });

    return category;
  }
}
