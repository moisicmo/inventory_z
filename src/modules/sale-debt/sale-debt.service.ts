import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';
import { SaleDebtSelect, SaleDebtType } from './entities/sale-debt.entity';
import { CreateSalePaymentDto } from './dto/create-sale-payment.dto';
import { PaginationResult } from '@/common/entities/pagination.entity';

@Injectable()
export class SaleDebtService {
  constructor(private readonly prisma: PrismaService) {}

  async getDebts(paginationDto: PaginationDto): Promise<PaginationResult<SaleDebtType>> {
    const { page = 1, limit = 10, branchId, keys, status } = paginationDto;

    const where: any = { active: true };
    if (branchId) where.branchId = branchId;
    if (status) where.status = status;
    if (keys && keys.trim() !== '') {
      where.OR = [
        { customer: { user: { name: { contains: keys, mode: 'insensitive' } } } },
        { customer: { user: { lastName: { contains: keys, mode: 'insensitive' } } } },
        { customer: { user: { numberDocument: { contains: keys, mode: 'insensitive' } } } },
      ];
    }

    const total = await this.prisma.saleDebt.count({ where });
    const data = await this.prisma.saleDebt.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      select: SaleDebtSelect,
      orderBy: { createdAt: 'desc' },
    });

    return { data, meta: { total, page: Number(page), lastPage: Math.ceil(total / limit) } };
  }

  async addPayment(id: string, dto: CreateSalePaymentDto, userId: string) {
    const debt = await this.prisma.saleDebt.findUnique({ where: { id } });
    if (!debt) throw new NotFoundException('Deuda no encontrada');
    if (!debt.active) throw new BadRequestException('La deuda está inactiva');
    if (debt.status === 'PAID') throw new BadRequestException('La deuda ya está completamente pagada');

    const remaining = debt.totalAmount - debt.paidAmount;
    if (dto.amount > remaining + 0.01) {
      throw new BadRequestException(`El monto excede el saldo pendiente de Bs. ${remaining.toFixed(2)}`);
    }

    await this.prisma.salePayment.create({
      data: {
        debtId: id,
        amount: dto.amount,
        payMethod: dto.payMethod ?? 'cash',
        notes: dto.notes,
        createdBy: userId,
      },
    });

    const newPaidAmount = debt.paidAmount + dto.amount;
    const newStatus = newPaidAmount >= debt.totalAmount - 0.01 ? 'PAID' : 'PENDING';

    await this.prisma.saleDebt.update({
      where: { id },
      data: { paidAmount: newPaidAmount, status: newStatus, updatedBy: userId },
    });

    return { message: 'Pago registrado correctamente' };
  }
}
