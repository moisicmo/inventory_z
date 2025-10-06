import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { AbilitiesGuard } from '@/guard/abilities.guard';
import { checkAbilities } from '@/decorator';
import { TypeAction, TypeSubject } from '@prisma/client';
import { PaginationDto } from '@/common';

@UseGuards(AbilitiesGuard)
@Controller('transfer')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.transfer })
  create(@Body() createTransferDto: CreateTransferDto) {
    return this.transferService.create(createTransferDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.transfer })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.transferService.findAll(paginationDto);
  }
}
