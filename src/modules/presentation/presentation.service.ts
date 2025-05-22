import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePresentationDto } from './dto/create-presentation.dto';
import { UpdatePresentationDto } from './dto/update-presentation.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PresentationEntity } from './entities/presentation.entity';
import { TypeUnit } from '@prisma/client';
import { PaginationDto } from '@/common';
import { PriceService } from '@/modules/price/price.service';

@Injectable()
export class PresentationService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly priceService: PriceService,
  ) { }

  async create(createPresentationDto: CreatePresentationDto) {
    const { price, ...restPresentation } = createPresentationDto;
    return await this.prisma.presentation.create({
      data: {
        ...restPresentation,
        prices: {
          create: {
            price,
          },
        },
      },
      select: PresentationEntity
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.presentation.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.prisma.presentation.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { active: true },
      select: PresentationEntity,
    });

    return {
      data,
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const presentation = await this.prisma.presentation.findUnique({
      where: { id },
      select: PresentationEntity,
    });

    if (!presentation) {
      throw new NotFoundException(`Category with id #${id} not found`);
    }

    return presentation;
  }

  async findFirst(branchId: string, typeUnit: TypeUnit, productId: string) {
    const presentation = await this.prisma.presentation.findUnique({
      where: {
        productId_branchId_typeUnit: {
          productId,
          branchId,
          typeUnit,
        },
        active: true,
      },
      select: PresentationEntity,
    });

    if (!presentation) {
      throw new NotFoundException(`Presentation with branchId #${branchId} not found`);
    }

    return presentation;
  }

  async update(id: string, updatePresentationDto: UpdatePresentationDto) {
    const { price, changedReason, ...restPresentation } = updatePresentationDto;

    const existingPresentation = await this.prisma.presentation.findUnique({
      where: { id },
      include: {
        prices: {
          where: { active: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!existingPresentation) {
      throw new NotFoundException(`Presentation with id #${id} not found`);
    }

    const currentPrice = existingPresentation.prices[0]?.price;

    // Si el precio cambió, registramos uno nuevo
    if (price !== undefined && price !== currentPrice) {
      await this.priceService.create({
        presentationId: id,
        price,
        changedReason,
      });
    }

    // Actualiza la presentación (sin tocar precios)
    return this.prisma.presentation.update({
      where: { id },
      data: {
        ...restPresentation,
      },
      select: PresentationEntity,
    });
  }


  async remove(id: string) {
    await this.findOne(id);
    return await this.prisma.presentation.update({
      where: { id },
      data: { active: false },
      select: PresentationEntity,
    });
  }
}
