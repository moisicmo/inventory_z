import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser } from '@/decorator';
import { TypeAction } from "@prisma/client";
import { JwtPayload } from '../auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/subjects';

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

