import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '@/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CurrentUser, FileMimeTypeInterceptor } from '@/decorator';
import { checkAbilities } from '@/decorator';
import { TypeAction } from "@prisma/client";
import { JwtPayload } from '../auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/subjects';

// @UseGuards(AbilitiesGuard)
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
    @CurrentUser() user: JwtPayload,
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.productService.create(user.email, createProductDto, image);
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
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.productService.update(user.email, id, updateProductDto, image);
  }


  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.product })
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }

  @Post('import')
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.product })
  @UseInterceptors(
    FileInterceptor('file'),
    new FileMimeTypeInterceptor([
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Excel file containing products to import',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  importProducts(
    @CurrentUser() user: JwtPayload, @UploadedFile() file: Express.Multer.File) {
    return this.productService.importProducts(user.email, file);
  }
}