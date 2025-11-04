import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser } from '@/decorator';
import { TypeAction } from "@prisma/client";
import { TypeSubject } from '@/common/subjects';
import { JwtPayload } from '../auth/entities/jwt-payload.interface';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.customer })
  create(@CurrentUser() user: JwtPayload, @Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(user.email, createCustomerDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.customer })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.customerService.findAll(paginationDto);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.customer })
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.customer })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.customer })
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }
}
