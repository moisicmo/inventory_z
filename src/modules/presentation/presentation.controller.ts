import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';

import { PaginationDto } from '@/common';
import { checkAbilities } from '@/decorator';
import { AbilitiesGuard } from '@/guard/abilities.guard';
import { TypeAction, TypeSubject } from "@prisma/client";
import { PresentationService } from './presentation.service';
import { CreatePresentationDto } from './dto/create-presentation.dto';
import { UpdatePresentationDto } from './dto/update-presentation.dto';

@UseGuards(AbilitiesGuard)
@Controller('presentation')
export class PresentationController {
  constructor(private readonly presentationService: PresentationService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.presentation })
  create(@Body() createPresentationDto: CreatePresentationDto) {
    return this.presentationService.create(createPresentationDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.presentation })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.presentationService.findAll(paginationDto);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.presentation })
  findOne(@Param('id') id: string) {
    return this.presentationService.findOne(id);
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.presentation })
  update(@Param('id') id: string, @Body() updatePresentationDto: UpdatePresentationDto) {
    return this.presentationService.update(id, updatePresentationDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.presentation })
  remove(@Param('id') id: string) {
    return this.presentationService.remove(id);
  }
}

