import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';

@Injectable()
export class ProductService {

  constructor(private prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto) {
    const { categoryId, name, typeUnit, price } = createProductDto;
    const product = await this.prisma.product.create({
      data: {
        code: `P${Date.now()}`,
        categoryId,
        name,
        prices: {
          create: {
            typeUnit,
            price,
          }
        }
      },
      include: {
        prices: {
          select: {
            id: true,
            typeUnit: true,
            price: true,
          }
        }
      }
    });
    return product;

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
        include: {
          prices: {
            select: {
              id: true,
              typeUnit: true,
              price: true,
            }
          }
        }
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, active: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with id #${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    return this.prisma.product.update({
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
