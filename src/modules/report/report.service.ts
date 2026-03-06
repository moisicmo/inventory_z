import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { XlsxService } from '@/common/xlsx/xlsx.service';
import { ReportDateDto } from './dto/report-date.dto';
import { format } from 'date-fns';

@Injectable()
export class ReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly xlsxService: XlsxService,
  ) {}

  async getInventoryReport(dto: ReportDateDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    end.setHours(23, 59, 59, 999);

    const [inputs, outputs] = await Promise.all([
      this.prisma.input.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: {
          id: true,
          quantity: true,
          price: true,
          detail: true,
          createdAt: true,
          branch: { select: { name: true } },
          product: { select: { name: true, code: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.output.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: {
          id: true,
          orderId: true,
          bajaId: true,
          quantity: true,
          price: true,
          detail: true,
          createdAt: true,
          branch: { select: { name: true } },
          product: { select: { name: true, code: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const data = [
      ...inputs.map((i) => ({
        date: format(i.createdAt, 'dd/MM/yyyy HH:mm'),
        type: 'Entrada',
        branch: i.branch.name,
        product: i.product.name,
        code: i.product.code ?? '—',
        quantity: i.quantity,
        price: i.price,
        detail: i.detail ?? '—',
      })),
      ...outputs.map((o) => ({
        date: format(o.createdAt, 'dd/MM/yyyy HH:mm'),
        type: o.orderId ? 'Venta' : o.bajaId ? 'Baja' : 'Salida',
        branch: o.branch.name,
        product: o.product.name,
        code: o.product.code ?? '—',
        quantity: o.quantity,
        price: o.price,
        detail: o.detail ?? '—',
      })),
    ].sort((a, b) => a.date.localeCompare(b.date));

    const buffer = await this.xlsxService.generateInventoryReport(data);
    return { xlsxBase64: buffer.toString('base64'), data };
  }

  async getSaleReport(dto: ReportDateDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    end.setHours(23, 59, 59, 999);

    const orders = await this.prisma.order.findMany({
      where: {
        stateSold: true,
        stateAnulled: false,
        createdAt: { gte: start, lte: end },
      },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        customer: { select: { user: { select: { name: true, lastName: true } } } },
        branch: { select: { name: true } },
        outputs: {
          select: {
            product: { select: { name: true, code: true } },
            quantity: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const data = orders.flatMap((order) =>
      order.outputs.map((out) => ({
        date: format(order.createdAt, 'dd/MM/yyyy HH:mm'),
        orderId: order.id.slice(-8).toUpperCase(),
        customer: order.customer
          ? `${order.customer.user?.name ?? ''} ${order.customer.user?.lastName ?? ''}`.trim()
          : 'Sin cliente',
        branch: order.branch.name,
        product: out.product.name,
        code: out.product.code ?? '—',
        quantity: out.quantity,
        price: out.price,
        subtotal: out.quantity * out.price,
        orderTotal: order.amount,
      })),
    );

    const buffer = await this.xlsxService.generateSaleReport(data);
    return { xlsxBase64: buffer.toString('base64'), data };
  }
}
