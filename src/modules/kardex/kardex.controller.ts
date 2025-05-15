import { Controller, Get, Param, Query } from '@nestjs/common';
import { KardexService } from './kardex.service';
import { PaginationDto } from '@/common';
import { TypeReference } from '@prisma/client';

@Controller('kardex')
export class KardexController {
  constructor(private readonly kardexService: KardexService) { }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.kardexService.findAll(paginationDto);
  }

  @Get('input/:inputId')
  findOneInput(@Param('inputId') inputId: number) {
    return this.kardexService.findByReference(inputId, TypeReference.inputs);
  }

  @Get('output/:outputId')
  findOneOutput(@Param('outputId') outputId: number) {
    return this.kardexService.findByReference(outputId, TypeReference.outputs);
  }
}
