import { PaginationDto } from '@/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { TypeReference } from '@/generated/prisma/enums';
import { KardexSelect } from './entities/kardex.entity';
import { ProductSelect } from '../product/entities/product.entity';
@Injectable()
export class KardexService {

  constructor(private readonly prisma: PrismaService) { }

  async findAll(paginationDto: PaginationDto) {
    const { branchId, page = 1, limit = 10, keys } = paginationDto;

    // Filtro para productos (nombre, código, categoría, marca)
    const productWhere: any = { active: true };
    if (keys && keys.trim() !== '') {
      productWhere.OR = [
        { name: { contains: keys, mode: 'insensitive' } },
        { code: { contains: keys, mode: 'insensitive' } },
        { category: { name: { contains: keys, mode: 'insensitive' } } },
        { brand: { name: { contains: keys, mode: 'insensitive' } } },
      ];
    }

    const totalProducts = await this.prisma.product.count({ where: productWhere });
    const lastPage = Math.ceil(totalProducts / limit);

    const products = await this.prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: productWhere,
      select: ProductSelect,
    });

    const data = await Promise.all(
      products.map(async (product) => {
        // Filtrar kardex por branchId si se proporciona, para stock por sucursal
        const kardexWhere: any = { productId: product.id };
        if (branchId) {
          kardexWhere.branchId = branchId;
        }

        const kardexList = await this.prisma.kardex.findMany({
          select: KardexSelect,
          where: kardexWhere,
          orderBy: { createdAt: 'desc' },
        });

        const kardexWithDetails = await Promise.all(
          kardexList.map((kardex) =>
            this.findByReference(kardex.referenceId, kardex.typeReference),
          ),
        );

        return {
          stock: kardexList.length > 0 ? kardexList[0].stock : 0,
          product,
          kardex: kardexWithDetails.filter(Boolean),
        };
      }),
    );

    return {
      data,
      meta: { total: totalProducts, page, lastPage },
    };
  }


  async getStock(productId: string, branchId: string): Promise<number> {
    const latest = await this.prisma.kardex.findFirst({
      where: { productId, branchId },
      orderBy: { createdAt: 'desc' },
      select: { stock: true },
    });
    return latest?.stock ?? 0;
  }

  async findByReference(referenceId: string, typeReference: TypeReference) {
    const kardex = await this.prisma.kardex.findFirst({
      select: KardexSelect,
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
