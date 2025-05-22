import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '@/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { FileMimeTypeInterceptor } from '@/decorator';
import { checkAbilities } from '@/decorator';
import { AbilitiesGuard } from '@/guard/abilities.guard';
import { TypeAction, TypeSubject } from "@prisma/client";

@UseGuards(AbilitiesGuard)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.product })
  @UseInterceptors(
    FileInterceptor('image'),
    new FileMimeTypeInterceptor(['image/jpeg', 'image/png']),
  )
  @ApiConsumes('multipart/form-data')
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.productService.create(createProductDto, image);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.product })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productService.findAll(paginationDto);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.product })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.product })
  @UseInterceptors(
    FileInterceptor('image'),
    new FileMimeTypeInterceptor(['image/jpeg', 'image/png']),
  )
  @ApiConsumes('multipart/form-data')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.productService.update(id, updateProductDto, image);
  }


  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.product })
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}