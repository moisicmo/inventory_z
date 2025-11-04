import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { KardexService } from './kardex.service';
import { PaginationDto } from '@/common';
import { TypeReference } from '@prisma/client';
import { checkAbilities } from '@/decorator';
import { TypeAction } from "@prisma/client";
import { TypeSubject } from '@/common/subjects';

@Controller('kardex')
export class KardexController {
  constructor(private readonly kardexService: KardexService) { }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.kardex })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.kardexService.findAll(paginationDto);
  }

  @Get('input/:inputId')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.kardex })
  findOneInput(@Param('inputId') inputId: string) {
    return this.kardexService.findByReference(inputId, TypeReference.inputs);
  }

  @Get('output/:outputId')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.kardex })
  findOneOutput(@Param('outputId') outputId: string) {
    return this.kardexService.findByReference(outputId, TypeReference.outputs);
  }
}
