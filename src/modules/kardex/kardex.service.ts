import { PaginationDto } from '@/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { TypeReference } from '@prisma/client';
import { KardexEntity } from './entities/kardex.entity';
import { ProductPresentationEntity } from '../productPresentation/entities/product-presentation.entity';
@Injectable()
export class KardexService {

  constructor(private readonly prisma: PrismaService) { }

  async findAll(paginationDto: PaginationDto) {
    const { branchId, page = 1, limit = 10, keys } = paginationDto;

    // Condición dinámica de filtro
    const where: any = {};
    if (branchId) {
      where.branchId = branchId;
    }

    // 🔎 Opcional: si quieres búsqueda por nombre o código
    if (keys && keys.trim() !== '') {
      where.OR = [
        { name: { contains: keys, mode: 'insensitive' } },
        { product: { name: { contains: keys, mode: 'insensitive' } } },
      ];
    }

    // Total filtrado (respetando branchId y/o keys)
    const totalProducts = await this.prisma.productPresentation.count({ where });
    const lastPage = Math.ceil(totalProducts / limit);

    const productPresentations = await this.prisma.productPresentation.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      select: ProductPresentationEntity
    });

    const data = await Promise.all(
      productPresentations.map(async (productPresentation) => {
        const kardexList = await this.prisma.kardex.findMany({
          select: KardexEntity,
          where: { productPresentationId: productPresentation.id },
          orderBy: { createdAt: 'desc' }, // aseguras orden cronológico
        });

        const kardexWithDetails = await Promise.all(
          kardexList.map((kardex) =>
            this.findByReference(kardex.referenceId, kardex.typeReference),
          ),
        );

        return {
          stock: kardexList.length > 0 ? kardexList[0].stock : 0,
          presentation: productPresentation,
          kardex: kardexWithDetails.filter(Boolean),
        };
      }),
    );

    return {
      data,
      meta: { total: totalProducts, page, lastPage },
    };
  }


  async findByReference(referenceId: string, typeReference: TypeReference) {
    const kardex = await this.prisma.kardex.findFirst({
      select: KardexEntity,
      where: {
        typeReference,
        referenceId,
      },
    });

    if (!kardex) return null;

    const reference =
      typeReference === TypeReference.inputs
        ? await this.prisma.input.findUnique({ where: { id: referenceId } })
        : await this.prisma.output.findUnique({ where: { id: referenceId } });

    const key = typeReference === TypeReference.inputs ? 'input' : 'output';

    return {
      stock: kardex.stock,
      [key]: reference,
    };
  }






}
