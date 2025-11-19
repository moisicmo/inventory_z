import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { KardexService } from '../kardex/kardex.service';
import { TypeReference } from '@prisma/client';
import { PaginationDto } from '@/common';
import { OrderSelect, OutputSelect, OrderType } from './entities/order.entity';
import { PdfService } from '@/common/pdf/pdf.service';
import { GoogledriveService } from '@/common/googledrive/googledrive.service';
import { PaginationResult } from '@/common/entities/pagination.entity';

@Injectable()
export class OrderService {

  constructor(
    private prisma: PrismaService,
    private kardexService: KardexService,
    private readonly pdfService: PdfService,
    private readonly googledriveService: GoogledriveService,
  ) { }

  async create(email: string,userId: string,createOrderDto: CreateOrderDto) {
    const { customerId, branchId, amount, outputs: dataOutputs } = createOrderDto;

    const order = await this.prisma.order.create({
      data: { 
        staffId: userId,
        customerId, branchId, amount,
        createdBy: email,
       },
    });

    await this.prisma.output.createMany({
      data: dataOutputs.map((e) => ({
        branchId,
        orderId: order.id,
        productId: e.productId,
        quantity: e.quantity,
        price: e.price,
        detail: 'venta',
        createdBy: email,
      })),
    });

    const outputs = await this.prisma.output.findMany({
      where: { orderId: order.id },
      select: OutputSelect,
    });

    const kardexLists = await Promise.all(
      outputs.map((output) =>
        this.kardexService.findByReference(output.id, TypeReference.outputs),
      ),
    );

    const orderCreated = await this.findOne(order.id);

    const pdfBuffer = await this.pdfService.generateInvoiceRoll(orderCreated);
    const { webViewLink } = await this.googledriveService.uploadFile(
      `ord${orderCreated.id}.pdf`,
      pdfBuffer,
      'application/pdf',
      'comprobantes'
    );
    await this.prisma.order.update({
      where: { id: orderCreated.id },
      data: { url: webViewLink },
    });

    return {
      kardexLists,
      pdfBase64: pdfBuffer.toString('base64'),
    };
  }


  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<OrderType>> {
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
        select: OrderSelect,
      }),
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string): Promise<OrderType> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: OrderSelect,
    });

    if (!order) {
      throw new NotFoundException(`Order with id #${id} not found`);
    }

    return order;
  }
}
