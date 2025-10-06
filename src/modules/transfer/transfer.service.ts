import { Injectable } from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { PaginationDto } from '@/common';
import { PrismaService } from '@/prisma/prisma.service';
import { KardexService } from '../kardex/kardex.service';
import { TypeReference } from '@prisma/client';

@Injectable()
export class TransferService {

  constructor(
    private readonly prisma: PrismaService,
    private kardexService: KardexService,
  ) { }

  async create(createTransferDto: CreateTransferDto) {
    const { fromBranchId, toBranchId, detail, outputs } = createTransferDto;

    const results: any[] = [];

    for (const output of outputs) {
      const { productPresentationId, quantity, price } = output;

      // 1️⃣ Buscar la presentación de origen
      const fromPres = await this.prisma.productPresentation.findUnique({
        where: { id: productPresentationId },
        include: { product: true, branch: true },
      });

      if (!fromPres) {
        throw new Error(`No se encontró la presentación con id ${productPresentationId}`);
      }

      // 2️⃣ Buscar o crear la presentación en la sucursal destino
      let toPres = await this.prisma.productPresentation.findFirst({
        where: {
          productId: fromPres.productId,
          branchId: toBranchId,
          typeUnit: fromPres.typeUnit,
        },
        include: { branch: true },
      });
      console.log(toPres)

      if (!toPres) {
        toPres = await this.prisma.productPresentation.create({
          data: {
            productId: fromPres.productId,
            branchId: toBranchId,
            name: fromPres.name,
            typeUnit: fromPres.typeUnit,
            active: true,
          },
          include: { branch: true },
        });

        // Si quieres clonar también el precio base del origen
        const lastPrice = await this.prisma.price.findFirst({
          where: { productPresentationId: fromPres.id, active: true },
          orderBy: { createdAt: 'desc' },
        });

        if (lastPrice) {
          await this.prisma.price.create({
            data: {
              productPresentationId: toPres.id,
              price: lastPrice.price,
              discount: lastPrice.discount,
              typeDiscount: lastPrice.typeDiscount,
              changedReason: 'Creado por transferencia automática',
            },
          });
        }
      }

      // 3️⃣ Crear Transfer
      const transfer = await this.prisma.transfer.create({
        data: {
          fromBranchId,
          toBranchId,
          productPresentationId: fromPres.id, // sigue referenciando la de origen
          quantity,
          price,
          detail,
        },
      });

      // 4️⃣ Crear Output (sucursal origen)
      const outputCreated = await this.prisma.output.create({
        data: {
          branchId: fromBranchId,
          transferId: transfer.id,
          productPresentationId: fromPres.id,
          quantity,
          price,
          detail: `Traspaso hacia la sucursal ${toPres.branch.name}`,
        },
      });

      // 5️⃣ Crear Input (sucursal destino)
      const inputCreated = await this.prisma.input.create({
        data: {
          branchId: toBranchId,
          transferId: transfer.id,
          productPresentationId: toPres.id, // ✅ usar la de destino
          quantity,
          price,
          detail: `Traspaso desde la sucursal ${fromPres.branch.name}`,
        },
      });

      // 6️⃣ Obtener el estado actualizado del Kardex
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


  async findAll(paginationDto: PaginationDto) {
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
        // select: StaffEntity,
      }),
      meta: { total: totalPages, page, lastPage },
    };
  }
}
