import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';
import { PaginationResult } from '@/common/entities/pagination.entity';
import { KardexService } from '@/modules/kardex/kardex.service';
import { PdfService } from '@/common/pdf/pdf.service';
import { TransferRequestStatus, TypeReference, TypeUnit } from '@/generated/prisma/enums';
import { CreateTransferRequestDto } from './dto/create-transfer-request.dto';
import { DispatchTransferRequestDto } from './dto/dispatch-transfer-request.dto';
import { ReceiveTransferRequestDto } from './dto/receive-transfer-request.dto';
import { RejectTransferRequestDto } from './dto/reject-transfer-request.dto';
import { TransferRequestListType, TransferRequestSelectList } from './entities/transfer-request.entity';

@Injectable()
export class TransferRequestService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly kardexService: KardexService,
    private readonly pdfService: PdfService,
  ) { }

  async create(userId: string, dto: CreateTransferRequestDto) {
    const request = await this.prisma.transferRequest.create({
      data: {
        fromBranchId: dto.fromBranchId,
        toBranchId: dto.toBranchId,
        note: dto.note,
        createdBy: userId,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantityRequested: item.quantityRequested,
            typeUnit: item.typeUnit,
            price: item.price,
            detail: item.detail,
          })),
        },
      },
      select: TransferRequestSelectList,
    });

    return request;
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<TransferRequestListType>> {
    const { page = 1, limit = 10, branchId, keys, status } = paginationDto;

    const where: any = { active: true };
    if (branchId) {
      where.OR = [{ fromBranchId: branchId }, { toBranchId: branchId }];
    }
    if (status) {
      where.status = status;
    }
    if (keys && keys.trim()) {
      const keyFilter = [
        { fromBranch: { name: { contains: keys, mode: 'insensitive' } } },
        { toBranch: { name: { contains: keys, mode: 'insensitive' } } },
        { note: { contains: keys, mode: 'insensitive' } },
      ];
      if (where.OR) {
        where.AND = [{ OR: keyFilter }];
      } else {
        where.OR = keyFilter;
      }
    }

    const total = await this.prisma.transferRequest.count({ where });
    const lastPage = Math.ceil(total / limit);

    const data = await this.prisma.transferRequest.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      select: TransferRequestSelectList,
      orderBy: { createdAt: 'desc' },
    });

    // Resolver nombres de usuarios
    const userIds = [...new Set([
      ...data.map((r) => r.createdBy),
      ...data.filter((r) => r.dispatchedBy).map((r) => r.dispatchedBy!),
      ...data.filter((r) => r.receivedBy).map((r) => r.receivedBy!),
    ])];

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, lastName: true },
    });
    const userMap = new Map(users.map((u) => [u.id, `${u.name} ${u.lastName}`]));

    const enriched = data.map((r) => ({
      ...r,
      createdByName: userMap.get(r.createdBy) ?? 'Desconocido',
      dispatchedByName: r.dispatchedBy ? (userMap.get(r.dispatchedBy) ?? 'Desconocido') : null,
      receivedByName: r.receivedBy ? (userMap.get(r.receivedBy) ?? 'Desconocido') : null,
    }));

    return { data: enriched as any, meta: { total, page: Number(page), lastPage } };
  }

  async findOne(id: string) {
    const request = await this.prisma.transferRequest.findUnique({
      where: { id },
      select: TransferRequestSelectList,
    });
    if (!request) throw new NotFoundException(`Solicitud #${id} no encontrada`);
    return request;
  }

  async dispatch(id: string, userId: string, dto: DispatchTransferRequestDto) {
    const request = await this.findOne(id);

    if (request.status !== TransferRequestStatus.SOLICITADO) {
      throw new BadRequestException('Solo se pueden despachar solicitudes en estado SOLICITADO');
    }

    // Validar stock para cada ítem
    for (const dispatchItem of dto.items) {
      const reqItem = request.items.find((i) => i.id === dispatchItem.itemId);
      if (!reqItem) throw new BadRequestException(`Ítem ${dispatchItem.itemId} no encontrado en la solicitud`);

      if (dispatchItem.quantityDispatched > reqItem.quantityRequested) {
        throw new BadRequestException(
          `No se puede despachar más de lo solicitado para ${reqItem.product.name}. Solicitado: ${reqItem.quantityRequested}, despachado: ${dispatchItem.quantityDispatched}`,
        );
      }

      const stock = await this.kardexService.getStock(reqItem.product.id, request.fromBranch.id);
      if (stock < dispatchItem.quantityDispatched) {
        throw new BadRequestException(
          `Stock insuficiente para ${reqItem.product.name}. Disponible: ${stock}, a despachar: ${dispatchItem.quantityDispatched}`,
        );
      }
    }

    // Actualizar cantidades despachadas en cada ítem
    for (const dispatchItem of dto.items) {
      await this.prisma.transferRequestItem.update({
        where: { id: dispatchItem.itemId },
        data: { quantityDispatched: dispatchItem.quantityDispatched },
      });
    }

    // Cambiar estado a DESPACHADO
    const updated = await this.prisma.transferRequest.update({
      where: { id },
      data: {
        status: TransferRequestStatus.DESPACHADO,
        note: dto.note ?? request.note,
        dispatchedBy: userId,
        dispatchedAt: new Date(),
        updatedBy: userId,
      },
      select: TransferRequestSelectList,
    });

    return updated;
  }

  async receive(id: string, userId: string, dto: ReceiveTransferRequestDto) {
    const request = await this.findOne(id);

    if (request.status !== TransferRequestStatus.DESPACHADO) {
      throw new BadRequestException('Solo se pueden recibir solicitudes en estado DESPACHADO');
    }

    const hasObservation = dto.observationNote && dto.observationNote.trim() !== '';
    const newStatus = hasObservation
      ? TransferRequestStatus.OBSERVADO
      : TransferRequestStatus.RECIBIDO;

    // Si se recibe (sin observación), ejecutar el traspaso real
    if (!hasObservation) {
      await this.executeTransfer(request, userId);
    }

    const updated = await this.prisma.transferRequest.update({
      where: { id },
      data: {
        status: newStatus,
        observationNote: dto.observationNote || null,
        receivedBy: userId,
        receivedAt: new Date(),
        updatedBy: userId,
      },
      select: TransferRequestSelectList,
    });

    return updated;
  }

  async reject(id: string, userId: string, dto: RejectTransferRequestDto) {
    const request = await this.findOne(id);

    if (request.status !== TransferRequestStatus.SOLICITADO) {
      throw new BadRequestException('Solo se pueden rechazar solicitudes en estado SOLICITADO');
    }

    const updated = await this.prisma.transferRequest.update({
      where: { id },
      data: {
        status: TransferRequestStatus.RECHAZADO,
        rejectionNote: dto.rejectionNote,
        updatedBy: userId,
      },
      select: TransferRequestSelectList,
    });

    return updated;
  }

  async getPdf(id: string): Promise<Buffer> {
    const request = await this.findOne(id);

    // Resolver nombres de usuarios
    const userIds = [
      request.createdBy,
      ...(request.dispatchedBy ? [request.dispatchedBy] : []),
      ...(request.receivedBy ? [request.receivedBy] : []),
    ];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, lastName: true },
    });
    const userMap = new Map(users.map((u) => [u.id, `${u.name} ${u.lastName}`]));

    return this.pdfService.generateTransferRequestRoll({
      ...request,
      createdByName: userMap.get(request.createdBy) ?? 'Desconocido',
      dispatchedByName: request.dispatchedBy ? (userMap.get(request.dispatchedBy) ?? 'Desconocido') : null,
      receivedByName: request.receivedBy ? (userMap.get(request.receivedBy) ?? 'Desconocido') : null,
    });
  }

  private async executeTransfer(request: TransferRequestListType, userId: string) {
    const fromBranchId = request.fromBranch.id;
    const toBranchId = request.toBranch.id;

    for (const item of request.items) {
      const dispatched = item.quantityDispatched ?? item.quantityRequested;
      if (dispatched <= 0) continue;

      // Crear precio en sucursal destino si no existe
      const existingPrice = await this.prisma.price.findFirst({
        where: { productId: item.product.id, branchId: toBranchId },
      });
      if (!existingPrice) {
        await this.prisma.price.create({
          data: {
            productId: item.product.id,
            branchId: toBranchId,
            typeUnit: item.typeUnit,
            price: item.price,
            createdBy: userId,
          },
        });
      }

      // Crear registro de transferencia
      const transfer = await this.prisma.transfer.create({
        data: {
          fromBranchId,
          toBranchId,
          productId: item.product.id,
          quantity: dispatched,
          price: item.price,
          detail: `Traspaso por solicitud`,
          transferRequestId: request.id,
          createdBy: userId,
        },
      });

      const fromBranch = request.fromBranch;
      const toBranch = request.toBranch;

      // Salida de sucursal origen
      const outputCreated = await this.prisma.output.create({
        data: {
          branchId: fromBranchId,
          transferId: transfer.id,
          productId: item.product.id,
          quantity: dispatched,
          price: item.price,
          detail: `Traspaso hacia ${toBranch.name}`,
          createdBy: userId,
        },
      });

      // Entrada en sucursal destino
      const inputCreated = await this.prisma.input.create({
        data: {
          branchId: toBranchId,
          transferId: transfer.id,
          productId: item.product.id,
          quantity: dispatched,
          price: item.price,
          typeUnit: item.typeUnit,
          detail: `Traspaso desde ${fromBranch.name}`,
          createdBy: userId,
        },
      });

      // Actualizar kardex
      await Promise.all([
        this.kardexService.findByReference(outputCreated.id, TypeReference.outputs),
        this.kardexService.findByReference(inputCreated.id, TypeReference.inputs),
      ]);
    }
  }
}
