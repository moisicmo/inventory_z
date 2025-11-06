import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser } from '@/decorator';
import { TypeAction } from "@prisma/client";
import { JwtPayload } from '../auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/subjects';
import { CategoryResponseDto } from './dto/category-response.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.category })
  create(@CurrentUser() user: JwtPayload, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(user.email,createCategoryDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.category })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.categoryService.findAll(paginationDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'busqueda de categorias por nombre (autocomplete)' })
  @ApiQuery({ name: 'name', required: true, type: String, description: 'Nombre de la categoria a buscar' })
  @ApiResponse({ status: 200, description: 'lista de categorias.', type: [CategoryResponseDto] })
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.category })
  searchByName(@Query('name') name: string) {
    return this.categoryService.searchByName(name);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.category })
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.category })
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.category })
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}

