import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductPresentationDto } from './dto/create-product-presentation.dto';
import { UpdateProductPresentationDto } from './dto/update-product-presentation.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { ProductPresentationEntity } from './entities/product-presentation.entity';
import { TypeUnit } from '@prisma/client';
import { PaginationDto } from '@/common';
import { PriceService } from '@/modules/price/price.service';

@Injectable()
export class ProductPresentationService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly priceService: PriceService,
  ) { }

  async create(createPresentationDto: CreateProductPresentationDto) {
    const { price, ...restPresentation } = createPresentationDto;
    return await this.prisma.productPresentation.create({
      data: {
        ...restPresentation,
        prices: {
          create: {
            price,
          },
        },
      },
      select: ProductPresentationEntity
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.productPresentation.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.prisma.productPresentation.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { active: true },
      select: ProductPresentationEntity,
    });

    return {
      data,
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const productPresentation = await this.prisma.productPresentation.findUnique({
      where: { id },
      select: ProductPresentationEntity,
    });

    if (!productPresentation) {
      throw new NotFoundException(`Category with id #${id} not found`);
    }

    return productPresentation;
  }

  async findFirst(branchId: string, typeUnit: TypeUnit, productId: string) {
    const productPresentation = await this.prisma.productPresentation.findUnique({
      where: {
        productId_branchId_typeUnit: {
          productId,
          branchId,
          typeUnit,
        },
        active: true,
      },
      select: ProductPresentationEntity,
    });

    if (!productPresentation) {
      throw new NotFoundException(`Product Presentation with branchId #${branchId} not found`);
    }

    return productPresentation;
  }

  async update(id: string, updatePresentationDto: UpdateProductPresentationDto) {
    const { price, changedReason, ...restPresentation } = updatePresentationDto;

    const existingProductPresentation = await this.prisma.productPresentation.findUnique({
      where: { id },
      include: {
        prices: {
          where: { active: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!existingProductPresentation) {
      throw new NotFoundException(`Product Presentation with id #${id} not found`);
    }

    const currentPrice = existingProductPresentation.prices[0]?.price;

    // Si el precio cambió, registramos uno nuevo
    if (price !== undefined && price !== currentPrice) {
      await this.priceService.create({
        productPresentationId: id,
        price,
        changedReason,
      });
    }

    // Actualiza la presentación (sin tocar precios)
    return this.prisma.productPresentation.update({
      where: { id },
      data: {
        ...restPresentation,
      },
      select: ProductPresentationEntity,
    });
  }


  async remove(id: string) {
    await this.findOne(id);
    return await this.prisma.productPresentation.update({
      where: { id },
      data: { active: false },
      select: ProductPresentationEntity,
    });
  }
}
