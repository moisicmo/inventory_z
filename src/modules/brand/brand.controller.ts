import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser } from '@/decorator';
import { TypeAction } from "@prisma/client";
import { JwtPayload } from '../auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/subjects';
import { BrandResponseDto } from './dto/brand-response.dto';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.brand })
  create(@CurrentUser() user: JwtPayload, @Body() createBrandDto: CreateBrandDto) {
    return this.brandService.create(user.email,createBrandDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.brand })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.brandService.findAll(paginationDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'busqueda de marcas por nombre (autocomplete)' })
  @ApiQuery({ name: 'name', required: true, type: String, description: 'Nombre de la marca a buscar' })
  @ApiResponse({ status: 200, description: 'lista de marcas.', type: [BrandResponseDto] })
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.brand })
  searchByName(@Query('name') name: string) {
    return this.brandService.searchByName(name);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.brand })
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(id);
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.brand })
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.brand })
  remove(@Param('id') id: string) {
    return this.brandService.remove(id);
  }
}

