import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWriteoffDto } from './dto/create-writeoff.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { WriteoffSelect, WriteoffType } from './entities/writeoff.entity';
import { KardexService } from '@/modules/kardex/kardex.service';
import { XlsxService } from '@/common/xlsx/xlsx.service';
import { TypeReference } from '@/generated/prisma/enums';
import { PaginationDto } from '@/common';
import { PaginationResult } from '@/common/entities/pagination.entity';
import { format } from 'date-fns';

const REASON_LABELS: Record<string, string> = {
  VENCIMIENTO: 'Vencimiento',
  DANIO: 'Daño',
  ROBO: 'Robo',
  PERDIDA: 'Pérdida',
  OTRO: 'Otro',
};

@Injectable()
export class WriteoffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kardexService: KardexService,
    private readonly xlsxService: XlsxService,
  ) {}

  async create(userId: string, dto: CreateWriteoffDto): Promise<WriteoffType> {
    const { branchId, reason, description, items } = dto;

    for (const item of items) {
      const stock = await this.kardexService.getStock(item.productId, branchId);
      if (stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${item.productId}. Available: ${stock}, requested: ${item.quantity}`,
        );
      }
    }

    const writeoff = await this.prisma.baja.create({
      data: {
        branchId,
        reason,
        description,
        createdBy: userId,
      },
    });

    const outputs = await this.prisma.output.createManyAndReturn({
      data: items.map((item) => ({
        branchId,
        bajaId: writeoff.id,
        productId: item.productId,
        quantity: item.quantity,
        price: 0,
        detail: `write-off: ${reason.toLowerCase()}`,
        createdBy: userId,
      })),
    });

    await Promise.all(
      outputs.map((output) =>
        this.kardexService.findByReference(output.id, TypeReference.outputs),
      ),
    );

    return this.prisma.baja.findUniqueOrThrow({
      where: { id: writeoff.id },
      select: WriteoffSelect,
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<WriteoffType>> {
    const { page = 1, limit = 10, branchId, keys } = paginationDto;

    const where: any = { active: true };
    if (branchId) where.branchId = branchId;
    if (keys && keys.trim()) {
      where.OR = [
        { description: { contains: keys, mode: 'insensitive' } },
        { reason: { equals: keys.toUpperCase() } },
        { outputs: { some: { product: { name: { contains: keys, mode: 'insensitive' } } } } },
      ];
    }

    const total = await this.prisma.baja.count({ where });
    const lastPage = Math.ceil(total / limit);

    const data = await this.prisma.baja.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      select: WriteoffSelect,
      orderBy: { createdAt: 'desc' },
    });

    return { data, meta: { total, page: Number(page), lastPage } };
  }

  async exportXlsx(paginationDto: PaginationDto) {
    const { branchId, keys } = paginationDto;

    const where: any = { active: true };
    if (branchId) where.branchId = branchId;
    if (keys && keys.trim()) {
      where.OR = [
        { description: { contains: keys, mode: 'insensitive' } },
        { reason: { equals: keys.toUpperCase() } },
        { outputs: { some: { product: { name: { contains: keys, mode: 'insensitive' } } } } },
      ];
    }

    const writeoffs = await this.prisma.baja.findMany({
      where,
      select: WriteoffSelect,
      orderBy: { createdAt: 'desc' },
    });

    const rows = writeoffs.flatMap((wo) =>
      wo.outputs.map((output) => ({
        date: format(wo.createdAt, 'dd/MM/yyyy HH:mm'),
        branch: wo.branch.name,
        reason: REASON_LABELS[wo.reason ?? ''] ?? wo.reason ?? '—',
        description: wo.description ?? '—',
        product: output.product.name,
        code: output.product.code ?? '—',
        quantity: output.quantity,
      })),
    );

    const buffer = await this.xlsxService.generateWriteoffReport(rows);
    return { xlsxBase64: buffer.toString('base64') };
  }
}
