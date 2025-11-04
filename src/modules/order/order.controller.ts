import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationDto } from '@/common';
import { TypeAction } from '@prisma/client';
import { checkAbilities, CurrentUser } from '@/decorator';
import { JwtPayload } from '../auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/subjects';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.order })
  create(@CurrentUser() user: JwtPayload,@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(user.id,user.email,createOrderDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.order })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.orderService.findAll(paginationDto);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.order })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

}
