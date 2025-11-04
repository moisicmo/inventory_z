import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { checkAbilities, CurrentUser } from '@/decorator';
import { TypeAction } from '@prisma/client';
import { PaginationDto } from '@/common';
import { JwtPayload } from '../auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/subjects';

@Controller('transfer')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.transfer })
  create(@CurrentUser() user: JwtPayload,@Body() createTransferDto: CreateTransferDto) {
    return this.transferService.create(user.email,createTransferDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.transfer })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.transferService.findAll(paginationDto);
  }
}
