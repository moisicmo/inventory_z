import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { PaginationDto } from '@/common';
import { PrismaService } from '@/prisma/prisma.service';
import { KardexService } from '../kardex/kardex.service';
import { TypeReference, TypeUnit } from '@/generated/prisma/enums';
import { TransferSelect, TransferType } from './entities/transfer.entity';
import { PaginationResult } from '@/common/entities/pagination.entity';

@Injectable()
export class TransferService {

  constructor(
    private readonly prisma: PrismaService,
    private kardexService: KardexService,
  ) { }

  async create(userId: string, createTransferDto: CreateTransferDto) {
    const { fromBranchId, toBranchId, detail, outputs } = createTransferDto;

    // Validar stock antes de procesar
    for (const output of outputs) {
      const stock = await this.kardexService.getStock(output.productId, fromBranchId);
      if (stock < output.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para el producto ${output.productId}. Disponible: ${stock}, solicitado: ${output.quantity}`,
        );
      }
    }

    const results: any[] = [];

    for (const output of outputs) {
      const product = await this.prisma.product.findUnique({
        where: { id: output.productId },
        select: {
          id: true,
          name: true,
          prices: {
            where: { branchId: fromBranchId },
            select: { price: true, typeUnit: true, branch: { select: { name: true } } },
          },
        },
      });

      if (!product) {
        throw new BadRequestException(`No se encontró el producto con id ${output.productId}`);
      }

      const fromBranch = await this.prisma.branch.findUnique({
        where: { id: fromBranchId },
        select: { name: true },
      });
      const toBranch = await this.prisma.branch.findUnique({
        where: { id: toBranchId },
        select: { name: true },
      });

      const typeUnit = product.prices[0]?.typeUnit ?? TypeUnit.UNIDAD;

      // Crear precio en sucursal destino si no existe
      const existingPrice = await this.prisma.price.findFirst({
        where: { productId: product.id, branchId: toBranchId },
      });
      if (!existingPrice) {
        await this.prisma.price.create({
          data: {
            productId: product.id,
            branchId: toBranchId,
            typeUnit,
            price: output.price,
            createdBy: userId,
          },
        });
      }

      // Registro de transferencia
      const transfer = await this.prisma.transfer.create({
        data: {
          fromBranchId,
          toBranchId,
          productId: product.id,
          quantity: output.quantity,
          price: output.price,
          detail,
          createdBy: userId,
        },
      });

      // Salida de la sucursal origen
      const outputCreated = await this.prisma.output.create({
        data: {
          branchId: fromBranchId,
          transferId: transfer.id,
          productId: product.id,
          quantity: output.quantity,
          price: output.price,
          detail: `Traspaso hacia ${toBranch?.name ?? toBranchId}`,
          createdBy: userId,
        },
      });

      // Entrada en la sucursal destino
      const inputCreated = await this.prisma.input.create({
        data: {
          branchId: toBranchId,
          transferId: transfer.id,
          productId: product.id,
          quantity: output.quantity,
          price: output.price,
          typeUnit,
          detail: `Traspaso desde ${fromBranch?.name ?? fromBranchId}`,
          createdBy: userId,
        },
      });

      const [outputKardex, inputKardex] = await Promise.all([
        this.kardexService.findByReference(outputCreated.id, TypeReference.outputs),
        this.kardexService.findByReference(inputCreated.id, TypeReference.inputs),
      ]);

      results.push({ transfer, from: outputKardex, to: inputKardex });
    }

    return results;
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<TransferType>> {
    const { page = 1, limit = 10, branchId, keys } = paginationDto;

    const where: any = {};
    if (branchId) {
      where.OR = [{ fromBranchId: branchId }, { toBranchId: branchId }];
    }
    if (keys && keys.trim()) {
      const keyFilter = [
        { product: { name: { contains: keys, mode: 'insensitive' } } },
        { detail: { contains: keys, mode: 'insensitive' } },
        { fromBranch: { name: { contains: keys, mode: 'insensitive' } } },
        { toBranch: { name: { contains: keys, mode: 'insensitive' } } },
      ];
      where.AND = [{ OR: keyFilter }];
    }

    const total = await this.prisma.transfer.count({ where });
    const lastPage = Math.ceil(total / limit);

    return {
      data: await this.prisma.transfer.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where,
        select: TransferSelect,
        orderBy: { createdAt: 'desc' },
      }),
      meta: { total, page: Number(page), lastPage },
    };
  }
}
