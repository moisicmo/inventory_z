import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';

@Injectable()
export class ProductService {

  constructor(private prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto) {
    return await this.prisma.branch.create({
      data: {
        ...createProductDto
      }
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.product.count({ where: { active: true } });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.product.findMany({
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
    const branch = await this.prisma.product.findFirst({
      where: { id, active: true },
    });

    if (!branch) {
      throw new NotFoundException(`Staff with id #${id} not found`);
    }

    return branch;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    return this.prisma.branch.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: number) {

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        active: false,
      },
    });

    return product;
  }
}
