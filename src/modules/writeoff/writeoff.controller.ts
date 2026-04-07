import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { WriteoffService } from './writeoff.service';
import { CreateWriteoffDto } from './dto/create-writeoff.dto';
import { checkAbilities, CurrentUser } from '@/decorator';
import type { JwtPayload } from '@/modules/auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/subjects';
import { TypeAction } from '@/generated/prisma/enums';
import { PaginationDto } from '@/common';

@Controller('writeoff')
export class WriteoffController {
  constructor(private readonly writeoffService: WriteoffService) {}

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.writeoff })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateWriteoffDto) {
    return this.writeoffService.create(user.id, dto);
  }

  @Get('export')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.writeoff })
  exportXlsx(@Query() paginationDto: PaginationDto) {
    return this.writeoffService.exportXlsx(paginationDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.writeoff })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.writeoffService.findAll(paginationDto);
  }
}
