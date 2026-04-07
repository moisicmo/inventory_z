import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';
import { PaginationResult } from '@/common/entities/pagination.entity';
import { InputSelect } from '@/modules/input/entities/input.entity';
import { KardexService } from '@/modules/kardex/kardex.service';
import { InstallmentStatus, PaymentType, TypeReference } from '@/generated/prisma/enums';
import { PdfService } from '@/common/pdf/pdf.service';
import { PayableSelect, PayableType, PurchaseFullType, PurchaseListType, PurchaseSelectFull, PurchaseSelectList } from './entities/purchase.entity';

@Injectable()
export class PurchaseService {

  constructor(
    private prisma: PrismaService,
    private kardexService: KardexService,
    private readonly pdfService: PdfService,
  ) { }

  async create(userId: string, createPurchaseDto: CreatePurchaseDto) {
    const { branchId, providerId, code, dischargeDate, paymentType, totalAmount, items, installments } = createPurchaseDto;

    // 1. Crear encabezado de compra
    const purchase = await this.prisma.purchase.create({
      data: {
        branchId,
        providerId,
        code,
        dischargeDate,
        paymentType,
        totalAmount,
        createdBy: userId,
      },
    });

    // 2. Crear los inputs (líneas de productos)
    const inputs = await this.prisma.input.createManyAndReturn({
      select: InputSelect,
      data: items.map((item) => ({
        branchId,
        purchaseId: purchase.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        typeUnit: item.typeUnit,
        detail: item.detail,
        createdBy: userId,
      })),
    });

    // 3. Actualizar el costo referencial de cada producto con el precio de esta compra
    await Promise.all(
      items.map((item) =>
        this.prisma.product.update({
          where: { id: item.productId },
          data: { refCost: item.price },
        }),
      ),
    );

    // 4. Crear cuotas si el pago es a cuotas
    if (paymentType === PaymentType.CUOTAS && installments && installments.length > 0) {
      await this.prisma.purchaseInstallment.createMany({
        data: installments.map((inst) => ({
          purchaseId: purchase.id,
          installmentNumber: inst.installmentNumber,
          amount: inst.amount,
          dueDate: inst.dueDate,
          createdBy: userId,
        })),
      });
    }

    // 5. Actualizar kardex por cada input creado
    const kardexLists = await Promise.all(
      inputs.map((input) => this.kardexService.findByReference(input.id, TypeReference.inputs)),
    );

    // 6. Generar comprobante PDF
    const purchaseFull = await this.findOne(purchase.id);
    const pdfBuffer = await this.pdfService.generatePurchaseRoll(purchaseFull);

    return {
      kardexLists,
      pdfBase64: pdfBuffer.toString('base64'),
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10, keys, branchId } = paginationDto;

    const where: any = { active: true };
    if (branchId) {
      where.branchId = branchId;
    }
    if (keys && keys.trim() !== '') {
      where.OR = [
        { code: { contains: keys, mode: 'insensitive' } },
        { provider: { name: { contains: keys, mode: 'insensitive' } } },
      ];
    }

    const total = await this.prisma.purchase.count({ where });
    const lastPage = Math.ceil(total / limit);

    const purchases = await this.prisma.purchase.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      select: PurchaseSelectList,
      orderBy: { createdAt: 'desc' },
    });

    // Resolver nombres de usuarios creadores
    const userIds = [...new Set(purchases.map((p) => p.createdBy))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, lastName: true },
    });
    const userMap = new Map(users.map((u) => [u.id, `${u.name} ${u.lastName}`]));

    const data = purchases.map((p) => ({
      ...p,
      createdByName: userMap.get(p.createdBy) ?? 'Desconocido',
    }));

    return { data, meta: { total, page, lastPage } };
  }

  async findOne(id: string): Promise<PurchaseFullType> {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      select: PurchaseSelectFull,
    });

    if (!purchase) {
      throw new NotFoundException(`Purchase with id #${id} not found`);
    }

    return purchase;
  }

  async getPdf(id: string): Promise<Buffer> {
    const purchase = await this.findOne(id);
    return this.pdfService.generatePurchaseRoll(purchase);
  }

  async getPayables(paginationDto: PaginationDto): Promise<PaginationResult<PayableType>> {
    const { page = 1, limit = 10, branchId, keys, status } = paginationDto;

    const where: any = { active: true };
    if (branchId) where.purchase = { branchId };
    if (status) where.status = status;
    if (keys && keys.trim()) {
      where.OR = [
        { purchase: { code: { contains: keys, mode: 'insensitive' } } },
        { purchase: { provider: { name: { contains: keys, mode: 'insensitive' } } } },
      ];
    }

    const total = await this.prisma.purchaseInstallment.count({ where });
    const lastPage = Math.ceil(total / limit);
    const data = await this.prisma.purchaseInstallment.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      select: PayableSelect,
      orderBy: { dueDate: 'asc' },
    });

    return { data, meta: { total, page: Number(page), lastPage } };
  }

  async payInstallment(id: string, userId: string): Promise<PayableType> {
    return this.prisma.purchaseInstallment.update({
      where: { id },
      data: { status: InstallmentStatus.PAID, paidAt: new Date(), updatedBy: userId },
      select: PayableSelect,
    });
  }
}
