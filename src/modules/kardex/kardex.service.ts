import { PaginationDto } from '@/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';
import { TypeReference } from '@prisma/client';

@Injectable()
export class KardexService {

  constructor(
    @Inject('ExtendedPrisma') private readonly prisma: PrismaService['extendedPrisma']
  ) { }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const totalProducts = await this.prisma.product.count();
    const lastPage = Math.ceil(totalProducts / limit);

    const products = await this.prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });

    const data = await Promise.all(
      products.map(async (product) => {
        const kardexList = await this.prisma.kardex.findMany({
          where: { productId: product.id },
        });

        const kardexWithDetails = await Promise.all(
          kardexList.map((kardex) =>
            this.findByReference(kardex.referenceId, kardex.typeReference)
          )
        );

        return {
          stock: kardexList.length > 0 ? kardexList[kardexList.length - 1].stock : 0,
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



  async findByReference(referenceId: number, typeReference: TypeReference) {
    const kardex = await this.prisma.kardex.findFirst({
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
