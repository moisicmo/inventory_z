import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SaleDebtService } from './sale-debt.service';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser } from '@/decorator';
import type { JwtPayload } from '@/modules/auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/subjects';
import { TypeAction } from '@/generated/prisma/enums';
import { CreateSalePaymentDto } from './dto/create-sale-payment.dto';

@Controller('sale-debt')
export class SaleDebtController {
  constructor(private readonly saleDebtService: SaleDebtService) {}

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.accountsReceivable })
  getDebts(@Query() paginationDto: PaginationDto) {
    return this.saleDebtService.getDebts(paginationDto);
  }

  @Post(':id/payment')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.accountsReceivable })
  addPayment(
    @Param('id') id: string,
    @Body() dto: CreateSalePaymentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.saleDebtService.addPayment(id, dto, user.id);
  }
}
