import { Controller, Post, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser } from '@/decorator';
import type { JwtPayload } from '@/modules/auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/subjects';
import { TypeAction } from '@/generated/prisma/enums';

@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.purchase })
  create(@CurrentUser() user: JwtPayload, @Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchaseService.create(user.id, createPurchaseDto);
  }

  // Static routes BEFORE :id
  @Get('payables')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.purchase })
  getPayables(@Query() paginationDto: PaginationDto) {
    return this.purchaseService.getPayables(paginationDto);
  }

  @Patch('installments/:id/pay')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.purchase })
  payInstallment(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.purchaseService.payInstallment(id, user.id);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.purchase })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.purchaseService.findAll(paginationDto);
  }

  @Get(':id/pdf')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.purchase })
  async getPdf(@Param('id') id: string) {
    const buffer = await this.purchaseService.getPdf(id);
    return { pdfBase64: buffer.toString('base64') };
  }
}
