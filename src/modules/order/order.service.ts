import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { KardexService } from '../kardex/kardex.service';
import { TypeReference } from '@prisma/client';
import { PaginationDto } from '@/common';

@Injectable()
export class OrderService {

  constructor(
    private prisma: PrismaService,
    private kardexService: KardexService,
  ) { }

  async create(createOrderDto: CreateOrderDto) {
    const { customerId, branchId, amount, outputs: dataOutputs } = createOrderDto;
    const order = await this.prisma.order.create({
      data: {
        customerId,
        branchId,
        amount,
      }
    });
    const outputs = await this.prisma.output.createManyAndReturn({
      // select: InputEntity,
      data: dataOutputs.map((e) => ({
        branchId,
        orderId: order.id,
        productPresentationId: e.productPresentationId,
        quantity: e.quantity,
        price: e.price,
        detail: 'venta'
      })),
    });
    const kardexLists = await Promise.all(
      outputs.map((output) => this.kardexService.findByReference(output.id, TypeReference.outputs)),
    );
    return kardexLists;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.order.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { active: true },
        // select: PermissionEntity,
      }),
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const permission = await this.prisma.order.findUnique({
      where: { id },
      // select: PermissionEntity,
    });

    if (!permission) {
      throw new NotFoundException(`Order with id #${id} not found`);
    }

    return permission;
  }
}
