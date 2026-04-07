import { Controller, Post, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { TransferRequestService } from './transfer-request.service';
import { CreateTransferRequestDto } from './dto/create-transfer-request.dto';
import { DispatchTransferRequestDto } from './dto/dispatch-transfer-request.dto';
import { ReceiveTransferRequestDto } from './dto/receive-transfer-request.dto';
import { RejectTransferRequestDto } from './dto/reject-transfer-request.dto';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser } from '@/decorator';
import type { JwtPayload } from '@/modules/auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/subjects';
import { TypeAction } from '@/generated/prisma/enums';

@Controller('transfer-request')
export class TransferRequestController {
  constructor(private readonly service: TransferRequestService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.transferRequest })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTransferRequestDto) {
    return this.service.create(user.id, dto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.transferRequest })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.service.findAll(paginationDto);
  }

  @Get(':id/pdf')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.transferRequest })
  async getPdf(@Param('id') id: string) {
    const buffer = await this.service.getPdf(id);
    return { pdfBase64: buffer.toString('base64') };
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.transferRequest })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/dispatch')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.transferRequest })
  dispatch(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: DispatchTransferRequestDto,
  ) {
    return this.service.dispatch(id, user.id, dto);
  }

  @Patch(':id/receive')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.transferRequest })
  receive(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ReceiveTransferRequestDto,
  ) {
    return this.service.receive(id, user.id, dto);
  }

  @Patch(':id/reject')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.transferRequest })
  reject(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: RejectTransferRequestDto,
  ) {
    return this.service.reject(id, user.id, dto);
  }
}
