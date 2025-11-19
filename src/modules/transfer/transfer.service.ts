import { Injectable } from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { PaginationDto } from '@/common';
import { PrismaService } from '@/prisma/prisma.service';
import { KardexService } from '../kardex/kardex.service';
import { TypeReference } from '@prisma/client';
import { TransferSelect, TransferType } from './entities/transfer.entity';
import { PaginationResult } from '@/common/entities/pagination.entity';

@Injectable()
export class TransferService {

  constructor(
    private readonly prisma: PrismaService,
    private kardexService: KardexService,
  ) { }

  async create(email: string, createTransferDto: CreateTransferDto) {
    const { fromBranchId, toBranchId, detail, outputs } = createTransferDto;

    const results: any[] = [];

    for (const output of outputs) {
      // Buscar el producto
      const product = await this.prisma.product.findUnique({
        where: {
          id: output.productId,
          prices: {
            some: {
              branchId: fromBranchId,
            }
          }
        },
        select: {
          id: true,
          prices: {
            select: {
              price: true,
              branch: true,
              typeUnit: true,
            }
          },
        }
      });

      if (!product) {
        throw new Error(`No se encontró el producto con id ${output.productId}`);
      }
      // Buscar o crear el precio en la sucursal destino
      let price = await this.prisma.price.findFirst({
        where: {
          productId: product.id,
          branchId: toBranchId,
        },
        include: { branch: true },
      });
      if (price != null) {
        price = await this.prisma.price.create({
          data: {
            productId: product.id,
            branchId: toBranchId,
            typeUnit: price.typeUnit,
            createdBy: email,
          },
          include: { branch: true },
        });
      }
      // registro de transferencia
      const transfer = await this.prisma.transfer.create({
        data: {
          fromBranchId,
          toBranchId,
          productId: product.id,
          quantity: output.quantity,
          price: output.price,
          detail,
          createdBy: email,
        },
      });
      // crear registro de salida
      const outputCreated = await this.prisma.output.create({
        data: {
          branchId: fromBranchId,
          transferId: transfer.id,
          productId: product.id,
          quantity: output.quantity,
          price: output.price,
          detail: `Traspaso hacia la sucursal ${price?.branch.name}`,
          createdBy: email,
        },
      });

      // crear Input (sucursal destino)
      const inputCreated = await this.prisma.input.create({
        data: {
          branchId: toBranchId,
          transferId: transfer.id,
          productId: product.id,
          quantity: output.quantity,
          price: output.price,
          detail: `Traspaso desde la sucursal ${product.prices[0].branch.name}`,
          createdBy: email,
        },
      });

      // Obtener el estado actualizado del Kardex
      const [outputKardex, inputKardex] = await Promise.all([
        this.kardexService.findByReference(outputCreated.id, TypeReference.outputs),
        this.kardexService.findByReference(inputCreated.id, TypeReference.inputs),
      ]);

      results.push({
        transfer,
        from: outputKardex,
        to: inputKardex,
      });
    }

    return results;
  }


  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<TransferType>> {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.staff.count({
      where: {
        active: true,
      },
    });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.transfer.findMany({
        skip: (page - 1) * limit,
        take: limit,
        select: TransferSelect,
      }),
      meta: { total: totalPages, page, lastPage },
    };
  }
}
