import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';

import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser } from '@/decorator';
import { TypeAction } from "@prisma/client";
import { ProductPresentationService } from './productPresentation.service';
import { CreateProductPresentationDto } from './dto/create-product-presentation.dto';
import { UpdateProductPresentationDto } from './dto/update-product-presentation.dto';
import { JwtPayload } from '../auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/subjects';

@Controller('product/presentation')
export class ProductPresentationController {
  constructor(private readonly productPresentationService: ProductPresentationService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.presentation })
  create(@CurrentUser() user: JwtPayload,@Body() createPresentationDto: CreateProductPresentationDto) {
    return this.productPresentationService.create(user.email,createPresentationDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.presentation })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productPresentationService.findAll(paginationDto);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.presentation })
  findOne(@Param('id') id: string) {
    return this.productPresentationService.findOne(id);
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.presentation })
  update(@CurrentUser() user: JwtPayload,@Param('id') id: string, @Body() updateProductPresentationDto: UpdateProductPresentationDto) {
    return this.productPresentationService.update(user.email,id, updateProductPresentationDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.presentation })
  remove(@Param('id') id: string) {
    return this.productPresentationService.remove(id);
  }
}

