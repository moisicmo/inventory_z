import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProviderService } from './providerservice';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { PaginationDto } from '@/common';
import { checkAbilities, CurrentUser } from '@/decorator';
import { TypeAction } from "@prisma/client";
import { JwtPayload } from '../auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/subjects';

@Controller('provider')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.provider })
  create(@CurrentUser() user: JwtPayload, @Body() createProviderDto: CreateProviderDto) {
    return this.providerService.create(user.email,createProviderDto);
  }

  @Get()
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.provider })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.providerService.findAll(paginationDto);
  }

  @Get(':id')
  @checkAbilities({ action: TypeAction.read, subject: TypeSubject.provider })
  findOne(@Param('id') id: string) {
    return this.providerService.findOne(id);
  }

  @Patch(':id')
  @checkAbilities({ action: TypeAction.update, subject: TypeSubject.provider })
  update(@Param('id') id: string, @Body() updateProviderDto: UpdateProviderDto) {
    return this.providerService.update(id, updateProviderDto);
  }

  @Delete(':id')
  @checkAbilities({ action: TypeAction.delete, subject: TypeSubject.provider })
  remove(@Param('id') id: string) {
    return this.providerService.remove(id);
  }
}

