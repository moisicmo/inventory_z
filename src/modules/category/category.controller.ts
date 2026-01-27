import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser } from '@/decorator';
import { TypeSubject } from '@/common/subjects';
import { TypeAction } from '@/generated/prisma/enums';
import type { JwtPayload } from '../auth/entities/jwt-payload.interface';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.category })
  create(@CurrentUser() user: JwtPayload, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(user.id,createCategoryDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.category })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.categoryService.findAll(paginationDto);
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

