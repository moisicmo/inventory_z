import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser } from '@/decorator';
import type { JwtPayload } from '../auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/subjects';
import { TypeAction } from '@/generated/prisma/enums';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.order })
  create(@CurrentUser() user: JwtPayload, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(user.id, createOrderDto);
  }

  @Patch(':id/confirm')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.order })
  confirmSale(@Param('id') id: string) {
    return this.orderService.confirmSale(id);
  }

  @Patch(':id/annul')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.order })
  annulOrder(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.orderService.annulOrder(id, user.id);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.order })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.orderService.findAll(paginationDto);
  }

  @Get('delivery')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.order })
  findDelivery(@Query('branchId') branchId: string) {
    return this.orderService.findDelivery(branchId ?? '');
  }

  @Patch(':id/deliver')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.order })
  deliverOrder(@Param('id') id: string) {
    return this.orderService.deliverOrder(id);
  }

  @Get(':id/pdf')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.order })
  getPdf(@Param('id') id: string) {
    return this.orderService.getPdf(id);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.order })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }
}
