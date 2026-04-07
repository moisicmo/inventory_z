import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { KardexService } from '../kardex/kardex.service';
import { PaymentType, TypeReference, TypeUnit } from '@/generated/prisma/enums';
import { PaginationDto } from '@/common';
import { OrderSelect, OutputSelect, OrderType } from './entities/order.entity';
import { PdfService } from '@/common/pdf/pdf.service';
import { GoogledriveService } from '@/common/googledrive/googledrive.service';
import { PaginationResult } from '@/common/entities/pagination.entity';
import { OrderGateway } from './order.gateway';

@Injectable()
export class OrderService {

  constructor(
    private prisma: PrismaService,
    private kardexService: KardexService,
    private readonly pdfService: PdfService,
    private readonly googledriveService: GoogledriveService,
    private readonly orderGateway: OrderGateway,
  ) { }

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const {
      customerId, branchId, amount, outputs: dataOutputs,
      paymentType = PaymentType.CONTADO,
      amountPaid = 0,
    } = createOrderDto;

    // Validar stock por sucursal antes de crear la orden
    for (const output of dataOutputs) {
      const currentStock = await this.kardexService.getStock(output.productId, branchId);
      if (currentStock < output.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para el producto ${output.productId}. Disponible: ${currentStock}, solicitado: ${output.quantity}`,
        );
      }
    }

    const order = await this.prisma.order.create({
      data: {
        staffId: userId,
        customerId, branchId, amount,
        paymentType,
        amountPaid,
        createdBy: userId,
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
        createdBy: userId,
      })),
    });

    const outputs = await this.prisma.output.findMany({
      where: { orderId: order.id },
      select: OutputSelect,
    });

    // Registrar kardex (descuento de stock) al crear la reserva
    await Promise.all(
      outputs.map((output) =>
        this.kardexService.findByReference(output.id, TypeReference.outputs),
      ),
    );

    // Si el pago es a cuotas, registrar la deuda del cliente
    if (paymentType === PaymentType.CUOTAS) {
      const remaining = amount - amountPaid;
      const status = remaining <= 0 ? 'PAID' : 'PENDING';

      const debt = await this.prisma.saleDebt.create({
        data: {
          orderId: order.id,
          customerId,
          branchId,
          totalAmount: amount,
          paidAmount: amountPaid,
          status,
          createdBy: userId,
        },
      });

      if (amountPaid > 0) {
        await this.prisma.salePayment.create({
          data: {
            debtId: debt.id,
            amount: amountPaid,
            payMethod: 'cash',
            notes: 'Pago inicial al momento de la venta',
            createdBy: userId,
          },
        });
      }
    }

    return { orderId: order.id };
  }

  async confirmSale(id: string) {
    const order = await this.findOne(id);
    console.log('hola');
    if (order.stateSold) {
      return { message: 'La venta ya fue confirmada anteriormente' };
    }
    
    console.log('hola');
    const pdfBuffer = await this.pdfService.generateInvoiceRoll(order);
    console.log('hola');
    const { webViewLink } = await this.googledriveService.uploadFile(
      `ord${order.id}.pdf`,
      pdfBuffer,
      'application/pdf',
      'comprobantes',
    );

    await this.prisma.order.update({
      where: { id },
      data: { stateSold: true, url: webViewLink },
    });

    const confirmedOrder = await this.findOne(id);
    this.orderGateway.emitNewDelivery(confirmedOrder);

    return { pdfBase64: pdfBuffer.toString('base64') };
  }

  async findDelivery(branchId: string): Promise<OrderType[]> {
    return this.prisma.order.findMany({
      where: { stateSold: true, delivered: false, active: true, ...(branchId ? { branchId } : {}) },
      select: OrderSelect,
      orderBy: { updatedAt: 'asc' },
    });
  }

  async deliverOrder(id: string) {
    const order = await this.findOne(id);

    if (!order.stateSold) {
      throw new BadRequestException('La orden aún no ha sido confirmada');
    }
    if (order.delivered) {
      throw new BadRequestException('La orden ya fue entregada');
    }

    await this.prisma.order.update({
      where: { id },
      data: { delivered: true },
    });

    this.orderGateway.emitDeliveryDone(id);
    return { message: 'Orden entregada correctamente' };
  }


  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<OrderType>> {
    const { page = 1, limit = 10, branchId, keys, status } = paginationDto;

    const where: any = { active: true };
    if (branchId) where.branchId = branchId;

    if (keys && keys.trim() !== '') {
      where.OR = [
        { id: { contains: keys, mode: 'insensitive' } },
        { customer: { user: { name: { contains: keys, mode: 'insensitive' } } } },
        { customer: { user: { lastName: { contains: keys, mode: 'insensitive' } } } },
        { staff: { user: { name: { contains: keys, mode: 'insensitive' } } } },
        { staff: { user: { lastName: { contains: keys, mode: 'insensitive' } } } },
      ];
    }

    if (status === 'reserva') {
      where.stateSold = false;
      where.stateAnulled = false;
    } else if (status === 'confirmada') {
      where.stateSold = true;
    } else if (status === 'anulada') {
      where.stateAnulled = true;
    }

    const totalPages = await this.prisma.order.count({ where });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where,
        select: OrderSelect,
        orderBy: { createdAt: 'desc' },
      }),
      meta: { total: totalPages, page: Number(page), lastPage },
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

  async annulOrder(id: string, userId: string) {
    const order = await this.findOne(id);

    if (order.stateSold) {
      throw new BadRequestException('No se puede anular una venta ya confirmada');
    }
    if (order.stateAnulled) {
      throw new BadRequestException('La orden ya fue anulada anteriormente');
    }

    // Crear un Input de devolución por cada Output — el trigger de PG restaurará el stock
    await this.prisma.input.createMany({
      data: order.outputs.map((output) => ({
        branchId: order.branch.id,
        productId: output.product.id,
        quantity: output.quantity,
        price: 0,
        typeUnit: TypeUnit.UNIDAD,
        detail: `anulacion orden ${id}`,
        createdBy: userId,
      })),
    });

    // Desactivar deuda asociada si existe
    await this.prisma.saleDebt.updateMany({
      where: { orderId: id },
      data: { active: false, updatedBy: userId },
    });

    await this.prisma.order.update({
      where: { id },
      data: { stateAnulled: true },
    });

    return { message: 'Orden anulada correctamente' };
  }

  async getPdf(id: string) {
    const order = await this.findOne(id);
    if (!order.stateSold) {
      throw new BadRequestException('La venta aún no ha sido confirmada');
    }
    const pdfBuffer = await this.pdfService.generateInvoiceRoll(order);
    return { pdfBase64: pdfBuffer.toString('base64') };
  }
}
