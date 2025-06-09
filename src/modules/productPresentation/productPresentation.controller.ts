import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';

import { PaginationDto } from '@/common';
import { checkAbilities } from '@/decorator';
import { AbilitiesGuard } from '@/guard/abilities.guard';
import { TypeAction, TypeSubject } from "@prisma/client";
import { ProductPresentationService } from './productPresentation.service';
import { CreateProductPresentationDto } from './dto/create-product-presentation.dto';
import { UpdateProductPresentationDto } from './dto/update-product-presentation.dto';

@UseGuards(AbilitiesGuard)
@Controller('product/presentation')
export class ProductPresentationController {
  constructor(private readonly productPresentationService: ProductPresentationService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.presentation })
  create(@Body() createPresentationDto: CreateProductPresentationDto) {
    return this.productPresentationService.create(createPresentationDto);
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
  update(@Param('id') id: string, @Body() updateProductPresentationDto: UpdateProductPresentationDto) {
    return this.productPresentationService.update(id, updateProductPresentationDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.presentation })
  remove(@Param('id') id: string) {
    return this.productPresentationService.remove(id);
  }
}

